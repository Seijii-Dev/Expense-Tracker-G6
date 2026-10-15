const sanitizeKey = (str: string) => str.replace(/[^a-zA-Z0-9._-]/g, "_");

export const STORAGE_KEYS = {
  authToken: "expense-tracker-auth-token",
  cachedAccount: "expense-tracker-cached-account",
  userCache: (email: string) => `expense-tracker:${sanitizeKey(email)}:cache`,
  userBudget: (email: string) => `expense-tracker:${sanitizeKey(email)}:budget`,
  syncQueue: (email: string) => `expense-tracker:${sanitizeKey(email)}:pending-sync`,
  darkMode: (email: string) => `expense-tracker:${sanitizeKey(email)}:dark-mode`,
  budgetNudges: (email: string) => `expense-tracker:${sanitizeKey(email)}:budget-nudges`,
  profilePicture: (email: string) => `expense-tracker:${sanitizeKey(email)}:profile-picture`,
  profileBanner: (email: string) => `expense-tracker:${sanitizeKey(email)}:profile-banner`,
  localAccounts: "expense-tracker-local-accounts",
  userPassword: (email: string) => `expense-tracker-password-${sanitizeKey(email)}`,
  userCustomCategories: (email: string) => `expense-tracker:${sanitizeKey(email)}:custom-categories`,
  globalCustomCategories: "expense-tracker:global-custom-categories",
} as const;
