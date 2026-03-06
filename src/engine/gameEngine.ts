import {
  GameState,
  InjuryAlert,
  JuniorTournament,
  Player,
  PlayerTournamentEligibility,
  ScheduleTournament,
  Surface,
  Tournament,
  TournamentResult,
  TournamentWithPlayers,
} from "../types/game";
import {
  EXHIBITION_FOCUSES,
  ExhibitionFocus,
  TERRITORIES,
  TRAINING_OPTIONS,
} from "../data/recruiting";
import { JUNIOR_TOURNAMENT_SCHEDULE, TOURNAMENT_SCHEDULE } from "../data/tournamentSchedule";
import { clamp, randomBetween, randomInt } from "./random";
import { STAMINA_MAX } from "./engineConstants";
import { createPlayer } from "./playerGeneration";
import { refreshStandings } from "./standings";
import { applyWeeklyPlayerProgress, endOfYear } from "./playerProgress";
import { runTournament, simulateExhibitionMatch } from "./tournamentSimulation";

const cloneState = (state: GameState): GameState => JSON.parse(JSON.stringify(state));

const calcRequiredPoints = (player: Player, tournament: Tournament | JuniorTournament) => {
  if (player.junior && String(tournament.level).startsWith("grade") || tournament.level === "junior_grand_slam") {
    let required = 0;
    if (tournament.level === "grade_3") required = 400;
    if (tournament.level === "grade_2") required = 200;
    if (tournament.level === "grade_1") required = 100;
    if (tournament.level === "grade_a" || tournament.level === "junior_grand_slam") required = 56;
    player.required_ranking[tournament.name] = required;

    if (player.ranking <= required) player.qualify_tourney[tournament.name] = 1;
    else {
      player.qualify_tourney[tournament.name] = 0;
      let qualifierRec = 0;
      if (tournament.level === "junior_grand_slam") qualifierRec = 120;
      if (tournament.level === "grade_a") qualifierRec = 120;
      if (tournament.level === "grade_1") qualifierRec = 300 + randomInt(-25, 25);
      if (tournament.level === "grade_2") qualifierRec = 700 + randomInt(-200, 200);
      if (tournament.level === "grade_3") qualifierRec = 1000;
      if (player.ranking <= qualifierRec) player.qualify_tourney[tournament.name] = 3;
    }
    player.junior_points_inputs[tournament.name] = player.junior_points_inputs[tournament.name] ?? 0;
    return;
  }

  let requiredRank = 0;
  if (tournament.level === "challenger75") requiredRank = 350;
  if (tournament.level === "challenger100") requiredRank = 200;
  if (tournament.level === "challenger125") requiredRank = 150;
  if (tournament.level === "atp250") requiredRank = 90;
  if (tournament.level === "atp500") requiredRank = 50;
  if (tournament.level === "grand_slam") requiredRank = 108;
  if (tournament.level === "masters" && tournament.name !== "ATP Finals") requiredRank = Math.floor(tournament.participants * 0.75);
  if (tournament.name === "ATP Finals") requiredRank = 8;

  player.required_ranking[tournament.name] = requiredRank;

  if (player.ranking <= requiredRank) {
    player.qualify_tourney[tournament.name] =
      tournament.level === "grand_slam" || (tournament.level === "masters" && tournament.name !== "Monte Carlo Masters")
        ? -1
        : 1;
  } else {
    player.qualify_tourney[tournament.name] = 0;
  }

  const mandatory =
    tournament.level === "grand_slam" ||
    (tournament.level === "masters" && tournament.name !== "Monte Carlo Masters");
  if (mandatory) player.points_inputs_mandatory[tournament.name] = player.points_inputs_mandatory[tournament.name] ?? 0;
  else player.points_inputs[tournament.name] = player.points_inputs[tournament.name] ?? 0;

  if (player.qualify_tourney[tournament.name] === 0) {
    let wildcard = false;
    if (player.nationality === tournament.country && player.age < 20 && player.potential > 88) wildcard = true;
    if (player.potential > 94 && player.age < 19 && player.ranking < 200) wildcard = true;
    if ((player.best_junior_ranking <= 10 || player.heat > 30) && player.ranking < 250) wildcard = true;
    if (player.tournaments_won[tournament.name]) wildcard = true;

    if (wildcard) {
      player.qualify_tourney[tournament.name] = 2;
      return;
    }

    let qualifierRec = 0;
    if (tournament.level === "grand_slam") qualifierRec = 232;
    if (tournament.level === "masters" && tournament.name !== "ATP Finals") qualifierRec = 150;
    if (tournament.level === "atp500") qualifierRec = 250 + randomInt(-25, 25);
    if (tournament.level === "atp250") qualifierRec = 350 + randomInt(-40, 40);
    if (tournament.level === "challenger125") qualifierRec = 500 + randomInt(-200, 200);
    if (tournament.level === "challenger100") qualifierRec = 1000 + randomInt(-300, 500);
    if (tournament.level === "challenger75") qualifierRec = 2500 + randomInt(-500, 1000);
    if (player.ranking <= qualifierRec) {
      player.qualify_tourney[tournament.name] = 3;
    }
  }
};

