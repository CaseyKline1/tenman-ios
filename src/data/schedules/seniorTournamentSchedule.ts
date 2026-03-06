import { Tournament } from "../../types/game";
import { SENIOR_TOURNAMENT_SCHEDULE_WEEKS_1_13 } from "./seniorTournamentScheduleWeeks1To13";
import { SENIOR_TOURNAMENT_SCHEDULE_WEEKS_14_26 } from "./seniorTournamentScheduleWeeks14To26";
import { SENIOR_TOURNAMENT_SCHEDULE_WEEKS_27_39 } from "./seniorTournamentScheduleWeeks27To39";
import { SENIOR_TOURNAMENT_SCHEDULE_WEEKS_40_52 } from "./seniorTournamentScheduleWeeks40To52";

export const TOURNAMENT_SCHEDULE: Record<number, Tournament[]> = {
  ...SENIOR_TOURNAMENT_SCHEDULE_WEEKS_1_13,
  ...SENIOR_TOURNAMENT_SCHEDULE_WEEKS_14_26,
  ...SENIOR_TOURNAMENT_SCHEDULE_WEEKS_27_39,
  ...SENIOR_TOURNAMENT_SCHEDULE_WEEKS_40_52,
};
