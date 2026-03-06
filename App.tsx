import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import {
  ActivityIndicator as PaperActivityIndicator,
  Provider as PaperProvider,
  Text as PaperText,
} from "react-native-paper";
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
import { GameState, ScreenKey, TournamentWithPlayers } from "./src/types/game";
import { PlayerListScreen, paperTheme } from "./src/ui/appHelpers";
import { useExhibitionSetup } from "./src/ui/hooks/useExhibitionSetup";
import { useScreenLocalState } from "./src/ui/hooks/useScreenLocalState";
import { useTournamentSelection } from "./src/ui/hooks/useTournamentSelection";
import {
  InjuryAlertScreen,
  LandingScreen,
  MenuScreen,
  RecruitOffersScreen,
  RecruitTerritoriesScreen,
  RetireAgentScreen,
  SkipAheadScreen,
} from "./src/ui/screens/CareerScreens";
import {
  JuniorPlayersScreen,
  PlayerDetailsScreen,
  RemovePlayerScreen,
  SeniorPlayersScreen,
  TrainingScreen,
} from "./src/ui/screens/PlayerScreens";
import {
  ChooseTournamentScreen,
  ExhibitionMatchScreen,
  TournamentResultsScreen,
  TournamentScheduleScreen,
} from "./src/ui/screens/TournamentScreens";
import { styles } from "./src/ui/appStyles";

