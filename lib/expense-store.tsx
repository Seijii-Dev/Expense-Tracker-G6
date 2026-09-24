import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-store";
import { api } from "@/lib/api-client";

export type Category = "Food" | "Transport" | "School" | "Shopping" | "Bills" | "Fun" | "Health" | "Other";
export type Payment = "Cash" | "GCash" | "Card" | "Bank";
export type Expense = { id: string; amount: number; category: Category; date: string; description: string; payment: Payment };

export const categoryMeta: Record<Category, { color: string; soft: string }> = {
  Food: { color: "#EB6F61", soft: "#FFF0ED" },
  Transport: { color: "#4D8AF0", soft: "#EEF4FF" },
  School: { color: "#8A69DC", soft: "#F2EFFF" },
  Shopping: { color: "#D18B38", soft: "#FFF5E6" },
  Bills: { color: "#5A9E7E", soft: "#EDF8F1" },
  Fun: { color: "#C45BA7", soft: "#FFF0FA" },
  Health: { color: "#45A6AD", soft: "#EAF9FA" },
  Other: { color: "#82908D", soft: "#F1F4F3" },
};

export const getPhilippinesDate = (date = new Date()) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
export const getPhilippinesMonth = (date = new Date()) => getPhilippinesDate(date).slice(0, 7);

type ExpenseContextValue = {
  expenses: Expense[];
  hydrated: boolean;
  syncing: boolean;
  syncError: string | null;
  budget: number;
  setBudget: (value: number) => void;
  addExpense: (expense: Omit<Expense, "id">) => void;
  updateExpense: (id: string, expense: Omit<Expense, "id">) => void;
  removeExpense: (id: string) => void;
  monthTotal: number;
  todayTotal: number;
  remaining: number;
  budgetPercent: number;
  sortedExpenses: Expense[];
};

const ExpenseContext = createContext<ExpenseContextValue | null>(null);
const cacheKey = (email: string) => `expense-tracker:${email}:cache`;

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const { account, token, refreshAccount } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budget, setBudgetState] = useState(5000);
  const [hydratedKey, setHydratedKey] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const accountKey = account ? account.email : null;
  const hydrated = accountKey !== null && hydratedKey === accountKey;

  // On login (or account switch): show cached data instantly, then refresh from the server.
  useEffect(() => {
    let mounted = true;
    setHydratedKey(null);
    setSyncError(null);
    if (!account || !token) { setExpenses([]); setBudgetState(5000); return; }

    setBudgetState(account.budget);

    AsyncStorage.getItem(cacheKey(account.email)).then((cached) => {
      if (!mounted) return;
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) setExpenses(parsed);
        } catch {
          // Ignore corrupt cache; server sync below will replace it.
        }
      }
      setHydratedKey(account.email);
    });

    (async () => {
      setSyncing(true);
      const [expensesResult, meResult] = await Promise.all([api.listExpenses(token), api.me(token)]);
      if (!mounted) return;
      if (expensesResult.ok) {
        const remote = expensesResult.expenses.map((e) => ({ ...e, category: e.category as Category, payment: e.payment as Payment }));
        setExpenses(remote);
        AsyncStorage.setItem(cacheKey(account.email), JSON.stringify(remote)).catch(() => undefined);
        setSyncError(null);
      } else {
        // Keep showing cached data; just flag that we couldn't refresh.
        setSyncError(expensesResult.message);
      }
      if (meResult.ok) {
        setBudgetState(meResult.account.budget);
        refreshAccount(meResult.account);
      }
      setSyncing(false);
    })();

    return () => { mounted = false; };
  }, [account?.email, token]);

  // Keep the local cache fresh so re-opening the app shows the latest data instantly.
  useEffect(() => {
    if (hydrated && account) AsyncStorage.setItem(cacheKey(account.email), JSON.stringify(expenses)).catch(() => undefined);
  }, [expenses, hydrated, account?.email]);

  const currentDate = getPhilippinesDate();
  const currentMonth = getPhilippinesMonth();
  const monthExpenses = expenses.filter((expense) => expense.date.startsWith(currentMonth));
  const monthTotal = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const todayTotal = expenses.filter((expense) => expense.date === currentDate).reduce((sum, expense) => sum + expense.amount, 0);
  const remaining = Math.max(0, budget - monthTotal);
  const budgetPercent = budget > 0 ? Math.min(100, Math.round((monthTotal / budget) * 100)) : 0;
  const sortedExpenses = [...expenses].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));

  const value = useMemo(() => ({
    expenses, hydrated, syncing, syncError, budget,

    setBudget: (value: number) => {
      setBudgetState(value); // optimistic — updates immediately in the UI
      if (token) api.updateBudget(token, value).then((result) => { if (!result.ok) setSyncError(result.message); });
    },

    addExpense: (expense: Omit<Expense, "id">) => {
      // Optimistic add with a temporary id, replaced once the server confirms.
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setExpenses((current) => [{ ...expense, id: tempId }, ...current]);
      if (!token) return;
      api.createExpense(token, expense).then((result) => {
        if (result.ok) {
          setExpenses((current) => current.map((item) => (item.id === tempId ? { ...result.expense, category: result.expense.category as Category, payment: result.expense.payment as Payment } : item)));
        } else {
          setExpenses((current) => current.filter((item) => item.id !== tempId));
          setSyncError(result.message);
        }
      });
    },

    updateExpense: (id: string, expense: Omit<Expense, "id">) => {
      const previous = expenses.find((item) => item.id === id);
      setExpenses((current) => current.map((item) => (item.id === id ? { ...expense, id } : item)));
      if (!token) return;
      api.updateExpense(token, id, expense).then((result) => {
        if (!result.ok) {
          setSyncError(result.message);
          if (previous) setExpenses((current) => current.map((item) => (item.id === id ? previous : item)));
        }
      });
    },

    removeExpense: (id: string) => {
      const previous = expenses.find((item) => item.id === id);
      setExpenses((current) => current.filter((expense) => expense.id !== id));
      if (!token) return;
      api.deleteExpense(token, id).then((result) => {
        if (!result.ok) {
          setSyncError(result.message);
          if (previous) setExpenses((current) => [previous, ...current]);
        }
      });
    },

    monthTotal, todayTotal, remaining, budgetPercent, sortedExpenses,
  }), [expenses, hydrated, syncing, syncError, budget, token, monthTotal, todayTotal, remaining, budgetPercent, sortedExpenses]);

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>;
}

export function useExpenses() {
  const value = useContext(ExpenseContext);
  if (!value) throw new Error("useExpenses must be used inside ExpenseProvider");
  return value;
}
