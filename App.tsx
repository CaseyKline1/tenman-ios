import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { CountryFlag } from "./src/components/CountryFlag";
import {
  addRecruit,
  advanceWeek,
  canRunExhibition,
  createInitialState,
  dismissInjuryAlerts,
  enterTournaments,
  exhibitionFocuses,
  getAvailableTournaments,
  getEligibleExhibitionPlayers,
  getJuniorPlayers,
  getSeniorPlayers,
  getTournamentSchedule,
  getTrainingEligiblePlayers,
  getWeeklyHeader,
  playExhibitionMatch,
  promoteJunior,
  removePlayer,
  seeRecruits,
  skipRecruits,
  skipToNextYear,
  skipToWeek,
  startNewGame,
  territoryNames,
  trainPlayers,
  trainingOptions,
} from "./src/engine/gameEngine";
import { clearGameState, loadGameState, saveGameState } from "./src/store/persistence";
import { ExhibitionFocus, QUALIFICATION_LABELS } from "./src/data/recruiting";
import { GameState, Player, PlayerTournamentEligibility, ScreenKey, Surface, TournamentWithPlayers } from "./src/types/game";

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

const toInt = (value: number) => Math.round(value);

const TOURNAMENT_LEVEL_LABELS: Record<string, string> = {
  grand_slam: "Grand Slam",
  masters: "ATP Masters 1000",
  atp500: "ATP 500",
  atp250: "ATP 250",
  challenger125: "ATP Challenger 125",
  challenger100: "ATP Challenger 100",
  challenger75: "ATP Challenger 75",
  junior_grand_slam: "Junior Grand Slam",
  grade_a: "ITF Grade A",
  grade_1: "ITF Grade 1",
  grade_2: "ITF Grade 2",
  grade_3: "ITF Grade 3",
};

const formatTournamentLevel = (level: string) =>
  TOURNAMENT_LEVEL_LABELS[level] ??
  level
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

type PlayerListScreen = "view-senior-players" | "view-junior-players";

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

const isMajorTournament = (name: string): boolean =>
  MAJOR_TOURNAMENTS.includes(name) || MASTERS_TOURNAMENTS.includes(name);

const isSlamOrJuniorSlam = (name: string): boolean =>
  MAJOR_TOURNAMENTS.includes(name) || (name.includes("Junior") && MAJOR_TOURNAMENTS.some((major) => name.includes(major)));

const sortByTopFinish = (a: [string, number], b: [string, number]): number =>
  a[1] - b[1] || a[0].localeCompare(b[0]);

const sortByWinsDesc = (a: [string, number], b: [string, number]): number =>
  b[1] - a[1] || a[0].localeCompare(b[0]);

const sortByName = <T,>(a: [string, T], b: [string, T]): number =>
  a[0].localeCompare(b[0]);

const formatTopFinish = (top: number): string => {
  const rounded = toInt(top);
  if (rounded <= 1) return "Champion";
  if (rounded === 2) return "Runner-up";
  if (rounded === 4) return "Semifinals";
  if (rounded === 8) return "Quarterfinals";
  if (rounded === 16) return "Round of 16";
  if (rounded === 32) return "Round of 32";
  if (rounded === 64) return "Round of 64";
  if (rounded === 128) return "Round of 128";
  if (rounded === 256) return "Round of 256";
  return `Top ${rounded}`;
};

const formatYears = (years: number[]): string => [...years]
  .map((year) => toInt(year))
  .sort((a, b) => a - b)
  .join(", ");

const Button = ({
  label,
  onPress,
  variant = "primary",
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger" | "gold";
  disabled?: boolean;
}) => (
  <Pressable
    disabled={disabled}
    onPress={onPress}
    style={({ pressed }) => [
      styles.button,
      styles[`button_${variant}`],
      disabled && styles.buttonDisabled,
      pressed && !disabled && styles.buttonPressed,
    ]}
  >
    <Text style={styles.buttonText}>{label}</Text>
  </Pressable>
);

const MiniStat = ({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | Surface;
}) => (
  <View style={[styles.miniStat, tone !== "default" && styles[`miniStat_${tone}`]]}>
    <Text style={[styles.miniStatLabel, tone !== "default" && styles[`miniStatLabel_${tone}`]]}>{label}</Text>
    <Text style={[styles.miniStatValue, tone !== "default" && styles[`miniStatValue_${tone}`]]}>{value}</Text>
  </View>
);

const DetailStatRow = ({
  label,
  value,
  emphasizeLabel = false,
  compact = false,
}: {
  label: string;
  value: string;
  emphasizeLabel?: boolean;
  compact?: boolean;
}) => (
  <View style={[styles.detailRow, compact && styles.detailSubRow]}>
    <Text
      style={[
        styles.detailRowLabel,
        emphasizeLabel && styles.detailRowLabelStrong,
      ]}
      numberOfLines={1}
      ellipsizeMode="tail"
      adjustsFontSizeToFit
      minimumFontScale={0.72}
    >
      {label}
    </Text>
    <Text
      style={[styles.detailRowValue, compact && styles.detailSubRowValue]}
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={0.75}
    >
      {value}
    </Text>
  </View>
);

