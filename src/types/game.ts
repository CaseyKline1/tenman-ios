export type Surface = "hard" | "clay" | "grass";

export type TournamentLevel =
  | "grand_slam"
  | "masters"
  | "atp500"
  | "atp250"
  | "challenger125"
  | "challenger100"
  | "challenger75";

export type JuniorTournamentLevel =
  | "junior_grand_slam"
  | "grade_a"
  | "grade_1"
  | "grade_2"
  | "grade_3";

export interface Tournament {
  name: string;
  surface: Surface;
  level: TournamentLevel;
  country: string;
  participants: number;
  points: number;
  prize_money: number;
}

export interface JuniorTournament {
  name: string;
  surface: Surface;
  level: JuniorTournamentLevel;
  country: string;
  participants: number;
  points: number;
  prize_money: number;
}

export interface CourtProficiencies {
  hard: number;
  clay: number;
  grass: number;
}

export interface RecordStat {
  wins: number;
  losses: number;
}

export interface Player {
  player_id: number;
  name: string;
  age: number;
  nationality: string;
  overall: number;
  potential: number;
  potential_letter: string;
  energy: number;
  court_proficiencies: CourtProficiencies;
  career_record: RecordStat;
  season_record: RecordStat;
  tournament_wins: number;
  grand_slam_wins: number;
  points: number;
  junior_points: number;
  ranking: number;
  best_ranking: number;
  best_junior_ranking: number;
  weeks_ranked_1: number;
  user_name: string;
  injury_weeks: number;
  injury_prone: number;
  big_moments: number;
  serve: number;
  stamina: number;
  junior: boolean;
  career_earnings: number;
  heat: number;
  hard_heat: number;
  clay_heat: number;
  grass_heat: number;
  qualify_tourney: Record<string, number>;
  required_ranking: Record<string, number>;
  points_inputs: Record<string, number>;
  points_inputs_mandatory: Record<string, number>;
  junior_points_inputs: Record<string, number>;
  tournaments_won: Record<string, number[]>;
  tournaments_won_share: Record<string, number[]>;
  best_results: Record<string, number>;
  best_junior_results: Record<string, number>;
  annual_results: Record<string, number>;
  last_year_results: Record<string, number>;
  head_to_head_wins: Record<string, number>;
  head_to_head_win_breakdown: Record<string, Record<string, number[]>>;
}

export type ScreenKey =
  | "landing"
  | "recruit-territories"
  | "offer-recruits"
  | "choose-tournament"
  | "tournament-results"
  | "menu"
  | "view-senior-players"
  | "view-junior-players"
  | "training"
  | "remove-player"
  | "skip-ahead"
  | "view-tournament-schedule"
  | "exhibition-match";

export interface TournamentResult {
  tournamentName: string;
  lines: string[];
}

export interface GameState {
  userName: string;
  week: number;
  year: number;
  // 0 means current week tournaments are not processed yet.
  // Otherwise this stores the processed week number.
  lastProcessedTournamentWeek?: number;
  userPlayers: Player[];
  offerRecruits: Player[];
  lastTournamentResults: TournamentResult[];
  screen: ScreenKey;
}

export interface TournamentWithPlayers {
  tournament: Tournament | JuniorTournament;
  players: PlayerTournamentEligibility[];
  isJunior: boolean;
}

export interface PlayerTournamentEligibility {
  player_id: number;
  name: string;
  age: number;
  country: string;
  overall: number;
  energy: number;
  hard_court: number;
  clay_court: number;
  grass_court: number;
  qualify_tourney: number;
  ranking: number;
}

export interface ScheduleTournament {
  name: string;
  level: string;
  surface: Surface;
  country: string;
  participants: number;
  prize_money: number;
  points: number;
  week: number;
}
