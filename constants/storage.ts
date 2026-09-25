export const STORAGE_KEYS = {
  authToken: "expense-tracker-auth-token",
  cachedAccount: "expense-tracker-cached-account",
  userCache: (email: string) => `expense-tracker:${email}:cache`,
  userBudget: (email: string) => `expense-tracker:${email}:budget`,
  syncQueue: (email: string) => `expense-tracker:${email}:pending-sync`,
  darkMode: (email: string) => `expense-tracker:${email}:dark-mode`,
  budgetNudges: (email: string) => `expense-tracker:${email}:budget-nudges`,
  localAccounts: "expense-tracker-local-accounts",
  userPassword: (email: string) => `expense-tracker-password-${email}`,
} as const;
