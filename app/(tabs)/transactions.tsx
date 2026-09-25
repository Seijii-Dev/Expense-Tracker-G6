import React, { useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { ScreenHeader } from "@/components/common/screen-header";
import { ExpenseRow } from "@/components/ui/expense-row";
import { EmptyState } from "@/components/ui/empty-state";
import { ExpenseModal } from "@/components/expense-modal";
import { SearchBar } from "@/components/transactions/search-bar";
import { SortSelector } from "@/components/transactions/sort-selector";
import { CategoryChips } from "@/components/transactions/category-chips";
import { Expense } from "@/types/expense";
import { useExpenses } from "@/lib/expense-store";
import { useTheme } from "@/lib/theme-store";
import { formatMoney } from "@/utils/formatters";
import { useFilteredExpenses } from "@/hooks/useFilteredExpenses";

export default function TransactionsScreen() {
  const { sortedExpenses, removeExpense, updateExpense, refreshExpenses, syncing } = useExpenses();
  const { colors } = useTheme();

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const {
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
  } = useFilteredExpenses(sortedExpenses);

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
        <ScreenHeader
          kicker="YOUR MONEY TRAIL"
          title="Transactions"
          subtitle="Every peso has a place. Keep the record clear and organized."
        />

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
        <SearchBar value={query} onChangeText={setQuery} />

        {/* Sort Selector */}
        <SortSelector selected={sortBy} onSelect={setSortBy} />

        {/* Category Filter Chips */}
        <CategoryChips selected={category} onSelect={setCategory} />

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
                hasActiveFilters
                  ? "No transactions match your search or filter. Try clearing filters."
                  : "You haven't logged any transactions yet."
              }
            />
            {hasActiveFilters && (
              <Pressable onPress={resetFilters} style={[styles.resetBtn, { backgroundColor: colors.primarySoft }]}>
                <Text style={[styles.resetBtnText, { color: colors.primary }]}>Clear all filters</Text>
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
  scroll: {
    paddingTop: 12,
    paddingBottom: 32,
  },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 14,
    marginBottom: 16,
  },
  summaryCol: {
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },
  summaryValue: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 32,
  },
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
    marginTop: 4,
  },
  resetBtnText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
