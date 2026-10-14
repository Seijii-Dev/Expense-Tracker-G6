import { useCallback, useMemo, useState } from "react";
import { Category, Expense } from "@/types/expense";
import { addCalendarDays, getExpenseDateKey, getPhilippinesDate, getPhilippinesMonth } from "@/utils/date";

export type SortOption = "newest" | "oldest" | "highest" | "lowest";
export type DateRangePreset = "all" | "today" | "week" | "month" | "last_month";

export function useFilteredExpenses(
  expenses: Expense[],
  selectedDate: string | null = null,
  initialRangePreset: DateRangePreset = "all"
) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"All" | Category>("All");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [rangePreset, setRangePreset] = useState<DateRangePreset>(initialRangePreset);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const today = getPhilippinesDate();
    const currentMonth = getPhilippinesMonth();
    const sevenDaysAgo = addCalendarDays(today, -6);

    // Compute previous month prefix: YYYY-MM
    const [currY, currM] = currentMonth.split("-").map(Number);
    const prevDate = new Date(Date.UTC(currY, currM - 2, 1));
    const prevMonthPrefix = `${prevDate.getUTCFullYear()}-${String(prevDate.getUTCMonth() + 1).padStart(2, "0")}`;

    const result = expenses.filter((expense) => {
      const matchCategory = category === "All" || expense.category === category;
      if (!matchCategory) return false;

      const dateKey = getExpenseDateKey(expense.date);

      // If a specific date is selected, it takes precedence over range preset
      if (selectedDate) {
        if (dateKey !== selectedDate) return false;
      } else if (rangePreset !== "all") {
        if (rangePreset === "today" && dateKey !== today) return false;
        if (rangePreset === "week" && (dateKey < sevenDaysAgo || dateKey > today)) return false;
        if (rangePreset === "month" && !dateKey.startsWith(currentMonth)) return false;
        if (rangePreset === "last_month" && !dateKey.startsWith(prevMonthPrefix)) return false;
      }

      if (!q) return true;

      return (
        (expense.description && expense.description.toLowerCase().includes(q)) ||
        (expense.category && expense.category.toLowerCase().includes(q)) ||
        (expense.payment && expense.payment.toLowerCase().includes(q)) ||
        String(expense.amount).includes(q)
      );
    });

    return result.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return (a.date || "").localeCompare(b.date || "") || (a.id || "").localeCompare(b.id || "");
        case "highest":
          return (b.amount || 0) - (a.amount || 0);
        case "lowest":
          return (a.amount || 0) - (b.amount || 0);
        case "newest":
        default:
          return (b.date || "").localeCompare(a.date || "") || (b.id || "").localeCompare(a.id || "");
      }
    });
  }, [expenses, query, category, sortBy, selectedDate, rangePreset]);

  const total = useMemo(
    () => filtered.reduce((sum, expense) => sum + (expense.amount || 0), 0),
    [filtered]
  );

  const resetFilters = useCallback(() => {
    setQuery("");
    setCategory("All");
    setRangePreset("all");
  }, []);

  const hasActiveFilters =
    query.length > 0 || category !== "All" || selectedDate !== null || rangePreset !== "all";

  return {
    query,
    setQuery,
    category,
    setCategory,
    sortBy,
    setSortBy,
    rangePreset,
    setRangePreset,
    filtered,
    total,
    resetFilters,
    hasActiveFilters,
  };
}
