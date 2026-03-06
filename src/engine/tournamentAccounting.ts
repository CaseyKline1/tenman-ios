import { JuniorTournament, Player, Tournament } from "../types/game";
import { MAJOR_TOURNAMENTS, MASTERS_TOURNAMENTS } from "./engineConstants";
import { topFinishLabel } from "./engineFormatting";

const pointsForRoundLoss = (
  tournament: Tournament | JuniorTournament,
  roundOut: number,
): number => {
  const level = String(tournament.level);
  if (level === "junior_grand_slam") return [0, 0, 90, 180, 300, 490, 700][roundOut] ?? 0;
  if (level === "grade_a") return [0, 0, 45, 90, 150, 250, 350][roundOut] ?? 0;
  if (level === "grade_1") return [0, 30, 60, 100, 140, 210][roundOut] ?? 0;
  if (level === "grade_2") return [0, 18, 36, 60, 100, 140][roundOut] ?? 0;
  if (level === "grade_3") return [0, 5, 10, 20, 36, 60][roundOut] ?? 0;

  const ratioByRound = [0, 0.004, 0.02, 0.045, 0.09, 0.18, 0.36, 0.6];
  const ratio = ratioByRound[Math.min(roundOut, ratioByRound.length - 1)] ?? 0.01;
  const points = Math.round(tournament.points * ratio);
  return Math.max(points, roundOut === 1 ? 3 : 0);
};

const awardPrizeMoney = (player: Player, tournament: Tournament, win: boolean, roundOut: number): number => {
  if (win) {
    player.career_earnings += tournament.prize_money;
    return tournament.prize_money;
  }
  const rounds = Math.ceil(Math.log2(tournament.participants));
  const playersLeft = Math.pow(2, rounds - roundOut + 1);
  const payout = Math.round(tournament.prize_money / Math.max(playersLeft, 1));
  player.career_earnings += payout;
  return payout;
};

const getEarningsSharePercent = (player: Player): number => {
  const share = Number(player.earnings_share);
  if (!Number.isFinite(share)) return 1;
  return Math.max(1, Math.min(10, Math.round(share)));
};

export const calculateAgentCut = (player: Player, payout: number): number =>
  Math.round(Math.max(0, payout) * getEarningsSharePercent(player) / 100);

const assignTournamentPoints = (
  player: Player,
  tournament: Tournament | JuniorTournament,
  win: boolean,
  roundOut: number,
) => {
  const pointsAwarded = win ? tournament.points : pointsForRoundLoss(tournament, roundOut);

  if (player.junior) {
    player.junior_points_inputs[tournament.name] = pointsAwarded;
  } else {
    const mandatory =
      tournament.level === "grand_slam" ||
      (tournament.level === "masters" && tournament.name !== "Monte Carlo Masters");
    if (mandatory) {
      player.points_inputs_mandatory[tournament.name] = pointsAwarded;
    } else {
      player.points_inputs[tournament.name] = pointsAwarded;
    }
  }

  player.heat += pointsAwarded;
  if (tournament.surface === "hard") player.hard_heat += pointsAwarded;
  if (tournament.surface === "clay") player.clay_heat += pointsAwarded;
  if (tournament.surface === "grass") player.grass_heat += pointsAwarded;
};

const addTournamentWin = (player: Player, tournamentName: string, year: number) => {
  player.tournament_wins += 1;
  if (!player.tournaments_won[tournamentName]) {
    player.tournaments_won[tournamentName] = [];
  }
  player.tournaments_won[tournamentName].push(year);

  if (player.grand_slam_wins > 0) {
    if (
      MAJOR_TOURNAMENTS.includes(tournamentName) ||
      MASTERS_TOURNAMENTS.includes(tournamentName) ||
      tournamentName.includes("Junior")
    ) {
      player.tournaments_won_share[tournamentName] = player.tournaments_won[tournamentName];
    }
  } else {
    player.tournaments_won_share[tournamentName] = player.tournaments_won[tournamentName];
  }
};

export const winTournament = (
  player: Player,
  tournament: Tournament | JuniorTournament,
  year: number,
  rounds: number,
  lines: string[],
): number => {
  assignTournamentPoints(player, tournament, true, rounds + 1);
  let payout = 0;
  if (!player.junior && "prize_money" in tournament) {
    payout = awardPrizeMoney(player, tournament as Tournament, true, rounds + 1);
  }
  if (tournament.level === "grand_slam") {
    player.grand_slam_wins += 1;
  }
  addTournamentWin(player, tournament.name, year);
  lines.push(`${player.name} wins the ${tournament.name}`);
  return payout;
};

export const recordTournamentLoss = (
  player: Player,
  tournament: Tournament | JuniorTournament,
  roundOut: number,
): number => {
  assignTournamentPoints(player, tournament, false, roundOut);
  if (player.junior) return 0;
  return awardPrizeMoney(player, tournament as Tournament, false, roundOut);
};

export const updateBestResults = (
  player: Player,
  tournament: Tournament | JuniorTournament,
  resultTop: number,
  lines: string[],
) => {
  if (tournament.level === "grand_slam" || tournament.level === "masters") {
    const prev = player.best_results[tournament.name] ?? Infinity;
    if (resultTop < prev) {
      player.best_results[tournament.name] = resultTop;
      lines.push(`New best result for ${player.name} at ${tournament.name}: ${topFinishLabel(resultTop)}`);
    }
  } else if (tournament.level === "junior_grand_slam" || tournament.level === "grade_a") {
    const prev = player.best_junior_results[tournament.name] ?? Infinity;
    if (resultTop < prev) {
      player.best_junior_results[tournament.name] = resultTop;
      lines.push(`New best result for ${player.name} at ${tournament.name}: ${topFinishLabel(resultTop)}`);
    }
  }
};
