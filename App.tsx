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

const MiniStat = ({ label, value }: { label: string; value: string | number }) => (
  <View style={styles.miniStat}>
    <Text style={styles.miniStatLabel}>{label}</Text>
    <Text style={styles.miniStatValue}>{value}</Text>
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
    <View style={styles.rowWrap}>
      <MiniStat label="Age" value={player.age} />
      <MiniStat label="Overall" value={toInt(player.overall)} />
      <MiniStat label="Potential" value={player.potential_letter} />
      <MiniStat label="Rank" value={`#${toInt(player.ranking)}`} />
      <MiniStat label="Energy" value={toInt(player.energy)} />
      <MiniStat label="Serve" value={toInt(player.serve)} />
      <MiniStat label="Stamina" value={toInt(player.stamina)} />
      <MiniStat label="Clutch" value={toInt(player.big_moments)} />
      <MiniStat label="Hard" value={toInt(player.court_proficiencies.hard)} />
      <MiniStat label="Clay" value={toInt(player.court_proficiencies.clay)} />
      <MiniStat label="Grass" value={toInt(player.court_proficiencies.grass)} />
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
      <Text style={styles.title}>Tenman iOS</Text>
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
            <View key={tournament.name} style={styles.card}>
              <Text style={styles.cardTitle}>{tournament.name}</Text>
              <Text style={styles.text}><CountryFlag countryName={tournament.country} /></Text>
              <Text style={styles.text}>Surface: {tournament.surface}</Text>
              <Text style={styles.text}>Level: {String(tournament.level)}</Text>
              <Text style={styles.text}>Points: {tournament.points}</Text>
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

      {state.screen === "menu" && (
        <View style={styles.section}>
          <Text style={styles.h2}>Menu</Text>
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
                  <MiniStat label="Wins" value={player.career_record.wins} />
                  <MiniStat label="Losses" value={player.career_record.losses} />
                  <MiniStat label="Titles" value={player.tournament_wins} />
                </View>
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
              action={<Button label="Turn Pro" onPress={() => setState((prev) => promoteJunior(prev, player.player_id))} />}
            />
          ))}
          <Button label="Back to Menu" variant="secondary" onPress={() => go("menu")} />
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
                <Button
                  label="Cycle Training Option"
                  onPress={() =>
                    setTrainingChoices((prev) => {
                      const current = prev[player.player_id] ?? -1;
                      return { ...prev, [player.player_id]: (current + 1) % trainingOptions.length };
                    })
                  }
                />
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
          <Text style={styles.h2}>Tournament Schedule</Text>
          <Text style={styles.h3}>Senior (next 5 weeks)</Text>
          {schedule.senior.length === 0 && <Text style={styles.text}>No upcoming senior tournaments.</Text>}
          {schedule.senior.map((tournament) => (
            <View key={`${tournament.week}-${tournament.name}`} style={styles.card}>
              <Text style={styles.cardTitle}>Week {tournament.week}: {tournament.name}</Text>
              <Text style={styles.text}><CountryFlag countryName={tournament.country} /></Text>
              <Text style={styles.text}>{tournament.surface} | {tournament.level}</Text>
              <Text style={styles.text}>Points {tournament.points} | Prize {formatMoney(tournament.prize_money)}</Text>
            </View>
          ))}

          <Text style={styles.h3}>Junior (next 10 weeks)</Text>
          {schedule.junior.length === 0 && <Text style={styles.text}>No upcoming junior tournaments.</Text>}
          {schedule.junior.map((tournament) => (
            <View key={`${tournament.week}-${tournament.name}`} style={styles.card}>
              <Text style={styles.cardTitle}>Week {tournament.week}: {tournament.name}</Text>
              <Text style={styles.text}><CountryFlag countryName={tournament.country} /></Text>
              <Text style={styles.text}>{tournament.surface} | {tournament.level}</Text>
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
  title: {
    color: "#e0f2fe",
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
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
  cardTitle: {
    color: "#e2e8f0",
    fontSize: 16,
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
  miniStatLabel: {
    color: "#94a3b8",
    fontSize: 11,
  },
  miniStatValue: {
    color: "#f1f5f9",
    fontSize: 13,
    fontWeight: "700",
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
  error: {
    color: "#fca5a5",
    fontWeight: "700",
  },
});
