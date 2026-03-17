import React from "react";
import { View } from "react-native";
import { Text as PaperText } from "react-native-paper";
import { Player } from "../../types/game";
import { Button, CardBlock, DetailStatRow, MiniStat, PlayerCard, Section } from "../AppPrimitives";
import {
  formatMoney,
  formatTopFinish,
  formatYears,
  isMajorTournament,
  isSlamOrJuniorSlam,
  sortByName,
  sortByTopFinish,
  sortByWinsDesc,
  toInt,
} from "../appHelpers";
import { styles } from "../appStyles";
import { CountryFlag } from "../../components/CountryFlag";

type SeniorPlayersScreenProps = {
  seniorPlayers: Player[];
  openPlayerDetails: (playerId: number) => void;
  onBack: () => void;
};

export const SeniorPlayersScreen = ({ seniorPlayers, openPlayerDetails, onBack }: SeniorPlayersScreenProps) => (
  <Section>
    <PaperText style={styles.h2}>Senior Players</PaperText>
    {seniorPlayers.length === 0 && <PaperText style={styles.text}>No senior players.</PaperText>}
    {seniorPlayers.map((player) => (
      <PlayerCard
        key={player.player_id}
        player={player}
        inlineExtraStat={<MiniStat label="Slams" value={player.grand_slam_wins} />}
        extra={(
          <View style={styles.rowWrap}>
            <MiniStat label="Points" value={toInt(player.points)} />
            <MiniStat label="Season" value={`${player.season_record.wins}-${player.season_record.losses}`} />
            <MiniStat label="Career" value={`${player.career_record.wins}-${player.career_record.losses}`} />
            <MiniStat label="Titles" value={player.tournament_wins} />
            <MiniStat label="Earnings" value={formatMoney(player.career_earnings)} />
          </View>
        )}
        action={<Button label="More Info" variant="secondary" onPress={() => openPlayerDetails(player.player_id)} />}
      />
    ))}
    <Button label="Back to Menu" variant="secondary" onPress={onBack} />
  </Section>
);

type JuniorPlayersScreenProps = {
  juniorPlayers: Player[];
  openPlayerDetails: (playerId: number) => void;
  onPromoteJunior: (playerId: number) => void;
  onBack: () => void;
};

export const JuniorPlayersScreen = ({
  juniorPlayers,
  openPlayerDetails,
  onPromoteJunior,
  onBack,
}: JuniorPlayersScreenProps) => (
  <Section>
    <PaperText style={styles.h2}>Junior Players</PaperText>
    {juniorPlayers.length === 0 && <PaperText style={styles.text}>No junior players.</PaperText>}
    {juniorPlayers.map((player) => (
      <PlayerCard
        key={player.player_id}
        player={player}
        extra={(
          <View style={styles.rowWrap}>
            <MiniStat label="Junior Points" value={toInt(player.junior_points)} />
            <MiniStat label="Best JR Rank" value={`#${toInt(player.best_junior_ranking)}`} />
          </View>
        )}
        action={(
          <View style={styles.detailActions}>
            <Button
              label="More Info"
              variant="secondary"
              onPress={() => openPlayerDetails(player.player_id)}
            />
            <Button label="Turn Pro" onPress={() => onPromoteJunior(player.player_id)} />
          </View>
        )}
      />
    ))}
    <Button label="Back to Menu" variant="secondary" onPress={onBack} />
  </Section>
);

type PlayerDetailsScreenProps = {
  detailPlayer: Player | null;
  year: number;
  onBack: () => void;
};

export const PlayerDetailsScreen = ({ detailPlayer, year, onBack }: PlayerDetailsScreenProps) => (
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
                <MiniStat
                  label={detailPlayer.junior ? "JR Points" : "Points"}
                  value={toInt(detailPlayer.junior ? detailPlayer.junior_points : detailPlayer.points)}
                />
                <MiniStat label="Titles" value={detailPlayer.tournament_wins} />
                <MiniStat label="Slams" value={detailPlayer.grand_slam_wins} />
                <MiniStat label="Best Rank" value={`#${toInt(detailPlayer.best_ranking)}`} />
                <MiniStat label="Best JR Rank" value={`#${toInt(detailPlayer.best_junior_ranking)}`} />
                <MiniStat label="Weeks #1" value={detailPlayer.weeks_ranked_1} />
              </View>
            </CardBlock>

            {detailPlayer.endorsement && (
              <CardBlock>
                <PaperText style={styles.detailSectionHeader}>Endorsement Deal</PaperText>
                <DetailStatRow label="Brand" value={detailPlayer.endorsement.brand} />
                <DetailStatRow label="Total Value" value={formatMoney(detailPlayer.endorsement.total_value)} />
                <DetailStatRow label="Deal Length" value={`${detailPlayer.endorsement.years} ${detailPlayer.endorsement.years === 1 ? "year" : "years"}`} />
                <DetailStatRow label="Ends After" value={String(detailPlayer.endorsement.end_year)} />
                <DetailStatRow label="Agent Cut" value={formatMoney(detailPlayer.endorsement.agent_cut)} />
              </CardBlock>
            )}

            <CardBlock>
              <PaperText style={styles.detailSectionHeader}>Results This Year ({year})</PaperText>
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
              <PaperText style={styles.detailSectionHeader}>Results Last Year ({year - 1})</PaperText>
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
    <Button label="Back" variant="secondary" onPress={onBack} />
  </Section>
);

