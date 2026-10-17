import type { TextStyle } from "react-native";

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radii = {
  control: 12,
  card: 18,
  panel: 22,
  sheet: 28,
  pill: 999,
} as const;

export const typography: Record<string, TextStyle> = {
  screenTitle: {
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 34,
    letterSpacing: -0.6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
    letterSpacing: -0.25,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
  bodyMedium: {
    fontSize: 13,
    lineHeight: 18,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.45,
  },
  money: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.4,
    fontVariant: ["tabular-nums"],
  },
  moneyLarge: {
    fontSize: 34,
    fontWeight: "700",
    lineHeight: 42,
    letterSpacing: -0.8,
    fontVariant: ["tabular-nums"],
  },
};

export const motionDuration = {
  quick: 140,
  standard: 220,
  entrance: 320,
} as const;
