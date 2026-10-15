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

## Authentication and offline use

Registration and login use the configured API first. If the server cannot be reached, the app can create a device-only account or sign in with credentials previously saved on that device. Offline-created accounts stay on that device and do not sync to the server. Remote accounts keep a local profile and expense cache so the app remains usable without a connection; expense and budget changes are queued for the next successful sync.

The API URL defaults to the deployed service and can be overridden with `EXPO_PUBLIC_API_URL`. Native builds store credentials in Expo SecureStore when available; web builds use browser storage. Profile details, budgets, categories, session data, and expense caches use AsyncStorage.

## GitHub Actions builds

Every push to `main` and every pull request targeting `main` runs the Expo CI workflow. It installs dependencies, runs `pnpm typecheck`, and validates the Expo configuration.

To create an Android or iOS build from GitHub Actions:

1. Create an Expo/EAS account and install the EAS CLI locally with `pnpm dlx eas-cli@latest login`.
2. Create an Expo access token and add it to the repository as an Actions secret named `EXPO_TOKEN` under **Settings → Secrets and variables → Actions**.
3. Open the **Actions** tab, choose **Build Expo app**, click **Run workflow**, then select `production` for the directly installable Android APK or `preview` for testing.

The `production` profile creates a directly installable Android APK with all four common Android ABIs (`armeabi-v7a`, `arm64-v8a`, `x86`, and `x86_64`). Keep the workflow architecture set to `all` for release distribution; the arm64-only option is restricted to local preview builds. Before building, confirm the EAS Android keystore matches the certificate used for any installed release; do not create or replace it if the APK must update an existing installation.

Preview builds produce an Android APK and an iOS simulator build. This project is configured for direct APK distribution; the Android production profile does not produce a Play Store App Bundle (AAB). The Expo SDK 54 baseline supports Android 7.0 (API 24) and newer; devices below that minimum are not supported.
