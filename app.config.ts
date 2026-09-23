import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Expense Tracker",
  icon: "./assets/images/icon.png",
  slug: "expense-tracker-group6",
  version: "1.0.0",
  orientation: "portrait",
  scheme: "expense-tracker",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    bundleIdentifier: "expense.tracker.group6",
    supportsTablet: true,
  },
  android: {
    package: "expense.tracker.group6",
    adaptiveIcon: {
      backgroundColor: "#2A4740",
      foregroundImage: "./assets/images/icon.png",
    },
  },
  extra: {
    eas: {
      projectId: "e2002670-90ed-468a-b2f7-cfd6aa16be13",
    },
  },
  plugins: ["expo-router", "expo-font", "expo-secure-store"],
  experiments: {
    typedRoutes: true,
  },
};

export default config;