const getTournamentsByWeekRange = (startWeek: number, endWeek: number): ScheduleTournament[] => {
  const out: ScheduleTournament[] = [];
  for (let week = startWeek; week <= endWeek; week += 1) {
    const tournaments = TOURNAMENT_SCHEDULE[week] ?? [];
    for (const tournament of tournaments) {
      out.push({ ...tournament, week });
    }
  }
  return out;
};

const getJuniorTournamentsByWeekRange = (startWeek: number, endWeek: number): ScheduleTournament[] => {
  const out: ScheduleTournament[] = [];
  for (let week = startWeek; week <= endWeek; week += 1) {
    const tournament = JUNIOR_TOURNAMENT_SCHEDULE[week];
    if (tournament) {
      out.push({ ...tournament, week });
    }
  }
  return out;
};

const resetSkippedTournamentPoints = (players: Player[], startWeek: number, endWeek: number) => {
  const skipped = getTournamentsByWeekRange(startWeek, endWeek);
  const skippedJunior = getJuniorTournamentsByWeekRange(startWeek, endWeek);

  for (const tournament of skipped) {
    for (const player of players.filter((p) => !p.junior)) {
      if (tournament.level === "grand_slam" || (tournament.level === "masters" && tournament.name !== "Monte Carlo Masters")) {
        player.points_inputs_mandatory[tournament.name] = 0;
      } else {
        player.points_inputs[tournament.name] = 0;
      }
    }
  }

  for (const tournament of skippedJunior) {
    for (const player of players.filter((p) => p.junior)) {
      player.junior_points_inputs[tournament.name] = 0;
    }
  }
};

const hasRecordedResultsForWeek = (players: Player[], week: number): boolean => {
  const seniorTournamentNames = (TOURNAMENT_SCHEDULE[week] ?? []).map((tournament) => tournament.name);
  const juniorTournamentName = JUNIOR_TOURNAMENT_SCHEDULE[week]?.name;

  for (const player of players) {
    if (player.junior) {
      if (juniorTournamentName && player.annual_results[juniorTournamentName] !== undefined) {
        return true;
      }
      continue;
    }

    for (const tournamentName of seniorTournamentNames) {
      if (player.annual_results[tournamentName] !== undefined) {
        return true;
      }
    }
  }

  return false;
};

const isCurrentWeekTournamentProcessed = (state: GameState): boolean => {
  if (state.lastProcessedTournamentWeek === state.week) return true;
  if (state.lastProcessedTournamentWeek !== undefined) return false;

  // Legacy save fallback: infer whether this week was already processed.
  const inferredProcessed = hasRecordedResultsForWeek(state.userPlayers, state.week);
  state.lastProcessedTournamentWeek = inferredProcessed ? state.week : 0;
  return inferredProcessed;
};

const markCurrentWeekProcessed = (state: GameState) => {
  state.lastProcessedTournamentWeek = state.week;
};

const markCurrentWeekUnprocessed = (state: GameState) => {
  state.lastProcessedTournamentWeek = 0;
};

type EligibilityLockState = GameState & { tournamentEligibilityWeek?: number };

const getEligibilityLockWeek = (state: GameState): number => (state as EligibilityLockState).tournamentEligibilityWeek ?? 0;

const setEligibilityLockWeek = (state: GameState, week: number) => {
  (state as EligibilityLockState).tournamentEligibilityWeek = week;
};

const clearEligibilityLockWeek = (state: GameState) => {
  setEligibilityLockWeek(state, 0);
};

const lockTournamentEligibilityForWeek = (state: GameState) => {
  if (getEligibilityLockWeek(state) === state.week) return;

  const seniorTournaments = TOURNAMENT_SCHEDULE[state.week] ?? [];
  for (const tournament of seniorTournaments) {
    for (const player of state.userPlayers.filter((entry) => !entry.junior)) {
      calcRequiredPoints(player, tournament as Tournament);
    }
  }

  const juniorTournament = JUNIOR_TOURNAMENT_SCHEDULE[state.week];
  if (juniorTournament) {
    for (const player of state.userPlayers.filter((entry) => entry.junior)) {
      calcRequiredPoints(player, juniorTournament as JuniorTournament);
    }
  }

  setEligibilityLockWeek(state, state.week);
};

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