const PlayerCard = ({
  player,
  extra,
  action,
  inlineExtraStat,
}: {
  player: Player;
  extra?: React.ReactNode;
  action?: React.ReactNode;
  inlineExtraStat?: React.ReactNode;
}) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>
      <CountryFlag countryName={player.nationality} showName={false} /> {player.name}
    </Text>
    {player.injury_weeks > 0 && (
      <View style={styles.injuryBanner}>
        <Text style={styles.injuryBannerText}>
          Injured: out {player.injury_weeks} {player.injury_weeks === 1 ? "week" : "weeks"}
        </Text>
      </View>
    )}
    <View style={styles.rowWrap}>
      <MiniStat label="Age" value={player.age} />
      <MiniStat label="Overall" value={toInt(player.overall)} />
      <MiniStat label="Potential" value={player.potential_letter} />
      <MiniStat label="Share" value={`${player.earnings_share}%`} />
      <MiniStat label="Rank" value={`#${toInt(player.ranking)}`} />
      <MiniStat label="Energy" value={toInt(player.energy)} />
      <MiniStat label="Serve" value={toInt(player.serve)} />
      <MiniStat label="Stamina" value={toInt(player.stamina)} />
      <MiniStat label="Clutch" value={toInt(player.big_moments)} />
      <MiniStat label="Hard" value={toInt(player.court_proficiencies.hard)} tone="hard" />
      <MiniStat label="Clay" value={toInt(player.court_proficiencies.clay)} tone="clay" />
      <MiniStat label="Grass" value={toInt(player.court_proficiencies.grass)} tone="grass" />
      {inlineExtraStat}
    </View>
    {extra}
    {action}
  </View>
);

