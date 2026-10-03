import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Smart Spending and Savings Tracker",
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
      backgroundColor: "#16382B",
      foregroundImage: "./assets/images/icon.png",
    },
    permissions: ["READ_EXTERNAL_STORAGE", "WRITE_EXTERNAL_STORAGE"],
  },
  extra: {
    eas: {
      projectId: "e2002670-90ed-468a-b2f7-cfd6aa16be13",
    },
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/icon.png",
  },
  plugins: ["expo-router", "expo-font", "expo-secure-store"],
  experiments: {
    typedRoutes: true,
  },
};

export default config;