export default function App() {
  const [state, setState] = useState<GameState>(createInitialState());
  const [booting, setBooting] = useState(true);
  const [username, setUsername] = useState("");
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

  const { selectedByTournament, toggleTournamentPlayer } = useTournamentSelection(state.screen, availableTournaments);
  const {
    resultIndex,
    trainingChoices,
    selectedWeek,
    setResultIndex,
    setTrainingChoices,
    setSelectedWeek,
  } = useScreenLocalState(state.screen, state.week);
  const {
    exhPlayer1,
    exhPlayer2,
    exhSurface,
    exhFocus1,
    exhFocus2,
    exhLines,
    exhError,
    setExhPlayer1,
    setExhPlayer2,
    setExhSurface,
    setExhFocus1,
    setExhFocus2,
    setExhLines,
    setExhError,
  } = useExhibitionSetup(state.screen, state.week);

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
    }
  }, [state.screen, availableTournaments]);

  const go = (screen: ScreenKey) => setState((prev) => ({ ...prev, screen }));

  const openPlayerDetails = (playerId: number, backScreen: PlayerListScreen) => {
    setDetailPlayerId(playerId);
    setDetailBackScreen(backScreen);
    go("view-player-details");
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

  const renderScreen = () => {
    switch (state.screen) {
      case "landing":
        return (
          <LandingScreen
            username={username}
            setUsername={setUsername}
            onStart={() => {
              const trimmed = username.trim();
              if (!trimmed) return;
              setState(startNewGame(trimmed));
            }}
            onClearSave={async () => {
              await clearGameState();
              setState(createInitialState());
              setUsername("");
            }}
          />
        );
      case "recruit-territories":
        return (
          <RecruitTerritoriesScreen
            territoryNames={territoryNames}
            onSelectTerritory={(territoryIndex) => setState((prev) => seeRecruits(prev, territoryIndex))}
            onMenu={() => go("menu")}
          />
        );
      case "offer-recruits":
        return (
          <RecruitOffersScreen
            recruits={state.offerRecruits}
            onSelectRecruit={(playerId) => setState((prev) => addRecruit(prev, playerId))}
            onSkipRecruits={() => setState((prev) => skipRecruits(prev))}
          />
        );
      case "choose-tournament":
        return (
          <ChooseTournamentScreen
            availableTournaments={availableTournaments}
            selectedByTournament={selectedByTournament}
            toggleTournamentPlayer={toggleTournamentPlayer}
            onEnterSelected={() => setState((prev) => enterTournaments(prev, selectedByTournament))}
            onSkip={() => go("menu")}
          />
        );
      case "tournament-results":
        return (
          <TournamentResultsScreen
            results={state.lastTournamentResults}
            resultIndex={resultIndex}
            onNextTournament={() => setResultIndex((prev) => prev + 1)}
            onFinish={() => go("menu")}
          />
        );
      case "injury-alert":
        return (
          <InjuryAlertScreen
            injuryAlerts={state.injuryAlerts ?? []}
            onContinue={() => setState((prev) => dismissInjuryAlerts(prev))}
          />
        );
      case "menu":
        return (
          <MenuScreen
            cash={state.agent_earnings}
            exhibitionAvailable={canRunExhibition(state)}
            onAdvanceWeek={() => setState((prev) => advanceWeek(prev))}
            onViewSeniorPlayers={() => go("view-senior-players")}
            onViewJuniorPlayers={() => go("view-junior-players")}
            onViewSchedule={() => go("view-tournament-schedule")}
            onExhibition={() => go("exhibition-match")}
            onSkipAhead={() => go("skip-ahead")}
            onRemovePlayer={() => go("remove-player")}
            onRetire={() => go("retire-agent")}
          />
        );
      case "retire-agent":
        return (
          <RetireAgentScreen
            onDelete={async () => {
              await clearGameState();
              setState(createInitialState());
              setUsername("");
            }}
            onBack={() => go("menu")}
          />
        );
      case "view-senior-players":
        return (
          <SeniorPlayersScreen
            seniorPlayers={seniorPlayers}
            openPlayerDetails={(playerId) => openPlayerDetails(playerId, "view-senior-players")}
            onBack={() => go("menu")}
          />
        );
      case "view-junior-players":
        return (
          <JuniorPlayersScreen
            juniorPlayers={juniorPlayers}
            openPlayerDetails={(playerId) => openPlayerDetails(playerId, "view-junior-players")}
            onPromoteJunior={(playerId) => setState((prev) => promoteJunior(prev, playerId))}
            onBack={() => go("menu")}
          />
        );
      case "view-player-details":
        return (
          <PlayerDetailsScreen
            detailPlayer={detailPlayer}
            year={state.year}
            onBack={() => go(detailBackScreen)}
          />
        );
      case "training":
        return (
          <TrainingScreen
            trainingEligible={trainingEligible}
            trainingChoices={trainingChoices}
            trainingOptions={trainingOptions}
            setTrainingChoices={setTrainingChoices}
            onSubmitTraining={() => setState((prev) => trainPlayers(prev, trainingChoices))}
            onBack={() => go("menu")}
          />
        );
      case "remove-player":
        return (
          <RemovePlayerScreen
            players={state.userPlayers}
            onRemovePlayer={(playerId) => setState((prev) => removePlayer(prev, playerId))}
            onBack={() => go("menu")}
          />
        );
      case "skip-ahead":
        return (
          <SkipAheadScreen
            currentWeek={state.week}
            selectedWeek={selectedWeek}
            setSelectedWeek={setSelectedWeek}
            onSimToSelectedWeek={() => setState((prev) => skipToWeek(prev, selectedWeek))}
            onSimToNextYear={() => setState((prev) => skipToNextYear(prev))}
            onBack={() => go("menu")}
          />
        );
      case "view-tournament-schedule":
        return (
          <TournamentScheduleScreen
            schedule={schedule}
            onBack={() => go("menu")}
          />
        );
      case "exhibition-match":
        return (
          <ExhibitionMatchScreen
            exhibitionEligible={exhibitionEligible}
            exhPlayer1={exhPlayer1}
            exhPlayer2={exhPlayer2}
            exhSurface={exhSurface}
            exhFocus1={exhFocus1}
            exhFocus2={exhFocus2}
            exhLines={exhLines}
            exhError={exhError}
            exhibitionFocuses={exhibitionFocuses}
            setExhPlayer1={setExhPlayer1}
            setExhPlayer2={setExhPlayer2}
            setExhSurface={setExhSurface}
            setExhFocus1={setExhFocus1}
            setExhFocus2={setExhFocus2}
            setExhLines={setExhLines}
            setExhError={setExhError}
            onPlayMatch={() => {
              if (!exhPlayer1 || !exhPlayer2) {
                return { lines: [], error: "Please select two different players." };
              }
              const result = playExhibitionMatch(state, exhPlayer1, exhPlayer2, exhSurface, exhFocus1, exhFocus2);
              setState(result.state);
              return { lines: result.lines, error: result.error };
            }}
            onBack={() => go("menu")}
          />
        );
      default:
        return null;
    }
  };

  return (
    <PaperProvider theme={paperTheme}>
      <ScrollView style={styles.app} contentContainerStyle={styles.container}>
        <PaperText style={styles.subtitle}>{getWeeklyHeader(state)}</PaperText>
        {renderScreen()}
      </ScrollView>
    </PaperProvider>
  );
}
