import { JUNIOR_TOURNAMENT_SCHEDULE, TOURNAMENT_SCHEDULE } from "../data/tournamentSchedule";
import {
  GameState,
  JuniorTournament,
  Player,
  PlayerTournamentEligibility,
  Tournament,
  TournamentWithPlayers,
} from "../types/game";
import { randomInt } from "./random";

type EligibilityLockState = GameState & { tournamentEligibilityWeek?: number };

const getEligibilityLockWeek = (state: GameState): number => (state as EligibilityLockState).tournamentEligibilityWeek ?? 0;

const setEligibilityLockWeek = (state: GameState, week: number) => {
  (state as EligibilityLockState).tournamentEligibilityWeek = week;
};

export const clearEligibilityLockWeek = (state: GameState) => {
  setEligibilityLockWeek(state, 0);
};

const calcRequiredPoints = (player: Player, tournament: Tournament | JuniorTournament) => {
  if ((player.junior && String(tournament.level).startsWith("grade")) || tournament.level === "junior_grand_slam") {
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
  if (tournament.level === "masters" && tournament.name !== "ATP Finals") {
    requiredRank = Math.floor(tournament.participants * 0.75);
  }
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

export const lockTournamentEligibilityForWeek = (state: GameState) => {
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

export const getAvailableTournaments = (state: GameState): TournamentWithPlayers[] => {
  lockTournamentEligibilityForWeek(state);

  const eligible = state.userPlayers.filter(
    (player) =>
      player.injury_weeks === 0 &&
      (player.suspension_weeks_remaining ?? 0) === 0 &&
      (player.break_weeks_remaining ?? 0) === 0,
  );
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
