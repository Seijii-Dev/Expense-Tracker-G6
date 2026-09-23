import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-store";

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
const today = getPhilippinesDate();

type ExpenseContextValue = {
  expenses: Expense[];
  budget: number;
  setBudget: (value: number) => void;
  addExpense: (expense: Omit<Expense, "id">) => void;
  removeExpense: (id: string) => void;
  monthTotal: number;
  todayTotal: number;
  remaining: number;
  budgetPercent: number;
  sortedExpenses: Expense[];
};

const ExpenseContext = createContext<ExpenseContextValue | null>(null);

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const { account } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budget, setBudgetState] = useState(5000);
  const storageKey = account ? `expense-tracker:${account.email}` : null;

  useEffect(() => {
    if (!storageKey) { setExpenses([]); setBudgetState(5000); return; }
    setExpenses([]);
    setBudgetState(5000);
    AsyncStorage.multiGet([`${storageKey}:expenses`, `${storageKey}:budget`]).then(([expensePair, budgetPair]) => {
      if (expensePair[1]) setExpenses(JSON.parse(expensePair[1]));
      if (budgetPair[1]) setBudgetState(Number(budgetPair[1]));
    }).catch(() => undefined);
  }, [storageKey]);

  useEffect(() => { if (storageKey) AsyncStorage.setItem(`${storageKey}:expenses`, JSON.stringify(expenses)).catch(() => undefined); }, [expenses, storageKey]);
  useEffect(() => { if (storageKey) AsyncStorage.setItem(`${storageKey}:budget`, String(budget)).catch(() => undefined); }, [budget, storageKey]);

  const monthExpenses = expenses.filter((expense) => expense.date.startsWith(getPhilippinesMonth()));
  const monthTotal = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const todayTotal = expenses.filter((expense) => expense.date === today).reduce((sum, expense) => sum + expense.amount, 0);
  const remaining = Math.max(0, budget - monthTotal);
  const budgetPercent = Math.min(100, Math.round((monthTotal / budget) * 100));
  const sortedExpenses = [...expenses].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));

  const value = useMemo(() => ({ expenses, budget, setBudget: setBudgetState, addExpense: (expense: Omit<Expense, "id">) => setExpenses((current) => [{ ...expense, id: String(Date.now()) }, ...current]), removeExpense: (id: string) => setExpenses((current) => current.filter((expense) => expense.id !== id)), monthTotal, todayTotal, remaining, budgetPercent, sortedExpenses }), [expenses, budget, monthTotal, todayTotal, remaining, budgetPercent, sortedExpenses]);

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>;
}

export function useExpenses() {
  const value = useContext(ExpenseContext);
  if (!value) throw new Error("useExpenses must be used inside ExpenseProvider");
  return value;
}

export const CURRENT_DATE = today;
