import {
  ExhibitionFocus,
} from "../data/recruiting";
import {
  JuniorTournament,
  Player,
  Surface,
  Tournament,
} from "../types/game";
import { MAJOR_TOURNAMENTS, MASTERS_TOURNAMENTS, STAMINA_MAX } from "./engineConstants";
import { roundLabel, topFinishLabel } from "./engineFormatting";
import { clamp, randomBetween, randomInt } from "./random";

const useEnergy = (player: Player) => {
  const normalizedEnergy = clamp(player.energy / 100, 0.01, 1);
  const effectiveStamina = clamp(player.stamina, 1, STAMINA_MAX);
  const staminaPenalty = Math.sqrt((100 - effectiveStamina) / 25);
  const energyUsed = 0.15 / Math.sqrt(normalizedEnergy) * staminaPenalty;
  player.energy = clamp(player.energy - energyUsed, 0.01, 100);
};

const adjustSurfaceGrowth = (player: Player, surface: Surface) => {
  if (surface === "hard") {
    player.court_proficiencies.hard = clamp(player.court_proficiencies.hard + randomBetween(0, 0.02), 0, 100);
  } else if (surface === "clay") {
    player.court_proficiencies.clay = clamp(player.court_proficiencies.clay + randomBetween(0, 0.06), 0, 100);
  } else {
    player.court_proficiencies.grass = clamp(player.court_proficiencies.grass + randomBetween(0, 0.1), 0, 100);
  }
};

const calcSkill = (
  player: Player,
  tournament: Tournament | JuniorTournament,
  currentRound: number,
  set: number,
  game: number,
  serve: boolean,
): number => {
  const sameCountry = tournament.country === player.nationality;
  const court = Math.pow((player.court_proficiencies[tournament.surface] ?? 50) / 100, 0.67);
  let heat = player.heat;
  if (tournament.surface === "hard") heat += player.hard_heat;
  if (tournament.surface === "clay") heat += player.clay_heat;
  if (tournament.surface === "grass") heat += player.grass_heat;

  const rand = randomBetween(0.8, 1.2);
  let skill = (player.overall * (player.energy / 100) * court * rand + heat / 10) * (sameCountry ? 1.1 : 1);

  if (serve) {
    const serveFactor = (player.serve - 25) / 100;
    if (tournament.surface === "hard") skill *= Math.pow(1 + serveFactor, 0.75);
    if (tournament.surface === "clay") skill *= Math.pow(1 + serveFactor, 0.65);
    if (tournament.surface === "grass") skill *= Math.pow(1 + serveFactor, 0.9);
  }

  const clutchFactor = (player.big_moments - 60) / 100;
  const rounds = Math.max(1, Math.log2(tournament.participants));
  if (tournament.level === "grand_slam") skill *= Math.pow(1 + clutchFactor, 0.25);
  if (tournament.level === "masters") skill *= Math.pow(1 + clutchFactor, 0.125);
  if (tournament.level === "junior_grand_slam") skill *= Math.pow(1 + clutchFactor, 0.2);
  if (tournament.level === "grade_a") skill *= Math.pow(1 + clutchFactor, 0.1);

  if (currentRound === rounds) skill *= Math.pow(1 + clutchFactor, 0.5);
  else if (currentRound === rounds - 1) skill *= Math.pow(1 + clutchFactor, 0.25);

  if (set === 5) skill *= Math.pow(1 + clutchFactor, 0.125);
  if (game > 10) skill *= randomBetween(0.98, 1.03);
  return skill;
};

const getDifficulty = (
  tournament: Tournament | JuniorTournament,
  junior: boolean,
  qual = false,
): number => {
  if (qual) {
    if (tournament.level === "grand_slam") return 62;
    if (tournament.level === "masters") return 64;
    if (tournament.level === "atp500") return 55;
    if (tournament.level === "atp250") return 51;
    if (tournament.level === "challenger125") return 44;
    if (tournament.level === "challenger100") return 40;
    if (tournament.level === "challenger75") return 37;
    if (junior) {
      if (tournament.level === "junior_grand_slam") return 37;
      if (tournament.level === "grade_a") return 35;
      if (tournament.level === "grade_1") return 30;
      if (tournament.level === "grade_2") return 24;
      if (tournament.level === "grade_3") return 21;
    }
    return 42;
  }

  if (tournament.level === "grand_slam") return 69;
  if (tournament.level === "masters") return tournament.name === "ATP Finals" ? 82 : 69;
  if (tournament.level === "atp500") return 60;
  if (tournament.level === "atp250") return 55;
  if (tournament.level === "challenger125") return 48;
  if (tournament.level === "challenger100") return 45;
  if (tournament.level === "challenger75") return 42;

  if (junior) {
    if (tournament.level === "junior_grand_slam") return 42;
    if (tournament.level === "grade_a") return 41;
    if (tournament.level === "grade_1") return 36;
    if (tournament.level === "grade_2") return 33;
    if (tournament.level === "grade_3") return 28;
  }
  return 50;
};

