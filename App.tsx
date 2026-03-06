import React, { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  View,
} from "react-native";
import {
  ActivityIndicator as PaperActivityIndicator,
  Provider as PaperProvider,
  Text as PaperText,
  TextInput as PaperTextInput,
  TouchableRipple,
} from "react-native-paper";
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
import { GameState, PlayerTournamentEligibility, ScreenKey, Surface as CourtSurface, TournamentWithPlayers } from "./src/types/game";
import { Button, CardBlock, DetailStatRow, MiniStat, PlayerCard, Section } from "./src/ui/AppPrimitives";
import {
  formatMoney,
  formatTournamentLevel,
  formatTopFinish,
  formatYears,
  isMajorTournament,
  isSlamOrJuniorSlam,
  paperTheme,
  PlayerListScreen,
  sortByName,
  sortByTopFinish,
  sortByWinsDesc,
  toInt,
} from "./src/ui/appHelpers";
import { styles } from "./src/ui/appStyles";

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
  const [exhSurface, setExhSurface] = useState<CourtSurface>("hard");
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
      <PaperProvider theme={paperTheme}>
        <View style={styles.loadingScreen}>
          <PaperActivityIndicator size="large" color="#2563eb" />
          <PaperText style={styles.loadingText}>Loading Tenman iOS save...</PaperText>
        </View>
      </PaperProvider>
    );
  }

  const schedule = getTournamentSchedule(state);

  return (
    <PaperProvider theme={paperTheme}>
      <ScrollView style={styles.app} contentContainerStyle={styles.container}>
        <PaperText style={styles.subtitle}>{getWeeklyHeader(state)}</PaperText>

      {state.screen === "landing" && (
        <Section>
          <PaperText style={styles.h2}>Start New Career</PaperText>
          <PaperTextInput
            style={styles.input}
            mode="outlined"
            label="Manager Name"
            placeholder="Manager Name"
            value={username}
            onChangeText={setUsername}
            outlineColor="#9ca3af"
            activeOutlineColor="#1f2937"
            textColor="#000000"
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
        </Section>
      )}

      {state.screen === "recruit-territories" && (
        <Section>
          <PaperText style={styles.h2}>Select Territory to Scout</PaperText>
          {territoryNames.map((name, index) => (
            <Button
              key={name}
              label={name}
              onPress={() => setState((prev) => seeRecruits(prev, index + 1))}
            />
          ))}
          <View style={styles.spacer} />
          <Button label="Menu" variant="secondary" onPress={() => go("menu")} />
        </Section>
      )}

      {state.screen === "offer-recruits" && (
        <Section>
          <PaperText style={styles.h2}>Recruit Offers</PaperText>
          {state.offerRecruits.length === 0 && <PaperText style={styles.text}>No recruits available.</PaperText>}
          {state.offerRecruits.map((player) => (
            <PlayerCard
              key={player.player_id}
              player={player}
              inlineExtraStat={<MiniStat label="Injury Prone" value={`${Math.round(player.injury_prone * 100)}%`} />}
              action={<Button label="Select Recruit" onPress={() => setState((prev) => addRecruit(prev, player.player_id))} />}
            />
          ))}
          <Button label="Skip Recruits" variant="secondary" onPress={() => setState((prev) => skipRecruits(prev))} />
        </Section>
      )}

      {state.screen === "choose-tournament" && (
        <Section>
          <PaperText style={styles.h2}>Choose Tournaments</PaperText>
          {availableTournaments.map(({ tournament, players }) => (
            <CardBlock key={tournament.name} style={styles[`cardSurface_${tournament.surface}`]}>
              <PaperText style={styles.cardTitle}>{tournament.name}</PaperText>
              <PaperText style={styles.text}><CountryFlag countryName={tournament.country} /></PaperText>
              <PaperText style={styles.text}>Level: {formatTournamentLevel(String(tournament.level))}</PaperText>
              <PaperText style={styles.text}>Prize: {formatMoney(tournament.prize_money)}</PaperText>

              {players.length === 0 ? (
                <PaperText style={styles.text}>No players available.</PaperText>
              ) : (
                players.map((player) => {
                  const selected = (selectedByTournament[tournament.name] ?? []).includes(player.player_id);
                  const isRequired = player.qualify_tourney === -1;
                  return (
                    <TouchableRipple
                      key={player.player_id}
                      style={[styles.playerOption, selected && styles.playerOptionSelected, player.qualify_tourney === 0 && styles.playerOptionDisabled]}
                      onPress={() => toggleTournamentPlayer(tournament.name, player)}
                    >
                      <View>
                        <View style={styles.playerOptionHeader}>
                          <PaperText style={styles.playerOptionTitle}>
                            <CountryFlag countryName={player.country} showName={false} /> {player.name}
                          </PaperText>
                          {isRequired ? (
                            <PaperText style={[styles.playerOptionBadge, styles.playerOptionBadgeRequired]}>Required</PaperText>
                          ) : selected ? (
                            <PaperText style={[styles.playerOptionBadge, styles.playerOptionBadgeSelected]}>Selected</PaperText>
                          ) : null}
                        </View>
                        <PaperText style={styles.playerOptionText}>Rank #{toInt(player.ranking)} | OVR {toInt(player.overall)} | Energy {toInt(player.energy)}</PaperText>
                        <PaperText style={styles.playerOptionText}>Qualification: {QUALIFICATION_LABELS[player.qualify_tourney] ?? "Unknown"}</PaperText>
                      </View>
                    </TouchableRipple>
                  );
                })
              )}
            </CardBlock>
          ))}

          <Button
            label="Enter Selected Tournaments"
            onPress={() => setState((prev) => enterTournaments(prev, selectedByTournament))}
          />
          <Button label="Skip" variant="secondary" onPress={() => go("menu")} />
        </Section>
      )}

      {state.screen === "tournament-results" && (
        <Section>
          <PaperText style={styles.h2}>Tournament Results</PaperText>
          {state.lastTournamentResults.length === 0 ? (
            <PaperText style={styles.text}>No results to display.</PaperText>
          ) : (
            <CardBlock>
              <PaperText style={styles.cardTitle}>{state.lastTournamentResults[resultIndex]?.tournamentName}</PaperText>
              {state.lastTournamentResults[resultIndex]?.lines.map((line, idx) => (
                <PaperText key={`${idx}-${line}`} style={styles.resultLine}>
                  {line}
                </PaperText>
              ))}
            </CardBlock>
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
        </Section>
      )}

      {state.screen === "injury-alert" && (
        <Section>
          <PaperText style={styles.h2}>Injury Alert</PaperText>
          {(state.injuryAlerts ?? []).length === 0 ? (
            <PaperText style={styles.text}>No new injuries this week.</PaperText>
          ) : (
            state.injuryAlerts?.map((alert, index) => (
              <CardBlock key={`${alert.player_id}-${index}`} style={styles.injuryAlertCard}>
                <PaperText style={styles.injuryAlertTitle}>{alert.player_name} has been injured.</PaperText>
                <PaperText style={styles.injuryAlertText}>
                  Injured: out {alert.weeks_out} {alert.weeks_out === 1 ? "week" : "weeks"}
                </PaperText>
              </CardBlock>
            ))
          )}
          <Button label="Continue" onPress={() => setState((prev) => dismissInjuryAlerts(prev))} />
        </Section>
      )}

      {state.screen === "menu" && (
        <Section>
          <View style={styles.menuHeaderRow}>
            <PaperText style={styles.h2}>Menu</PaperText>
            <PaperText style={styles.menuCash}>Cash: {formatMoney(state.agent_earnings)}</PaperText>
          </View>
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
        </Section>
      )}

      {state.screen === "retire-agent" && (
        <Section>
          <PaperText style={styles.h2}>Retire Agent</PaperText>
          <CardBlock>
            <PaperText style={styles.text}>
              This action is permanent. Your current career progress will be deleted and your game will start over.
            </PaperText>
          </CardBlock>
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
        </Section>
      )}

      {state.screen === "view-senior-players" && (
        <Section>
          <PaperText style={styles.h2}>Senior Players</PaperText>
          {seniorPlayers.length === 0 && <PaperText style={styles.text}>No senior players.</PaperText>}
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
        </Section>
      )}

      {state.screen === "view-junior-players" && (
        <Section>
          <PaperText style={styles.h2}>Junior Players</PaperText>
          {juniorPlayers.length === 0 && <PaperText style={styles.text}>No junior players.</PaperText>}
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
        </Section>
      )}

      {state.screen === "view-player-details" && (
        <Section>
          <PaperText style={styles.h2}>Player Details</PaperText>
          {!detailPlayer ? (
            <CardBlock>
              <PaperText style={styles.text}>Player not found in your roster.</PaperText>
            </CardBlock>
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
                  <CardBlock>
                    <PaperText style={styles.cardTitle}>
                      <CountryFlag countryName={detailPlayer.nationality} showName={false} /> {detailPlayer.name}
                    </PaperText>
                    <PaperText style={styles.text}>
                      {detailPlayer.junior ? "Junior" : "Senior"} | Age {detailPlayer.age} | Rank #{toInt(detailPlayer.ranking)}
                    </PaperText>
                    <PaperText style={styles.text}>
                      Season {detailPlayer.season_record.wins}-{detailPlayer.season_record.losses}
                      {" | "}Career {detailPlayer.career_record.wins}-{detailPlayer.career_record.losses}
                    </PaperText>
                    <PaperText style={styles.text}>Career Earnings: {formatMoney(detailPlayer.career_earnings)}</PaperText>
                    <View style={styles.rowWrap}>
                      <MiniStat label={detailPlayer.junior ? "JR Points" : "Points"} value={toInt(detailPlayer.junior ? detailPlayer.junior_points : detailPlayer.points)} />
                      <MiniStat label="Titles" value={detailPlayer.tournament_wins} />
                      <MiniStat label="Slams" value={detailPlayer.grand_slam_wins} />
                      <MiniStat label="Best Rank" value={`#${toInt(detailPlayer.best_ranking)}`} />
                      <MiniStat label="Best JR Rank" value={`#${toInt(detailPlayer.best_junior_ranking)}`} />
                      <MiniStat label="Weeks #1" value={detailPlayer.weeks_ranked_1} />
                    </View>
                  </CardBlock>

                  <CardBlock>
                    <PaperText style={styles.detailSectionHeader}>Results This Year ({state.year})</PaperText>
                    {annualResults.length === 0 ? (
                      <PaperText style={styles.textMuted}>No tournament results recorded this year.</PaperText>
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
                  </CardBlock>

                  <CardBlock>
                    <PaperText style={styles.detailSectionHeader}>Results Last Year ({state.year - 1})</PaperText>
                    {lastYearResults.length === 0 ? (
                      <PaperText style={styles.textMuted}>No results stored for last season.</PaperText>
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
                  </CardBlock>

                  <CardBlock>
                    <PaperText style={styles.detailSectionHeader}>Major Tournament Snapshot</PaperText>
                    <PaperText style={styles.h3}>This Year</PaperText>
                    {majorCurrentResults.length === 0 ? (
                      <PaperText style={styles.textMuted}>No major results this year yet.</PaperText>
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
                    <PaperText style={styles.h3}>Last Year</PaperText>
                    {majorLastResults.length === 0 ? (
                      <PaperText style={styles.textMuted}>No major results from last year.</PaperText>
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
                    <PaperText style={styles.h3}>Best Senior Major Finishes</PaperText>
                    {majorBestResults.length === 0 ? (
                      <PaperText style={styles.textMuted}>No recorded major best finishes yet.</PaperText>
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
                    <PaperText style={styles.h3}>Best Junior Big Event Finishes</PaperText>
                    {juniorBigResults.length === 0 ? (
                      <PaperText style={styles.textMuted}>No recorded junior big-event best finishes yet.</PaperText>
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
                  </CardBlock>

                  <CardBlock>
                    <PaperText style={styles.detailSectionHeader}>Titles Won</PaperText>
                    {titlesWon.length === 0 ? (
                      <PaperText style={styles.textMuted}>No titles won yet.</PaperText>
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
                  </CardBlock>

                  <CardBlock>
                    <PaperText style={styles.detailSectionHeader}>Head-to-Head Matchups</PaperText>
                    {h2hWins.length === 0 ? (
                      <PaperText style={styles.textMuted}>No head-to-head wins recorded yet.</PaperText>
                    ) : (
                      h2hWins.map(([opponent, wins]) => (
                        <DetailStatRow
                          key={`h2h-${opponent}`}
                          label={opponent}
                          value={`${wins} win${wins === 1 ? "" : "s"}`}
                        />
                      ))
                    )}
                  </CardBlock>

                  <CardBlock>
                    <PaperText style={styles.detailSectionHeader}>Head-to-Head Breakdown</PaperText>
                    {h2hBreakdown.length === 0 ? (
                      <PaperText style={styles.textMuted}>No matchup breakdown data yet.</PaperText>
                    ) : (
                      h2hBreakdown.map(([opponent, tournaments]) => (
                        <View key={`breakdown-${opponent}`} style={styles.detailGroup}>
                          <PaperText style={styles.detailGroupTitle}>{opponent}</PaperText>
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
                  </CardBlock>
                </>
              );
            })()
          )}
          <Button label="Back" variant="secondary" onPress={() => go(detailBackScreen)} />
        </Section>
      )}

      {state.screen === "training" && (
        <Section>
          <PaperText style={styles.h2}>Offseason Training</PaperText>
          {trainingEligible.length === 0 && <PaperText style={styles.text}>No players are eligible for training this offseason.</PaperText>}
          {trainingEligible.map((player) => {
            const currentChoice = trainingChoices[player.player_id];
            const label = currentChoice === undefined ? "Choose training" : trainingOptions[currentChoice];
            return (
              <CardBlock key={player.player_id}>
                <PaperText style={styles.cardTitle}>{player.name}</PaperText>
                <PaperText style={styles.text}>Age {player.age} | Rank #{toInt(player.ranking)} | OVR {toInt(player.overall)}</PaperText>
                <PaperText style={styles.text}>Current training: {label}</PaperText>
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
              </CardBlock>
            );
          })}
          <Button
            label="Submit Training"
            onPress={() => setState((prev) => trainPlayers(prev, trainingChoices))}
            disabled={trainingEligible.length > 0 && trainingEligible.some((player) => trainingChoices[player.player_id] === undefined)}
          />
          <Button label="Back to Menu" variant="secondary" onPress={() => go("menu")} />
        </Section>
      )}

      {state.screen === "remove-player" && (
        <Section>
          <PaperText style={styles.h2}>Remove Player</PaperText>
          {state.userPlayers.length === 0 && <PaperText style={styles.text}>No players in roster.</PaperText>}
          {state.userPlayers.map((player) => (
            <PlayerCard
              key={player.player_id}
              player={player}
              action={<Button label="Remove Player" variant="danger" onPress={() => setState((prev) => removePlayer(prev, player.player_id))} />}
            />
          ))}
          <Button label="Back to Menu" variant="secondary" onPress={() => go("menu")} />
        </Section>
      )}

      {state.screen === "skip-ahead" && (
        <Section>
          <PaperText style={styles.h2}>Simulate Ahead</PaperText>
          <PaperText style={styles.text}>Current week: {state.week}</PaperText>
          <PaperText style={styles.text}>Selected week: {selectedWeek}</PaperText>
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
        </Section>
      )}

      {state.screen === "view-tournament-schedule" && (
        <Section>
          <View style={styles.topLeftAction}>
            <Button label="Back to Menu" variant="secondary" onPress={() => go("menu")} />
          </View>
          <PaperText style={styles.h2}>Tournament Schedule</PaperText>
          <PaperText style={styles.h3}>Senior (next 5 weeks)</PaperText>
          {schedule.senior.length === 0 && <PaperText style={styles.text}>No upcoming senior tournaments.</PaperText>}
          {schedule.senior.map((tournament) => (
            <CardBlock key={`${tournament.week}-${tournament.name}`} style={styles[`cardSurface_${tournament.surface}`]}>
              <PaperText style={styles.cardTitle}>Week {tournament.week}: {tournament.name}</PaperText>
              <PaperText style={styles.text}><CountryFlag countryName={tournament.country} /></PaperText>
              <PaperText style={styles.text}>Level: {formatTournamentLevel(tournament.level)}</PaperText>
              <PaperText style={styles.text}>Points {tournament.points} | Prize {formatMoney(tournament.prize_money)}</PaperText>
            </CardBlock>
          ))}

          <PaperText style={styles.h3}>Junior (next 10 weeks)</PaperText>
          {schedule.junior.length === 0 && <PaperText style={styles.text}>No upcoming junior tournaments.</PaperText>}
          {schedule.junior.map((tournament) => (
            <CardBlock key={`${tournament.week}-${tournament.name}`} style={styles[`cardSurface_${tournament.surface}`]}>
              <PaperText style={styles.cardTitle}>Week {tournament.week}: {tournament.name}</PaperText>
              <PaperText style={styles.text}><CountryFlag countryName={tournament.country} /></PaperText>
              <PaperText style={styles.text}>Level: {formatTournamentLevel(tournament.level)}</PaperText>
              <PaperText style={styles.text}>Points {tournament.points}</PaperText>
            </CardBlock>
          ))}
          <Button label="Back to Menu" variant="secondary" onPress={() => go("menu")} />
        </Section>
      )}

      {state.screen === "exhibition-match" && (
        <Section>
          <PaperText style={styles.h2}>Exhibition Match</PaperText>
          {exhibitionEligible.length < 2 ? (
            <PaperText style={styles.text}>Need at least 2 healthy players with 40+ energy.</PaperText>
          ) : (
            <>
              <PaperText style={styles.h3}>Select Players</PaperText>
              {exhibitionEligible.map((player) => {
                const selected = player.player_id === exhPlayer1 || player.player_id === exhPlayer2;
                const selectionSlot = player.player_id === exhPlayer1 ? "Selected P1" : player.player_id === exhPlayer2 ? "Selected P2" : null;
                return (
                  <TouchableRipple
                    key={player.player_id}
                    style={[styles.playerOption, selected && styles.playerOptionSelected]}
                    onPress={() => {
                      if (player.player_id === exhPlayer1) setExhPlayer1(null);
                      else if (player.player_id === exhPlayer2) setExhPlayer2(null);
                      else if (!exhPlayer1) setExhPlayer1(player.player_id);
                      else if (!exhPlayer2) setExhPlayer2(player.player_id);
                    }}
                  >
                    <View>
                      <View style={styles.playerOptionHeader}>
                        <PaperText style={styles.playerOptionTitle}>{player.name}</PaperText>
                        {selectionSlot ? (
                          <PaperText style={[styles.playerOptionBadge, styles.playerOptionBadgeSelected]}>{selectionSlot}</PaperText>
                        ) : null}
                      </View>
                      <PaperText style={styles.playerOptionText}>Energy {toInt(player.energy)} | Rank #{toInt(player.ranking)} | OVR {toInt(player.overall)}</PaperText>
                    </View>
                  </TouchableRipple>
                );
              })}

              <PaperText style={styles.h3}>Surface</PaperText>
              <View style={styles.rowButtons}>
                {(["hard", "clay", "grass"] as CourtSurface[]).map((surface) => (
                  <Button
                    key={surface}
                    label={surface.toUpperCase()}
                    variant={exhSurface === surface ? "primary" : "secondary"}
                    onPress={() => setExhSurface(surface)}
                  />
                ))}
              </View>

              <PaperText style={styles.h3}>Focus ({exhPlayer1 ? exhibitionEligible.find((p) => p.player_id === exhPlayer1)?.name : "Player 1"})</PaperText>
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

              <PaperText style={styles.h3}>Focus ({exhPlayer2 ? exhibitionEligible.find((p) => p.player_id === exhPlayer2)?.name : "Player 2"})</PaperText>
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

              {exhError && <PaperText style={styles.error}>{exhError}</PaperText>}
              {exhLines && (
                <CardBlock>
                  <PaperText style={styles.cardTitle}>Exhibition Results</PaperText>
                  {exhLines.map((line, index) => (
                    <PaperText key={`${line}-${index}`} style={styles.resultLine}>
                      {line}
                    </PaperText>
                  ))}
                </CardBlock>
              )}
            </>
          )}
          <Button label="Back to Menu" variant="secondary" onPress={() => go("menu")} />
        </Section>
      )}
      </ScrollView>
    </PaperProvider>
  );
}

