import { GameState, Player, QuarterlyScenario } from "../types/game";
import { ENERGY_MAX, STAMINA_MAX } from "./engineConstants";
import { makePotentialLetter, generateUniqueName } from "./playerGeneration";
import { clamp, randomBetween, randomChoice, randomInt } from "./random";

export const QUARTERLY_TRIGGER_WEEKS = [13, 26, 39];

const ENDORSEMENT_BRANDS = [
  "Apex Sports",
  "Vantage Athletic",
  "ProServe",
  "MatchPoint",
  "Grand Slam Athletic",
  "Net Force",
  "Deuce Sports",
  "Baseline Athletic",
  "Smash Athletic",
  "Topspin Athletic",
  "Rally Sports",
  "Ace Athletic",
];

const SCENARIO_NATIONALITIES = [
  "USA", "Spain", "England", "Argentina", "France", "Australia", "Germany", "Serbia",
];

const generateEndorsementOffer = (
  player: Player,
): { brand: string; total_value: number; years: number; agent_cut: number } => {
  let baseValuePerYear: number;
  if (player.ranking <= 10) {
    baseValuePerYear = randomBetween(2_000_000, 10_000_000);
  } else if (player.ranking <= 50) {
    baseValuePerYear = randomBetween(800_000, 3_000_000);
  } else if (player.ranking <= 100) {
    baseValuePerYear = randomBetween(400_000, 1_200_000);
  } else if (player.ranking <= 200) {
    baseValuePerYear = randomBetween(200_000, 500_000);
  } else if (player.ranking <= 500) {
    baseValuePerYear = randomBetween(80_000, 250_000);
  } else {
    baseValuePerYear = randomBetween(30_000, 100_000);
  }

  if (player.age <= 22 && player.is_promising_junior) {
    baseValuePerYear *= randomBetween(1.3, 1.6);
  }

  baseValuePerYear *= randomBetween(0.7, 1.3);

  const years = randomInt(1, 3);
  const totalValue = Math.round(baseValuePerYear * years);
  const agentCut = Math.round(totalValue * 0.1);
  const brand = randomChoice(ENDORSEMENT_BRANDS);

  return { brand, total_value: totalValue, years, agent_cut: agentCut };
};

const createScenarioPlayerBase = (userName: string, takenNames: Set<string>): Player => {
  const nationality = randomChoice(SCENARIO_NATIONALITIES);
  const name = generateUniqueName(nationality, takenNames);
  return {
    player_id: randomInt(1_000_000, 9_999_999_999),
    recruited_from: "",
    name,
    age: 0,
    nationality,
    overall: 60,
    potential: 75,
    potential_letter: "C",
    energy: ENERGY_MAX,
    court_proficiencies: { hard: 65, clay: 65, grass: 65 },
    career_record: { wins: 0, losses: 0 },
    season_record: { wins: 0, losses: 0 },
    tournament_wins: 0,
    grand_slam_wins: 0,
    points: 0,
    junior_points: 0,
    ranking: 1000,
    best_ranking: 10000,
    best_junior_ranking: 3000,
    weeks_ranked_1: 0,
    user_name: userName,
    injury_weeks: 0,
    injury_prone: randomBetween(0.1, 0.5),
    big_moments: Math.round(randomBetween(40, 80)),
    serve: Math.round(randomBetween(40, 85)),
    stamina: clamp(Math.round(randomBetween(60, 85)), 1, STAMINA_MAX),
    junior: false,
    career_earnings: 0,
    earnings_share: randomInt(1, 10),
    heat: 0,
    hard_heat: 0,
    clay_heat: 0,
    grass_heat: 0,
    qualify_tourney: {},
    required_ranking: {},
    points_inputs: {},
    points_inputs_mandatory: {},
    junior_points_inputs: {},
    tournaments_won: {},
    tournaments_won_share: {},
    best_results: {},
    best_junior_results: {},
    annual_results: {},
    last_year_results: {},
    head_to_head_wins: {},
    head_to_head_win_breakdown: {},
  };
};

