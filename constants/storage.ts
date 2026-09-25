export const STORAGE_KEYS = {
  authToken: "expense-tracker-auth-token",
  userCache: (email: string) => `expense-tracker:${email}:cache`,
  darkMode: (email: string) => `expense-tracker:${email}:dark-mode`,
  budgetNudges: (email: string) => `expense-tracker:${email}:budget-nudges`,
} as const;