export const getAvailableTournaments = (state: GameState): TournamentWithPlayers[] => {
  lockTournamentEligibilityForWeek(state);

  const eligible = state.userPlayers.filter((player) => player.injury_weeks === 0);
  const result: TournamentWithPlayers[] = [];

  const seniorTournaments = TOURNAMENT_SCHEDULE[state.week] ?? [];
  for (const tournament of seniorTournaments) {
    const players: PlayerTournamentEligibility[] = [];
    for (const player of state.userPlayers.filter((entry) => !entry.junior)) {
      if (eligible.find((entry) => entry.player_id === player.player_id)) {
        players.push({
          player_id: player.player_id,
          name: player.name,
          age: player.age,
          country: player.nationality,
          overall: player.overall,
          energy: player.energy,
          hard_court: player.court_proficiencies.hard,
          clay_court: player.court_proficiencies.clay,
          grass_court: player.court_proficiencies.grass,
          qualify_tourney: player.qualify_tourney[tournament.name] ?? 0,
          ranking: player.ranking,
        });
      }
    }
    result.push({ tournament: tournament as Tournament, players, isJunior: false });
  }

  const juniorTournament = JUNIOR_TOURNAMENT_SCHEDULE[state.week];
  if (juniorTournament) {
    const players: PlayerTournamentEligibility[] = [];
    for (const player of state.userPlayers.filter((entry) => entry.junior)) {
      if (eligible.find((entry) => entry.player_id === player.player_id)) {
        players.push({
          player_id: player.player_id,
          name: player.name,
          age: player.age,
          country: player.nationality,
          overall: player.overall,
          energy: player.energy,
          hard_court: player.court_proficiencies.hard,
          clay_court: player.court_proficiencies.clay,
          grass_court: player.court_proficiencies.grass,
          qualify_tourney: player.qualify_tourney[juniorTournament.name] ?? 0,
          ranking: player.ranking,
        });
      }
    }
    result.push({ tournament: juniorTournament as JuniorTournament, players, isJunior: true });
  }

  return result;
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

export const advanceWeek = (state: GameState): GameState => {
  const next = cloneState(state);
  const previousWeek = next.week;
  const injuryAlerts: InjuryAlert[] = [];

  if (!isCurrentWeekTournamentProcessed(next)) {
    resetSkippedTournamentPoints(next.userPlayers, previousWeek, previousWeek);
    markCurrentWeekProcessed(next);
  }

  next.week += 1;
  for (const player of next.userPlayers) {
    const injury = applyWeeklyPlayerProgress(player);
    if (injury) injuryAlerts.push(injury);
  }

  if (next.week > 52) {
    next.week = 1;
    next.year += 1;
    endOfYear(next);
  }

  refreshStandings(next.userPlayers, true);
  clearEligibilityLockWeek(next);
  markCurrentWeekUnprocessed(next);
  const targetScreen = previousWeek === 52 ? "training" : "choose-tournament";
  if (targetScreen === "choose-tournament") {
    lockTournamentEligibilityForWeek(next);
  }
  if (injuryAlerts.length > 0) {
    next.injuryAlerts = injuryAlerts;
    next.postInjuryAlertScreen = targetScreen;
    next.screen = "injury-alert";
  } else {
    next.injuryAlerts = [];
    next.postInjuryAlertScreen = undefined;
    next.screen = targetScreen;
  }
  return next;
};

export const trainPlayers = (state: GameState, choices: Record<number, number>): GameState => {
  const next = cloneState(state);
  for (const player of next.userPlayers) {
    const choice = choices[player.player_id];
    if (choice === undefined) continue;
    if (player.injury_weeks > 0 || player.age >= 28) continue;

    if (choice === 0) {
      const delta = player.age < 24 ? randomBetween(1, 3) * Math.pow(player.potential / 100, 2) * (player.overall < 55 ? 1.7 : 1) : randomBetween(0, 1) * Math.pow(player.potential / 100, 2);
      player.overall = clamp(player.overall + delta, 1, 100);
    } else if (choice === 1) {
      const delta = player.age < 24 ? randomBetween(2, 6) * Math.pow(player.potential / 100, 2) * (player.serve < 60 ? 1.7 : 1) : randomBetween(0, 2) * Math.pow(player.potential / 100, 2);
      player.serve = clamp(player.serve + delta, 1, 100);
    } else if (choice === 2) {
      const delta = player.age < 24 ? randomBetween(1.3, 3) * Math.pow(player.potential / 100, 2) * (player.stamina < 68 ? 1.7 : 1) : randomBetween(0, 1.5) * Math.pow(player.potential / 100, 2);
      player.stamina = clamp(player.stamina + delta, 1, STAMINA_MAX);
    } else if (choice === 3) {
      const delta = player.age < 24 ? randomBetween(2, 6) * Math.pow(player.potential / 100, 2) * (player.big_moments < 60 ? 1.7 : 1) : randomBetween(0, 2) * Math.pow(player.potential / 100, 2);
      player.big_moments = clamp(player.big_moments + delta, 1, 100);
    } else if (choice === 4) {
      const delta = player.age < 24 ? randomBetween(2, 6) * Math.pow(player.potential / 100, 2) * (player.court_proficiencies.hard < 70 ? 1.7 : 1) : randomBetween(0, 2) * Math.pow(player.potential / 100, 2);
      player.court_proficiencies.hard = clamp(player.court_proficiencies.hard + delta, 1, 100);
    } else if (choice === 5) {
      const delta = player.age < 24 ? randomBetween(2, 6) * Math.pow(player.potential / 100, 2) * (player.court_proficiencies.clay < 70 ? 1.7 : 1) : randomBetween(0, 2) * Math.pow(player.potential / 100, 2);
      player.court_proficiencies.clay = clamp(player.court_proficiencies.clay + delta, 1, 100);
    } else if (choice === 6) {
      const delta = player.age < 24 ? randomBetween(2, 6) * Math.pow(player.potential / 100, 2) * (player.court_proficiencies.grass < 70 ? 1.7 : 1) : randomBetween(0, 2) * Math.pow(player.potential / 100, 2);
      player.court_proficiencies.grass = clamp(player.court_proficiencies.grass + delta, 1, 100);
    }
  }

  next.screen = "recruit-territories";
  return next;
};

export const skipToWeek = (state: GameState, week: number): GameState => {
  const next = cloneState(state);
  if (week <= next.week || week > 52) return next;
  const injuryAlerts: InjuryAlert[] = [];

  const startWeek = next.week;
  const skipStartWeek = isCurrentWeekTournamentProcessed(next) ? startWeek + 1 : startWeek;
  const weeksToAdvance = week - startWeek;
  for (let i = 0; i < weeksToAdvance; i += 1) {
    for (const player of next.userPlayers) {
      const injury = applyWeeklyPlayerProgress(player);
      if (injury) injuryAlerts.push(injury);
    }
  }

  resetSkippedTournamentPoints(next.userPlayers, skipStartWeek, week - 1);
  next.week = week;
  clearEligibilityLockWeek(next);
  markCurrentWeekUnprocessed(next);
  refreshStandings(next.userPlayers);
  lockTournamentEligibilityForWeek(next);
  if (injuryAlerts.length > 0) {
    next.injuryAlerts = injuryAlerts;
    next.postInjuryAlertScreen = "choose-tournament";
    next.screen = "injury-alert";
  } else {
    next.injuryAlerts = [];
    next.postInjuryAlertScreen = undefined;
    next.screen = "choose-tournament";
  }
  return next;
};

export const skipToNextYear = (state: GameState): GameState => {
  const next = cloneState(state);
  const oldWeek = next.week;
  const skipStartWeek = isCurrentWeekTournamentProcessed(next) ? oldWeek + 1 : oldWeek;
  const injuryAlerts: InjuryAlert[] = [];

  const weeksToAdvance = 53 - oldWeek;
  for (let i = 0; i < weeksToAdvance; i += 1) {
    for (const player of next.userPlayers) {
      const injury = applyWeeklyPlayerProgress(player);
      if (injury) injuryAlerts.push(injury);
    }
  }

  resetSkippedTournamentPoints(next.userPlayers, skipStartWeek, 52);
  next.week = 1;
  next.year += 1;
  clearEligibilityLockWeek(next);

  endOfYear(next);
  markCurrentWeekUnprocessed(next);
  refreshStandings(next.userPlayers);
  if (injuryAlerts.length > 0) {
    next.injuryAlerts = injuryAlerts;
    next.postInjuryAlertScreen = "training";
    next.screen = "injury-alert";
  } else {
    next.injuryAlerts = [];
    next.postInjuryAlertScreen = undefined;
    next.screen = "training";
  }
  return next;
};

export const dismissInjuryAlerts = (state: GameState): GameState => {
  const next = cloneState(state);
  next.injuryAlerts = [];
  next.screen = next.postInjuryAlertScreen ?? "menu";
  next.postInjuryAlertScreen = undefined;
  return next;
};

export const getTournamentSchedule = (state: GameState): { senior: ScheduleTournament[]; junior: ScheduleTournament[] } => ({
  senior: getTournamentsByWeekRange(state.week + 1, Math.min(52, state.week + 5)),
  junior: getJuniorTournamentsByWeekRange(state.week + 1, Math.min(52, state.week + 10)),
});

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