const generateStarVet = (userName: string, cost: number, takenNames: Set<string>): Player => {
  const qualityFactor = clamp((cost - 100_000) / 400_000, 0, 1);
  const overall = Math.round(clamp(52 + qualityFactor * 28 + randomBetween(-3, 3), 50, 82));
  const potential = Math.round(clamp(overall + randomBetween(0, 8), 52, 88));
  const age = Math.round(clamp(36 - qualityFactor * 12 + randomBetween(-2, 2), 24, 37));

  const basePoints = Math.round(50 + qualityFactor * 450 + randomBetween(-20, 20));
  const player = createScenarioPlayerBase(userName, takenNames);
  player.recruited_from = "Veteran Representation";
  player.overall = overall;
  player.potential = potential;
  player.potential_letter = makePotentialLetter(potential);
  player.age = age;
  player.junior = false;
  player.points_inputs["Career Points"] = Math.max(0, basePoints);
  player.points = Math.max(0, basePoints);
  player.court_proficiencies = {
    hard: Math.round(randomBetween(55, 55 + qualityFactor * 35)),
    clay: Math.round(randomBetween(50, 50 + qualityFactor * 35)),
    grass: Math.round(randomBetween(50, 50 + qualityFactor * 35)),
  };
  return player;
};

const generateSuperstarYoungster = (userName: string, cost: number, takenNames: Set<string>): Player => {
  const costFactor = clamp((cost - 200_000) / 800_000, 0, 1);
  const potential = Math.round(clamp(92 + costFactor * 8 + randomBetween(-2, 2), 90, 100));
  const age = randomInt(14, 15);
  const overall = age < 15
    ? Math.round(clamp(62 + costFactor * 6 + randomBetween(-5, 5), 54, 72))
    : Math.round(clamp(66 + costFactor * 6 + randomBetween(-5, 5), 58, 76));

  const archetype = randomInt(1, 5);
  let hard: number, clay: number, grass: number, serve: number, stamina: number, clutch: number;

  if (archetype === 1) {
    // Clay specialist (high stamina, moderate serve)
    clay = Math.round(randomBetween(80, 93));
    hard = Math.round(randomBetween(66, 80));
    grass = Math.round(randomBetween(58, 72));
    serve = Math.round(randomBetween(52, 70));
    stamina = Math.round(randomBetween(82, 94));
    clutch = Math.round(randomBetween(55, 75));
  } else if (archetype === 2) {
    // Hard court baseliner (well-rounded, solid everywhere)
    hard = Math.round(randomBetween(80, 93));
    clay = Math.round(randomBetween(72, 84));
    grass = Math.round(randomBetween(68, 80));
    serve = Math.round(randomBetween(62, 78));
    stamina = Math.round(randomBetween(78, 90));
    clutch = Math.round(randomBetween(58, 76));
  } else if (archetype === 3) {
    // Big server (dominant on fast courts, weaker on clay)
    serve = Math.round(randomBetween(82, 95));
    hard = Math.round(randomBetween(76, 90));
    grass = Math.round(randomBetween(74, 88));
    clay = Math.round(randomBetween(56, 72));
    stamina = Math.round(randomBetween(64, 78));
    clutch = Math.round(randomBetween(50, 70));
  } else if (archetype === 4) {
    // All-court attacker (Federer-type, grass and hard dominant)
    hard = Math.round(randomBetween(78, 90));
    grass = Math.round(randomBetween(80, 92));
    clay = Math.round(randomBetween(68, 80));
    serve = Math.round(randomBetween(70, 84));
    stamina = Math.round(randomBetween(70, 84));
    clutch = Math.round(randomBetween(65, 82));
  } else {
    // Defensive grinder (elite stamina and clutch, weaker serve)
    clay = Math.round(randomBetween(82, 94));
    hard = Math.round(randomBetween(62, 76));
    grass = Math.round(randomBetween(56, 70));
    serve = Math.round(randomBetween(44, 62));
    stamina = Math.round(randomBetween(86, 96));
    clutch = Math.round(randomBetween(72, 88));
  }

  const juniorBasePoints = 0;
  const player = createScenarioPlayerBase(userName, takenNames);
  player.recruited_from = "Junior Scouting";
  player.overall = overall;
  player.potential = potential;
  player.potential_letter = makePotentialLetter(potential);
  player.age = age;
  player.junior = true;
  player.is_promising_junior = true;
  player.junior_points_inputs["Career Junior Points"] = juniorBasePoints;
  player.junior_points = juniorBasePoints;
  player.points = 0;
  player.serve = serve;
  player.stamina = clamp(stamina, 1, STAMINA_MAX);
  player.big_moments = clutch;
  player.court_proficiencies = { hard, clay, grass };
  return player;
};

