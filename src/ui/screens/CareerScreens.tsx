import React from "react";
import { View } from "react-native";
import { Text as PaperText, TextInput as PaperTextInput } from "react-native-paper";
import { RecruitTerritoryOption } from "../../data/recruiting";
import { InjuryAlert, Player, QuarterlyScenario } from "../../types/game";
import { Button, CardBlock, MiniStat, PlayerCard, Section } from "../AppPrimitives";
import { formatMoney, toInt } from "../appHelpers";
import { styles } from "../appStyles";

type LandingScreenProps = {
  username: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  onStart: () => void;
};

export const LandingScreen = ({ username, setUsername, onStart }: LandingScreenProps) => (
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
    <Button label="Start Your Journey" onPress={onStart} disabled={!username.trim()} />
  </Section>
);

type RecruitTerritoriesScreenProps = {
  territories: RecruitTerritoryOption[];
  cash: number;
  onSelectTerritory: (territoryId: number) => void;
  onMenu: () => void;
};

export const RecruitTerritoriesScreen = ({
  territories,
  cash,
  onSelectTerritory,
  onMenu,
}: RecruitTerritoriesScreenProps) => (
  <Section>
    <View style={styles.menuHeaderRow}>
      <PaperText style={styles.h2}>Select Territory to Scout</PaperText>
      <PaperText style={styles.menuCash}>Cash: {formatMoney(cash)}</PaperText>
    </View>
    {territories.map((territory) => (
      <Button
        key={territory.id}
        label={`${territory.name} (${territory.scoutCost === 0 ? "Free" : formatMoney(territory.scoutCost)})`}
        onPress={() => onSelectTerritory(territory.id)}
        disabled={cash < territory.scoutCost}
      />
    ))}
    <View style={styles.spacer} />
    <Button label="Menu" variant="secondary" onPress={onMenu} />
  </Section>
);

type RecruitOffersScreenProps = {
  recruits: Player[];
  onSelectRecruit: (playerId: number) => void;
  onSkipRecruits: () => void;
};

export const RecruitOffersScreen = ({
  recruits,
  onSelectRecruit,
  onSkipRecruits,
}: RecruitOffersScreenProps) => (
  <Section>
    <PaperText style={styles.h2}>Recruit Offers</PaperText>
    {recruits.length === 0 && <PaperText style={styles.text}>No recruits available.</PaperText>}
    {recruits.map((player) => (
      <PlayerCard
        key={player.player_id}
        player={player}
        inlineExtraStat={<MiniStat label="Injury Prone" value={`${Math.round(player.injury_prone * 100)}%`} />}
        action={<Button label="Select Recruit" onPress={() => onSelectRecruit(player.player_id)} />}
      />
    ))}
    <Button label="Skip Recruits" variant="secondary" onPress={onSkipRecruits} />
  </Section>
);

type InjuryAlertScreenProps = {
  injuryAlerts: InjuryAlert[];
  onContinue: () => void;
};

export const InjuryAlertScreen = ({ injuryAlerts, onContinue }: InjuryAlertScreenProps) => (
  <Section>
    <PaperText style={styles.h2}>Injury Alert</PaperText>
    {injuryAlerts.length === 0 ? (
      <PaperText style={styles.text}>No new injuries this week.</PaperText>
    ) : (
      injuryAlerts.map((alert, index) => (
        <CardBlock key={`${alert.player_id}-${index}`} style={styles.injuryAlertCard}>
          <PaperText style={styles.injuryAlertTitle}>
            {alert.reaggravated
              ? `${alert.player_name} re-aggravated their injury.`
              : `${alert.player_name} has been injured.`}
          </PaperText>
          <PaperText style={styles.injuryAlertText}>
            Out {alert.weeks_out} {alert.weeks_out === 1 ? "week" : "weeks"}
          </PaperText>
        </CardBlock>
      ))
    )}
    <Button label="Continue" onPress={onContinue} />
  </Section>
);

type MenuScreenProps = {
  cash: number;
  exhibitionAvailable: boolean;
  onAdvanceWeek: () => void;
  onViewSeniorPlayers: () => void;
  onViewJuniorPlayers: () => void;
  onViewSchedule: () => void;
  onExhibition: () => void;
  onSkipAhead: () => void;
  onRemovePlayer: () => void;
  onRetire: () => void;
};

