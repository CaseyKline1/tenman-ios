import { JuniorTournament, Player, Tournament } from "../types/game";
import { cpuMatch, getDifficulty, pvpMatch, simulateExhibitionMatch } from "./matchSimulation";
import { calculateAgentCut, recordTournamentLoss, updateBestResults, winTournament } from "./tournamentAccounting";
import { randomInt } from "./random";

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
    const payout = won
      ? winTournament(player, tournament, year, rounds, lines)
      : recordTournamentLoss(player, tournament, roundOut);

    if (!player.junior && payout > 0) {
      agentEarnings += calculateAgentCut(player, payout);
    }

    const resultTop = Math.max(1, Math.pow(2, Math.max(0, rounds - roundOut + 1)));
    updateBestResults(player, tournament, resultTop, lines);
    player.annual_results[tournament.name] = resultTop;
  }

  return { lines, agentEarnings };
};

export { simulateExhibitionMatch };
