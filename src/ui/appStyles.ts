import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#e9eef5",
  },
  app: {
    flex: 1,
    backgroundColor: "#e9eef5",
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
    backgroundColor: "#e9eef5",
    gap: 12,
  },
  loadingText: {
    color: "#111111",
    fontSize: 16,
  },
  subtitle: {
    color: "#111111",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 6,
  },
  appTitle: {
    color: "#0f172a",
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
  },
  appTagline: {
    color: "#475569",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  section: {
    gap: 10,
    backgroundColor: "#f5f8fc",
    borderColor: "#cdd8e6",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  h2: {
    color: "#000000",
    fontSize: 22,
    fontWeight: "700",
  },
  menuHeaderRow: {
    alignItems: "baseline",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-between",
  },
  menuCash: {
    color: "#111111",
    fontSize: 16,
    fontWeight: "600",
  },
  menuButtonStack: {
    gap: 12,
  },
  menuButtonContent: {
    paddingVertical: 7,
  },
  h3: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 4,
  },
  text: {
    color: "#000000",
    fontSize: 14,
  },
  textMuted: {
    color: "#4b5563",
    fontSize: 13,
  },
  input: {
    backgroundColor: "#ffffff",
  },
  sectionIntro: {
    gap: 4,
  },
  spacer: {
    height: 4,
  },
  rowButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tournamentHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  tournamentHeaderLocation: {
    textAlign: "right",
    flexShrink: 1,
    fontSize: 14,
  },
  tournamentMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  tournamentMetaRight: {
    textAlign: "right",
    flexShrink: 1,
  },
  detailActions: {
    gap: 8,
  },
  topLeftAction: {
    alignSelf: "flex-start",
  },
  button: {
    alignSelf: "stretch",
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 2,
  },
  buttonText: {
    fontWeight: "700",
    fontSize: 14,
  },
  trainingButtonContent: {
    paddingVertical: 0,
    paddingHorizontal: 6,
  },
  trainingButtonText: {
    fontSize: 12,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#cfd8e3",
    padding: 10,
    gap: 6,
  },
  cardSurface_hard: {
    borderColor: "#1d4ed8",
    backgroundColor: "#bfdbfe",
  },
  cardSurface_clay: {
    borderColor: "#b91c1c",
    backgroundColor: "#fecaca",
  },
  cardSurface_grass: {
    borderColor: "#166534",
    backgroundColor: "#bbf7d0",
  },
  cardTitle: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "700",
  },
  detailSectionHeader: {
    color: "#000000",
    fontSize: 17,
    fontWeight: "700",
  },
  detailGroup: {
    gap: 4,
  },
  detailGroupTitle: {
    color: "#111111",
    fontSize: 13,
    fontWeight: "700",
  },
  injuryBanner: {
    backgroundColor: "#fee2e2",
    borderColor: "#ef4444",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  injuryBannerText: {
    color: "#7f1d1d",
    fontSize: 13,
    fontWeight: "700",
  },
  suspensionBanner: {
    backgroundColor: "#fef3c7",
    borderColor: "#f59e0b",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  suspensionBannerText: {
    color: "#78350f",
    fontSize: 13,
    fontWeight: "700",
  },
  breakBanner: {
    backgroundColor: "#e0e7ff",
    borderColor: "#6366f1",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  breakBannerText: {
    color: "#312e81",
    fontSize: 13,
    fontWeight: "700",
  },
  paternityBanner: {
    backgroundColor: "#fce7f3",
    borderColor: "#ec4899",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  paternityBannerText: {
    color: "#831843",
    fontSize: 13,
    fontWeight: "700",
  },
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  miniStat: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexBasis: "23%",
    flexGrow: 0,
    flexShrink: 0,
    minWidth: 0,
  },
  miniStat_hard: {
    backgroundColor: "#93c5fd",
    borderWidth: 1,
    borderColor: "#2563eb",
  },
  miniStat_clay: {
    backgroundColor: "#fca5a5",
    borderWidth: 1,
    borderColor: "#dc2626",
  },
  miniStat_grass: {
    backgroundColor: "#86efac",
    borderWidth: 1,
    borderColor: "#15803d",
  },
  miniStatLabel: {
    color: "#4b5563",
    fontSize: 11,
  },
  miniStatLabel_hard: {
    color: "#1f2937",
  },
  miniStatLabel_clay: {
    color: "#1f2937",
  },
  miniStatLabel_grass: {
    color: "#1f2937",
  },
  miniStatValue: {
    color: "#000000",
    fontSize: 13,
    fontWeight: "700",
  },
  miniStatValue_hard: {
    color: "#000000",
  },
  miniStatValue_clay: {
    color: "#000000",
  },
  miniStatValue_grass: {
    color: "#000000",
  },
  playerOption: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
  },
  playerOptionSelected: {
    borderWidth: 2,
    borderColor: "#1d4ed8",
    backgroundColor: "#dbeafe",
  },
  playerOptionDisabled: {
    opacity: 0.45,
  },
  playerOptionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  playerOptionBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 11,
    fontWeight: "700",
    overflow: "hidden",
  },
  playerOptionBadgeSelected: {
    backgroundColor: "#1d4ed8",
    color: "#ffffff",
  },
  playerOptionBadgeRequired: {
    backgroundColor: "#b91c1c",
    color: "#ffffff",
  },
  playerOptionTitle: {
    color: "#000000",
    fontWeight: "700",
    fontSize: 14,
    flex: 1,
  },
  playerOptionText: {
    color: "#111827",
    fontSize: 12,
  },
  resultLine: {
    color: "#000000",
    borderLeftWidth: 3,
    borderLeftColor: "#2563eb",
    paddingLeft: 8,
    paddingVertical: 3,
  },
  detailRow: {
    color: "#000000",
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
    color: "#000000",
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
    color: "#1f2937",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "right",
    minWidth: 84,
    maxWidth: "42%",
  },
  detailSubRowValue: {
    color: "#374151",
    fontSize: 12,
    minWidth: 96,
  },
  error: {
    color: "#b91c1c",
    fontWeight: "700",
  },
  injuryAlertCard: {
    borderColor: "#ef4444",
    backgroundColor: "#fee2e2",
  },
  injuryAlertTitle: {
    color: "#7f1d1d",
    fontSize: 15,
    fontWeight: "700",
  },
  injuryAlertText: {
    color: "#991b1b",
    fontSize: 13,
    fontWeight: "600",
  },
  bulletList: {
    gap: 8,
  },
  bulletItem: {
    color: "#111827",
    fontSize: 14,
    lineHeight: 20,
  },
  legalCard: {
    gap: 8,
  },
});
