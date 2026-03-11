import React from "react";
import { StyleProp, TextStyle, View, ViewStyle } from "react-native";
import {
  Button as PaperButton,
  Surface,
  Text as PaperText,
} from "react-native-paper";
import { CountryFlag } from "../components/CountryFlag";
import { Player, Surface as CourtSurface } from "../types/game";
import { toInt } from "./appHelpers";
import { styles } from "./appStyles";

type ButtonVariant = "primary" | "secondary" | "danger" | "gold";

const buttonConfig: Record<
  ButtonVariant,
  {
    mode: "contained" | "contained-tonal" | "outlined";
    buttonColor?: string;
    textColor?: string;
  }
> = {
  primary: { mode: "contained" },
  secondary: { mode: "contained-tonal" },
  danger: { mode: "contained", buttonColor: "#ef4444", textColor: "#ffffff" },
  gold: { mode: "contained", buttonColor: "#fbbf24", textColor: "#111827" },
};

export const Button = ({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  compact = false,
  style,
  contentStyle,
  labelStyle,
}: {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}) => {
  const config = buttonConfig[variant];
  return (
    <PaperButton
      mode={config.mode}
      buttonColor={config.buttonColor}
      textColor={config.textColor}
      onPress={onPress}
      disabled={disabled}
      compact={compact}
      style={[styles.button, style]}
      contentStyle={[styles.buttonContent, contentStyle]}
      labelStyle={[styles.buttonText, labelStyle]}
    >
      {label}
    </PaperButton>
  );
};

export const Section = ({ children }: { children: React.ReactNode }) => (
  <Surface style={styles.section} elevation={1}>
    {children}
  </Surface>
);

export const CardBlock = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) => (
  <Surface style={[styles.card, style]} elevation={1}>
    {children}
  </Surface>
);

export const MiniStat = ({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | CourtSurface;
}) => (
  <Surface style={[styles.miniStat, tone !== "default" && styles[`miniStat_${tone}`]]} elevation={0}>
    <PaperText style={[styles.miniStatLabel, tone !== "default" && styles[`miniStatLabel_${tone}`]]}>{label}</PaperText>
    <PaperText style={[styles.miniStatValue, tone !== "default" && styles[`miniStatValue_${tone}`]]}>{value}</PaperText>
  </Surface>
);

export const DetailStatRow = ({
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
    <PaperText
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
    </PaperText>
    <PaperText
      style={[styles.detailRowValue, compact && styles.detailSubRowValue]}
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={0.75}
    >
      {value}
    </PaperText>
  </View>
);

export const PlayerCard = ({
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
  <CardBlock>
    <PaperText style={styles.cardTitle}>
      <CountryFlag countryName={player.nationality} showName={false} /> {player.name}
    </PaperText>
    {player.injury_weeks > 0 && (
      <View style={styles.injuryBanner}>
        <PaperText style={styles.injuryBannerText}>
          Injured: out {player.injury_weeks} {player.injury_weeks === 1 ? "week" : "weeks"}
        </PaperText>
      </View>
    )}
    <View style={styles.rowWrap}>
      <MiniStat label="Rank" value={`#${toInt(player.ranking)}`} />
      {inlineExtraStat}
      <MiniStat label="Age" value={player.age} />
      <MiniStat label="Overall" value={toInt(player.overall)} />
      <MiniStat label="Potential" value={player.potential_letter} />
      <MiniStat label="Share" value={`${player.earnings_share}%`} />
      <MiniStat label="Energy" value={toInt(player.energy)} />
      <MiniStat label="Serve" value={toInt(player.serve)} />
      <MiniStat label="Hard" value={toInt(player.court_proficiencies.hard)} tone="hard" />
      <MiniStat label="Clay" value={toInt(player.court_proficiencies.clay)} tone="clay" />
      <MiniStat label="Grass" value={toInt(player.court_proficiencies.grass)} tone="grass" />
      <MiniStat label="Stamina" value={toInt(player.stamina)} />
      <MiniStat label="Clutch" value={toInt(player.big_moments)} />
    </View>
    {extra}
    {action}
  </CardBlock>
);
