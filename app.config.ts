import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Ledgerly",
  icon: "./assets/images/icon.png",
  slug: "expense-tracker-group6",
  version: "1.0.0",
  orientation: "portrait",
  scheme: "expense-tracker",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  splash: {
    backgroundColor: "#0A1714",
  },
  ios: {
    bundleIdentifier: "expense.tracker.group6",
    supportsTablet: true,
  },
  android: {
    package: "expense.tracker.group6",
    blockedPermissions: ["android.permission.VIBRATE"],
    adaptiveIcon: {
      backgroundColor: "#16382B",
      foregroundImage: "./assets/images/icon.png",
    },
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
  plugins: [
    "expo-router",
    "expo-font",
    "expo-secure-store",
    [
      "expo-image-picker",
      {
        photosPermission: "Allow Ledgerly to choose a profile photo or banner from your library.",
        cameraPermission: false,
        microphonePermission: false,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
};

export default config;
