import { useCallback, useMemo, useState } from "react";
import { Category, Expense } from "@/types/expense";

export type SortOption = "newest" | "oldest" | "highest" | "lowest";

export function useFilteredExpenses(expenses: Expense[]) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"All" | Category>("All");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = expenses.filter((expense) => {
      const matchCategory = category === "All" || expense.category === category;
      if (!matchCategory) return false;
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
  }, [expenses, query, category, sortBy]);

  const total = useMemo(
    () => filtered.reduce((sum, expense) => sum + (expense.amount || 0), 0),
    [filtered]
  );

  const resetFilters = useCallback(() => {
    setQuery("");
    setCategory("All");
  }, []);

  const hasActiveFilters = query.length > 0 || category !== "All";

  return {
    query,
    setQuery,
    category,
    setCategory,
    sortBy,
    setSortBy,
    filtered,
    total,
    resetFilters,
    hasActiveFilters,
  };
}
