import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-store";
import { api } from "@/lib/api-client";
import { Category, CustomCategory, Expense, NewExpenseData, Payment } from "@/types/expense";
import { CATEGORIES, CATEGORY_META } from "@/constants/categories";
import { STORAGE_KEYS } from "@/constants/storage";
import { getPhilippinesDate, getPhilippinesMonth, normalizeDate } from "@/utils/date";

export type { Category, Payment, Expense };
export const categoryMeta = CATEGORY_META;
export { getPhilippinesDate, getPhilippinesMonth, normalizeDate };

export type ExpenseContextValue = {
  expenses: Expense[];
  hydrated: boolean;
  syncing: boolean;
  syncError: string | null;
  budget: number;
  setBudget: (value: number) => void;
  addExpense: (expense: NewExpenseData) => void;
  updateExpense: (id: string, expense: NewExpenseData) => void;
  removeExpense: (id: string) => void;
  refreshExpenses: () => Promise<void>;
  monthTotal: number;
  todayTotal: number;
  remaining: number;
  budgetPercent: number;
  sortedExpenses: Expense[];
  customCategories: CustomCategory[];
  allCategories: string[];
  addCustomCategory: (category: { name: string; color: string; soft?: string; icon: string }) => Promise<boolean>;
  deleteCustomCategory: (nameOrId: string) => Promise<boolean>;
  addExpenseModalOpen: boolean;
  openAddExpenseModal: () => void;
  closeAddExpenseModal: () => void;
  isBalanceHidden: boolean;
  toggleBalanceHidden: () => void;
};

type PendingSyncItem =
  | { action: "create"; tempId: string; data: NewExpenseData }
  | { action: "update"; id: string; data: NewExpenseData }
  | { action: "delete"; id: string };

const ExpenseContext = createContext<ExpenseContextValue | null>(null);

function sanitizeExpense(expense: NewExpenseData): NewExpenseData {
  return {
    ...expense,
    amount: Math.max(0.01, isNaN(expense.amount) ? 0 : Math.round(expense.amount * 100) / 100),
    date: normalizeDate(expense.date),
  };
}

async function getSyncQueue(email: string): Promise<PendingSyncItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.syncQueue(email));
    return raw ? (JSON.parse(raw) as PendingSyncItem[]) : [];
  } catch {
    return [];
  }
}

async function saveSyncQueue(email: string, queue: PendingSyncItem[]): Promise<void> {
  try {
    if (queue.length === 0) {
      await AsyncStorage.removeItem(STORAGE_KEYS.syncQueue(email));
    } else {
      await AsyncStorage.setItem(STORAGE_KEYS.syncQueue(email), JSON.stringify(queue));
    }
  } catch {
    // Ignore storage write error
  }
}

