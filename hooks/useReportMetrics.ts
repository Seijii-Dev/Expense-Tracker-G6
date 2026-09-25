import { useMemo } from "react";
import { Category, Expense, Payment } from "@/types/expense";
import { CATEGORIES, PAYMENT_METHODS } from "@/constants/categories";
import { getPhilippinesMonth, normalizeDate } from "@/utils/date";

export type CategoryTotal = {
  category: Category;
  total: number;
};

export type PaymentTotal = {
  payment: Payment;
  total: number;
};

export function useReportMetrics(expenses: Expense[]) {
  const currentMonth = getPhilippinesMonth();

  const monthExpenses = useMemo(
    () => expenses.filter((expense) => normalizeDate(expense.date).startsWith(currentMonth)),
    [expenses, currentMonth]
  );

  const monthTotal = useMemo(
    () => monthExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0),
    [monthExpenses]
  );

  const categoryTotals: CategoryTotal[] = useMemo(
    () =>
      CATEGORIES.map((category) => {
        const total = monthExpenses
          .filter((expense) => expense.category === category)
          .reduce((sum, expense) => sum + (expense.amount || 0), 0);
        return { category, total };
      }).sort((a, b) => b.total - a.total),
    [monthExpenses]
  );

  const paymentTotals: PaymentTotal[] = useMemo(
    () =>
      PAYMENT_METHODS.map((payment) => {
        const total = monthExpenses
          .filter((expense) => expense.payment === payment)
          .reduce((sum, expense) => sum + (expense.amount || 0), 0);
        return { payment, total };
      })
        .filter((item) => item.total > 0)
        .sort((a, b) => b.total - a.total),
    [monthExpenses]
  );

  const activeCategoryCount = useMemo(
    () => categoryTotals.filter((item) => item.total > 0).length,
    [categoryTotals]
  );

  const maxCategorySpend = useMemo(
    () => Math.max(...categoryTotals.map((item) => item.total), 1),
    [categoryTotals]
  );

  const topCategory = useMemo(
    () => categoryTotals.find((item) => item.total > 0) ?? null,
    [categoryTotals]
  );

  return {
    currentMonth,
    monthExpenses,
    monthTotal,
    categoryTotals,
    paymentTotals,
    activeCategoryCount,
    maxCategorySpend,
    topCategory,
  };
}