const winsGame = (player1Skill: number, player2Skill: number): boolean => {
  const p1 = Math.max(player1Skill, 0);
  const p2 = Math.max(player2Skill, 0);
  const total = p1 + p2;
  if (total <= 0) return Math.random() < 0.5;
  return Math.random() < p1 / total;
};

const cpuMatch = (
  player: Player,
  tournament: Tournament | JuniorTournament,
  currentRound: number,
  difficultyBase: number,
  rounds: number,
  qualifying = false,
): { win: boolean; line: string } => {
  let set = 1;
  let game = 1;
  let totalGames = 0;
  let pGames = 0;
  let pSets = 0;
  let cpuGames = 0;
  let cpuSets = 0;
  const setsToWin = tournament.level === "grand_slam" ? 3 : 2;
  const serveFirst = randomInt(0, 1);
  const setScores: string[] = [];
  const difficulty = difficultyBase * randomBetween(0.75, 1.25);
  const oppServe = randomBetween(
    ["junior_grand_slam", "grade_a", "grand_slam", "masters"].includes(String(tournament.level)) ? 40 : 30,
    100,
  );

  while (pSets < setsToWin && cpuSets < setsToWin) {
    const serving = totalGames % 2 === serveFirst;
    let oppDifficulty = difficulty * randomBetween(0.8, 1.2);
    if (!serving) {
      if (tournament.surface === "hard") oppDifficulty *= Math.pow(1 + (oppServe - 25) / 100, 0.75);
      if (tournament.surface === "clay") oppDifficulty *= Math.pow(1 + (oppServe - 25) / 100, 0.65);
      if (tournament.surface === "grass") oppDifficulty *= Math.pow(1 + (oppServe - 25) / 100, 0.9);
    }

    const skill = calcSkill(player, tournament, currentRound, set, game, serving);
    if (skill >= oppDifficulty) pGames += 1;
    else cpuGames += 1;

    useEnergy(player);
    game += 1;
    totalGames += 1;

    if ((pGames === 6 && cpuGames < 5) || pGames === 7) {
      pSets += 1;
      setScores.push(`${pGames}-${cpuGames}`);
      pGames = 0;
      cpuGames = 0;
      set += 1;
      game = 1;
    } else if ((cpuGames === 6 && pGames < 5) || cpuGames === 7) {
      cpuSets += 1;
      setScores.push(`${pGames}-${cpuGames}`);
      pGames = 0;
      cpuGames = 0;
      set += 1;
      game = 1;
    }
  }

  const win = pSets === setsToWin;
  if (win) {
    player.season_record.wins += 1;
    if (!player.junior) player.career_record.wins += 1;
    adjustSurfaceGrowth(player, tournament.surface);
  } else {
    player.season_record.losses += 1;
    if (!player.junior) player.career_record.losses += 1;
  }

  const label = roundLabel(currentRound, rounds, qualifying);
  return {
    win,
    line: `${player.name} ${win ? "wins" : "loses"} in ${label}, ${setScores.join(", ")}`,
  };
};

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

const calculateAgentCut = (player: Player, payout: number): number =>
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