type TrainingScreenProps = {
  trainingEligible: Player[];
  trainingChoices: Record<number, number>;
  trainingOptions: string[];
  setTrainingChoices: React.Dispatch<React.SetStateAction<Record<number, number>>>;
  onSubmitTraining: () => void;
  onBack: () => void;
};

const getTrainingCurrentRating = (player: Player, optionIndex: number): number => {
  if (optionIndex === 0) return player.overall;
  if (optionIndex === 1) return player.serve;
  if (optionIndex === 2) return player.stamina;
  if (optionIndex === 3) return player.big_moments;
  if (optionIndex === 4) return player.court_proficiencies.hard;
  if (optionIndex === 5) return player.court_proficiencies.clay;
  return player.court_proficiencies.grass;
};

const getTrainingOptionLabel = (option: string, optionIndex: number): string => {
  if (optionIndex === 4) return "Hard";
  if (optionIndex === 5) return "Clay";
  if (optionIndex === 6) return "Grass";
  return option;
};

export const TrainingScreen = ({
  trainingEligible,
  trainingChoices,
  trainingOptions,
  setTrainingChoices,
  onSubmitTraining,
  onBack,
}: TrainingScreenProps) => (
  <Section>
    <PaperText style={styles.h2}>Offseason Training</PaperText>
    {trainingEligible.length === 0 && <PaperText style={styles.text}>No players are eligible for training this offseason.</PaperText>}
    {trainingEligible.map((player) => {
      const currentChoice = trainingChoices[player.player_id];
      const label = currentChoice === undefined
        ? "Choose training"
        : `${getTrainingOptionLabel(trainingOptions[currentChoice], currentChoice)} (${toInt(getTrainingCurrentRating(player, currentChoice))})`;
      return (
        <CardBlock key={player.player_id}>
          <PaperText style={styles.cardTitle}>{player.name}</PaperText>
          <PaperText style={styles.text}>
            Age {player.age} | Rank #{toInt(player.ranking)} | OVR {toInt(player.overall)} | POT {player.potential_letter}
          </PaperText>
          <PaperText style={styles.text}>Current training: {label}</PaperText>
          <View style={styles.rowButtons}>
            {trainingOptions.map((option, optionIndex) => (
              <Button
                key={`${player.player_id}-${option}`}
                label={`${getTrainingOptionLabel(option, optionIndex)} (${toInt(getTrainingCurrentRating(player, optionIndex))})`}
                variant={currentChoice === optionIndex ? "primary" : "secondary"}
                compact
                contentStyle={styles.trainingButtonContent}
                labelStyle={styles.trainingButtonText}
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
      onPress={onSubmitTraining}
      disabled={trainingEligible.length > 0 && trainingEligible.some((player) => trainingChoices[player.player_id] === undefined)}
    />
    {trainingEligible.length === 0 && <Button label="Back to Menu" variant="secondary" onPress={onBack} />}
  </Section>
);

type RemovePlayerScreenProps = {
  players: Player[];
  onRemovePlayer: (playerId: number) => void;
  onBack: () => void;
};

export const RemovePlayerScreen = ({ players, onRemovePlayer, onBack }: RemovePlayerScreenProps) => (
  <Section>
    <PaperText style={styles.h2}>Remove Player</PaperText>
    {players.length === 0 && <PaperText style={styles.text}>No players in roster.</PaperText>}
    {players.map((player) => (
      <PlayerCard
        key={player.player_id}
        player={player}
        action={<Button label="Remove Player" variant="danger" onPress={() => onRemovePlayer(player.player_id)} />}
      />
    ))}
    <Button label="Back to Menu" variant="secondary" onPress={onBack} />
  </Section>
);
