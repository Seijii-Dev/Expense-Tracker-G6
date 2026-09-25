import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-store";
import { api } from "@/lib/api-client";
import { Category, Expense, NewExpenseData, Payment } from "@/types/expense";
import { CATEGORY_META } from "@/constants/categories";
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
};

const ExpenseContext = createContext<ExpenseContextValue | null>(null);

function sanitizeExpense(expense: NewExpenseData): NewExpenseData {
  return {
    ...expense,
    amount: Math.max(0.01, isNaN(expense.amount) ? 0 : Math.round(expense.amount * 100) / 100),
    date: normalizeDate(expense.date),
  };
}

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const { account, token, refreshAccount } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budget, setBudgetState] = useState(5000);
  const [hydratedKey, setHydratedKey] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const accountKey = account ? account.email : null;
  const hydrated = accountKey !== null && hydratedKey === accountKey;

  const refreshExpenses = async () => {
    if (!token || !account) return;
    setSyncing(true);
    try {
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
        setExpenses(remote);
        AsyncStorage.setItem(STORAGE_KEYS.userCache(account.email), JSON.stringify(remote)).catch(() => undefined);
        setSyncError(null);
      } else {
        setSyncError(expensesResult.message);
      }

      if (meResult.ok) {
        setBudgetState(meResult.account.budget);
        refreshAccount(meResult.account);
      }
    } catch {
      setSyncError("Unable to refresh latest expenses from server.");
    } finally {
      setSyncing(false);
    }
  };

  // On login (or account switch): load cache first, then sync fresh data from server
  useEffect(() => {
    let mounted = true;
    setHydratedKey(null);
    setSyncError(null);
    if (!account || !token) {
      setExpenses([]);
      setBudgetState(5000);
      return;
    }

    setBudgetState(account.budget);

    (async () => {
      // 1. Read cached data first so UI renders instantly
      try {
        const cached = await AsyncStorage.getItem(STORAGE_KEYS.userCache(account.email));
        if (mounted && cached) {
          try {
            const parsed = JSON.parse(cached);
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
      } catch {
        // Disk read error fallback
      } finally {
        if (mounted) setHydratedKey(account.email);
      }

      // 2. Fetch latest state from server in background without being overwritten by cache
      if (!mounted) return;
      await refreshExpenses();
    })();

    return () => {
      mounted = false;
    };
  }, [account?.email, token]);

  // Keep the local cache fresh whenever expenses change after hydration
  useEffect(() => {
    if (hydrated && account) {
      AsyncStorage.setItem(STORAGE_KEYS.userCache(account.email), JSON.stringify(expenses)).catch(() => undefined);
    }
  }, [expenses, hydrated, account?.email]);

  const currentDate = getPhilippinesDate();
  const currentMonth = getPhilippinesMonth();
  const monthExpenses = expenses.filter((expense) => normalizeDate(expense.date).startsWith(currentMonth));
  const monthTotal = monthExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const todayTotal = expenses
    .filter((expense) => normalizeDate(expense.date) === currentDate)
    .reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const remaining = Math.max(0, budget - monthTotal);
  const budgetPercent = budget > 0 ? Math.min(100, Math.round((monthTotal / budget) * 100)) : 0;
  const sortedExpenses = [...expenses].sort((a, b) => {
    const dateComp = (b.date || "").localeCompare(a.date || "");
    if (dateComp !== 0) return dateComp;
    return (b.id || "").localeCompare(a.id || "");
  });

  const value = useMemo(
    () => ({
      expenses,
      hydrated,
      syncing,
      syncError,
      budget,

      setBudget: (value: number) => {
        const safeValue = Math.max(0, isNaN(value) ? 0 : Math.round(value));
        setBudgetState(safeValue);
        if (token) {
          api.updateBudget(token, safeValue).then((result) => {
            if (!result.ok) setSyncError(result.message);
          });
        }
      },

      addExpense: (expense: NewExpenseData) => {
        const sanitized = sanitizeExpense(expense);
        const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        setExpenses((current) => [{ ...sanitized, id: tempId }, ...current]);
        if (!token) return;
        api.createExpense(token, sanitized).then((result) => {
          if (result.ok) {
            setExpenses((current) =>
              current.map((item) =>
                item.id === tempId
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
            setExpenses((current) => current.filter((item) => item.id !== tempId));
            setSyncError(result.message);
          }
        });
      },

      updateExpense: (id: string, expense: NewExpenseData) => {
        const sanitized = sanitizeExpense(expense);
        let previous: Expense | undefined;
        setExpenses((current) => {
          previous = current.find((item) => item.id === id);
          return current.map((item) => (item.id === id ? { ...sanitized, id } : item));
        });
        if (!token) return;
        api.updateExpense(token, id, sanitized).then((result) => {
          if (!result.ok) {
            setSyncError(result.message);
            if (previous) {
              setExpenses((current) => current.map((item) => (item.id === id ? previous! : item)));
            }
          }
        });
      },

      removeExpense: (id: string) => {
        let previousItem: Expense | undefined;
        let previousIndex = -1;
        setExpenses((current) => {
          previousIndex = current.findIndex((item) => item.id === id);
          previousItem = current[previousIndex];
          return current.filter((expense) => expense.id !== id);
        });
        if (!token) return;
        api.deleteExpense(token, id).then((result) => {
          if (!result.ok) {
            setSyncError(result.message);
            if (previousItem) {
              setExpenses((current) => {
                const next = [...current];
                if (previousIndex >= 0 && previousIndex <= next.length) {
                  next.splice(previousIndex, 0, previousItem!);
                  return next;
                }
                return [previousItem!, ...current];
              });
            }
          }
        });
      },

      monthTotal,
      todayTotal,
      remaining,
      budgetPercent,
      sortedExpenses,
      refreshExpenses,
    }),
    [expenses, hydrated, syncing, syncError, budget, token, monthTotal, todayTotal, remaining, budgetPercent, sortedExpenses, refreshExpenses]
  );

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>;
}

export function useExpenses() {
  const value = useContext(ExpenseContext);
  if (!value) throw new Error("useExpenses must be used inside ExpenseProvider");
  return value;
}
