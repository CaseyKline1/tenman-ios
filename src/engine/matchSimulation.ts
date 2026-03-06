import { ExhibitionFocus } from "../data/recruiting";
import { JuniorTournament, Player, Surface, Tournament } from "../types/game";
import { ENERGY_MAX, STAMINA_MAX } from "./engineConstants";
import { roundLabel } from "./engineFormatting";
import { clamp, randomBetween, randomInt } from "./random";

const ENERGY_DRAIN_MULTIPLIER = 1.2;
const EXHIBITION_ENERGY_DRAIN = 33 * ENERGY_DRAIN_MULTIPLIER;

const useEnergy = (player: Player) => {
  const normalizedEnergy = clamp(player.energy / ENERGY_MAX, 0.01, 1);
  const effectiveStamina = clamp(player.stamina, 1, STAMINA_MAX);
  const staminaPenalty = Math.sqrt((100 - effectiveStamina) / 25);
  const energyUsed = (0.15 / Math.sqrt(normalizedEnergy)) * staminaPenalty * ENERGY_DRAIN_MULTIPLIER;
  player.energy = clamp(player.energy - energyUsed, 0.01, ENERGY_MAX);
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
  let skill = (player.overall * (player.energy / ENERGY_MAX) * court * rand + heat / 10) * (sameCountry ? 1.1 : 1);

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

export const getDifficulty = (
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

export const cpuMatch = (
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

export const pvpMatch = (
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

  player1.energy = clamp(player1.energy - EXHIBITION_ENERGY_DRAIN, 1, ENERGY_MAX);
  player2.energy = clamp(player2.energy - EXHIBITION_ENERGY_DRAIN, 1, ENERGY_MAX);

  return lines;
};
