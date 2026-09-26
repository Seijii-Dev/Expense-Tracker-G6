import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
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
import { Expense, NewExpenseData } from "@/types/expense";
import { useExpenses } from "@/lib/expense-store";
import { useTheme } from "@/lib/theme-store";
import { formatMoney } from "@/utils/formatters";
import { useFilteredExpenses } from "@/hooks/useFilteredExpenses";
import { TransactionsSkeleton } from "@/components/ui/transactions-skeleton";

export default function TransactionsScreen() {
  const { sortedExpenses, removeExpense, updateExpense, refreshExpenses, syncing, hydrated } = useExpenses();
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

  const handleModalSubmit = useCallback(
    (data: NewExpenseData) => {
      if (editingExpense) {
        updateExpense(editingExpense.id, data);
      }
    },
    [editingExpense, updateExpense]
  );

  const handleCloseModal = useCallback(() => {
    setEditingExpense(null);
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: Expense; index: number }) => {
      const isFirst = index === 0;
      const isLast = index === filtered.length - 1;
      return (
        <View
          style={[
            styles.listItem,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderTopWidth: isFirst ? 1 : 0,
              borderBottomWidth: 1,
              borderLeftWidth: 1,
              borderRightWidth: 1,
              borderTopLeftRadius: isFirst ? 16 : 0,
              borderTopRightRadius: isFirst ? 16 : 0,
              borderBottomLeftRadius: isLast ? 16 : 0,
              borderBottomRightRadius: isLast ? 16 : 0,
            },
          ]}
        >
          <ExpenseRow
            expense={item}
            onEdit={() => setEditingExpense(item)}
            onDelete={() => removeExpense(item.id)}
          />
        </View>
      );
    },
    [colors.border, colors.surface, filtered.length, removeExpense]
  );

  const keyExtractor = useCallback((item: Expense) => item.id, []);

  const ListHeader = useMemo(
    () => (
      <View>
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

        {filtered.length > 0 && <View style={styles.listHeaderGap} />}
      </View>
    ),
    [category, colors, filtered.length, query, setCategory, setQuery, setSortBy, sortBy, total]
  );

  const ListEmpty = useMemo(
    () => (
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
    ),
    [colors.border, colors.primary, colors.primarySoft, colors.surface, hasActiveFilters, resetFilters]
  );

  if (!hydrated) {
    return (
      <ScreenContainer>
        <TransactionsSkeleton />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        initialNumToRender={12}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews
        refreshControl={
          <RefreshControl
            refreshing={syncing}
            onRefresh={refreshExpenses}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />

      {/* Edit Expense Modal */}
      <ExpenseModal
        visible={editingExpense !== null}
        initialExpense={editingExpense}
        onClose={handleCloseModal}
        onSubmit={handleModalSubmit}
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
  listHeaderGap: {
    height: 14,
  },
  listItem: {
    paddingHorizontal: 16,
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
