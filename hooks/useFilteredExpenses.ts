import { useMemo, useState } from "react";
import { Category, Expense } from "@/types/expense";

export type SortOption = "newest" | "oldest" | "highest" | "lowest";

export function useFilteredExpenses(expenses: Expense[]) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"All" | Category>("All");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = expenses.filter((expense) => {
      const matchSearch =
        !q ||
        `${expense.description || ""} ${expense.category || ""} ${expense.payment || ""} ${expense.amount || ""}`
          .toLowerCase()
          .includes(q);
      const matchCategory = category === "All" || expense.category === category;
      return matchSearch && matchCategory;
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

  const resetFilters = () => {
    setQuery("");
    setCategory("All");
  };

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
