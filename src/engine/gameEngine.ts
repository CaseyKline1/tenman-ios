import {
  EXHIBITION_FOCUSES,
  ExhibitionFocus,
  TERRITORIES,
  TRAINING_OPTIONS,
} from "../data/recruiting";
import { JUNIOR_TOURNAMENT_SCHEDULE, TOURNAMENT_SCHEDULE } from "../data/tournamentSchedule";
import {
  GameState,
  JuniorTournament,
  Player,
  Surface,
  Tournament,
  TournamentResult,
} from "../types/game";
import { STAMINA_MAX } from "./engineConstants";
import { createPlayer } from "./playerGeneration";
import { clamp, randomBetween } from "./random";
import { markCurrentWeekProcessed, resetSkippedTournamentPoints } from "./scheduleProcessing";
import { cloneState } from "./stateClone";
import { runTournament, simulateExhibitionMatch } from "./tournamentSimulation";
import { lockTournamentEligibilityForWeek } from "./tournamentEligibility";

export { advanceWeek, skipToNextYear, skipToWeek } from "./calendarProgression";
export { getTournamentSchedule } from "./scheduleProcessing";
export { getAvailableTournaments } from "./tournamentEligibility";

export const createInitialState = (): GameState => ({
  userName: "",
  agent_earnings: 0,
  week: 1,
  year: 2025,
  lastProcessedTournamentWeek: 0,
  userPlayers: [],
  offerRecruits: [],
  lastTournamentResults: [],
  injuryAlerts: [],
  screen: "landing",
});

export const startNewGame = (userName: string): GameState => ({
  userName,
  agent_earnings: 0,
  week: 1,
  year: 2025,
  lastProcessedTournamentWeek: 0,
  userPlayers: [],
  offerRecruits: [],
  lastTournamentResults: [],
  injuryAlerts: [],
  screen: "recruit-territories",
});

export const getSeniorPlayers = (state: GameState): Player[] =>
  state.userPlayers.filter((player) => !player.junior);

export const getJuniorPlayers = (state: GameState): Player[] =>
  state.userPlayers.filter((player) => player.junior);

export const seeRecruits = (state: GameState, territoryId: number): GameState => {
  const next = cloneState(state);
  const takenNames = new Set(next.userPlayers.map((player) => player.name));
  next.offerRecruits = [
    createPlayer(next.userName, territoryId, takenNames),
    createPlayer(next.userName, territoryId, takenNames),
    createPlayer(next.userName, territoryId, takenNames),
  ];
  next.screen = "offer-recruits";
  return next;
};

export const addRecruit = (state: GameState, playerId: number): GameState => {
  const next = cloneState(state);
  const recruit = next.offerRecruits.find((player) => player.player_id === playerId);
  if (!recruit) return next;
  const exists = next.userPlayers.some((player) => player.player_id === playerId);
  if (!exists) {
    next.userPlayers.push(recruit);
  }
  next.offerRecruits = [];
  lockTournamentEligibilityForWeek(next);
  next.screen = "choose-tournament";
  return next;
};

export const skipRecruits = (state: GameState): GameState => {
  const next = cloneState(state);
  next.offerRecruits = [];
  if (next.userPlayers.length > 0) {
    lockTournamentEligibilityForWeek(next);
  }
  next.screen = next.userPlayers.length > 0 ? "choose-tournament" : "recruit-territories";
  return next;
};

export const removePlayer = (state: GameState, playerId: number): GameState => {
  const next = cloneState(state);
  next.userPlayers = next.userPlayers.filter((player) => player.player_id !== playerId);
  return next;
};

export const promoteJunior = (state: GameState, playerId: number): GameState => {
  const next = cloneState(state);
  const player = next.userPlayers.find((entry) => entry.player_id === playerId && entry.junior);
  if (!player) return next;
  player.junior = false;
  player.ranking = 3000;
  player.weeks_ranked_1 = 0;
  return next;
};

export const enterTournaments = (
  state: GameState,
  selectedByTournament: Record<string, number[]>,
): GameState => {
  const next = cloneState(state);
  const tournamentsByName: Record<string, Tournament | JuniorTournament> = {};

  for (const tournament of TOURNAMENT_SCHEDULE[next.week] ?? []) {
    tournamentsByName[tournament.name] = tournament as Tournament;
  }
  const juniorTournament = JUNIOR_TOURNAMENT_SCHEDULE[next.week];
  if (juniorTournament) tournamentsByName[juniorTournament.name] = juniorTournament;

  // Defend this week's points by default; selected participants overwrite with their results.
  resetSkippedTournamentPoints(next.userPlayers, next.week, next.week);

  const output: TournamentResult[] = [];
  for (const [name, playerIds] of Object.entries(selectedByTournament)) {
    const tournament = tournamentsByName[name];
    if (!tournament || playerIds.length === 0) continue;
    const players = next.userPlayers.filter((player) => playerIds.includes(player.player_id));
    if (players.length === 0) continue;

    const { lines, agentEarnings } = runTournament(tournament, players, next.year);
    output.push({ tournamentName: name, lines });
    next.agent_earnings += agentEarnings;
  }

  markCurrentWeekProcessed(next);
  next.lastTournamentResults = output;
  next.screen = output.length ? "tournament-results" : "menu";
  return next;
};

