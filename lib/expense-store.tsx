import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-store";
import { api } from "@/lib/api-client";
import { Category, CustomCategory, Expense, NewExpenseData, Payment } from "@/types/expense";
import { CATEGORIES, CATEGORY_META, PAYMENT_METHODS } from "@/constants/categories";
import { STORAGE_KEYS } from "@/constants/storage";
import { getExpenseDateKey, getPhilippinesDate, getPhilippinesMonth, normalizeDate } from "@/utils/date";

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
  addExpenses: (expenses: NewExpenseData[]) => void;
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
  | { action: "delete"; id: string }
  | { action: "budget"; value: number };

const ExpenseContext = createContext<ExpenseContextValue | null>(null);

function isNewExpenseData(value: unknown): value is NewExpenseData {
  if (!value || typeof value !== "object") return false;
  const expense = value as Partial<NewExpenseData>;
  return (
    typeof expense.amount === "number" && Number.isFinite(expense.amount) && expense.amount > 0 &&
    typeof expense.category === "string" && expense.category.length > 0 &&
    typeof expense.date === "string" && Boolean(getExpenseDateKey(expense.date)) &&
    typeof expense.description === "string" &&
    typeof expense.payment === "string" && PAYMENT_METHODS.includes(expense.payment as Payment)
  );
}

function isStoredExpense(value: unknown): value is Expense {
  if (!value || typeof value !== "object") return false;
  const expense = value as Partial<Expense>;
  return (
    typeof expense.id === "string" && expense.id.length > 0 &&
    isNewExpenseData(expense)
  );
}

function isCustomCategory(value: unknown): value is CustomCategory {
  if (!value || typeof value !== "object") return false;
  const category = value as Partial<CustomCategory>;
  return (
    typeof category.id === "string" &&
    typeof category.name === "string" && category.name.trim().length > 0 &&
    typeof category.color === "string" &&
    typeof category.icon === "string"
  );
}

function sanitizeExpense(expense: NewExpenseData): NewExpenseData {
  const dateKey = getExpenseDateKey(expense.date);
  const hasValidTimestamp =
    /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/.test(expense.date) &&
    Boolean(dateKey) &&
    Number.isFinite(Date.parse(expense.date));
  return {
    ...expense,
    amount: Math.max(
      0.01,
      Number.isFinite(expense.amount) ? Math.round(expense.amount * 100) / 100 : 0
    ),
    date: hasValidTimestamp ? expense.date : normalizeDate(expense.date),
  };
}

async function getSyncQueue(email: string): Promise<PendingSyncItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.syncQueue(email));
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is PendingSyncItem => {
      if (!value || typeof value !== "object") return false;
      const item = value as Partial<PendingSyncItem>;
      if (item.action === "create") {
        return typeof item.tempId === "string" && isNewExpenseData(item.data);
      }
      if (item.action === "update") {
        return typeof item.id === "string" && isNewExpenseData(item.data);
      }
      if (item.action === "delete") return typeof item.id === "string";
      if (item.action === "budget") return typeof item.value === "number" && Number.isFinite(item.value) && item.value >= 0;
      return false;
    });
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

const syncQueueMutations = new Map<string, Promise<void>>();

async function mutateSyncQueue(
  email: string,
  mutation: (queue: PendingSyncItem[]) => PendingSyncItem[]
): Promise<void> {
  const previous = syncQueueMutations.get(email) ?? Promise.resolve();
  const next = previous.then(async () => {
    const queue = await getSyncQueue(email);
    await saveSyncQueue(email, mutation(queue));
  });
  syncQueueMutations.set(email, next);
  try {
    await next;
  } finally {
    if (syncQueueMutations.get(email) === next) syncQueueMutations.delete(email);
  }
}

function syncItemKey(item: PendingSyncItem): string {
  if (item.action === "create") return `create:${item.tempId}`;
  if (item.action === "budget") return "budget";
  return `${item.action}:${item.id}`;
}

