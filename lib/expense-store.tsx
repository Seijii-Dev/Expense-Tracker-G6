import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

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

const seedExpenses: Expense[] = [
  { id: "1", amount: 150, category: "Food", date: "2026-09-23", description: "Lunch at Canto", payment: "Cash" },
  { id: "2", amount: 65, category: "Transport", date: "2026-09-23", description: "Jeepney to campus", payment: "Cash" },
  { id: "3", amount: 380, category: "School", date: "2026-09-22", description: "Printing and supplies", payment: "GCash" },
  { id: "4", amount: 890, category: "Shopping", date: "2026-09-21", description: "New running shoes", payment: "Card" },
  { id: "5", amount: 120, category: "Food", date: "2026-09-20", description: "Coffee and pastry", payment: "GCash" },
  { id: "6", amount: 550, category: "Bills", date: "2026-09-19", description: "Mobile plan", payment: "Bank" },
  { id: "7", amount: 275, category: "Fun", date: "2026-09-18", description: "Movie night", payment: "Card" },
  { id: "8", amount: 90, category: "Transport", date: "2026-09-17", description: "Tricycle fare", payment: "Cash" },
];

const today = "2026-09-23";

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
  const [expenses, setExpenses] = useState<Expense[]>(seedExpenses);
  const [budget, setBudgetState] = useState(5000);

  useEffect(() => {
    AsyncStorage.multiGet(["expense-tracker-expenses", "expense-tracker-budget"]).then(([expensePair, budgetPair]) => {
      if (expensePair[1]) setExpenses(JSON.parse(expensePair[1]));
      if (budgetPair[1]) setBudgetState(Number(budgetPair[1]));
    }).catch(() => undefined);
  }, []);

  useEffect(() => { AsyncStorage.setItem("expense-tracker-expenses", JSON.stringify(expenses)).catch(() => undefined); }, [expenses]);
  useEffect(() => { AsyncStorage.setItem("expense-tracker-budget", String(budget)).catch(() => undefined); }, [budget]);

  const monthExpenses = expenses.filter((expense) => expense.date.startsWith("2026-09"));
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
