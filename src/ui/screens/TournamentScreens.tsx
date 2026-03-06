import React from "react";
import { View } from "react-native";
import { Text as PaperText, TouchableRipple } from "react-native-paper";
import { ExhibitionFocus, QUALIFICATION_LABELS } from "../../data/recruiting";
import { Player, PlayerTournamentEligibility, ScheduleTournament, Surface, TournamentResult, TournamentWithPlayers } from "../../types/game";
import { Button, CardBlock, Section } from "../AppPrimitives";
import { formatMoney, formatTournamentLevel, toInt } from "../appHelpers";
import { styles } from "../appStyles";
import { CountryFlag } from "../../components/CountryFlag";

type ChooseTournamentScreenProps = {
  availableTournaments: TournamentWithPlayers[];
  selectedByTournament: Record<string, number[]>;
  toggleTournamentPlayer: (tournamentName: string, player: PlayerTournamentEligibility) => void;
  onEnterSelected: () => void;
  onSkip: () => void;
};

export const ChooseTournamentScreen = ({
  availableTournaments,
  selectedByTournament,
  toggleTournamentPlayer,
  onEnterSelected,
  onSkip,
}: ChooseTournamentScreenProps) => (
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
                style={[
                  styles.playerOption,
                  selected && styles.playerOptionSelected,
                  player.qualify_tourney === 0 && styles.playerOptionDisabled,
                ]}
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
                  <PaperText style={styles.playerOptionText}>
                    Rank #{toInt(player.ranking)} | OVR {toInt(player.overall)} | Energy {toInt(player.energy)}
                  </PaperText>
                  <PaperText style={styles.playerOptionText}>
                    Qualification: {QUALIFICATION_LABELS[player.qualify_tourney] ?? "Unknown"}
                  </PaperText>
                </View>
              </TouchableRipple>
            );
          })
        )}
      </CardBlock>
    ))}

    <Button label="Enter Selected Tournaments" onPress={onEnterSelected} />
    <Button label="Skip" variant="secondary" onPress={onSkip} />
  </Section>
);

type TournamentResultsScreenProps = {
  results: TournamentResult[];
  resultIndex: number;
  onNextTournament: () => void;
  onFinish: () => void;
};

export const TournamentResultsScreen = ({
  results,
  resultIndex,
  onNextTournament,
  onFinish,
}: TournamentResultsScreenProps) => {
  const isLast = resultIndex >= results.length - 1;

  return (
    <Section>
      <PaperText style={styles.h2}>Tournament Results</PaperText>
      {results.length === 0 ? (
        <PaperText style={styles.text}>No results to display.</PaperText>
      ) : (
        <CardBlock>
          <PaperText style={styles.cardTitle}>{results[resultIndex]?.tournamentName}</PaperText>
          {results[resultIndex]?.lines.map((line, idx) => (
            <PaperText key={`${idx}-${line}`} style={styles.resultLine}>
              {line}
            </PaperText>
          ))}
        </CardBlock>
      )}
      <Button
        label={isLast ? "Finish" : "Next Tournament"}
        onPress={() => {
          if (isLast) onFinish();
          else onNextTournament();
        }}
      />
    </Section>
  );
};

type TournamentScheduleScreenProps = {
  schedule: { senior: ScheduleTournament[]; junior: ScheduleTournament[] };
  onBack: () => void;
};

export const TournamentScheduleScreen = ({ schedule, onBack }: TournamentScheduleScreenProps) => (
  <Section>
    <View style={styles.topLeftAction}>
      <Button label="Back to Menu" variant="secondary" onPress={onBack} />
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
    <Button label="Back to Menu" variant="secondary" onPress={onBack} />
  </Section>
);

type ExhibitionMatchScreenProps = {
  exhibitionEligible: Player[];
  exhPlayer1: number | null;
  exhPlayer2: number | null;
  exhSurface: Surface;
  exhFocus1: ExhibitionFocus;
  exhFocus2: ExhibitionFocus;
  exhLines: string[] | null;
  exhError: string | null;
  exhibitionFocuses: ReadonlyArray<ExhibitionFocus>;
  setExhPlayer1: React.Dispatch<React.SetStateAction<number | null>>;
  setExhPlayer2: React.Dispatch<React.SetStateAction<number | null>>;
  setExhSurface: React.Dispatch<React.SetStateAction<Surface>>;
  setExhFocus1: React.Dispatch<React.SetStateAction<ExhibitionFocus>>;
  setExhFocus2: React.Dispatch<React.SetStateAction<ExhibitionFocus>>;
  setExhLines: React.Dispatch<React.SetStateAction<string[] | null>>;
  setExhError: React.Dispatch<React.SetStateAction<string | null>>;
  onPlayMatch: () => { lines: string[]; error?: string };
  onBack: () => void;
};

export const ExhibitionMatchScreen = ({
  exhibitionEligible,
  exhPlayer1,
  exhPlayer2,
  exhSurface,
  exhFocus1,
  exhFocus2,
  exhLines,
  exhError,
  exhibitionFocuses,
  setExhPlayer1,
  setExhPlayer2,
  setExhSurface,
  setExhFocus1,
  setExhFocus2,
  setExhLines,
  setExhError,
  onPlayMatch,
  onBack,
}: ExhibitionMatchScreenProps) => (
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
                <PaperText style={styles.playerOptionText}>
                  Energy {toInt(player.energy)} | Rank #{toInt(player.ranking)} | OVR {toInt(player.overall)}
                </PaperText>
              </View>
            </TouchableRipple>
          );
        })}

        <PaperText style={styles.h3}>Surface</PaperText>
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
            const result = onPlayMatch();
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
    <Button label="Back to Menu" variant="secondary" onPress={onBack} />
  </Section>
);
