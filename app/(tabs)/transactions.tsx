import React, { useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { ExpenseRow } from "@/components/ui/expense-row";
import { EmptyState } from "@/components/ui/empty-state";
import { ExpenseModal } from "@/components/expense-modal";
import { Category, Expense, useExpenses } from "@/lib/expense-store";
import { useTheme } from "@/lib/theme-store";
import { formatMoney } from "@/lib/formatters";

type SortOption = "newest" | "oldest" | "highest" | "lowest";

const categories: ("All" | Category)[] = [
  "All",
  "Food",
  "Transport",
  "School",
  "Shopping",
  "Bills",
  "Fun",
  "Health",
  "Other",
];

export default function TransactionsScreen() {
  const { sortedExpenses, removeExpense, updateExpense, refreshExpenses, syncing } = useExpenses();
  const { colors } = useTheme();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"All" | Category>("All");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Filter and sort expenses
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = sortedExpenses.filter((expense) => {
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
  }, [sortedExpenses, query, category, sortBy]);

  const total = filtered.reduce((sum, expense) => sum + (expense.amount || 0), 0);

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={syncing}
            onRefresh={refreshExpenses}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <Text style={styles.kicker}>YOUR MONEY TRAIL</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Transactions<Text style={styles.dot}>.</Text>
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Every peso has a place. Keep the record clear and organized.
        </Text>

        {/* Summary banner */}
        <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.summaryCol}>
            <Text style={[styles.summaryLabel, { color: colors.subtle }]}>SHOWING</Text>
            <Text style={[styles.summaryValue, { color: colors.foreground }]}>{filtered.length} records</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.summaryCol}>
            <Text style={[styles.summaryLabel, { color: colors.subtle }]}>FILTERED TOTAL</Text>
            <Text style={[styles.summaryValue, { color: colors.foreground }]}>{formatMoney(total)}</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search" size={17} color={colors.subtle} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search note, category, payment, or amount…"
            placeholderTextColor={colors.subtle}
            style={[styles.searchInput, { color: colors.foreground }]}
          />
          {query.length > 0 && (
            <Pressable
              hitSlop={8}
              onPress={() => {
                Haptics.selectionAsync();
                setQuery("");
              }}
            >
              <Ionicons name="close-circle" size={18} color={colors.subtle} />
            </Pressable>
          )}
        </View>

        {/* Sort Bar */}
        <View style={styles.sortRow}>
          <Text style={[styles.filterLabel, { color: colors.subtle }]}>SORT BY:</Text>
          {(
            [
              { key: "newest", label: "Newest" },
              { key: "oldest", label: "Oldest" },
              { key: "highest", label: "Highest ₱" },
              { key: "lowest", label: "Lowest ₱" },
            ] as const
          ).map((opt) => (
            <Pressable
              key={opt.key}
              onPress={() => {
                Haptics.selectionAsync();
                setSortBy(opt.key);
              }}
              style={[
                styles.sortChip,
                { borderColor: colors.border, backgroundColor: colors.surface },
                sortBy === opt.key && styles.sortChipActive,
              ]}
            >
              <Text
                style={[
                  styles.sortChipText,
                  { color: colors.muted },
                  sortBy === opt.key && styles.sortChipTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Category Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {categories.map((item) => (
            <Pressable
              key={item}
              onPress={() => {
                Haptics.selectionAsync();
                setCategory(item);
              }}
              style={[
                styles.chip,
                { borderColor: colors.border, backgroundColor: colors.surface },
                category === item && styles.chipActive,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: colors.muted },
                  category === item && styles.chipTextActive,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Transactions List */}
        {filtered.length > 0 ? (
          <View style={[styles.list, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {filtered.map((expense) => (
              <ExpenseRow
                key={expense.id}
                expense={expense}
                onEdit={() => setEditingExpense(expense)}
                onDelete={() => removeExpense(expense.id)}
              />
            ))}
          </View>
        ) : (
          <View style={[styles.emptyContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <EmptyState
              icon="receipt-outline"
              title="No records found"
              description={
                query || category !== "All"
                  ? "No transactions match your search or filter. Try clearing filters."
                  : "You haven't logged any transactions yet."
              }
            />
            {(query || category !== "All") && (
              <Pressable
                onPress={() => {
                  setQuery("");
                  setCategory("All");
                }}
                style={styles.resetBtn}
              >
                <Text style={styles.resetBtnText}>Clear all filters</Text>
              </Pressable>
            )}
          </View>
        )}
      </ScrollView>

      {/* Edit Expense Modal */}
      <ExpenseModal
        visible={editingExpense !== null}
        initialExpense={editingExpense}
        onClose={() => setEditingExpense(null)}
        onSubmit={(data) => {
          if (editingExpense) {
            updateExpense(editingExpense.id, data);
          }
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: 12, paddingBottom: 32 },
  kicker: { color: "#EB6F61", fontSize: 10, fontWeight: "800", letterSpacing: 1.4 },
  title: { fontFamily: "Fraunces_700Bold", fontSize: 32, fontWeight: "700", letterSpacing: -1.2, marginTop: 6 },
  dot: { color: "#EB6F61" },
  subtitle: { fontSize: 12, marginTop: 4 },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 20,
    marginBottom: 16,
  },
  summaryCol: { alignItems: "center" },
  summaryLabel: { fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  summaryValue: { fontFamily: "Fraunces_700Bold", fontSize: 20, fontWeight: "700", marginTop: 4 },
  divider: { width: 1, height: 32 },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 46,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 12 },
  sortRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
    marginBottom: 10,
  },
  filterLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginRight: 4,
  },
  sortChip: {
    height: 28,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 7,
    borderWidth: 1,
  },
  sortChipActive: {
    borderColor: "#F2B8B0",
    backgroundColor: "#FFF0ED",
  },
  sortChipText: { fontSize: 10, fontWeight: "600" },
  sortChipTextActive: { color: "#EB6F61", fontWeight: "700" },
  chips: { gap: 8, paddingBottom: 6 },
  chip: {
    height: 32,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
  },
  chipActive: { borderColor: "#F2B8B0", backgroundColor: "#FFF0ED" },
  chipText: { fontSize: 11, fontWeight: "500" },
  chipTextActive: { color: "#EB6F61", fontWeight: "700" },
  list: {
    marginTop: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  emptyContainer: {
    marginTop: 16,
    paddingVertical: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
  },
  resetBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#FFF0ED",
    marginTop: 4,
  },
  resetBtnText: {
    color: "#EB6F61",
    fontSize: 11,
    fontWeight: "700",
  },
});