async function addToSyncQueue(email: string, item: PendingSyncItem): Promise<void> {
  await mutateSyncQueue(email, (queue) => {
    const key = syncItemKey(item);
    const withoutSuperseded = queue.filter((queued) => {
      if (syncItemKey(queued) === key) return false;
      if (item.action === "delete" && queued.action === "update" && queued.id === item.id) return false;
      return true;
    });
    return [...withoutSuperseded, item];
  });
}

async function finishSyncQueueBatch(
  email: string,
  processed: PendingSyncItem[],
  failed: PendingSyncItem[]
): Promise<void> {
  const processedByKey = new Map(processed.map((item) => [syncItemKey(item), JSON.stringify(item)]));
  const failedByKey = new Map(failed.map((item) => [syncItemKey(item), item]));

  await mutateSyncQueue(email, (current) =>
    current.flatMap((item) => {
      const key = syncItemKey(item);
      const snapshot = processedByKey.get(key);
      if (!snapshot || snapshot !== JSON.stringify(item)) return [item];
      const failedItem = failedByKey.get(key);
      return failedItem ? [failedItem] : [];
    })
  );
}

async function deleteRemoteExpenseOrQueue(email: string, token: string, id: string): Promise<void> {
  try {
    const result = await api.deleteExpense(token, id);
    if (!result.ok) await addToSyncQueue(email, { action: "delete", id });
  } catch {
    await addToSyncQueue(email, { action: "delete", id });
  }
}

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const { account, token, refreshAccount } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budget, setBudgetState] = useState(5000);
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [hydratedKey, setHydratedKey] = useState<string | null>(null);
  const loadedAccountKeyRef = React.useRef<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [addExpenseModalOpen, setAddExpenseModalOpen] = useState(false);
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);

  const openAddExpenseModal = useCallback(() => setAddExpenseModalOpen(true), []);
  const closeAddExpenseModal = useCallback(() => setAddExpenseModalOpen(false), []);
  const toggleBalanceHidden = useCallback(() => setIsBalanceHidden((prev) => !prev), []);

  const accountEmail = account?.email ?? null;
  const isSyncingRef = React.useRef(false);
  const activeSessionRef = React.useRef({ email: accountEmail, token });
  activeSessionRef.current = { email: accountEmail, token };
  const pendingCreateIdsRef = React.useRef(new Set<string>());
  const cancelledCreateIdsRef = React.useRef(new Set<string>());
  const pendingCreateDataRef = React.useRef(new Map<string, NewExpenseData>());

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
    const sessionIsCurrent = () =>
      activeSessionRef.current.email === accountEmail && activeSessionRef.current.token === token;
    try {
      // 1. Process pending offline sync queue
      const queue = await getSyncQueue(accountEmail);
      if (queue.length > 0) {
        const remainingQueue: PendingSyncItem[] = [];
        for (const item of queue) {
          if (item.action === "create") {
            pendingCreateIdsRef.current.add(item.tempId);
            pendingCreateDataRef.current.set(item.tempId, item.data);
            try {
              const res = await api.createExpense(token, item.data);
              const latestData = pendingCreateDataRef.current.get(item.tempId) ?? item.data;
              const wasCancelled = cancelledCreateIdsRef.current.delete(item.tempId);

              if (!res.ok) {
                if (!wasCancelled) remainingQueue.push(item);
                continue;
              }

              await mutateSyncQueue(accountEmail, (current) =>
                current.filter((queued) => !(queued.action === "create" && queued.tempId === item.tempId))
              );

              if (wasCancelled) {
                await deleteRemoteExpenseOrQueue(accountEmail, token, res.expense.id);
                continue;
              }

              if (JSON.stringify(latestData) !== JSON.stringify(item.data)) {
                const updateResult = await api.updateExpense(token, res.expense.id, latestData);
                if (!updateResult.ok) {
                  await addToSyncQueue(accountEmail, {
                    action: "update",
                    id: res.expense.id,
                    data: latestData,
                  });
                }
              }

              const syncedExpense: Expense = {
                ...res.expense,
                ...latestData,
                id: res.expense.id,
                category: latestData.category as Category,
                payment: latestData.payment as Payment,
              };
              setExpenses((curr) =>
                sessionIsCurrent()
                  ? curr.map((expense) => (expense.id === item.tempId ? syncedExpense : expense))
                  : curr
              );
            } catch {
              const wasCancelled = cancelledCreateIdsRef.current.delete(item.tempId);
              if (!wasCancelled) remainingQueue.push(item);
            } finally {
              pendingCreateIdsRef.current.delete(item.tempId);
              pendingCreateDataRef.current.delete(item.tempId);
            }
            continue;
          }

          try {
            if (item.action === "update") {
              const res = await api.updateExpense(token, item.id, item.data);
              if (!res.ok) remainingQueue.push(item);
            } else if (item.action === "delete") {
              const res = await api.deleteExpense(token, item.id);
              if (!res.ok) remainingQueue.push(item);
            } else if (item.action === "budget") {
              const res = await api.updateBudget(token, item.value);
              if (!res.ok) remainingQueue.push(item);
            }
          } catch {
            remainingQueue.push(item);
          }
        }
        await finishSyncQueueBatch(accountEmail, queue, remainingQueue);
      }

      // 2. Fetch fresh list from server
      const [expensesResult, meResult] = await Promise.all([
        api.listExpenses(token),
        api.me(token),
      ]);

      if (!sessionIsCurrent()) return;

      if (expensesResult.ok) {
        const remote: Expense[] = expensesResult.expenses.map((e) => ({
          ...e,
          date: e.date,
          category: e.category as Category,
          payment: e.payment as Payment,
        }));

        // Preserve any local un-synced expenses (starting with local-)
        setExpenses((current) => {
          if (!sessionIsCurrent()) return current;
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
      if (sessionIsCurrent()) setSyncError("Working offline. Records are saved locally.");
    } finally {
      setSyncing(false);
      isSyncingRef.current = false;
      if (!sessionIsCurrent()) {
        Promise.resolve().then(() => refreshExpensesRef.current());
      }
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
      loadedAccountKeyRef.current = null;
      setHydratedKey(null);
      setSyncError(null);
      setExpenses([]);
      setBudgetState(5000);
      setCustomCategories([]);
      return;
    }

    if (loadedAccountKeyRef.current !== accountEmail) {
      // Clear the previous account before reading this account's cache. The tab
      // screens stay in their loading state until the new cache is hydrated.
      setHydratedKey(null);
      setSyncError(null);
      setExpenses([]);
      setCustomCategories([]);
      setBudgetState(
        account && Number.isFinite(account.budget) && account.budget >= 0 ? account.budget : 5000
      );
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
          const parsedBudget = cachedBudget === null ? NaN : Number(cachedBudget);
          if (Number.isFinite(parsedBudget) && parsedBudget >= 0) {
            setBudgetState(parsedBudget);
          } else if (account && Number.isFinite(account.budget) && account.budget >= 0) {
            setBudgetState(account.budget);
          } else {
            setBudgetState(5000);
          }

          if (cachedExpenses) {
            try {
              const parsed: unknown = JSON.parse(cachedExpenses);
              if (Array.isArray(parsed)) setExpenses(parsed.filter(isStoredExpense));
            } catch {
              // Ignore corrupted cache
            }
          }

          if (cachedCustomCats) {
            try {
              const parsedCats: unknown = JSON.parse(cachedCustomCats);
              if (Array.isArray(parsedCats)) setCustomCategories(parsedCats.filter(isCustomCategory));
            } catch {
              // Ignore corrupted cache
            }
          }
        }
      } catch {
        // Disk read fallback
      } finally {
        if (mounted) {
          loadedAccountKeyRef.current = accountEmail;
          setHydratedKey(accountEmail);
        }
      }

      // 2. Sync with remote server if online in the background without unmounting hydrated state
      if (!mounted) return;
      await refreshExpensesRef.current();
    })();

    return () => {
      mounted = false;
    };
  }, [accountEmail, token, account?.budget]);

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
      const normDate = getExpenseDateKey(expense.date);
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
      const safeValue = Math.max(0, Number.isFinite(value) ? Math.round(value) : 0);
      setBudgetState(safeValue);

      if (accountEmail) {
        AsyncStorage.setItem(STORAGE_KEYS.userBudget(accountEmail), String(safeValue)).catch(() => undefined);
        if (account) {
          refreshAccount({ ...account, budget: safeValue });
        }
      }

      if (token && accountEmail && !token.startsWith("local-token-")) {
        api
          .updateBudget(token, safeValue)
          .then((result) => {
            if (!result.ok) addToSyncQueue(accountEmail, { action: "budget", value: safeValue });
          })
          .catch(() => {
            addToSyncQueue(accountEmail, { action: "budget", value: safeValue });
          });
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

      const sessionIsCurrent = () =>
        activeSessionRef.current.email === accountEmail && activeSessionRef.current.token === token;
      pendingCreateIdsRef.current.add(localId);
      pendingCreateDataRef.current.set(localId, sanitized);

      // Keep edits and deletes made before the create request completes attached to this record.
      api
        .createExpense(token, sanitized)
        .then(async (result) => {
          const latestData = pendingCreateDataRef.current.get(localId) ?? sanitized;
          const wasCancelled = cancelledCreateIdsRef.current.delete(localId);

          if (wasCancelled) {
            if (result.ok) await deleteRemoteExpenseOrQueue(accountEmail, token, result.expense.id);
            return;
          }

          if (result.ok) {
            const syncedExpense: Expense = {
              ...result.expense,
              ...latestData,
              id: result.expense.id,
              category: latestData.category as Category,
              payment: latestData.payment as Payment,
            };
            if (sessionIsCurrent()) {
              setExpenses((current) =>
                current.map((item) => (item.id === localId ? syncedExpense : item))
              );
            }

            if (JSON.stringify(latestData) !== JSON.stringify(sanitized)) {
              try {
                const updateResult = await api.updateExpense(token, result.expense.id, latestData);
                if (!updateResult.ok) {
                  await addToSyncQueue(accountEmail, {
                    action: "update",
                    id: result.expense.id,
                    data: latestData,
                  });
                }
              } catch {
                await addToSyncQueue(accountEmail, {
                  action: "update",
                  id: result.expense.id,
                  data: latestData,
                });
              }
            }
          } else {
            // Server sync failed: KEEP the expense locally, queue it for next sync!
            await addToSyncQueue(accountEmail, { action: "create", tempId: localId, data: latestData });
          }
        })
        .catch(async () => {
          const wasCancelled = cancelledCreateIdsRef.current.delete(localId);
          const latestData = pendingCreateDataRef.current.get(localId) ?? sanitized;
          if (wasCancelled) return;
          // Network failed: KEEP the expense locally, queue it for next sync!
          await addToSyncQueue(accountEmail, { action: "create", tempId: localId, data: latestData });
        })
        .finally(() => {
          pendingCreateIdsRef.current.delete(localId);
          pendingCreateDataRef.current.delete(localId);
        });
    },
    [token, accountEmail]
  );

  const addExpenses = useCallback(
    (items: NewExpenseData[]) => {
      if (items.length === 0) return;
      const created = items.map((item) => ({
        ...sanitizeExpense(item),
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      }));
      setExpenses((current) => [...created, ...current]);

      if (!token || !accountEmail || token.startsWith("local-token-")) return;

      mutateSyncQueue(accountEmail, (queue) => [
        ...queue,
        ...created.map(({ id, ...data }) => ({ action: "create" as const, tempId: id, data })),
      ]).then(() => refreshExpensesRef.current());
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
        if (pendingCreateIdsRef.current.has(id)) {
          pendingCreateDataRef.current.set(id, sanitized);
          return;
        }
        mutateSyncQueue(accountEmail, (queue) =>
          queue.map((q) =>
            q.action === "create" && q.tempId === id ? { ...q, data: sanitized } : q
          )
        );
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
        if (pendingCreateIdsRef.current.has(id)) {
          cancelledCreateIdsRef.current.add(id);
        }
        mutateSyncQueue(accountEmail, (queue) =>
          queue.filter((item) => !(item.action === "create" && item.tempId === id))
        );
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
      addExpenses,
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
      addExpenses,
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
