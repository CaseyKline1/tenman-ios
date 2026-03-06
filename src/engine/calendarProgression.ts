import { GameState, InjuryAlert } from "../types/game";
import { applyWeeklyPlayerProgress, endOfYear } from "./playerProgress";
import {
  isCurrentWeekTournamentProcessed,
  markCurrentWeekProcessed,
  markCurrentWeekUnprocessed,
  resetSkippedTournamentPoints,
} from "./scheduleProcessing";
import { refreshStandings } from "./standings";
import { cloneState } from "./stateClone";
import { clearEligibilityLockWeek, lockTournamentEligibilityForWeek } from "./tournamentEligibility";

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