export const trainPlayers = (state: GameState, choices: Record<number, number>): GameState => {
  const next = cloneState(state);
  for (const player of next.userPlayers) {
    const choice = choices[player.player_id];
    if (choice === undefined) continue;
    if (player.injury_weeks > 0 || player.age >= 28) continue;

    if (choice === 0) {
      const delta = player.age < 24
        ? randomBetween(1, 3) * Math.pow(player.potential / 100, 2) * (player.overall < 55 ? 1.7 : 1)
        : randomBetween(0, 1) * Math.pow(player.potential / 100, 2);
      player.overall = clamp(player.overall + delta, 1, 100);
    } else if (choice === 1) {
      const delta = player.age < 24
        ? randomBetween(2, 6) * Math.pow(player.potential / 100, 2) * (player.serve < 60 ? 1.7 : 1)
        : randomBetween(0, 2) * Math.pow(player.potential / 100, 2);
      player.serve = clamp(player.serve + delta, 1, 100);
    } else if (choice === 2) {
      const delta = player.age < 24
        ? randomBetween(1.3, 3) * Math.pow(player.potential / 100, 2) * (player.stamina < 68 ? 1.7 : 1)
        : randomBetween(0, 1.5) * Math.pow(player.potential / 100, 2);
      player.stamina = clamp(player.stamina + delta, 1, STAMINA_MAX);
    } else if (choice === 3) {
      const delta = player.age < 24
        ? randomBetween(2, 6) * Math.pow(player.potential / 100, 2) * (player.big_moments < 60 ? 1.7 : 1)
        : randomBetween(0, 2) * Math.pow(player.potential / 100, 2);
      player.big_moments = clamp(player.big_moments + delta, 1, 100);
    } else if (choice === 4) {
      const delta = player.age < 24
        ? randomBetween(2, 6) * Math.pow(player.potential / 100, 2) * (player.court_proficiencies.hard < 70 ? 1.7 : 1)
        : randomBetween(0, 2) * Math.pow(player.potential / 100, 2);
      player.court_proficiencies.hard = clamp(player.court_proficiencies.hard + delta, 1, 100);
    } else if (choice === 5) {
      const delta = player.age < 24
        ? randomBetween(2, 6) * Math.pow(player.potential / 100, 2) * (player.court_proficiencies.clay < 70 ? 1.7 : 1)
        : randomBetween(0, 2) * Math.pow(player.potential / 100, 2);
      player.court_proficiencies.clay = clamp(player.court_proficiencies.clay + delta, 1, 100);
    } else if (choice === 6) {
      const delta = player.age < 24
        ? randomBetween(2, 6) * Math.pow(player.potential / 100, 2) * (player.court_proficiencies.grass < 70 ? 1.7 : 1)
        : randomBetween(0, 2) * Math.pow(player.potential / 100, 2);
      player.court_proficiencies.grass = clamp(player.court_proficiencies.grass + delta, 1, 100);
    }
  }

  next.screen = "recruit-territories";
  return next;
};

export const dismissInjuryAlerts = (state: GameState): GameState => {
  const next = cloneState(state);
  next.injuryAlerts = [];
  next.screen = next.postInjuryAlertScreen ?? "menu";
  next.postInjuryAlertScreen = undefined;
  return next;
};

export const playExhibitionMatch = (
  state: GameState,
  player1Id: number,
  player2Id: number,
  surface: Surface,
  focus1: ExhibitionFocus,
  focus2: ExhibitionFocus,
): { state: GameState; lines: string[]; error?: string } => {
  const next = cloneState(state);
  if (!canRunExhibition(next)) {
    return { state: next, lines: [], error: "Exhibition matches are only available before week 48" };
  }

  const player1 = next.userPlayers.find((entry) => entry.player_id === player1Id);
  const player2 = next.userPlayers.find((entry) => entry.player_id === player2Id);
  if (!player1 || !player2 || player1.player_id === player2.player_id) {
    return { state: next, lines: [], error: "Please select two different players" };
  }
  if (player1.injury_weeks > 0 || player2.injury_weeks > 0) {
    return { state: next, lines: [], error: "Both players must be healthy for an exhibition match" };
  }
  if (player1.energy < 40 || player2.energy < 40) {
    return { state: next, lines: [], error: "Both players need at least 40 energy for an exhibition match" };
  }

  return { state: next, lines: simulateExhibitionMatch(player1, player2, surface, focus1, focus2, next.year) };
};

export const getWeeklyHeader = (state: GameState): string => `Year ${state.year} - Week ${state.week}`;

export const getEligibleExhibitionPlayers = (state: GameState): Player[] =>
  state.userPlayers.filter((player) => player.injury_weeks === 0 && player.energy >= 40);

export const canRunExhibition = (state: GameState): boolean => state.week < 48;

export const getTrainingEligiblePlayers = (state: GameState): Player[] =>
  state.userPlayers.filter((player) => player.age <= 27 && player.injury_weeks === 0);

export const territoryNames = TERRITORIES.map((territory) => territory.name);

export const trainingOptions = TRAINING_OPTIONS;

export const exhibitionFocuses = EXHIBITION_FOCUSES;
