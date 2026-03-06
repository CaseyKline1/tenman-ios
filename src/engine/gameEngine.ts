import {
  GameState,
  JuniorTournament,
  Player,
  PlayerTournamentEligibility,
  ScheduleTournament,
  Surface,
  Tournament,
  TournamentResult,
  TournamentWithPlayers,
} from "../types/game";
import {
  EXHIBITION_FOCUSES,
  ExhibitionFocus,
  NAME_POOL,
  TERRITORIES,
  TRAINING_OPTIONS,
} from "../data/recruiting";
import { JUNIOR_TOURNAMENT_SCHEDULE, TOURNAMENT_SCHEDULE } from "../data/tournamentSchedule";
import { clamp, randomBetween, randomChoice, randomInt } from "./random";

const MAJOR_TOURNAMENTS = ["Australian Open", "French Open", "Wimbledon", "US Open"];
const MASTERS_TOURNAMENTS = [
  "Monte Carlo Masters",
  "Italian Open",
  "Madrid Open",
  "Canadian Open",
  "Shanghai Masters",
  "Cincinnati Masters",
  "Indian Wells Masters",
  "Miami Open",
  "ATP Finals",
  "Paris Masters",
];

const roundLabel = (round: number, rounds: number, qualifying = false): string => {
  if (qualifying) {
    return "qualifying";
  }
  if (rounds > round + 2) {
    return `round ${round}`;
  }
  if (rounds === round + 2) {
    return "quarterfinal";
  }
  if (rounds === round + 1) {
    return "semifinal";
  }
  return "final";
};

const cloneState = (state: GameState): GameState => JSON.parse(JSON.stringify(state));

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