export default function App() {
  const [state, setState] = useState<GameState>(createInitialState());
  const [booting, setBooting] = useState(true);
  const [username, setUsername] = useState("");

  const [selectedByTournament, setSelectedByTournament] = useState<Record<string, number[]>>({});
  const [resultIndex, setResultIndex] = useState(0);
  const [trainingChoices, setTrainingChoices] = useState<Record<number, number>>({});
  const [selectedWeek, setSelectedWeek] = useState(2);

  const [exhPlayer1, setExhPlayer1] = useState<number | null>(null);
  const [exhPlayer2, setExhPlayer2] = useState<number | null>(null);
  const [exhSurface, setExhSurface] = useState<Surface>("hard");
  const [exhFocus1, setExhFocus1] = useState<ExhibitionFocus>("court");
  const [exhFocus2, setExhFocus2] = useState<ExhibitionFocus>("court");
  const [exhLines, setExhLines] = useState<string[] | null>(null);
  const [exhError, setExhError] = useState<string | null>(null);
  const [detailPlayerId, setDetailPlayerId] = useState<number | null>(null);
  const [detailBackScreen, setDetailBackScreen] = useState<PlayerListScreen>("view-senior-players");

  useEffect(() => {
    const boot = async () => {
      const loaded = await loadGameState();
      if (loaded) {
        setState(loaded);
        setUsername(loaded.userName);
      }
      setBooting(false);
    };
    void boot();
  }, []);

  useEffect(() => {
    if (booting) return;
    void saveGameState(state);
  }, [state, booting]);

  const availableTournaments = useMemo<TournamentWithPlayers[]>(() => {
    if (state.screen !== "choose-tournament") return [];
    return getAvailableTournaments(state);
  }, [state]);

  const seniorPlayers = useMemo(() => getSeniorPlayers(state), [state]);
  const juniorPlayers = useMemo(() => getJuniorPlayers(state), [state]);
  const trainingEligible = useMemo(() => getTrainingEligiblePlayers(state), [state]);
  const exhibitionEligible = useMemo(() => getEligibleExhibitionPlayers(state), [state]);
  const detailPlayer = useMemo(
    () => state.userPlayers.find((player) => player.player_id === detailPlayerId) ?? null,
    [state.userPlayers, detailPlayerId],
  );

  useEffect(() => {
    if (state.screen !== "choose-tournament") return;
    if (availableTournaments.length === 0) {
      setState((prev) => ({ ...prev, screen: "menu" }));
      return;
    }

    const mandatory: Record<string, number[]> = {};
    availableTournaments.forEach(({ tournament, players }) => {
      const ids = players.filter((player) => player.qualify_tourney === -1).map((player) => player.player_id);
      if (ids.length) mandatory[tournament.name] = ids;
    });
    setSelectedByTournament(mandatory);
  }, [state.screen, availableTournaments]);

  useEffect(() => {
    if (state.screen === "tournament-results") {
      setResultIndex(0);
    }
    if (state.screen === "training") {
      setTrainingChoices({});
    }
    if (state.screen === "skip-ahead") {
      setSelectedWeek(Math.min(52, state.week + 1));
    }
    if (state.screen === "exhibition-match") {
      setExhLines(null);
      setExhError(null);
      setExhPlayer1(null);
      setExhPlayer2(null);
      setExhSurface("hard");
      setExhFocus1("court");
      setExhFocus2("court");
    }
  }, [state.screen, state.week]);

  const go = (screen: ScreenKey) => setState((prev) => ({ ...prev, screen }));

  const openPlayerDetails = (playerId: number, backScreen: PlayerListScreen) => {
    setDetailPlayerId(playerId);
    setDetailBackScreen(backScreen);
    go("view-player-details");
  };

  const toggleTournamentPlayer = (tournamentName: string, player: PlayerTournamentEligibility) => {
    if (player.qualify_tourney === 0) return;
    const isMandatorySomewhere = availableTournaments.some((entry) => {
      const found = entry.players.find((candidate) => candidate.player_id === player.player_id);
      return found?.qualify_tourney === -1;
    });
    if (isMandatorySomewhere) return;

    setSelectedByTournament((prev) => {
      const next: Record<string, number[]> = {};
      Object.entries(prev).forEach(([name, ids]) => {
        const filtered = ids.filter((id) => id !== player.player_id);
        if (filtered.length > 0) next[name] = filtered;
      });

      const current = prev[tournamentName] ?? [];
      const alreadySelected = current.includes(player.player_id);
      if (!alreadySelected) {
        next[tournamentName] = [...(next[tournamentName] ?? []), player.player_id];
      }
      return next;
    });
  };

  if (booting) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#00bfff" />
        <Text style={styles.loadingText}>Loading Tenman iOS save...</Text>
      </View>
    );
  }

  const schedule = getTournamentSchedule(state);

  return (
    <ScrollView style={styles.app} contentContainerStyle={styles.container}>
      <Text style={styles.subtitle}>{getWeeklyHeader(state)}</Text>

      {state.screen === "landing" && (
        <View style={styles.section}>
          <Text style={styles.h2}>Start New Career</Text>
          <TextInput
            style={styles.input}
            placeholder="Manager Name"
            value={username}
            onChangeText={setUsername}
            placeholderTextColor="#7a8da6"
          />
          <Button
            label="Start Your Journey"
            onPress={() => {
              const trimmed = username.trim();
              if (!trimmed) return;
              setState(startNewGame(trimmed));
            }}
            disabled={!username.trim()}
          />
          <View style={styles.spacer} />
          <Button
            label="Clear Saved Progress"
            variant="danger"
            onPress={async () => {
              await clearGameState();
              setState(createInitialState());
              setUsername("");
            }}
          />
        </View>
      )}

      {state.screen === "recruit-territories" && (
        <View style={styles.section}>
          <Text style={styles.h2}>Select Territory to Scout</Text>
          {territoryNames.map((name, index) => (
            <Button
              key={name}
              label={name}
              onPress={() => setState((prev) => seeRecruits(prev, index + 1))}
            />
          ))}
          <View style={styles.spacer} />
          <Button label="Menu" variant="secondary" onPress={() => go("menu")} />
        </View>
      )}

      {state.screen === "offer-recruits" && (
        <View style={styles.section}>
          <Text style={styles.h2}>Recruit Offers</Text>
          {state.offerRecruits.length === 0 && <Text style={styles.text}>No recruits available.</Text>}
          {state.offerRecruits.map((player) => (
            <PlayerCard
              key={player.player_id}
              player={player}
              inlineExtraStat={<MiniStat label="Injury Prone" value={`${Math.round(player.injury_prone * 100)}%`} />}
              action={<Button label="Select Recruit" onPress={() => setState((prev) => addRecruit(prev, player.player_id))} />}
            />
          ))}
          <Button label="Skip Recruits" variant="secondary" onPress={() => setState((prev) => skipRecruits(prev))} />
        </View>
      )}

      {state.screen === "choose-tournament" && (
        <View style={styles.section}>
          <Text style={styles.h2}>Choose Tournaments</Text>
          {availableTournaments.map(({ tournament, players }) => (
            <View key={tournament.name} style={[styles.card, styles[`cardSurface_${tournament.surface}`]]}>
              <Text style={styles.cardTitle}>{tournament.name}</Text>
              <Text style={styles.text}><CountryFlag countryName={tournament.country} /></Text>
              <Text style={styles.text}>Level: {formatTournamentLevel(String(tournament.level))}</Text>
              <Text style={styles.text}>Prize: {formatMoney(tournament.prize_money)}</Text>

              {players.length === 0 ? (
                <Text style={styles.text}>No players available.</Text>
              ) : (
                players.map((player) => {
                  const selected = (selectedByTournament[tournament.name] ?? []).includes(player.player_id);
                  return (
                    <Pressable
                      key={player.player_id}
                      style={[styles.playerOption, selected && styles.playerOptionSelected, player.qualify_tourney === 0 && styles.playerOptionDisabled]}
                      onPress={() => toggleTournamentPlayer(tournament.name, player)}
                    >
                      <Text style={styles.playerOptionTitle}>
                        <CountryFlag countryName={player.country} showName={false} /> {player.name}
                      </Text>
                      <Text style={styles.playerOptionText}>Rank #{toInt(player.ranking)} | OVR {toInt(player.overall)} | Energy {toInt(player.energy)}</Text>
                      <Text style={styles.playerOptionText}>Qualification: {QUALIFICATION_LABELS[player.qualify_tourney] ?? "Unknown"}</Text>
                    </Pressable>
                  );
                })
              )}
            </View>
          ))}

          <Button
            label="Enter Selected Tournaments"
            onPress={() => setState((prev) => enterTournaments(prev, selectedByTournament))}
          />
          <Button label="Skip" variant="secondary" onPress={() => go("menu")} />
        </View>
      )}

      {state.screen === "tournament-results" && (
        <View style={styles.section}>
          <Text style={styles.h2}>Tournament Results</Text>
          {state.lastTournamentResults.length === 0 ? (
            <Text style={styles.text}>No results to display.</Text>
          ) : (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{state.lastTournamentResults[resultIndex]?.tournamentName}</Text>
              {state.lastTournamentResults[resultIndex]?.lines.map((line, idx) => (
                <Text key={`${idx}-${line}`} style={styles.resultLine}>
                  {line}
                </Text>
              ))}
            </View>
          )}
          <Button
            label={resultIndex < state.lastTournamentResults.length - 1 ? "Next Tournament" : "Finish"}
            onPress={() => {
              if (resultIndex < state.lastTournamentResults.length - 1) {
                setResultIndex((prev) => prev + 1);
              } else {
                go("menu");
              }
            }}
          />
        </View>
      )}

      {state.screen === "injury-alert" && (
        <View style={styles.section}>
          <Text style={styles.h2}>Injury Alert</Text>
          {(state.injuryAlerts ?? []).length === 0 ? (
            <Text style={styles.text}>No new injuries this week.</Text>
          ) : (
            state.injuryAlerts?.map((alert, index) => (
              <View key={`${alert.player_id}-${index}`} style={[styles.card, styles.injuryAlertCard]}>
                <Text style={styles.injuryAlertTitle}>{alert.player_name} has been injured.</Text>
                <Text style={styles.injuryAlertText}>
                  Injured: out {alert.weeks_out} {alert.weeks_out === 1 ? "week" : "weeks"}
                </Text>
              </View>
            ))
          )}
          <Button label="Continue" onPress={() => setState((prev) => dismissInjuryAlerts(prev))} />
        </View>
      )}

      {state.screen === "menu" && (
        <View style={styles.section}>
          <Text style={styles.h2}>Menu</Text>
          <Text style={styles.text}>Lifetime Agent Earnings: {formatMoney(state.agent_earnings)}</Text>
          <Button label="Advance Week" onPress={() => setState((prev) => advanceWeek(prev))} />
          <Button label="View Senior Players" onPress={() => go("view-senior-players")} />
          <Button label="View Junior Players" onPress={() => go("view-junior-players")} />
          <Button label="Upcoming Tournaments" onPress={() => go("view-tournament-schedule")} />
          <Button
            label={canRunExhibition(state) ? "Exhibition Match" : "Exhibition Match (Before Week 48)"}
            onPress={() => go("exhibition-match")}
            disabled={!canRunExhibition(state)}
          />
          <Button label="Skip Ahead" variant="gold" onPress={() => go("skip-ahead")} />
          <Button label="Remove Player" variant="danger" onPress={() => go("remove-player")} />
          <Button label="Retire Agent" variant="danger" onPress={() => go("retire-agent")} />
        </View>
      )}

      {state.screen === "retire-agent" && (
        <View style={styles.section}>
          <Text style={styles.h2}>Retire Agent</Text>
          <View style={styles.card}>
            <Text style={styles.text}>
              This action is permanent. Your current career progress will be deleted and your game will start over.
            </Text>
          </View>
          <Button
            label="Delete"
            variant="danger"
            onPress={async () => {
              await clearGameState();
              setState(createInitialState());
              setUsername("");
            }}
          />
          <Button label="Back to Menu" variant="secondary" onPress={() => go("menu")} />
        </View>
      )}

      {state.screen === "view-senior-players" && (
        <View style={styles.section}>
          <Text style={styles.h2}>Senior Players</Text>
          {seniorPlayers.length === 0 && <Text style={styles.text}>No senior players.</Text>}
          {seniorPlayers.map((player) => (
            <PlayerCard
              key={player.player_id}
              player={player}
              inlineExtraStat={<MiniStat label="Slams" value={player.grand_slam_wins} />}
              extra={
                <View style={styles.rowWrap}>
                  <MiniStat label="Points" value={toInt(player.points)} />
                  <MiniStat label="Season" value={`${player.season_record.wins}-${player.season_record.losses}`} />
                  <MiniStat label="Career" value={`${player.career_record.wins}-${player.career_record.losses}`} />
                  <MiniStat label="Titles" value={player.tournament_wins} />
                  <MiniStat label="Earnings" value={formatMoney(player.career_earnings)} />
                </View>
              }
              action={
                <Button
                  label="More Info"
                  variant="secondary"
                  onPress={() => openPlayerDetails(player.player_id, "view-senior-players")}
                />
              }
            />
          ))}
          <Button label="Back to Menu" variant="secondary" onPress={() => go("menu")} />
        </View>
      )}

      {state.screen === "view-junior-players" && (
        <View style={styles.section}>
          <Text style={styles.h2}>Junior Players</Text>
          {juniorPlayers.length === 0 && <Text style={styles.text}>No junior players.</Text>}
          {juniorPlayers.map((player) => (
            <PlayerCard
              key={player.player_id}
              player={player}
              extra={
                <View style={styles.rowWrap}>
                  <MiniStat label="Junior Points" value={toInt(player.junior_points)} />
                  <MiniStat label="Best JR Rank" value={`#${toInt(player.best_junior_ranking)}`} />
                </View>
              }
              action={(
                <View style={styles.detailActions}>
                  <Button
                    label="More Info"
                    variant="secondary"
                    onPress={() => openPlayerDetails(player.player_id, "view-junior-players")}
                  />
                  <Button label="Turn Pro" onPress={() => setState((prev) => promoteJunior(prev, player.player_id))} />
                </View>
              )}
            />
          ))}
          <Button label="Back to Menu" variant="secondary" onPress={() => go("menu")} />
        </View>
      )}

      {state.screen === "view-player-details" && (
        <View style={styles.section}>
          <Text style={styles.h2}>Player Details</Text>
          {!detailPlayer ? (
            <View style={styles.card}>
              <Text style={styles.text}>Player not found in your roster.</Text>
            </View>
          ) : (
            (() => {
              const annualResults = Object.entries(detailPlayer.annual_results).sort(sortByTopFinish);
              const lastYearResults = Object.entries(detailPlayer.last_year_results).sort(sortByTopFinish);
              const majorCurrentResults = annualResults.filter(([name]) => isMajorTournament(name));
              const majorLastResults = lastYearResults.filter(([name]) => isMajorTournament(name));
              const majorBestResults = Object.entries(detailPlayer.best_results).sort(sortByTopFinish);
              const juniorBigResults = Object.entries(detailPlayer.best_junior_results).sort(sortByTopFinish);
              const titlesWon = Object.entries(detailPlayer.tournaments_won_share).sort(sortByName);
              const h2hWins = Object.entries(detailPlayer.head_to_head_wins).sort(sortByWinsDesc);
              const h2hBreakdown = Object.entries(detailPlayer.head_to_head_win_breakdown).sort(sortByName);

              return (
                <>
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>
                      <CountryFlag countryName={detailPlayer.nationality} showName={false} /> {detailPlayer.name}
                    </Text>
                    <Text style={styles.text}>
                      {detailPlayer.junior ? "Junior" : "Senior"} | Age {detailPlayer.age} | Rank #{toInt(detailPlayer.ranking)}
                    </Text>
                    <Text style={styles.text}>
                      Season {detailPlayer.season_record.wins}-{detailPlayer.season_record.losses}
                      {" | "}Career {detailPlayer.career_record.wins}-{detailPlayer.career_record.losses}
                    </Text>
                    <Text style={styles.text}>Career Earnings: {formatMoney(detailPlayer.career_earnings)}</Text>
                    <View style={styles.rowWrap}>
                      <MiniStat label={detailPlayer.junior ? "JR Points" : "Points"} value={toInt(detailPlayer.junior ? detailPlayer.junior_points : detailPlayer.points)} />
                      <MiniStat label="Titles" value={detailPlayer.tournament_wins} />
                      <MiniStat label="Slams" value={detailPlayer.grand_slam_wins} />
                      <MiniStat label="Best Rank" value={`#${toInt(detailPlayer.best_ranking)}`} />
                      <MiniStat label="Best JR Rank" value={`#${toInt(detailPlayer.best_junior_ranking)}`} />
                      <MiniStat label="Weeks #1" value={detailPlayer.weeks_ranked_1} />
                    </View>
                  </View>

                  <View style={styles.card}>
                    <Text style={styles.detailSectionHeader}>Results This Year ({state.year})</Text>
                    {annualResults.length === 0 ? (
                      <Text style={styles.textMuted}>No tournament results recorded this year.</Text>
                    ) : (
                      annualResults.map(([name, top]) => (
                        <DetailStatRow
                          key={`annual-${name}`}
                          label={name}
                          value={formatTopFinish(top)}
                          emphasizeLabel={isSlamOrJuniorSlam(name)}
                        />
                      ))
                    )}
                  </View>

                  <View style={styles.card}>
                    <Text style={styles.detailSectionHeader}>Results Last Year ({state.year - 1})</Text>
                    {lastYearResults.length === 0 ? (
                      <Text style={styles.textMuted}>No results stored for last season.</Text>
                    ) : (
                      lastYearResults.map(([name, top]) => (
                        <DetailStatRow
                          key={`last-${name}`}
                          label={name}
                          value={formatTopFinish(top)}
                          emphasizeLabel={isSlamOrJuniorSlam(name)}
                        />
                      ))
                    )}
                  </View>

                  <View style={styles.card}>
                    <Text style={styles.detailSectionHeader}>Major Tournament Snapshot</Text>
                    <Text style={styles.h3}>This Year</Text>
                    {majorCurrentResults.length === 0 ? (
                      <Text style={styles.textMuted}>No major results this year yet.</Text>
                    ) : (
                      majorCurrentResults.map(([name, top]) => (
                        <DetailStatRow
                          key={`major-current-${name}`}
                          label={name}
                          value={formatTopFinish(top)}
                          emphasizeLabel={isSlamOrJuniorSlam(name)}
                        />
                      ))
                    )}
                    <Text style={styles.h3}>Last Year</Text>
                    {majorLastResults.length === 0 ? (
                      <Text style={styles.textMuted}>No major results from last year.</Text>
                    ) : (
                      majorLastResults.map(([name, top]) => (
                        <DetailStatRow
                          key={`major-last-${name}`}
                          label={name}
                          value={formatTopFinish(top)}
                          emphasizeLabel={isSlamOrJuniorSlam(name)}
                        />
                      ))
                    )}
                    <Text style={styles.h3}>Best Senior Major Finishes</Text>
                    {majorBestResults.length === 0 ? (
                      <Text style={styles.textMuted}>No recorded major best finishes yet.</Text>
                    ) : (
                      majorBestResults.map(([name, top]) => (
                        <DetailStatRow
                          key={`major-best-${name}`}
                          label={name}
                          value={formatTopFinish(top)}
                          emphasizeLabel={isSlamOrJuniorSlam(name)}
                        />
                      ))
                    )}
                    <Text style={styles.h3}>Best Junior Big Event Finishes</Text>
                    {juniorBigResults.length === 0 ? (
                      <Text style={styles.textMuted}>No recorded junior big-event best finishes yet.</Text>
                    ) : (
                      juniorBigResults.map(([name, top]) => (
                        <DetailStatRow
                          key={`junior-best-${name}`}
                          label={name}
                          value={formatTopFinish(top)}
                          emphasizeLabel={isSlamOrJuniorSlam(name)}
                        />
                      ))
                    )}
                  </View>

                  <View style={styles.card}>
                    <Text style={styles.detailSectionHeader}>Titles Won</Text>
                    {titlesWon.length === 0 ? (
                      <Text style={styles.textMuted}>No titles won yet.</Text>
                    ) : (
                      titlesWon.map(([name, years]) => (
                        <DetailStatRow
                          key={`titles-${name}`}
                          label={name}
                          value={formatYears(years)}
                          emphasizeLabel={isSlamOrJuniorSlam(name)}
                        />
                      ))
                    )}
                  </View>

                  <View style={styles.card}>
                    <Text style={styles.detailSectionHeader}>Head-to-Head Matchups</Text>
                    {h2hWins.length === 0 ? (
                      <Text style={styles.textMuted}>No head-to-head wins recorded yet.</Text>
                    ) : (
                      h2hWins.map(([opponent, wins]) => (
                        <DetailStatRow
                          key={`h2h-${opponent}`}
                          label={opponent}
                          value={`${wins} win${wins === 1 ? "" : "s"}`}
                        />
                      ))
                    )}
                  </View>

                  <View style={styles.card}>
                    <Text style={styles.detailSectionHeader}>Head-to-Head Breakdown</Text>
                    {h2hBreakdown.length === 0 ? (
                      <Text style={styles.textMuted}>No matchup breakdown data yet.</Text>
                    ) : (
                      h2hBreakdown.map(([opponent, tournaments]) => (
                        <View key={`breakdown-${opponent}`} style={styles.detailGroup}>
                          <Text style={styles.detailGroupTitle}>{opponent}</Text>
                          {Object.entries(tournaments)
                            .sort(sortByName)
                            .map(([tournamentName, years]) => (
                              <DetailStatRow
                                key={`${opponent}-${tournamentName}`}
                                label={tournamentName}
                                value={formatYears(years)}
                                emphasizeLabel={isSlamOrJuniorSlam(tournamentName)}
                                compact
                              />
                            ))}
                        </View>
                      ))
                    )}
                  </View>
                </>
              );
            })()
          )}
          <Button label="Back" variant="secondary" onPress={() => go(detailBackScreen)} />
        </View>
      )}

      {state.screen === "training" && (
        <View style={styles.section}>
          <Text style={styles.h2}>Offseason Training</Text>
          {trainingEligible.length === 0 && <Text style={styles.text}>No players are eligible for training this offseason.</Text>}
          {trainingEligible.map((player) => {
            const currentChoice = trainingChoices[player.player_id];
            const label = currentChoice === undefined ? "Choose training" : trainingOptions[currentChoice];
            return (
              <View key={player.player_id} style={styles.card}>
                <Text style={styles.cardTitle}>{player.name}</Text>
                <Text style={styles.text}>Age {player.age} | Rank #{toInt(player.ranking)} | OVR {toInt(player.overall)}</Text>
                <Text style={styles.text}>Current training: {label}</Text>
                <View style={styles.rowButtons}>
                  {trainingOptions.map((option, optionIndex) => (
                    <Button
                      key={`${player.player_id}-${option}`}
                      label={option}
                      variant={currentChoice === optionIndex ? "primary" : "secondary"}
                      onPress={() =>
                        setTrainingChoices((prev) => ({
                          ...prev,
                          [player.player_id]: optionIndex,
                        }))
                      }
                    />
                  ))}
                </View>
              </View>
            );
          })}
          <Button
            label="Submit Training"
            onPress={() => setState((prev) => trainPlayers(prev, trainingChoices))}
            disabled={trainingEligible.length > 0 && trainingEligible.some((player) => trainingChoices[player.player_id] === undefined)}
          />
          <Button label="Back to Menu" variant="secondary" onPress={() => go("menu")} />
        </View>
      )}

      {state.screen === "remove-player" && (
        <View style={styles.section}>
          <Text style={styles.h2}>Remove Player</Text>
          {state.userPlayers.length === 0 && <Text style={styles.text}>No players in roster.</Text>}
          {state.userPlayers.map((player) => (
            <PlayerCard
              key={player.player_id}
              player={player}
              action={<Button label="Remove Player" variant="danger" onPress={() => setState((prev) => removePlayer(prev, player.player_id))} />}
            />
          ))}
          <Button label="Back to Menu" variant="secondary" onPress={() => go("menu")} />
        </View>
      )}

      {state.screen === "skip-ahead" && (
        <View style={styles.section}>
          <Text style={styles.h2}>Simulate Ahead</Text>
          <Text style={styles.text}>Current week: {state.week}</Text>
          <Text style={styles.text}>Selected week: {selectedWeek}</Text>
          <View style={styles.rowButtons}>
            <Button
              label="-1 Week"
              variant="secondary"
              onPress={() => setSelectedWeek((prev) => Math.max(state.week + 1, prev - 1))}
              disabled={selectedWeek <= state.week + 1}
            />
            <Button
              label="+1 Week"
              variant="secondary"
              onPress={() => setSelectedWeek((prev) => Math.min(52, prev + 1))}
              disabled={selectedWeek >= 52}
            />
          </View>
          <Button label="Sim to Selected Week" onPress={() => setState((prev) => skipToWeek(prev, selectedWeek))} />
          <Button label="Sim to Next Year" variant="gold" onPress={() => setState((prev) => skipToNextYear(prev))} />
          <Button label="Back to Menu" variant="secondary" onPress={() => go("menu")} />
        </View>
      )}

      {state.screen === "view-tournament-schedule" && (
        <View style={styles.section}>
          <View style={styles.topLeftAction}>
            <Button label="Back to Menu" variant="secondary" onPress={() => go("menu")} />
          </View>
          <Text style={styles.h2}>Tournament Schedule</Text>
          <Text style={styles.h3}>Senior (next 5 weeks)</Text>
          {schedule.senior.length === 0 && <Text style={styles.text}>No upcoming senior tournaments.</Text>}
          {schedule.senior.map((tournament) => (
            <View key={`${tournament.week}-${tournament.name}`} style={[styles.card, styles[`cardSurface_${tournament.surface}`]]}>
              <Text style={styles.cardTitle}>Week {tournament.week}: {tournament.name}</Text>
              <Text style={styles.text}><CountryFlag countryName={tournament.country} /></Text>
              <Text style={styles.text}>Level: {formatTournamentLevel(tournament.level)}</Text>
              <Text style={styles.text}>Points {tournament.points} | Prize {formatMoney(tournament.prize_money)}</Text>
            </View>
          ))}

          <Text style={styles.h3}>Junior (next 10 weeks)</Text>
          {schedule.junior.length === 0 && <Text style={styles.text}>No upcoming junior tournaments.</Text>}
          {schedule.junior.map((tournament) => (
            <View key={`${tournament.week}-${tournament.name}`} style={[styles.card, styles[`cardSurface_${tournament.surface}`]]}>
              <Text style={styles.cardTitle}>Week {tournament.week}: {tournament.name}</Text>
              <Text style={styles.text}><CountryFlag countryName={tournament.country} /></Text>
              <Text style={styles.text}>Level: {formatTournamentLevel(tournament.level)}</Text>
              <Text style={styles.text}>Points {tournament.points}</Text>
            </View>
          ))}
          <Button label="Back to Menu" variant="secondary" onPress={() => go("menu")} />
        </View>
      )}

      {state.screen === "exhibition-match" && (
        <View style={styles.section}>
          <Text style={styles.h2}>Exhibition Match</Text>
          {exhibitionEligible.length < 2 ? (
            <Text style={styles.text}>Need at least 2 healthy players with 40+ energy.</Text>
          ) : (
            <>
              <Text style={styles.h3}>Select Players</Text>
              {exhibitionEligible.map((player) => {
                const selected = player.player_id === exhPlayer1 || player.player_id === exhPlayer2;
                return (
                  <Pressable
                    key={player.player_id}
                    style={[styles.playerOption, selected && styles.playerOptionSelected]}
                    onPress={() => {
                      if (player.player_id === exhPlayer1) setExhPlayer1(null);
                      else if (player.player_id === exhPlayer2) setExhPlayer2(null);
                      else if (!exhPlayer1) setExhPlayer1(player.player_id);
                      else if (!exhPlayer2) setExhPlayer2(player.player_id);
                    }}
                  >
                    <Text style={styles.playerOptionTitle}>{player.name}</Text>
                    <Text style={styles.playerOptionText}>Energy {toInt(player.energy)} | Rank #{toInt(player.ranking)} | OVR {toInt(player.overall)}</Text>
                  </Pressable>
                );
              })}

              <Text style={styles.h3}>Surface</Text>
              <View style={styles.rowButtons}>
                {(["hard", "clay", "grass"] as Surface[]).map((surface) => (
                  <Button
                    key={surface}
                    label={surface.toUpperCase()}
                    variant={exhSurface === surface ? "primary" : "secondary"}
                    onPress={() => setExhSurface(surface)}
                  />
                ))}
              </View>

              <Text style={styles.h3}>Focus ({exhPlayer1 ? exhibitionEligible.find((p) => p.player_id === exhPlayer1)?.name : "Player 1"})</Text>
              <View style={styles.rowButtons}>
                {exhibitionFocuses.map((focus) => (
                  <Button
                    key={`p1-${focus}`}
                    label={focus}
                    variant={exhFocus1 === focus ? "primary" : "secondary"}
                    onPress={() => setExhFocus1(focus)}
                    disabled={!exhPlayer1}
                  />
                ))}
              </View>

              <Text style={styles.h3}>Focus ({exhPlayer2 ? exhibitionEligible.find((p) => p.player_id === exhPlayer2)?.name : "Player 2"})</Text>
              <View style={styles.rowButtons}>
                {exhibitionFocuses.map((focus) => (
                  <Button
                    key={`p2-${focus}`}
                    label={focus}
                    variant={exhFocus2 === focus ? "primary" : "secondary"}
                    onPress={() => setExhFocus2(focus)}
                    disabled={!exhPlayer2}
                  />
                ))}
              </View>

              <Button
                label="Play Exhibition Match"
                onPress={() => {
                  if (!exhPlayer1 || !exhPlayer2) {
                    setExhError("Please select two different players.");
                    return;
                  }
                  const result = playExhibitionMatch(state, exhPlayer1, exhPlayer2, exhSurface, exhFocus1, exhFocus2);
                  setState(result.state);
                  setExhLines(result.lines);
                  setExhError(result.error ?? null);
                }}
                disabled={!exhPlayer1 || !exhPlayer2}
              />

              {exhError && <Text style={styles.error}>{exhError}</Text>}
              {exhLines && (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Exhibition Results</Text>
                  {exhLines.map((line, index) => (
                    <Text key={`${line}-${index}`} style={styles.resultLine}>
                      {line}
                    </Text>
                  ))}
                </View>
              )}
            </>
          )}
          <Button label="Back to Menu" variant="secondary" onPress={() => go("menu")} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: "#0b1220",
  },
  container: {
    paddingHorizontal: 14,
    paddingVertical: 18,
    gap: 10,
  },
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0b1220",
    gap: 12,
  },
  loadingText: {
    color: "#dbeafe",
    fontSize: 16,
  },
  subtitle: {
    color: "#93c5fd",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 6,
  },
  section: {
    gap: 10,
    backgroundColor: "#101a2f",
    borderColor: "#1e3a5f",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  h2: {
    color: "#bae6fd",
    fontSize: 22,
    fontWeight: "700",
  },
  h3: {
    color: "#7dd3fc",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 4,
  },
  text: {
    color: "#dbeafe",
    fontSize: 14,
  },
  textMuted: {
    color: "#94a3b8",
    fontSize: 13,
  },
  input: {
    borderWidth: 1,
    borderColor: "#2563eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#e0f2fe",
    backgroundColor: "#0f172a",
  },
  spacer: {
    height: 4,
  },
  rowButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  detailActions: {
    gap: 8,
  },
  topLeftAction: {
    alignSelf: "flex-start",
  },
  button: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  button_primary: {
    backgroundColor: "#0ea5e9",
  },
  button_secondary: {
    backgroundColor: "#334155",
  },
  button_danger: {
    backgroundColor: "#dc2626",
  },
  button_gold: {
    backgroundColor: "#ca8a04",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonText: {
    color: "#f8fafc",
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#0f1b32",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1e3a5f",
    padding: 10,
    gap: 6,
  },
  cardSurface_hard: {
    borderColor: "#60a5fa",
    backgroundColor: "#112f66",
  },
  cardSurface_clay: {
    borderColor: "#fb923c",
    backgroundColor: "#3f2415",
  },
  cardSurface_grass: {
    borderColor: "#4ade80",
    backgroundColor: "#132a20",
  },
  cardTitle: {
    color: "#e2e8f0",
    fontSize: 16,
    fontWeight: "700",
  },
  detailSectionHeader: {
    color: "#93c5fd",
    fontSize: 17,
    fontWeight: "700",
  },
  detailGroup: {
    gap: 4,
  },
  detailGroupTitle: {
    color: "#e2e8f0",
    fontSize: 13,
    fontWeight: "700",
  },
  injuryBanner: {
    backgroundColor: "#7f1d1d",
    borderColor: "#ef4444",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  injuryBannerText: {
    color: "#fee2e2",
    fontSize: 13,
    fontWeight: "700",
  },
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  miniStat: {
    backgroundColor: "#1e293b",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexBasis: "23%",
    flexGrow: 0,
    flexShrink: 0,
    minWidth: 0,
  },
  miniStat_hard: {
    backgroundColor: "#1e40af",
    borderWidth: 1,
    borderColor: "#93c5fd",
  },
  miniStat_clay: {
    backgroundColor: "#c2410c",
    borderWidth: 1,
    borderColor: "#fdba74",
  },
  miniStat_grass: {
    backgroundColor: "#166534",
    borderWidth: 1,
    borderColor: "#86efac",
  },
  miniStatLabel: {
    color: "#94a3b8",
    fontSize: 11,
  },
  miniStatLabel_hard: {
    color: "#dbeafe",
  },
  miniStatLabel_clay: {
    color: "#fed7aa",
  },
  miniStatLabel_grass: {
    color: "#bbf7d0",
  },
  miniStatValue: {
    color: "#f1f5f9",
    fontSize: 13,
    fontWeight: "700",
  },
  miniStatValue_hard: {
    color: "#eff6ff",
  },
  miniStatValue_clay: {
    color: "#fff7ed",
  },
  miniStatValue_grass: {
    color: "#dcfce7",
  },
  playerOption: {
    backgroundColor: "#0c1426",
    borderWidth: 1,
    borderColor: "#27406a",
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
  },
  playerOptionSelected: {
    borderColor: "#22d3ee",
    backgroundColor: "#082f49",
  },
  playerOptionDisabled: {
    opacity: 0.45,
  },
  playerOptionTitle: {
    color: "#e2e8f0",
    fontWeight: "700",
    fontSize: 14,
  },
  playerOptionText: {
    color: "#bfdbfe",
    fontSize: 12,
  },
  resultLine: {
    color: "#e0f2fe",
    borderLeftWidth: 3,
    borderLeftColor: "#0ea5e9",
    paddingLeft: 8,
    paddingVertical: 3,
  },
  detailRow: {
    color: "#e0f2fe",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    borderLeftWidth: 2,
    borderLeftColor: "#1d4ed8",
    paddingLeft: 8,
    paddingVertical: 2,
  },
  detailSubRow: {
    marginLeft: 8,
    borderLeftColor: "#2563eb",
  },
  detailRowLabel: {
    color: "#e0f2fe",
    fontSize: 13,
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    paddingRight: 8,
  },
  detailRowLabelStrong: {
    fontWeight: "700",
  },
  detailRowValue: {
    color: "#bfdbfe",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "right",
    minWidth: 84,
    maxWidth: "42%",
  },
  detailSubRowValue: {
    color: "#93c5fd",
    fontSize: 12,
    minWidth: 96,
  },
  error: {
    color: "#fca5a5",
    fontWeight: "700",
  },
  injuryAlertCard: {
    borderColor: "#ef4444",
    backgroundColor: "#450a0a",
  },
  injuryAlertTitle: {
    color: "#fecaca",
    fontSize: 15,
    fontWeight: "700",
  },
  injuryAlertText: {
    color: "#fee2e2",
    fontSize: 13,
    fontWeight: "600",
  },
});
