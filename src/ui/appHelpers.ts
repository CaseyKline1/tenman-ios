import { MD3LightTheme } from "react-native-paper";

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

export type PlayerListScreen = "view-senior-players" | "view-junior-players";

export const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

export const toInt = (value: number) => Math.round(value);

export const formatTournamentLevel = (level: string) =>
  TOURNAMENT_LEVEL_LABELS[level] ??
  level
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const isMajorTournament = (name: string): boolean =>
  MAJOR_TOURNAMENTS.includes(name) || MASTERS_TOURNAMENTS.includes(name);

export const isSlamOrJuniorSlam = (name: string): boolean =>
  MAJOR_TOURNAMENTS.includes(name) || (name.includes("Junior") && MAJOR_TOURNAMENTS.some((major) => name.includes(major)));

export const sortByTopFinish = (a: [string, number], b: [string, number]): number =>
  a[1] - b[1] || a[0].localeCompare(b[0]);

export const sortByWinsDesc = (a: [string, number], b: [string, number]): number =>
  b[1] - a[1] || a[0].localeCompare(b[0]);

export const sortByName = <T,>(a: [string, T], b: [string, T]): number =>
  a[0].localeCompare(b[0]);

export const formatTopFinish = (top: number): string => {
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

export const formatYears = (years: number[]): string => [...years]
  .map((year) => toInt(year))
  .sort((a, b) => a - b)
  .join(", ");

export const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    background: "#e9eef5",
    surface: "#f5f8fc",
    primary: "#111827",
    onPrimary: "#ffffff",
    secondaryContainer: "#f3f4f6",
    onSecondaryContainer: "#111827",
    error: "#ef4444",
    onError: "#ffffff",
    outline: "#cfd8e3",
  },
};
