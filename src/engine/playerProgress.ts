import { GameState, InjuryAlert, Player } from "../types/game";
import { clamp, randomBetween, randomInt } from "./random";
import { ENERGY_MAX, MAJOR_TOURNAMENTS, MASTERS_TOURNAMENTS, STAMINA_MAX } from "./engineConstants";

const improvePlayerAtYearEnd = (player: Player) => {
  const totalSeasonMatches = Math.max(1, player.season_record.wins + player.season_record.losses);
  const seasonWinRate = player.season_record.wins / totalSeasonMatches;

  let yearSuccess = seasonWinRate;
  if (player.junior) {
    yearSuccess = seasonWinRate * 0.4 + player.junior_points / 3000;
  } else {
    yearSuccess = seasonWinRate * 0.7 + player.points / 5000;
  }

  let improvementRate = 0;
  if (player.age < 23) {
    improvementRate = player.potential * randomBetween(0.03, 0.055) * (yearSuccess + 0.4);
  } else if (player.age < 26) {
    improvementRate = player.potential * randomBetween(0, 0.02) * yearSuccess;
  } else if (player.age < 31) {
    improvementRate = randomBetween(0, 1) * yearSuccess - randomBetween(0, 1);
  } else if (player.age < 34) {
    improvementRate = Math.min(randomBetween(0, 1) * yearSuccess - randomBetween(0, 5), 0);
  } else {
    improvementRate = -randomBetween(2, 7);
  }

  if (player.age > 30) {
    player.serve -= randomBetween(0, 3);
    player.stamina -= randomBetween(0, 2.5);
  }
  if (player.age > 33) {
    player.serve -= randomBetween(0, 3);
    player.stamina -= randomBetween(0, 2.5);
  }

  player.overall = clamp(player.overall + improvementRate, 1, 100);
  player.serve = clamp(player.serve, 1, 100);
  player.stamina = clamp(player.stamina, 1, STAMINA_MAX);
};

export const endOfYear = (state: GameState) => {
  for (const player of state.userPlayers) {
    player.age += 1;
    improvePlayerAtYearEnd(player);
    player.last_year_results = { ...player.annual_results };
    player.annual_results = {};
    player.season_record = { wins: 0, losses: 0 };
    player.energy = ENERGY_MAX;
  }

  state.userPlayers = state.userPlayers.filter((player) => player.age <= 40);

  for (const player of state.userPlayers) {
    if (player.age > 18 && player.junior) {
      player.junior = false;
      player.ranking = 3000;
      player.junior_points = 0;
      player.junior_points_inputs = {};
      player.weeks_ranked_1 = 0;
    }

    const majorWin = Object.keys(player.tournaments_won).some((name) => MAJOR_TOURNAMENTS.includes(name));
    if (majorWin) {
      player.tournaments_won_share = {};
      for (const [name, years] of Object.entries(player.tournaments_won)) {
        if (MAJOR_TOURNAMENTS.includes(name) || MASTERS_TOURNAMENTS.includes(name) || name.includes("Junior")) {
          player.tournaments_won_share[name] = years;
        }
      }
    } else {
      player.tournaments_won_share = { ...player.tournaments_won };
    }
  }
};

const checkForInjury = (player: Player) => {
  const ageFactor = player.age > 35 ? 0.025 : player.age > 30 ? 0.012 : 0;
  const energyRisk = clamp((ENERGY_MAX - player.energy) / ENERGY_MAX, 0, 1);
  const injuryChance = energyRisk * (0.035 + player.injury_prone * 0.07) + ageFactor;
  if (Math.random() < injuryChance) {
    const weeks = randomInt(1, 12);
    player.injury_weeks += weeks;
    return true;
  }
  return false;
};

export const applyWeeklyPlayerProgress = (player: Player): InjuryAlert | null => {
  const wasHealthy = player.injury_weeks === 0;
  player.injury_weeks = Math.max(0, player.injury_weeks - 1);
  const injuredThisWeek = checkForInjury(player);
  player.energy = player.junior
    ? clamp(player.energy + 7, 1, ENERGY_MAX)
    : clamp(Math.max(Math.pow(ENERGY_MAX - player.energy, 0.8), player.energy + 11), 1, ENERGY_MAX);
  player.heat = Math.pow(player.heat, 2 / 3);
  player.hard_heat = Math.pow(player.hard_heat, 2 / 3);
  player.clay_heat = Math.pow(player.clay_heat, 2 / 3);
  player.grass_heat = Math.pow(player.grass_heat, 2 / 3);

  if (wasHealthy && injuredThisWeek) {
    return {
      player_id: player.player_id,
      player_name: player.name,
      weeks_out: player.injury_weeks,
    };
  }
  return null;
};