async function addToSyncQueue(email: string, item: PendingSyncItem): Promise<void> {
  const queue = await getSyncQueue(email);
  queue.push(item);
  await saveSyncQueue(email, queue);
}

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const { account, token, refreshAccount } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budget, setBudgetState] = useState(5000);
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [hydratedKey, setHydratedKey] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [addExpenseModalOpen, setAddExpenseModalOpen] = useState(false);
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);

  const openAddExpenseModal = useCallback(() => setAddExpenseModalOpen(true), []);
  const closeAddExpenseModal = useCallback(() => setAddExpenseModalOpen(false), []);
  const toggleBalanceHidden = useCallback(() => setIsBalanceHidden((prev) => !prev), []);

  const accountEmail = account?.email ?? null;
  const isSyncingRef = React.useRef(false);

  const accountKey = accountEmail;
  const hydrated = accountKey !== null && hydratedKey === accountKey;

  // Process any pending offline changes and fetch fresh records from server
  const refreshExpenses = useCallback(async () => {
    if (!token || !accountEmail || token.startsWith("local-token-")) {
      return;
    }

    if (isSyncingRef.current) {
      return;
    }
    isSyncingRef.current = true;
    setSyncing(true);
    try {
      // 1. Process pending offline sync queue
      const queue = await getSyncQueue(accountEmail);
      if (queue.length > 0) {
        const remainingQueue: PendingSyncItem[] = [];
        for (const item of queue) {
          try {
            if (item.action === "create") {
              const res = await api.createExpense(token, item.data);
              if (res.ok) {
                setExpenses((curr) =>
                  curr.map((e) =>
                    e.id === item.tempId
                      ? {
                          ...res.expense,
                          date: normalizeDate(res.expense.date),
                          category: res.expense.category as Category,
                          payment: res.expense.payment as Payment,
                        }
                      : e
                  )
                );
              } else {
                remainingQueue.push(item);
              }
            } else if (item.action === "update") {
              const res = await api.updateExpense(token, item.id, item.data);
              if (!res.ok) remainingQueue.push(item);
            } else if (item.action === "delete") {
              const res = await api.deleteExpense(token, item.id);
              if (!res.ok) remainingQueue.push(item);
            }
          } catch {
            remainingQueue.push(item);
          }
        }
        await saveSyncQueue(accountEmail, remainingQueue);
      }

      // 2. Fetch fresh list from server
      const [expensesResult, meResult] = await Promise.all([
        api.listExpenses(token),
        api.me(token),
      ]);

      if (expensesResult.ok) {
        const remote: Expense[] = expensesResult.expenses.map((e) => ({
          ...e,
          date: normalizeDate(e.date),
          category: e.category as Category,
          payment: e.payment as Payment,
        }));

        // Preserve any local un-synced expenses (starting with local-)
        setExpenses((current) => {
          const localOnly = current.filter((e) => e.id.startsWith("local-"));
          const merged = [...remote];
          for (const local of localOnly) {
            if (!merged.some((r) => r.id === local.id)) {
              merged.push(local);
            }
          }
          AsyncStorage.setItem(STORAGE_KEYS.userCache(accountEmail), JSON.stringify(merged)).catch(() => undefined);
          return merged;
        });
        setSyncError(null);
      } else {
        // If server call fails, do NOT erase local expenses
        setSyncError(expensesResult.message);
      }

      if (meResult.ok) {
        setBudgetState(meResult.account.budget);
        refreshAccount(meResult.account);
        AsyncStorage.setItem(STORAGE_KEYS.userBudget(accountEmail), String(meResult.account.budget)).catch(() => undefined);
      }
    } catch {
      // Offline fallback: keep local records intact
      setSyncError("Working offline. Records are saved locally.");
    } finally {
      setSyncing(false);
      isSyncingRef.current = false;
    }
  }, [token, accountEmail, refreshAccount]);

  // Keep a stable ref to refreshExpenses for background sync on initial load
  const refreshExpensesRef = React.useRef(refreshExpenses);
  useEffect(() => {
    refreshExpensesRef.current = refreshExpenses;
  }, [refreshExpenses]);

  // On login or account switch: load offline cache FIRST so user sees data immediately
  useEffect(() => {
    let mounted = true;

    if (!accountEmail) {
      setHydratedKey(null);
      setSyncError(null);
      setExpenses([]);
      setBudgetState(5000);
      setCustomCategories([]);
      return;
    }

    (async () => {
      // 1. Read cached budget, expenses & custom categories
      try {
        const catKey = STORAGE_KEYS.userCustomCategories(accountEmail);
        const [cachedExpenses, cachedBudget, cachedCustomCats] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.userCache(accountEmail)),
          AsyncStorage.getItem(STORAGE_KEYS.userBudget(accountEmail)),
          AsyncStorage.getItem(catKey),
        ]);

        if (mounted) {
          if (cachedBudget) {
            const parsedBudget = Number(cachedBudget);
            if (!isNaN(parsedBudget) && parsedBudget >= 0) {
              setBudgetState(parsedBudget);
            }
          } else if (account?.budget !== undefined) {
            setBudgetState(account.budget);
          }

          if (cachedExpenses) {
            try {
              const parsed = JSON.parse(cachedExpenses);
              if (Array.isArray(parsed)) {
                setExpenses(
                  parsed.map((item) => ({
                    ...item,
                    date: normalizeDate(item.date),
                  }))
                );
              }
            } catch {
              // Ignore corrupted cache
            }
          }

          if (cachedCustomCats) {
            try {
              const parsedCats = JSON.parse(cachedCustomCats);
              if (Array.isArray(parsedCats)) {
                setCustomCategories(parsedCats);
              }
            } catch {
              // Ignore corrupted cache
            }
          }
        }
      } catch {
        // Disk read fallback
      } finally {
        if (mounted) setHydratedKey(accountEmail);
      }

      // 2. Sync with remote server if online in the background without unmounting hydrated state
      if (!mounted) return;
      await refreshExpensesRef.current();
    })();

    return () => {
      mounted = false;
    };
  }, [accountEmail, token]);

  // Persist local expenses to AsyncStorage whenever they change
  useEffect(() => {
    if (hydrated && accountEmail) {
      AsyncStorage.setItem(STORAGE_KEYS.userCache(accountEmail), JSON.stringify(expenses)).catch(() => undefined);
    }
  }, [expenses, hydrated, accountEmail]);

  const { monthTotal, todayTotal, remaining, budgetPercent, sortedExpenses } = useMemo(() => {
    const currentDate = getPhilippinesDate();
    const currentMonth = getPhilippinesMonth();
    let mTotal = 0;
    let tTotal = 0;

    for (const expense of expenses) {
      const normDate = normalizeDate(expense.date);
      const amt = expense.amount || 0;
      if (normDate.startsWith(currentMonth)) {
        mTotal += amt;
      }
      if (normDate === currentDate) {
        tTotal += amt;
      }
    }

    const rem = Math.max(0, budget - mTotal);
    const bPercent = budget > 0 ? Math.min(100, Math.round((mTotal / budget) * 100)) : 0;
    const sorted = [...expenses].sort((a, b) => {
      const dateComp = (b.date || "").localeCompare(a.date || "");
      if (dateComp !== 0) return dateComp;
      return (b.id || "").localeCompare(a.id || "");
    });

    return {
      monthTotal: mTotal,
      todayTotal: tTotal,
      remaining: rem,
      budgetPercent: bPercent,
      sortedExpenses: sorted,
    };
  }, [expenses, budget]);

  const setBudget = useCallback(
    (value: number) => {
      const safeValue = Math.max(0, isNaN(value) ? 0 : Math.round(value));
      setBudgetState(safeValue);

      if (accountEmail) {
        AsyncStorage.setItem(STORAGE_KEYS.userBudget(accountEmail), String(safeValue)).catch(() => undefined);
        if (account) {
          refreshAccount({ ...account, budget: safeValue });
        }
      }

      if (token && !token.startsWith("local-token-")) {
        api.updateBudget(token, safeValue).catch(() => undefined);
      }
    },
    [accountEmail, account, token, refreshAccount]
  );

  const addExpense = useCallback(
    (expense: NewExpenseData) => {
      const sanitized = sanitizeExpense(expense);
      const localId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const newExpense: Expense = { ...sanitized, id: localId };

      // 1. Immediately save to local state and disk (NEVER revert)
      setExpenses((current) => [newExpense, ...current]);

      // If local-only token or no token, record stays local
      if (!token || !accountEmail || token.startsWith("local-token-")) {
        return;
      }

      // 2. Attempt remote sync in background
      api
        .createExpense(token, sanitized)
        .then((result) => {
          if (result.ok) {
            setExpenses((current) =>
              current.map((item) =>
                item.id === localId
                  ? {
                      ...result.expense,
                      date: normalizeDate(result.expense.date),
                      category: result.expense.category as Category,
                      payment: result.expense.payment as Payment,
                    }
                  : item
              )
            );
          } else {
            // Server sync failed: KEEP the expense locally, queue it for next sync!
            addToSyncQueue(accountEmail, { action: "create", tempId: localId, data: sanitized });
          }
        })
        .catch(() => {
          // Network failed: KEEP the expense locally, queue it for next sync!
          addToSyncQueue(accountEmail, { action: "create", tempId: localId, data: sanitized });
        });
    },
    [token, accountEmail]
  );

  const updateExpense = useCallback(
    (id: string, expense: NewExpenseData) => {
      const sanitized = sanitizeExpense(expense);

      // 1. Immediately update locally (NEVER revert)
      setExpenses((current) => current.map((item) => (item.id === id ? { ...sanitized, id } : item)));

      if (!token || !accountEmail || token.startsWith("local-token-")) {
        return;
      }

      // 2. If it's still a local un-synced item, update its queue data
      if (id.startsWith("local-")) {
        getSyncQueue(accountEmail).then((queue) => {
          const updated = queue.map((q) =>
            q.action === "create" && q.tempId === id ? { ...q, data: sanitized } : q
          );
          saveSyncQueue(accountEmail, updated);
        });
        return;
      }

      // 3. Attempt remote update
      api
        .updateExpense(token, id, sanitized)
        .then((result) => {
          if (!result.ok) {
            addToSyncQueue(accountEmail, { action: "update", id, data: sanitized });
          }
        })
        .catch(() => {
          addToSyncQueue(accountEmail, { action: "update", id, data: sanitized });
        });
    },
    [token, accountEmail]
  );

  const removeExpense = useCallback(
    (id: string) => {
      // 1. Immediately remove locally (NEVER revert)
      setExpenses((current) => current.filter((expense) => expense.id !== id));

      if (!token || !accountEmail || token.startsWith("local-token-")) {
        return;
      }

      // 2. If it was a local un-synced item, just remove it from queue
      if (id.startsWith("local-")) {
        getSyncQueue(accountEmail).then((queue) => {
          const updated = queue.filter((q) => !(q.action === "create" && q.tempId === id));
          saveSyncQueue(accountEmail, updated);
        });
        return;
      }

      // 3. Attempt remote delete
      api
        .deleteExpense(token, id)
        .then((result) => {
          if (!result.ok) {
            addToSyncQueue(accountEmail, { action: "delete", id });
          }
        })
        .catch(() => {
          addToSyncQueue(accountEmail, { action: "delete", id });
        });
    },
    [token, accountEmail]
  );

  const allCategories = useMemo(() => {
    const list = [...CATEGORIES];
    for (const custom of customCategories) {
      if (custom.name && !list.some((c) => c.toLowerCase() === custom.name.toLowerCase())) {
        list.push(custom.name);
      }
    }
    return list;
  }, [customCategories]);

  const addCustomCategory = useCallback(
    async (catData: { name: string; color: string; soft?: string; icon: string }): Promise<boolean> => {
      const trimmedName = catData.name.trim();
      if (!trimmedName) return false;

      const exists = allCategories.some((c) => c.toLowerCase() === trimmedName.toLowerCase());
      if (exists) return false;

      const newCat: CustomCategory = {
        id: `custom-cat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: trimmedName,
        color: catData.color,
        soft: catData.soft || `${catData.color}22`,
        icon: catData.icon,
        createdAt: new Date().toISOString(),
      };

      const updated = [...customCategories, newCat];
      setCustomCategories(updated);

      if (accountEmail) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.userCustomCategories(accountEmail),
          JSON.stringify(updated)
        ).catch(() => undefined);
      } else {
        await AsyncStorage.setItem(
          STORAGE_KEYS.globalCustomCategories,
          JSON.stringify(updated)
        ).catch(() => undefined);
      }

      return true;
    },
    [allCategories, customCategories, accountEmail]
  );

  const deleteCustomCategory = useCallback(
    async (nameOrId: string): Promise<boolean> => {
      const updated = customCategories.filter(
        (c) => c.id !== nameOrId && c.name.toLowerCase() !== nameOrId.toLowerCase()
      );
      setCustomCategories(updated);

      if (accountEmail) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.userCustomCategories(accountEmail),
          JSON.stringify(updated)
        ).catch(() => undefined);
      } else {
        await AsyncStorage.setItem(
          STORAGE_KEYS.globalCustomCategories,
          JSON.stringify(updated)
        ).catch(() => undefined);
      }

      return true;
    },
    [customCategories, accountEmail]
  );

  const value = useMemo(
    () => ({
      expenses,
      hydrated,
      syncing,
      syncError,
      budget,
      setBudget,
      addExpense,
      updateExpense,
      removeExpense,
      refreshExpenses,
      monthTotal,
      todayTotal,
      remaining,
      budgetPercent,
      sortedExpenses,
      customCategories,
      allCategories,
      addCustomCategory,
      deleteCustomCategory,
      addExpenseModalOpen,
      openAddExpenseModal,
      closeAddExpenseModal,
      isBalanceHidden,
      toggleBalanceHidden,
    }),
    [
      expenses,
      hydrated,
      syncing,
      syncError,
      budget,
      setBudget,
      addExpense,
      updateExpense,
      removeExpense,
      refreshExpenses,
      monthTotal,
      todayTotal,
      remaining,
      budgetPercent,
      sortedExpenses,
      customCategories,
      allCategories,
      addCustomCategory,
      deleteCustomCategory,
      addExpenseModalOpen,
      openAddExpenseModal,
      closeAddExpenseModal,
      isBalanceHidden,
      toggleBalanceHidden,
    ]
  );

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>;
}

export function useExpenses() {
  const value = useContext(ExpenseContext);
  if (!value) throw new Error("useExpenses must be used inside ExpenseProvider");
  return value;
}
