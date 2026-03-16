import { GameState, InjuryAlert } from "../types/game";
import { applyWeeklyPlayerProgress, endOfYear } from "./playerProgress";
import { generateQuarterlyScenario, QUARTERLY_TRIGGER_WEEKS } from "./quarterlyScenarios";
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

  const seenScenarios = next.quarterly_scenarios_seen ?? [];
  const isQuarterlyTrigger =
    QUARTERLY_TRIGGER_WEEKS.includes(previousWeek) && !seenScenarios.includes(previousWeek);
  let pendingScenario = null;
  if (isQuarterlyTrigger) {
    next.quarterly_scenarios_seen = [...seenScenarios, previousWeek];
    pendingScenario = generateQuarterlyScenario(next);
  }

  if (injuryAlerts.length > 0) {
    next.injuryAlerts = injuryAlerts;
    if (pendingScenario) {
      next.pending_scenario = pendingScenario;
      next.post_scenario_screen = targetScreen;
      next.postInjuryAlertScreen = "quarterly-scenario";
    } else {
      next.postInjuryAlertScreen = targetScreen;
    }
    next.screen = "injury-alert";
  } else if (pendingScenario) {
    next.injuryAlerts = [];
    next.postInjuryAlertScreen = undefined;
    next.pending_scenario = pendingScenario;
    next.post_scenario_screen = targetScreen;
    next.screen = "quarterly-scenario";
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

  const skippedTriggers = QUARTERLY_TRIGGER_WEEKS.filter(
    (w) => w >= startWeek && w < week && !(next.quarterly_scenarios_seen ?? []).includes(w),
  );
  if (skippedTriggers.length > 0) {
    next.quarterly_scenarios_seen = [...(next.quarterly_scenarios_seen ?? []), ...skippedTriggers];
  }

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