export const MenuScreen = ({
  cash,
  exhibitionAvailable,
  onAdvanceWeek,
  onViewSeniorPlayers,
  onViewJuniorPlayers,
  onViewSchedule,
  onExhibition,
  onSkipAhead,
  onRemovePlayer,
  onRetire,
}: MenuScreenProps) => (
  <Section>
    <View style={styles.menuHeaderRow}>
      <PaperText style={styles.h2}>Menu</PaperText>
      <PaperText style={styles.menuCash}>Cash: {formatMoney(cash)}</PaperText>
    </View>
    <View style={styles.menuButtonStack}>
      <Button label="Advance Week" onPress={onAdvanceWeek} contentStyle={styles.menuButtonContent} />
      <Button label="View Senior Players" onPress={onViewSeniorPlayers} contentStyle={styles.menuButtonContent} />
      <Button label="View Junior Players" onPress={onViewJuniorPlayers} contentStyle={styles.menuButtonContent} />
      <Button label="Upcoming Tournaments" onPress={onViewSchedule} contentStyle={styles.menuButtonContent} />
      <Button
        label={exhibitionAvailable ? "Exhibition Match" : "Exhibition Match (Before Week 48)"}
        onPress={onExhibition}
        disabled={!exhibitionAvailable}
        contentStyle={styles.menuButtonContent}
      />
      <Button label="Skip Ahead" variant="gold" onPress={onSkipAhead} contentStyle={styles.menuButtonContent} />
      <Button label="Remove Player" variant="danger" onPress={onRemovePlayer} contentStyle={styles.menuButtonContent} />
      <Button label="Retire Agent" variant="danger" onPress={onRetire} contentStyle={styles.menuButtonContent} />
    </View>
  </Section>
);

type RetireAgentScreenProps = {
  onDelete: () => void;
  onBack: () => void;
};

export const RetireAgentScreen = ({ onDelete, onBack }: RetireAgentScreenProps) => (
  <Section>
    <PaperText style={styles.h2}>Retire Agent</PaperText>
    <CardBlock>
      <PaperText style={styles.text}>
        This action is permanent. Your current career progress will be deleted and your game will start over.
      </PaperText>
    </CardBlock>
    <Button label="Delete" variant="danger" onPress={onDelete} />
    <Button label="Back to Menu" variant="secondary" onPress={onBack} />
  </Section>
);

type QuarterlyScenarioScreenProps = {
  scenario: QuarterlyScenario;
  agentCash: number;
  year: number;
  onContinue: () => void;
  onAccept: () => void;
  onDecline: () => void;
};

