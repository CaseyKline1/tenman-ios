import { NAME_POOL, TERRITORIES } from "../data/recruiting";
import { Player } from "../types/game";
import { clamp, randomBetween, randomChoice, randomInt } from "./random";
import { ENERGY_MAX, STAMINA_MAX } from "./engineConstants";

const makePotentialLetter = (potential: number): string => {
  if (potential > 97) return "A+";
  if (potential > 93) return "A";
  if (potential > 90) return "A-";
  if (potential > 87) return "B+";
  if (potential > 83) return "B";
  if (potential > 80) return "B-";
  if (potential > 77) return "C+";
  if (potential > 73) return "C";
  if (potential > 70) return "C-";
  if (potential > 67) return "D+";
  if (potential > 63) return "D";
  if (potential > 60) return "D-";
  return "F";
};

const generateName = (nationality: string): string => {
  const pool = NAME_POOL[nationality] ?? NAME_POOL.USA;
  return `${randomChoice(pool.first)} ${randomChoice(pool.last)}`;
};

const generateUniqueName = (nationality: string, takenNames: Set<string>): string => {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    const candidate = generateName(nationality);
    if (!takenNames.has(candidate)) {
      takenNames.add(candidate);
      return candidate;
    }
  }

  const base = generateName(nationality);
  let suffix = 2;
  let fallback = `${base} ${suffix}`;
  while (takenNames.has(fallback)) {
    suffix += 1;
    fallback = `${base} ${suffix}`;
  }
  takenNames.add(fallback);
  return fallback;
};

export const createPlayer = (userName: string, territoryId: number, takenNames: Set<string>): Player => {
  const territory = TERRITORIES.find((t) => t.id === territoryId) ?? TERRITORIES[0];
  const nationality = randomChoice(territory.nationalities);
  const age = randomInt(territory.ageRange[0], territory.ageRange[1]);
  let overall = randomBetween(territory.overallRange[0], territory.overallRange[1]);
  const potential = randomBetween(territory.potentialRange[0], territory.potentialRange[1]);

  if (age < 16 && overall > 50) {
    overall = clamp(52 + randomBetween(-3, 3), 35, 100);
  } else if (age < 18) {
    overall = clamp(62 + randomBetween(-3, 3), 35, 100);
  }

  const serve = clamp(randomBetween(30, 95), 30, 100);
  const junior = age <= 18;
  const player: Player = {
    player_id: randomInt(1_000_000, 9_999_999_999),
    recruited_from: territory.name,
    name: generateUniqueName(nationality, takenNames),
    age,
    nationality,
    overall,
    potential,
    potential_letter: makePotentialLetter(potential),
    energy: ENERGY_MAX,
    court_proficiencies: {
      hard: randomBetween(territory.hardRange[0], territory.hardRange[1]),
      clay: randomBetween(territory.clayRange[0], territory.clayRange[1]),
      grass: randomBetween(territory.grassRange[0], territory.grassRange[1]),
    },
    career_record: { wins: 0, losses: 0 },
    season_record: { wins: 0, losses: 0 },
    tournament_wins: 0,
    grand_slam_wins: 0,
    points: 0,
    junior_points: 0,
    ranking: junior ? randomInt(450, 900) : randomInt(700, 3000),
    best_ranking: 10000,
    best_junior_ranking: 3000,
    weeks_ranked_1: 0,
    user_name: userName,
    injury_weeks: 0,
    injury_prone: randomBetween(0, 1),
    big_moments: randomBetween(territory.clutchRange[0], territory.clutchRange[1]),
    serve,
    stamina: clamp(randomBetween(60, 85), 1, STAMINA_MAX),
    junior,
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

  return player;
};