const createPlayer = (userName: string, territoryId: number): Player => {
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
    name: generateName(nationality),
    age,
    nationality,
    overall,
    potential,
    potential_letter: makePotentialLetter(potential),
    energy: 100,
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
    stamina: randomBetween(60, 85),
    junior,
    career_earnings: 0,
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

const useEnergy = (player: Player) => {
  const normalizedEnergy = clamp(player.energy / 100, 0.01, 1);
  const staminaPenalty = Math.sqrt((100 - player.stamina) / 25);
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

const awardPrizeMoney = (player: Player, tournament: Tournament, win: boolean, roundOut: number) => {
  if (win) {
    player.career_earnings += tournament.prize_money;
    return;
  }
  const rounds = Math.ceil(Math.log2(tournament.participants));
  const playersLeft = Math.pow(2, rounds - roundOut + 1);
  player.career_earnings += Math.round(tournament.prize_money / Math.max(playersLeft, 1));
};

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

const calculatePoints = (player: Player) => {
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
) => {
  assignTournamentPoints(player, tournament, true, rounds + 1);
  if (!player.junior && "prize_money" in tournament) {
    awardPrizeMoney(player, tournament as Tournament, true, rounds + 1);
  }
  if (tournament.level === "grand_slam") {
    player.grand_slam_wins += 1;
  }
  addTournamentWin(player, tournament.name, year);
  lines.push(`${player.name} wins the ${tournament.name}`);
};

const updateBestResults = (player: Player, tournament: Tournament | JuniorTournament, resultTop: number, lines: string[]) => {
  if (tournament.level === "grand_slam" || tournament.level === "masters") {
    const prev = player.best_results[tournament.name] ?? Infinity;
    if (resultTop < prev) {
      player.best_results[tournament.name] = resultTop;
      lines.push(`New best result for ${player.name} at ${tournament.name}: finished top ${resultTop}`);
    }
  } else if (tournament.level === "junior_grand_slam" || tournament.level === "grade_a") {
    const prev = player.best_junior_results[tournament.name] ?? Infinity;
    if (resultTop < prev) {
      player.best_junior_results[tournament.name] = resultTop;
      lines.push(`New best result for ${player.name} at ${tournament.name}: finished top ${resultTop}`);
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

  winner.season_record.wins += 1;
  loser.season_record.losses += 1;
  if (!winner.junior) winner.career_record.wins += 1;
  if (!loser.junior) loser.career_record.losses += 1;

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

const runTournament = (
  tournament: Tournament | JuniorTournament,
  players: Player[],
  year: number,
): string[] => {
  if (!players.length) {
    return [];
  }

  const lines: string[] = [];
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
    return lines;
  }

  const playerRoundOut = new Map<number, number>();
  const finalists: Player[] = [];

  for (const player of tournamentPlayers) {
    const baseDifficulty = getDifficulty(tournament, player.junior, false);
    let survived = true;
    for (let round = 1; round <= rounds; round += 1) {
      const extra = rounds - round <= 2 ? 4 : 1;
      const match = cpuMatch(player, tournament, round, baseDifficulty + round * extra, rounds);
      lines.push(match.line);
      if (!match.win) {
        playerRoundOut.set(player.player_id, round);
        survived = false;
        break;
      }
    }
    if (survived) {
      finalists.push(player);
      playerRoundOut.set(player.player_id, rounds + 1);
    }
  }

  let winner: Player | null = null;
  if (finalists.length === 1) {
    winner = finalists[0];
  } else if (finalists.length > 1) {
    lines.push(`${finalists.length} of your players reached the title match stages in ${tournament.name}`);
    let remaining = [...finalists];
    while (remaining.length > 1) {
      const nextRound: Player[] = [];
      for (let i = 0; i < remaining.length; i += 2) {
        if (i === remaining.length - 1) {
          nextRound.push(remaining[i]);
          continue;
        }
        const match = pvpMatch(remaining[i], remaining[i + 1], tournament, year, rounds, rounds);
        lines.push(match.line);
        playerRoundOut.set(match.loser.player_id, rounds);
        nextRound.push(match.winner);
      }
      remaining = nextRound;
    }
    winner = remaining[0];
  }

  for (const player of tournamentPlayers) {
    const roundOut = playerRoundOut.get(player.player_id) ?? 1;
    const won = !!winner && winner.player_id === player.player_id;

    if (won) {
      winTournament(player, tournament, year, rounds, lines);
    } else {
      assignTournamentPoints(player, tournament, false, roundOut);
      if (!player.junior) {
        awardPrizeMoney(player, tournament as Tournament, false, roundOut);
      }
    }

    const resultTop = Math.max(1, Math.pow(2, Math.max(0, rounds - Math.min(roundOut, rounds) + 1)));
    updateBestResults(player, tournament, resultTop, lines);
    player.annual_results[tournament.name] = resultTop;
  }

  return lines;
};

const rankSeniors = (players: Player[], countWeeksRankedOne: boolean = true) => {
  const sorted = [...players]
    .filter((p) => !p.junior)
    .sort((a, b) => b.points - a.points);

  sorted.forEach((player, index) => {
    player.ranking = index + 1;
    player.best_ranking = Math.min(player.best_ranking, player.ranking);
    if (countWeeksRankedOne && player.ranking === 1) player.weeks_ranked_1 += 1;
  });
};

const rankJuniors = (players: Player[]) => {
  const sorted = [...players]
    .filter((p) => p.junior)
    .sort((a, b) => b.junior_points - a.junior_points);

  sorted.forEach((player, index) => {
    player.ranking = index + 1;
    player.best_junior_ranking = Math.min(player.best_junior_ranking, player.ranking);
  });
};

const refreshStandings = (players: Player[], countWeeksRankedOne: boolean = false) => {
  for (const player of players) {
    calculatePoints(player);
  }
  rankSeniors(players, countWeeksRankedOne);
  rankJuniors(players);
};

const calcRequiredPoints = (player: Player, tournament: Tournament | JuniorTournament) => {
  if (player.junior && String(tournament.level).startsWith("grade") || tournament.level === "junior_grand_slam") {
    let required = 0;
    if (tournament.level === "grade_3") required = 400;
    if (tournament.level === "grade_2") required = 200;
    if (tournament.level === "grade_1") required = 100;
    if (tournament.level === "grade_a" || tournament.level === "junior_grand_slam") required = 56;
    player.required_ranking[tournament.name] = required;

    if (player.ranking <= required) player.qualify_tourney[tournament.name] = 1;
    else {
      player.qualify_tourney[tournament.name] = 0;
      let qualifierRec = 0;
      if (tournament.level === "junior_grand_slam") qualifierRec = 120;
      if (tournament.level === "grade_a") qualifierRec = 120;
      if (tournament.level === "grade_1") qualifierRec = 300 + randomInt(-25, 25);
      if (tournament.level === "grade_2") qualifierRec = 700 + randomInt(-200, 200);
      if (tournament.level === "grade_3") qualifierRec = 1000;
      if (player.ranking <= qualifierRec) player.qualify_tourney[tournament.name] = 3;
    }
    player.junior_points_inputs[tournament.name] = player.junior_points_inputs[tournament.name] ?? 0;
    return;
  }

  let requiredRank = 0;
  if (tournament.level === "challenger75") requiredRank = 350;
  if (tournament.level === "challenger100") requiredRank = 200;
  if (tournament.level === "challenger125") requiredRank = 150;
  if (tournament.level === "atp250") requiredRank = 90;
  if (tournament.level === "atp500") requiredRank = 50;
  if (tournament.level === "grand_slam") requiredRank = 108;
  if (tournament.level === "masters" && tournament.name !== "ATP Finals") requiredRank = Math.floor(tournament.participants * 0.75);
  if (tournament.name === "ATP Finals") requiredRank = 8;

  player.required_ranking[tournament.name] = requiredRank;

  if (player.ranking <= requiredRank) {
    player.qualify_tourney[tournament.name] =
      tournament.level === "grand_slam" || (tournament.level === "masters" && tournament.name !== "Monte Carlo Masters")
        ? -1
        : 1;
  } else {
    player.qualify_tourney[tournament.name] = 0;
  }

  const mandatory =
    tournament.level === "grand_slam" ||
    (tournament.level === "masters" && tournament.name !== "Monte Carlo Masters");
  if (mandatory) player.points_inputs_mandatory[tournament.name] = player.points_inputs_mandatory[tournament.name] ?? 0;
  else player.points_inputs[tournament.name] = player.points_inputs[tournament.name] ?? 0;

  if (player.qualify_tourney[tournament.name] === 0) {
    let wildcard = false;
    if (player.nationality === tournament.country && player.age < 20 && player.potential > 88) wildcard = true;
    if (player.potential > 94 && player.age < 19 && player.ranking < 200) wildcard = true;
    if ((player.best_junior_ranking <= 10 || player.heat > 30) && player.ranking < 250) wildcard = true;
    if (player.tournaments_won[tournament.name]) wildcard = true;

    if (wildcard) {
      player.qualify_tourney[tournament.name] = 2;
      return;
    }

    let qualifierRec = 0;
    if (tournament.level === "grand_slam") qualifierRec = 232;
    if (tournament.level === "masters" && tournament.name !== "ATP Finals") qualifierRec = 150;
    if (tournament.level === "atp500") qualifierRec = 250 + randomInt(-25, 25);
    if (tournament.level === "atp250") qualifierRec = 350 + randomInt(-40, 40);
    if (tournament.level === "challenger125") qualifierRec = 500 + randomInt(-200, 200);
    if (tournament.level === "challenger100") qualifierRec = 1000 + randomInt(-300, 500);
    if (tournament.level === "challenger75") qualifierRec = 2500 + randomInt(-500, 1000);
    if (player.ranking <= qualifierRec) {
      player.qualify_tourney[tournament.name] = 3;
    }
  }
};

const getTournamentsByWeekRange = (startWeek: number, endWeek: number): ScheduleTournament[] => {
  const out: ScheduleTournament[] = [];
  for (let week = startWeek; week <= endWeek; week += 1) {
    const tournaments = TOURNAMENT_SCHEDULE[week] ?? [];
    for (const tournament of tournaments) {
      out.push({ ...tournament, week });
    }
  }
  return out;
};

const getJuniorTournamentsByWeekRange = (startWeek: number, endWeek: number): ScheduleTournament[] => {
  const out: ScheduleTournament[] = [];
  for (let week = startWeek; week <= endWeek; week += 1) {
    const tournament = JUNIOR_TOURNAMENT_SCHEDULE[week];
    if (tournament) {
      out.push({ ...tournament, week });
    }
  }
  return out;
};

const resetSkippedTournamentPoints = (players: Player[], startWeek: number, endWeek: number) => {
  const skipped = getTournamentsByWeekRange(startWeek, endWeek);
  const skippedJunior = getJuniorTournamentsByWeekRange(startWeek, endWeek);

  for (const tournament of skipped) {
    for (const player of players.filter((p) => !p.junior)) {
      if (tournament.level === "grand_slam" || (tournament.level === "masters" && tournament.name !== "Monte Carlo Masters")) {
        player.points_inputs_mandatory[tournament.name] = 0;
      } else {
        player.points_inputs[tournament.name] = 0;
      }
      player.heat = 0;
      player.hard_heat = 0;
      player.clay_heat = 0;
      player.grass_heat = 0;
    }
  }

  for (const tournament of skippedJunior) {
    for (const player of players.filter((p) => p.junior)) {
      player.junior_points_inputs[tournament.name] = 0;
      player.heat = 0;
      player.hard_heat = 0;
      player.clay_heat = 0;
      player.grass_heat = 0;
    }
  }
};

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
  player.stamina = clamp(player.stamina, 1, 100);
};

const endOfYear = (state: GameState) => {
  for (const player of state.userPlayers) {
    player.age += 1;
    improvePlayerAtYearEnd(player);
    player.last_year_results = { ...player.annual_results };
    player.annual_results = {};
    player.season_record = { wins: 0, losses: 0 };
    player.energy = 100;
  }

  state.userPlayers = state.userPlayers.filter((player) => player.age <= 40);

  for (const player of state.userPlayers) {
    if (player.age > 18 && player.junior) {
      player.junior = false;
      player.ranking = 3000;
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
  const ageFactor = player.age > 35 ? 0.03 : player.age > 30 ? 0.015 : 0;
  const energyRisk = clamp((100 - player.energy) / 100, 0, 1);
  const injuryChance = energyRisk * (0.04 + player.injury_prone * 0.08) + ageFactor;
  if (Math.random() < injuryChance) {
    const weeks = randomInt(1, 12);
    player.injury_weeks += weeks;
  }
};

export const createInitialState = (): GameState => ({
  userName: "",
  week: 1,
  year: 2025,
  userPlayers: [],
  offerRecruits: [],
  lastTournamentResults: [],
  screen: "landing",
});

export const startNewGame = (userName: string): GameState => ({
  userName,
  week: 1,
  year: 2025,
  userPlayers: [],
  offerRecruits: [],
  lastTournamentResults: [],
  screen: "recruit-territories",
});

export const getSeniorPlayers = (state: GameState): Player[] =>
  state.userPlayers.filter((player) => !player.junior);

export const getJuniorPlayers = (state: GameState): Player[] =>
  state.userPlayers.filter((player) => player.junior);

export const seeRecruits = (state: GameState, territoryId: number): GameState => {
  const next = cloneState(state);
  next.offerRecruits = [createPlayer(next.userName, territoryId), createPlayer(next.userName, territoryId), createPlayer(next.userName, territoryId)];
  next.screen = "offer-recruits";
  return next;
};

export const addRecruit = (state: GameState, playerId: number): GameState => {
  const next = cloneState(state);
  const recruit = next.offerRecruits.find((player) => player.player_id === playerId);
  if (!recruit) return next;
  const exists = next.userPlayers.some((player) => player.player_id === playerId);
  if (!exists) {
    next.userPlayers.push(recruit);
    refreshStandings(next.userPlayers);
  }
  next.offerRecruits = [];
  next.screen = "choose-tournament";
  return next;
};

export const skipRecruits = (state: GameState): GameState => {
  const next = cloneState(state);
  next.offerRecruits = [];
  next.screen = next.userPlayers.length > 0 ? "choose-tournament" : "recruit-territories";
  return next;
};

export const removePlayer = (state: GameState, playerId: number): GameState => {
  const next = cloneState(state);
  next.userPlayers = next.userPlayers.filter((player) => player.player_id !== playerId);
  refreshStandings(next.userPlayers);
  return next;
};

export const promoteJunior = (state: GameState, playerId: number): GameState => {
  const next = cloneState(state);
  const player = next.userPlayers.find((entry) => entry.player_id === playerId && entry.junior);
  if (!player) return next;
  player.junior = false;
  player.ranking = 3000;
  player.weeks_ranked_1 = 0;
  refreshStandings(next.userPlayers);
  return next;
};

export const getAvailableTournaments = (state: GameState): TournamentWithPlayers[] => {
  const working = cloneState(state);
  refreshStandings(working.userPlayers);

  const eligible = working.userPlayers.filter((player) => player.injury_weeks === 0);
  const result: TournamentWithPlayers[] = [];

  const seniorTournaments = TOURNAMENT_SCHEDULE[working.week] ?? [];
  for (const tournament of seniorTournaments) {
    const players: PlayerTournamentEligibility[] = [];
    for (const player of working.userPlayers.filter((entry) => !entry.junior)) {
      calcRequiredPoints(player, tournament as Tournament);
      if (eligible.find((entry) => entry.player_id === player.player_id)) {
        players.push({
          player_id: player.player_id,
          name: player.name,
          age: player.age,
          country: player.nationality,
          overall: player.overall,
          energy: player.energy,
          hard_court: player.court_proficiencies.hard,
          clay_court: player.court_proficiencies.clay,
          grass_court: player.court_proficiencies.grass,
          qualify_tourney: player.qualify_tourney[tournament.name] ?? 0,
          ranking: player.ranking,
        });
      }
    }
    result.push({ tournament: tournament as Tournament, players, isJunior: false });
  }

  const juniorTournament = JUNIOR_TOURNAMENT_SCHEDULE[working.week];
  if (juniorTournament) {
    const players: PlayerTournamentEligibility[] = [];
    for (const player of working.userPlayers.filter((entry) => entry.junior)) {
      calcRequiredPoints(player, juniorTournament as JuniorTournament);
      if (eligible.find((entry) => entry.player_id === player.player_id)) {
        players.push({
          player_id: player.player_id,
          name: player.name,
          age: player.age,
          country: player.nationality,
          overall: player.overall,
          energy: player.energy,
          hard_court: player.court_proficiencies.hard,
          clay_court: player.court_proficiencies.clay,
          grass_court: player.court_proficiencies.grass,
          qualify_tourney: player.qualify_tourney[juniorTournament.name] ?? 0,
          ranking: player.ranking,
        });
      }
    }
    result.push({ tournament: juniorTournament as JuniorTournament, players, isJunior: true });
  }

  return result;
};

export const enterTournaments = (
  state: GameState,
  selectedByTournament: Record<string, number[]>,
): GameState => {
  const next = cloneState(state);
  const tournamentsByName: Record<string, Tournament | JuniorTournament> = {};

  for (const tournament of TOURNAMENT_SCHEDULE[next.week] ?? []) {
    tournamentsByName[tournament.name] = tournament as Tournament;
  }
  const juniorTournament = JUNIOR_TOURNAMENT_SCHEDULE[next.week];
  if (juniorTournament) tournamentsByName[juniorTournament.name] = juniorTournament;

  const output: TournamentResult[] = [];
  for (const [name, playerIds] of Object.entries(selectedByTournament)) {
    const tournament = tournamentsByName[name];
    if (!tournament || playerIds.length === 0) continue;
    const players = next.userPlayers.filter((player) => playerIds.includes(player.player_id));
    if (players.length === 0) continue;

    const lines = runTournament(tournament, players, next.year);
    output.push({ tournamentName: name, lines });
  }

  refreshStandings(next.userPlayers);
  next.lastTournamentResults = output;
  next.screen = output.length ? "tournament-results" : "menu";
  return next;
};

export const advanceWeek = (state: GameState): GameState => {
  const next = cloneState(state);
  const previousWeek = next.week;

  next.week += 1;
  for (const player of next.userPlayers) {
    player.injury_weeks = Math.max(0, player.injury_weeks - 1);
    checkForInjury(player);
    player.energy = player.junior
      ? clamp(player.energy + 7, 1, 100)
      : clamp(Math.max(Math.pow(100 - player.energy, 0.8), player.energy + 11), 1, 100);
    player.heat = Math.pow(player.heat, 2 / 3);
    player.hard_heat = Math.pow(player.hard_heat, 2 / 3);
    player.clay_heat = Math.pow(player.clay_heat, 2 / 3);
    player.grass_heat = Math.pow(player.grass_heat, 2 / 3);
  }

  if (next.week > 52) {
    next.week = 1;
    next.year += 1;
    endOfYear(next);
  }

  refreshStandings(next.userPlayers, true);
  next.screen = previousWeek === 52 ? "training" : "choose-tournament";
  return next;
};

export const trainPlayers = (state: GameState, choices: Record<number, number>): GameState => {
  const next = cloneState(state);
  for (const player of next.userPlayers) {
    const choice = choices[player.player_id];
    if (choice === undefined) continue;
    if (player.injury_weeks > 0 || player.age >= 28) continue;

    if (choice === 0) {
      const delta = player.age < 24 ? randomBetween(1, 3) * Math.pow(player.potential / 100, 2) * (player.overall < 55 ? 1.7 : 1) : randomBetween(0, 1) * Math.pow(player.potential / 100, 2);
      player.overall = clamp(player.overall + delta, 1, 100);
    } else if (choice === 1) {
      const delta = player.age < 24 ? randomBetween(2, 6) * Math.pow(player.potential / 100, 2) * (player.serve < 60 ? 1.7 : 1) : randomBetween(0, 2) * Math.pow(player.potential / 100, 2);
      player.serve = clamp(player.serve + delta, 1, 100);
    } else if (choice === 2) {
      const delta = player.age < 24 ? randomBetween(1.3, 3) * Math.pow(player.potential / 100, 2) * (player.stamina < 68 ? 1.7 : 1) : randomBetween(0, 1.5) * Math.pow(player.potential / 100, 2);
      player.stamina = clamp(player.stamina + delta, 1, 100);
    } else if (choice === 3) {
      const delta = player.age < 24 ? randomBetween(2, 6) * Math.pow(player.potential / 100, 2) * (player.big_moments < 60 ? 1.7 : 1) : randomBetween(0, 2) * Math.pow(player.potential / 100, 2);
      player.big_moments = clamp(player.big_moments + delta, 1, 100);
    } else if (choice === 4) {
      const delta = player.age < 24 ? randomBetween(2, 6) * Math.pow(player.potential / 100, 2) * (player.court_proficiencies.hard < 70 ? 1.7 : 1) : randomBetween(0, 2) * Math.pow(player.potential / 100, 2);
      player.court_proficiencies.hard = clamp(player.court_proficiencies.hard + delta, 1, 100);
    } else if (choice === 5) {
      const delta = player.age < 24 ? randomBetween(2, 6) * Math.pow(player.potential / 100, 2) * (player.court_proficiencies.clay < 70 ? 1.7 : 1) : randomBetween(0, 2) * Math.pow(player.potential / 100, 2);
      player.court_proficiencies.clay = clamp(player.court_proficiencies.clay + delta, 1, 100);
    } else if (choice === 6) {
      const delta = player.age < 24 ? randomBetween(2, 6) * Math.pow(player.potential / 100, 2) * (player.court_proficiencies.grass < 70 ? 1.7 : 1) : randomBetween(0, 2) * Math.pow(player.potential / 100, 2);
      player.court_proficiencies.grass = clamp(player.court_proficiencies.grass + delta, 1, 100);
    }
  }

  next.screen = "recruit-territories";
  return next;
};

export const skipToWeek = (state: GameState, week: number): GameState => {
  const next = cloneState(state);
  if (week <= next.week || week > 52) return next;

  const delta = week - next.week;
  for (const player of next.userPlayers) {
    player.injury_weeks = Math.max(0, player.injury_weeks - delta);
    player.energy = clamp(player.energy + (player.junior ? 7 : 11) * delta, 1, 100);
  }

  resetSkippedTournamentPoints(next.userPlayers, next.week + 1, week);
  next.week = week;
  refreshStandings(next.userPlayers);
  next.screen = "choose-tournament";
  return next;
};

export const skipToNextYear = (state: GameState): GameState => {
  const next = cloneState(state);
  const oldWeek = next.week;

  resetSkippedTournamentPoints(next.userPlayers, oldWeek + 1, 52);
  next.week = 1;
  next.year += 1;

  for (const player of next.userPlayers) {
    player.injury_weeks = Math.max(0, player.injury_weeks - (53 - oldWeek));
    player.heat = 0;
    player.hard_heat = 0;
    player.clay_heat = 0;
    player.grass_heat = 0;
  }

  endOfYear(next);
  refreshStandings(next.userPlayers);
  next.screen = "training";
  return next;
};

export const getTournamentSchedule = (state: GameState): { senior: ScheduleTournament[]; junior: ScheduleTournament[] } => ({
  senior: getTournamentsByWeekRange(state.week + 1, Math.min(52, state.week + 5)),
  junior: getJuniorTournamentsByWeekRange(state.week + 1, Math.min(52, state.week + 10)),
});

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
    player.stamina = clamp(player.stamina + delta, 1, 100);
    return `${player.name} improved stamina by ${delta.toFixed(1)} points`;
  }
  const delta = randomBetween(1, 3) * Math.pow(player.potential / 100, 2);
  player.big_moments = clamp(player.big_moments + delta, 1, 100);
  return `${player.name} improved clutch by ${delta.toFixed(1)} points`;
};

export const playExhibitionMatch = (
  state: GameState,
  player1Id: number,
  player2Id: number,
  surface: Surface,
  focus1: ExhibitionFocus,
  focus2: ExhibitionFocus,
): { state: GameState; lines: string[]; error?: string } => {
  const next = cloneState(state);
  const player1 = next.userPlayers.find((entry) => entry.player_id === player1Id);
  const player2 = next.userPlayers.find((entry) => entry.player_id === player2Id);
  if (!player1 || !player2 || player1.player_id === player2.player_id) {
    return { state: next, lines: [], error: "Please select two different players" };
  }

  const pseudoTournament: Tournament = {
    name: "Exhibition Match",
    surface,
    level: "atp250",
    country: "Other",
    participants: 32,
    points: 0,
    prize_money: 0,
  };

  const match = pvpMatch(player1, player2, pseudoTournament, next.year, 1, 1);
  const lines = [match.line, applyExhibitionFocus(player1, surface, focus1), applyExhibitionFocus(player2, surface, focus2)];

  player1.energy = clamp(player1.energy - 33, 1, 100);
  player2.energy = clamp(player2.energy - 33, 1, 100);

  return { state: next, lines };
};

export const getWeeklyHeader = (state: GameState): string => `Year ${state.year} - Week ${state.week}`;

export const getEligibleExhibitionPlayers = (state: GameState): Player[] =>
  state.userPlayers.filter((player) => player.injury_weeks === 0 && player.energy >= 40);

export const canRunExhibition = (state: GameState): boolean => state.week < 48;

export const getTrainingEligiblePlayers = (state: GameState): Player[] =>
  state.userPlayers.filter((player) => player.age <= 27 && player.injury_weeks === 0);

export const territoryNames = TERRITORIES.map((territory) => territory.name);

export const trainingOptions = TRAINING_OPTIONS;

export const exhibitionFocuses = EXHIBITION_FOCUSES;
