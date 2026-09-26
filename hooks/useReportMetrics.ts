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

export function useReportMetrics(expenses: Expense[], customCategoryList?: string[]) {
  const currentMonth = getPhilippinesMonth();

  const monthExpenses = useMemo(
    () => expenses.filter((expense) => normalizeDate(expense.date).startsWith(currentMonth)),
    [expenses, currentMonth]
  );

  const monthTotal = useMemo(
    () => monthExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0),
    [monthExpenses]
  );

  const { categoryTotals, paymentTotals } = useMemo(() => {
    const catMap = new Map<Category, number>();
    const baseCats = customCategoryList && customCategoryList.length > 0 ? customCategoryList : CATEGORIES;
    for (const cat of baseCats) {
      catMap.set(cat, 0);
    }

    const payMap = new Map<Payment, number>();
    for (const pay of PAYMENT_METHODS) {
      payMap.set(pay, 0);
    }

    for (const expense of monthExpenses) {
      const amount = expense.amount || 0;
      if (expense.category) {
        catMap.set(expense.category, (catMap.get(expense.category) || 0) + amount);
      }
      if (expense.payment && payMap.has(expense.payment)) {
        payMap.set(expense.payment, (payMap.get(expense.payment) || 0) + amount);
      }
    }

    const cats: CategoryTotal[] = Array.from(catMap.entries())
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);

    const pays: PaymentTotal[] = Array.from(payMap.entries())
      .filter(([, total]) => total > 0)
      .map(([payment, total]) => ({ payment, total }))
      .sort((a, b) => b.total - a.total);

    return { categoryTotals: cats, paymentTotals: pays };
  }, [monthExpenses, customCategoryList]);

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