export const generateQuarterlyScenario = (state: GameState): QuarterlyScenario | null => {
  const seniorPlayers = state.userPlayers.filter((p) => !p.junior);
  const allPlayers = state.userPlayers;
  const takenNames = new Set(state.userPlayers.map((p) => p.name));
  const roll = Math.random();

  // steroids_ban: 5%
  if (roll < 0.05) {
    if (allPlayers.length === 0) return null;
    const player = randomChoice(allPlayers);
    player.suspension_weeks_remaining = 52;
    return {
      type: "steroids_ban",
      affected_player_id: player.player_id,
      affected_player_name: player.name,
    };
  }

  // player_break: 5%
  if (roll < 0.10) {
    if (allPlayers.length === 0) return null;
    const player = randomChoice(allPlayers);
    const months = randomChoice([3, 6, 12, 18]);
    const weeks = months === 3 ? 13 : months === 6 ? 26 : months === 12 ? 52 : 78;
    player.break_weeks_remaining = weeks;
    return {
      type: "player_break",
      affected_player_id: player.player_id,
      affected_player_name: player.name,
      break_months: months,
    };
  }

  // star_vet: 3%
  if (roll < 0.13) {
    const cost = Math.round(randomBetween(100_000, 500_000));
    const recruit = generateStarVet(state.userName, cost, takenNames);
    return {
      type: "star_vet",
      recruit_offer: recruit,
      recruit_cost: cost,
    };
  }

  // superstar_youngster: 5%
  if (roll < 0.18) {
    const cost = Math.round(randomBetween(200_000, 1_000_000));
    const recruit = generateSuperstarYoungster(state.userName, cost, takenNames);
    return {
      type: "superstar_youngster",
      recruit_offer: recruit,
      recruit_cost: cost,
    };
  }

  // potential_boost: 6%
  if (roll < 0.24) {
    if (allPlayers.length === 0) return null;
    const player = randomChoice(allPlayers);
    const change = Math.round(randomBetween(3, 8));
    player.potential = Math.round(clamp(player.potential + change, 1, 100));
    player.potential_letter = makePotentialLetter(player.potential);
    return {
      type: "potential_boost",
      affected_player_id: player.player_id,
      affected_player_name: player.name,
      potential_change: change,
      new_potential_letter: player.potential_letter,
    };
  }

  // potential_decline: 6%
  if (roll < 0.30) {
    if (allPlayers.length === 0) return null;
    const player = randomChoice(allPlayers);
    const change = Math.round(randomBetween(3, 8));
    player.potential = Math.round(clamp(player.potential - change, 1, 100));
    player.potential_letter = makePotentialLetter(player.potential);
    return {
      type: "potential_decline",
      affected_player_id: player.player_id,
      affected_player_name: player.name,
      potential_change: -change,
      new_potential_letter: player.potential_letter,
    };
  }

  // endorsement_offer: 70%
  const eligibleForEndorsement = seniorPlayers.filter(
    (p) => !p.endorsement || p.endorsement.end_year <= state.year,
  );
  if (eligibleForEndorsement.length === 0) return null;
  const player = randomChoice(eligibleForEndorsement);
  const offer = generateEndorsementOffer(player);
  return {
    type: "endorsement_offer",
    endorsement_offer: {
      player_id: player.player_id,
      player_name: player.name,
      ...offer,
    },
  };
};