const winTournament = (
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

const updateBestResults = (player: Player, tournament: Tournament | JuniorTournament, resultTop: number, lines: string[]) => {
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

const pvpMatch = (
  player1: Player,
  player2: Player,
  tournament: Tournament | JuniorTournament,
  year: number,
  currentRound: number,
  rounds: number,
  countAsOfficial: boolean = true,
): { winner: Player; loser: Player; line: string } => {
  let set = 1;
  let game = 1;
  let totalGames = 0;
  let p1Games = 0;
  let p1Sets = 0;
  let p2Games = 0;
  let p2Sets = 0;
  const setsToWin = tournament.level === "grand_slam" ? 3 : 2;
  const serveFirst = randomInt(0, 1);
  const setScores: string[] = [];

  while (p1Sets < setsToWin && p2Sets < setsToWin) {
    const p1Serve = totalGames % 2 === serveFirst;
    const p1Skill = calcSkill(player1, tournament, currentRound, set, game, p1Serve);
    const p2Skill = calcSkill(player2, tournament, currentRound, set, game, !p1Serve);

    if (winsGame(p1Skill, p2Skill)) p1Games += 1;
    else p2Games += 1;

    useEnergy(player1);
    useEnergy(player2);
    game += 1;
    totalGames += 1;

    if ((p1Games === 6 && p2Games < 5) || p1Games === 7) {
      p1Sets += 1;
      setScores.push(`${p1Games}-${p2Games}`);
      p1Games = 0;
      p2Games = 0;
      set += 1;
      game = 1;
    } else if ((p2Games === 6 && p1Games < 5) || p2Games === 7) {
      p2Sets += 1;
      setScores.push(`${p1Games}-${p2Games}`);
      p1Games = 0;
      p2Games = 0;
      set += 1;
      game = 1;
    }
  }

  const p1Win = p1Sets === setsToWin;
  const winner = p1Win ? player1 : player2;
  const loser = p1Win ? player2 : player1;

  if (countAsOfficial) {
    winner.season_record.wins += 1;
    loser.season_record.losses += 1;
    if (!winner.junior) winner.career_record.wins += 1;
    if (!loser.junior) loser.career_record.losses += 1;
  }

  adjustSurfaceGrowth(winner, tournament.surface);

  winner.head_to_head_wins[loser.name] = (winner.head_to_head_wins[loser.name] ?? 0) + 1;
  if (!winner.head_to_head_win_breakdown[loser.name]) {
    winner.head_to_head_win_breakdown[loser.name] = {};
  }
  if (!winner.head_to_head_win_breakdown[loser.name][tournament.name]) {
    winner.head_to_head_win_breakdown[loser.name][tournament.name] = [];
  }
  winner.head_to_head_win_breakdown[loser.name][tournament.name].push(year);

  const label = roundLabel(currentRound, rounds);
  return {
    winner,
    loser,
    line: `${winner.name} defeats ${loser.name} in ${label}, ${setScores.join(", ")}`,
  };
};

export const runTournament = (
  tournament: Tournament | JuniorTournament,
  players: Player[],
  year: number,
): { lines: string[]; agentEarnings: number } => {
  if (!players.length) {
    return { lines: [], agentEarnings: 0 };
  }

  const lines: string[] = [];
  let agentEarnings = 0;
  const rounds = Math.ceil(Math.log2(tournament.participants));
  const isJunior = players[0].junior;

  const qualifiedPlayers: Player[] = [];
  const qualifierCandidates = players.filter((player) => player.qualify_tourney[tournament.name] === 3);
  const directEntries = players.filter((player) => player.qualify_tourney[tournament.name] !== 3);

  if (qualifierCandidates.length > 0) {
    const qRounds = tournament.level === "grand_slam" || isJunior ? 3 : 2;
    for (const player of qualifierCandidates) {
      const qDifficulty = getDifficulty(tournament, player.junior, true);
      let survived = true;
      for (let round = 1; round <= qRounds; round += 1) {
        const match = cpuMatch(player, tournament, round, qDifficulty + round, qRounds, true);
        lines.push(match.line);
        if (!match.win) {
          survived = false;
          break;
        }
      }
      if (survived) {
        lines.push(`${player.name} qualified for ${tournament.name}`);
        qualifiedPlayers.push(player);
      }
    }
  }

  const tournamentPlayers = [...directEntries, ...qualifiedPlayers];
  if (!tournamentPlayers.length) {
    return { lines, agentEarnings };
  }

  const playerRoundOut = new Map<number, number>();
  const shufflePlayers = (input: Player[]): Player[] => {
    const shuffled = [...input];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = randomInt(0, i);
      const temp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = temp;
    }
    return shuffled;
  };

  const trimManagedField = (field: Player[], cap: number, round: number): Player[] => {
    let remaining = shufflePlayers(field);
    const safeCap = Math.max(1, cap);
    while (remaining.length > safeCap) {
      const reductionsNeeded = remaining.length - safeCap;
      const pairCount = Math.min(reductionsNeeded, Math.floor(remaining.length / 2));
      if (pairCount === 0) break;

      const next: Player[] = [];
      let cursor = 0;
      for (let i = 0; i < pairCount; i += 1) {
        const match = pvpMatch(remaining[cursor], remaining[cursor + 1], tournament, year, round, rounds);
        lines.push(match.line);
        playerRoundOut.set(match.loser.player_id, round);
        next.push(match.winner);
        cursor += 2;
      }
      while (cursor < remaining.length) {
        next.push(remaining[cursor]);
        cursor += 1;
      }
      remaining = shufflePlayers(next);
    }
    return remaining;
  };

  let activePlayers = [...tournamentPlayers];
  for (let round = 1; round <= rounds; round += 1) {
    if (!activePlayers.length) break;

    const slotsThisRound = Math.max(1, Math.floor(tournament.participants / Math.pow(2, round - 1)));
    const slotsNextRound = Math.max(1, Math.floor(slotsThisRound / 2));

    if (activePlayers.length > slotsThisRound) {
      activePlayers = trimManagedField(activePlayers, slotsThisRound, round);
    }

    const shuffled = shufflePlayers(activePlayers);
    const forcedManagedMatches = Math.max(0, shuffled.length - slotsNextRound);
    const playersInManagedMatches = Math.min(shuffled.length, forcedManagedMatches * 2);
    const winners: Player[] = [];

    for (let i = 0; i < playersInManagedMatches; i += 2) {
      const match = pvpMatch(shuffled[i], shuffled[i + 1], tournament, year, round, rounds);
      lines.push(match.line);
      playerRoundOut.set(match.loser.player_id, round);
      winners.push(match.winner);
    }

    for (let i = playersInManagedMatches; i < shuffled.length; i += 1) {
      const player = shuffled[i];
      const baseDifficulty = getDifficulty(tournament, player.junior, false);
      const extra = rounds - round <= 2 ? 4 : 1;
      const match = cpuMatch(player, tournament, round, baseDifficulty + round * extra, rounds);
      lines.push(match.line);
      if (match.win) {
        winners.push(player);
      } else {
        playerRoundOut.set(player.player_id, round);
      }
    }

    activePlayers = winners.length > slotsNextRound ? trimManagedField(winners, slotsNextRound, round) : winners;
  }

  if (activePlayers.length > 1) {
    activePlayers = trimManagedField(activePlayers, 1, rounds);
  }

  let winner: Player | null = null;
  if (activePlayers.length === 1) {
    winner = activePlayers[0];
    playerRoundOut.set(winner.player_id, rounds + 1);
  }

  for (const player of tournamentPlayers) {
    const roundOut = playerRoundOut.get(player.player_id) ?? 1;
    const won = !!winner && winner.player_id === player.player_id;
    let payout = 0;

    if (won) {
      payout = winTournament(player, tournament, year, rounds, lines);
    } else {
      assignTournamentPoints(player, tournament, false, roundOut);
      if (!player.junior) {
        payout = awardPrizeMoney(player, tournament as Tournament, false, roundOut);
      }
    }
    if (!player.junior && payout > 0) {
      agentEarnings += calculateAgentCut(player, payout);
    }

    const resultTop = Math.max(1, Math.pow(2, Math.max(0, rounds - Math.min(roundOut, rounds) + 1)));
    updateBestResults(player, tournament, resultTop, lines);
    player.annual_results[tournament.name] = resultTop;
  }

  return { lines, agentEarnings };
};

const applyExhibitionFocus = (player: Player, surface: Surface, focus: ExhibitionFocus): string => {
  if (focus === "court") {
    const delta = randomBetween(1, 3) * Math.pow(player.potential / 100, 2);
    player.court_proficiencies[surface] = clamp(player.court_proficiencies[surface] + delta, 1, 100);
    return `${player.name} improved ${surface} court proficiency by ${delta.toFixed(1)} points`;
  }
  if (focus === "serve") {
    const delta = randomBetween(2, 6) * Math.pow(player.potential / 100, 2);
    player.serve = clamp(player.serve + delta, 1, 100);
    return `${player.name} improved serve by ${delta.toFixed(1)} points`;
  }
  if (focus === "stamina") {
    const delta = randomBetween(0.8, 2) * Math.pow(player.potential / 100, 2);
    player.stamina = clamp(player.stamina + delta, 1, STAMINA_MAX);
    return `${player.name} improved stamina by ${delta.toFixed(1)} points`;
  }
  const delta = randomBetween(1, 3) * Math.pow(player.potential / 100, 2);
  player.big_moments = clamp(player.big_moments + delta, 1, 100);
  return `${player.name} improved clutch by ${delta.toFixed(1)} points`;
};

export const simulateExhibitionMatch = (
  player1: Player,
  player2: Player,
  surface: Surface,
  focus1: ExhibitionFocus,
  focus2: ExhibitionFocus,
  year: number,
): string[] => {
  const pseudoTournament: Tournament = {
    name: "Exhibition Match",
    surface,
    level: "atp250",
    country: "Other",
    participants: 32,
    points: 0,
    prize_money: 0,
  };

  const match = pvpMatch(player1, player2, pseudoTournament, year, 1, 1, false);
  const lines = [match.line, applyExhibitionFocus(player1, surface, focus1), applyExhibitionFocus(player2, surface, focus2)];

  player1.energy = clamp(player1.energy - 33, 1, 100);
  player2.energy = clamp(player2.energy - 33, 1, 100);

  return lines;
};
