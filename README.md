# Expense Tracker

A React Native / Expo expense tracking app for Group 6.

## App identity

- Display name: `Expense Tracker`
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

The app includes a mobile welcome landing page, local registration and login, a dashboard, add-expense flow, transaction search and category filters, spending reports, budget settings, and local persistence for expenses and account session state.

## Local authentication note

Registration and login are intentionally local-only for this version. The account record, session flag, budget, and expenses are stored on the device using AsyncStorage. No network API, cloud database, or remote authentication provider is used. This is suitable for a school-project MVP, but production authentication should use a secure backend and should not store raw passwords in AsyncStorage.
