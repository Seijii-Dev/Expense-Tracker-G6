import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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
  const { sortedExpenses, removeExpense, updateExpense, addExpense, refreshExpenses, syncing, hydrated } = useExpenses();
  const { colors, dark } = useTheme();

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

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
      } else {
        addExpense(data);
      }
    },
    [editingExpense, updateExpense, addExpense]
  );

  const handleCloseModal = useCallback(() => {
    setEditingExpense(null);
    setShowAddModal(false);
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
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <ScreenHeader
              kicker="YOUR MONEY TRAIL"
              title="Transactions"
              subtitle="Every peso has a place. Keep the record clear and organized."
            />
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.addBtn,
              { backgroundColor: colors.primary },
              pressed && styles.pressed,
            ]}
            onPress={() => {
              try {
                Haptics.selectionAsync();
              } catch {
                // Non-fatal
              }
              setShowAddModal(true);
            }}
            accessibilityRole="button"
            accessibilityLabel="Add new expense"
          >
            <Ionicons name="add" size={17} color="#FFFFFF" />
            <Text style={styles.addBtnText}>Add</Text>
          </Pressable>
        </View>

        {/* Summary banner */}
        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowColor: dark ? "#000000" : "#0A1F1C",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: dark ? 0.35 : 0.04,
              shadowRadius: 10,
              elevation: 2,
            },
          ]}
        >
          <View style={styles.summaryCol}>
            <View style={styles.labelRow}>
              <View style={[styles.statusDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.summaryLabel, { color: colors.subtle }]}>SHOWING</Text>
              {hasActiveFilters && (
                <View style={[styles.filterBadge, { backgroundColor: colors.primarySoft }]}>
                  <Text style={[styles.filterBadgeText, { color: colors.primary }]}>Filtered</Text>
                </View>
              )}
            </View>
            <Text
              style={[styles.summaryValue, { color: colors.foreground }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {filtered.length} <Text style={{ fontSize: 13, fontFamily: "DMSans_500Medium", color: colors.muted }}>records</Text>
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.summaryCol}>
            <View style={styles.labelRow}>
              <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
              <Text style={[styles.summaryLabel, { color: colors.subtle }]}>FILTERED TOTAL</Text>
            </View>
            <Text
              style={[styles.summaryValue, { color: colors.foreground }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {formatMoney(total)}
            </Text>
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
    [category, colors, dark, filtered.length, hasActiveFilters, query, setCategory, setQuery, setSortBy, sortBy, total]
  );

  const ListEmpty = useMemo(
    () => (
      <View
        style={[
          styles.emptyContainer,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowColor: dark ? "#000000" : "#0A1F1C",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: dark ? 0.25 : 0.04,
            shadowRadius: 10,
          },
        ]}
      >
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
          <Pressable
            onPress={resetFilters}
            style={({ pressed }) => [
              styles.resetBtn,
              {
                backgroundColor: colors.primarySoft,
                borderColor: `${colors.primary}40`,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text style={[styles.resetBtnText, { color: colors.primary }]}>Clear all filters</Text>
          </Pressable>
        )}
      </View>
    ),
    [colors.border, colors.primary, colors.primarySoft, colors.surface, dark, hasActiveFilters, resetFilters]
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

      {/* Add / Edit Expense Modal */}
      <ExpenseModal
        visible={showAddModal || editingExpense !== null}
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
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  headerLeft: {
    flex: 1,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginTop: 6,
    shadowColor: "#FF6554",
    shadowOpacity: 0.28,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  addBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  filterBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  filterBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 16,
    marginBottom: 16,
  },
  summaryCol: {
    flex: 1,
    alignItems: "center",
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  summaryValue: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 22,
  },
  divider: {
    width: 1,
    height: 36,
  },
  listHeaderGap: {
    height: 16,
  },
  listItem: {
    paddingHorizontal: 16,
  },
  emptyContainer: {
    marginTop: 16,
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
  },
  resetBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