export const QuarterlyScenarioScreen = ({
  scenario,
  agentCash,
  year,
  onContinue,
  onAccept,
  onDecline,
}: QuarterlyScenarioScreenProps) => {
  const { type } = scenario;

  if (type === "steroids_ban") {
    return (
      <Section>
        <PaperText style={styles.h2}>Drug Suspension</PaperText>
        <CardBlock style={styles.injuryAlertCard}>
          <PaperText style={styles.injuryAlertTitle}>
            {scenario.affected_player_name} has tested positive for banned substances.
          </PaperText>
          <PaperText style={styles.injuryAlertText}>
            Suspended for 12 months. They cannot compete during this period.
          </PaperText>
        </CardBlock>
        <Button label="Continue" onPress={onContinue} />
      </Section>
    );
  }

  if (type === "player_break") {
    return (
      <Section>
        <PaperText style={styles.h2}>Player Taking a Break</PaperText>
        <CardBlock>
          <PaperText style={styles.h3}>{scenario.affected_player_name}</PaperText>
          <PaperText style={styles.text}>
            Has decided to step away from tennis for {scenario.break_months} months to recharge.
            They will not be available to compete during this period.
          </PaperText>
        </CardBlock>
        <Button label="Continue" onPress={onContinue} />
      </Section>
    );
  }

  if (type === "potential_boost") {
    return (
      <Section>
        <PaperText style={styles.h2}>Renewed Commitment</PaperText>
        <CardBlock>
          <PaperText style={styles.h3}>{scenario.affected_player_name}</PaperText>
          <PaperText style={styles.text}>
            Has fully recommitted to training with renewed determination! Their potential ceiling has increased by {scenario.potential_change} points.
          </PaperText>
          {scenario.new_potential_letter && (
            <PaperText style={styles.text}>New potential: {scenario.new_potential_letter}</PaperText>
          )}
        </CardBlock>
        <Button label="Continue" onPress={onContinue} />
      </Section>
    );
  }

  if (type === "potential_decline") {
    return (
      <Section>
        <PaperText style={styles.h2}>Motivation Concerns</PaperText>
        <CardBlock>
          <PaperText style={styles.h3}>{scenario.affected_player_name}</PaperText>
          <PaperText style={styles.text}>
            Seems to have lost their passion for the game and is going through the motions. Their potential ceiling has declined by {Math.abs(scenario.potential_change ?? 0)} points.
          </PaperText>
          {scenario.new_potential_letter && (
            <PaperText style={styles.text}>New potential: {scenario.new_potential_letter}</PaperText>
          )}
        </CardBlock>
        <Button label="Continue" onPress={onContinue} />
      </Section>
    );
  }

  if (type === "endorsement_offer" && scenario.endorsement_offer) {
    const offer = scenario.endorsement_offer;
    const canAfford = true;
    return (
      <Section>
        <PaperText style={styles.h2}>Endorsement Offer</PaperText>
        <CardBlock>
          <PaperText style={styles.h3}>{offer.player_name}</PaperText>
          <PaperText style={styles.text}>
            Has received a sponsorship offer from {offer.brand}.
          </PaperText>
          <View style={styles.rowWrap}>
            <MiniStat label="Total Value" value={formatMoney(offer.total_value)} />
            <MiniStat label="Duration" value={`${offer.years} yr${offer.years > 1 ? "s" : ""}`} />
            <MiniStat label="Your Cut" value={formatMoney(offer.agent_cut)} />
          </View>
          <PaperText style={styles.textMuted}>
            Agent commission paid upfront upon acceptance.
          </PaperText>
        </CardBlock>
        <Button label={`Accept — Earn ${formatMoney(offer.agent_cut)}`} onPress={onAccept} />
        <Button label="Decline" variant="secondary" onPress={onDecline} />
      </Section>
    );
  }

  if ((type === "star_vet" || type === "superstar_youngster") && scenario.recruit_offer) {
    const recruit = scenario.recruit_offer;
    const cost = scenario.recruit_cost ?? 0;
    const canAfford = agentCash >= cost;
    const title = type === "star_vet" ? "Star Veteran Available" : "Superstar Youngster Discovered";
    const description =
      type === "star_vet"
        ? `${recruit.name} is an experienced pro seeking new representation.`
        : `Scouts have identified an extraordinary junior talent: ${recruit.name}, age ${recruit.age}.`;
    return (
      <Section>
        <PaperText style={styles.h2}>{title}</PaperText>
        <PaperText style={styles.text}>{description}</PaperText>
        <PlayerCard player={recruit} />
        <CardBlock>
          <PaperText style={styles.text}>
            Signing fee: {formatMoney(cost)}
          </PaperText>
          <PaperText style={styles.menuCash}>Cash: {formatMoney(agentCash)}</PaperText>
          {!canAfford && (
            <PaperText style={styles.error}>Insufficient funds to sign this player.</PaperText>
          )}
        </CardBlock>
        <Button label={`Sign — ${formatMoney(cost)}`} onPress={onAccept} disabled={!canAfford} />
        <Button label="Pass" variant="secondary" onPress={onDecline} />
      </Section>
    );
  }

  return (
    <Section>
      <PaperText style={styles.h2}>Quarterly Event</PaperText>
      <Button label="Continue" onPress={onContinue} />
    </Section>
  );
};

type SkipAheadScreenProps = {
  currentWeek: number;
  selectedWeek: number;
  setSelectedWeek: React.Dispatch<React.SetStateAction<number>>;
  onSimToSelectedWeek: () => void;
  onSimToNextYear: () => void;
  onBack: () => void;
};

export const SkipAheadScreen = ({
  currentWeek,
  selectedWeek,
  setSelectedWeek,
  onSimToSelectedWeek,
  onSimToNextYear,
  onBack,
}: SkipAheadScreenProps) => (
  <Section>
    <PaperText style={styles.h2}>Simulate Ahead</PaperText>
    <PaperText style={styles.text}>Current week: {currentWeek}</PaperText>
    <PaperText style={styles.text}>Selected week: {selectedWeek}</PaperText>
    <View style={styles.rowButtons}>
      <Button
        label="-1 Week"
        variant="secondary"
        onPress={() => setSelectedWeek((prev) => Math.max(currentWeek + 1, prev - 1))}
        disabled={selectedWeek <= currentWeek + 1}
      />
      <Button
        label="+1 Week"
        variant="secondary"
        onPress={() => setSelectedWeek((prev) => Math.min(52, prev + 1))}
        disabled={selectedWeek >= 52}
      />
    </View>
    <Button label="Sim to Selected Week" onPress={onSimToSelectedWeek} />
    <Button label="Sim to Next Year" variant="gold" onPress={onSimToNextYear} />
    <Button label="Back to Menu" variant="secondary" onPress={onBack} />
  </Section>
);
