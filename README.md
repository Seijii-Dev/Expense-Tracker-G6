# Smart Spending and Savings Tracker

A React Native / Expo expense tracking app for Group 6.

## App identity

- Display name: `Smart Spending and Savings Tracker`
- Package name: `expense.tracker.group6`
- iOS bundle identifier: `expense.tracker.group6`
- Android package: `expense.tracker.group6`

## Run locally

```bash
pnpm install
pnpm start
```

Then open the project with Expo Go, an Android emulator, or an iOS simulator.

## Features

The app includes a mobile welcome landing page, local registration and login, a dashboard, add and edit expense flows, transaction search and category filters, live spending reports, budget settings, persistent light/dark mode, CSV export and local persistence for expenses and account session state.

## Local authentication note

Registration and login are intentionally local-only for this version. The profile, session flag, budget, and expenses are stored on the device using AsyncStorage; passwords are stored in Expo SecureStore. No network API, cloud database, or remote authentication provider is used. This is suitable for a school-project MVP, but production authentication should still use a secure backend.

## GitHub Actions builds

Every push to `main` and every pull request targeting `main` runs the Expo CI workflow. It installs dependencies, runs `pnpm typecheck`, and validates the Expo configuration.

To create an Android or iOS build from GitHub Actions:

1. Create an Expo/EAS account and install the EAS CLI locally with `pnpm dlx eas-cli@latest login`.
2. Create an Expo access token and add it to the repository as an Actions secret named `EXPO_TOKEN` under **Settings → Secrets and variables → Actions**.
3. Open the **Actions** tab, choose **Build Expo app**, click **Run workflow**, then select `production` for the directly installable Android APK or `preview` for testing.

The `production` profile creates a directly installable Android APK with all four common Android ABIs (`armeabi-v7a`, `arm64-v8a`, `x86`, and `x86_64`). Keep the workflow architecture set to `all` for release distribution; the arm64-only option is restricted to local preview builds. Before building, confirm the EAS Android keystore matches the certificate used for any installed release; do not create or replace it if the APK must update an existing installation.

Preview builds produce an Android APK and an iOS simulator build. This project is configured for direct APK distribution; the Android production profile does not produce a Play Store App Bundle (AAB). The Expo SDK 54 baseline supports Android 7.0 (API 24) and newer; devices below that minimum are not supported.
