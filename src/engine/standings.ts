import { Player } from "../types/game";
import { randomInt } from "./random";

type RankBand = {
  minPointsExclusive: number;
  minRank: number;
  maxRank: number;
};

const SENIOR_RANK_BANDS: RankBand[] = [
  { minPointsExclusive: 10000, minRank: 1, maxRank: 1 },
  { minPointsExclusive: 8000, minRank: 2, maxRank: 2 },
  { minPointsExclusive: 7000, minRank: 3, maxRank: 3 },
  { minPointsExclusive: 5500, minRank: 4, maxRank: 4 },
  { minPointsExclusive: 5000, minRank: 5, maxRank: 5 },
  { minPointsExclusive: 4500, minRank: 6, maxRank: 6 },
  { minPointsExclusive: 4000, minRank: 7, maxRank: 7 },
  { minPointsExclusive: 3900, minRank: 8, maxRank: 8 },
  { minPointsExclusive: 3800, minRank: 9, maxRank: 9 },
  { minPointsExclusive: 3700, minRank: 10, maxRank: 10 },
  { minPointsExclusive: 2500, minRank: 11, maxRank: 15 },
  { minPointsExclusive: 2000, minRank: 16, maxRank: 21 },
  { minPointsExclusive: 1500, minRank: 22, maxRank: 31 },
  { minPointsExclusive: 1000, minRank: 32, maxRank: 52 },
  { minPointsExclusive: 750, minRank: 53, maxRank: 77 },
  { minPointsExclusive: 500, minRank: 78, maxRank: 117 },
  { minPointsExclusive: 400, minRank: 118, maxRank: 162 },
  { minPointsExclusive: 300, minRank: 163, maxRank: 200 },
  { minPointsExclusive: 250, minRank: 201, maxRank: 242 },
  { minPointsExclusive: 200, minRank: 243, maxRank: 275 },
  { minPointsExclusive: 150, minRank: 276, maxRank: 339 },
  { minPointsExclusive: 100, minRank: 340, maxRank: 434 },
  { minPointsExclusive: 75, minRank: 435, maxRank: 517 },
  { minPointsExclusive: 50, minRank: 518, maxRank: 624 },
  { minPointsExclusive: 40, minRank: 625, maxRank: 699 },
  { minPointsExclusive: 30, minRank: 700, maxRank: 770 },
  { minPointsExclusive: 20, minRank: 771, maxRank: 880 },
  { minPointsExclusive: 15, minRank: 881, maxRank: 977 },
  { minPointsExclusive: 10, minRank: 978, maxRank: 1100 },
  { minPointsExclusive: 7, minRank: 1101, maxRank: 1206 },
  { minPointsExclusive: 5, minRank: 1207, maxRank: 1302 },
  { minPointsExclusive: 3, minRank: 1303, maxRank: 1459 },
  { minPointsExclusive: 2, minRank: 1460, maxRank: 1600 },
  { minPointsExclusive: 0, minRank: 1601, maxRank: 2200 },
  { minPointsExclusive: Number.NEGATIVE_INFINITY, minRank: 2201, maxRank: 3000 },
];

