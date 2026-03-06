import { JUNIOR_TOURNAMENT_SCHEDULE, TOURNAMENT_SCHEDULE } from "../data/tournamentSchedule";
import { GameState, Player, ScheduleTournament } from "../types/game";

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

export const getTournamentSchedule = (state: GameState): { senior: ScheduleTournament[]; junior: ScheduleTournament[] } => ({
  senior: getTournamentsByWeekRange(state.week + 1, Math.min(52, state.week + 5)),
  junior: getJuniorTournamentsByWeekRange(state.week + 1, Math.min(52, state.week + 10)),
});

export const resetSkippedTournamentPoints = (players: Player[], startWeek: number, endWeek: number) => {
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

export const isCurrentWeekTournamentProcessed = (state: GameState): boolean => {
  if (state.lastProcessedTournamentWeek === state.week) return true;
  if (state.lastProcessedTournamentWeek !== undefined) return false;

  // Legacy save fallback: infer whether this week was already processed.
  const inferredProcessed = hasRecordedResultsForWeek(state.userPlayers, state.week);
  state.lastProcessedTournamentWeek = inferredProcessed ? state.week : 0;
  return inferredProcessed;
};

export const markCurrentWeekProcessed = (state: GameState) => {
  state.lastProcessedTournamentWeek = state.week;
};

export const markCurrentWeekUnprocessed = (state: GameState) => {
  state.lastProcessedTournamentWeek = 0;
};