const JUNIOR_RANK_BANDS: RankBand[] = [
  { minPointsExclusive: 3000, minRank: 1, maxRank: 1 },
  { minPointsExclusive: 2800, minRank: 2, maxRank: 2 },
  { minPointsExclusive: 2700, minRank: 3, maxRank: 3 },
  { minPointsExclusive: 2500, minRank: 4, maxRank: 4 },
  { minPointsExclusive: 2200, minRank: 5, maxRank: 5 },
  { minPointsExclusive: 2100, minRank: 6, maxRank: 6 },
  { minPointsExclusive: 2000, minRank: 7, maxRank: 7 },
  { minPointsExclusive: 1900, minRank: 8, maxRank: 8 },
  { minPointsExclusive: 1850, minRank: 9, maxRank: 9 },
  { minPointsExclusive: 1800, minRank: 10, maxRank: 10 },
  { minPointsExclusive: 1500, minRank: 11, maxRank: 20 },
  { minPointsExclusive: 1200, minRank: 21, maxRank: 30 },
  { minPointsExclusive: 1100, minRank: 31, maxRank: 40 },
  { minPointsExclusive: 1000, minRank: 41, maxRank: 50 },
  { minPointsExclusive: 900, minRank: 51, maxRank: 60 },
  { minPointsExclusive: 800, minRank: 61, maxRank: 70 },
  { minPointsExclusive: 700, minRank: 71, maxRank: 83 },
  { minPointsExclusive: 600, minRank: 84, maxRank: 100 },
  { minPointsExclusive: 500, minRank: 101, maxRank: 110 },
  { minPointsExclusive: 400, minRank: 111, maxRank: 115 },
  { minPointsExclusive: 300, minRank: 116, maxRank: 120 },
  { minPointsExclusive: 200, minRank: 121, maxRank: 151 },
  { minPointsExclusive: 150, minRank: 152, maxRank: 200 },
  { minPointsExclusive: 100, minRank: 201, maxRank: 250 },
  { minPointsExclusive: 75, minRank: 251, maxRank: 300 },
  { minPointsExclusive: 50, minRank: 301, maxRank: 350 },
  { minPointsExclusive: 40, minRank: 351, maxRank: 400 },
  { minPointsExclusive: 30, minRank: 401, maxRank: 450 },
  { minPointsExclusive: 20, minRank: 451, maxRank: 500 },
  { minPointsExclusive: 15, minRank: 501, maxRank: 550 },
  { minPointsExclusive: 10, minRank: 551, maxRank: 600 },
  { minPointsExclusive: 7, minRank: 601, maxRank: 650 },
  { minPointsExclusive: 5, minRank: 651, maxRank: 700 },
  { minPointsExclusive: 3, minRank: 701, maxRank: 750 },
  { minPointsExclusive: 2, minRank: 751, maxRank: 800 },
  { minPointsExclusive: 0, minRank: 801, maxRank: 850 },
  { minPointsExclusive: Number.NEGATIVE_INFINITY, minRank: 851, maxRank: 900 },
];

const pickRankFromBands = (points: number, bands: RankBand[]): number => {
  for (const band of bands) {
    if (points > band.minPointsExclusive) {
      if (band.minRank === band.maxRank) return band.minRank;
      return randomInt(band.minRank, band.maxRank);
    }
  }
  return bands[bands.length - 1].minRank;
};

const rankSeniors = (players: Player[], countWeeksRankedOne: boolean = true) => {
  const sorted = [...players]
    .filter((p) => !p.junior)
    .sort((a, b) => b.points - a.points);

  let highestAssignedRank = 0;
  for (const player of sorted) {
    const rank = Math.max(highestAssignedRank + 1, pickRankFromBands(player.points, SENIOR_RANK_BANDS));
    player.ranking = rank;
    highestAssignedRank = rank;
    player.best_ranking = Math.min(player.best_ranking, player.ranking);
    if (countWeeksRankedOne && player.ranking === 1) player.weeks_ranked_1 += 1;
  }
};

const rankJuniors = (players: Player[]) => {
  const sorted = [...players]
    .filter((p) => p.junior)
    .sort((a, b) => b.junior_points - a.junior_points);

  let highestAssignedRank = 0;
  for (const player of sorted) {
    const rank = Math.max(highestAssignedRank + 1, pickRankFromBands(player.junior_points, JUNIOR_RANK_BANDS));
    player.ranking = rank;
    highestAssignedRank = rank;
    player.best_junior_ranking = Math.min(player.best_junior_ranking, player.ranking);
  }
};

export const calculatePoints = (player: Player) => {
  if (player.junior) {
    const values = Object.values(player.junior_points_inputs).sort((a, b) => b - a);
    player.junior_points = values.slice(0, 7).reduce((sum, value) => sum + value, 0);
    return;
  }

  const mandatory = Object.values(player.points_inputs_mandatory).reduce((sum, value) => sum + value, 0);
  const optional = Object.values(player.points_inputs)
    .sort((a, b) => b - a)
    .slice(0, 7)
    .reduce((sum, value) => sum + value, 0);
  player.points = mandatory + optional;
};

export const refreshStandings = (players: Player[], countWeeksRankedOne: boolean = false) => {
  for (const player of players) {
    calculatePoints(player);
  }
  rankSeniors(players, countWeeksRankedOne);
  rankJuniors(players);
};
