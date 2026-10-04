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
import { formatDate, formatMoney } from "@/utils/formatters";
import { useFilteredExpenses } from "@/hooks/useFilteredExpenses";
import { TransactionsSkeleton } from "@/components/ui/transactions-skeleton";
import { DatePickerModal } from "@/components/common/date-picker-modal";
import { addCalendarDays, getExpenseDateKey, getPhilippinesDate } from "@/utils/date";

export default function TransactionsScreen() {
  const { sortedExpenses, removeExpense, updateExpense, addExpense, refreshExpenses, syncing, hydrated } = useExpenses();
  const { colors, dark } = useTheme();

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSortFilter, setShowSortFilter] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const todayDate = getPhilippinesDate();

  const {
    query,
    setQuery,
    category,
    setCategory,
    sortBy,
    setSortBy,
    filtered,
    total,
    resetFilters: resetTextFilters,
    hasActiveFilters,
  } = useFilteredExpenses(sortedExpenses, selectedDate);

  const resetFilters = useCallback(() => {
    resetTextFilters();
    setSelectedDate(null);
  }, [resetTextFilters]);

  const navigateDate = useCallback(
    (direction: -1 | 1) => {
      const base = selectedDate ?? addCalendarDays(todayDate, -1);
      const nextDate = addCalendarDays(base, direction);
      setSelectedDate(nextDate > todayDate ? todayDate : nextDate);
    },
    [selectedDate, todayDate]
  );

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

  const summaryLabel = selectedDate
    ? `${formatDate(selectedDate).toUpperCase()} SUMMARY`
    : "ALL DATES SUMMARY";
  const hasTransactionsForSelectedDate = selectedDate
    ? sortedExpenses.some((expense) => getExpenseDateKey(expense.date) === selectedDate)
    : false;

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
              subtitle="Track and manage your expenses"
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

        {/* Search Bar with filter toggle */}
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search transactions..."
          onPressFilter={() => setShowSortFilter((prev) => !prev)}
          hasActiveFilters={hasActiveFilters}
        />

        <View style={styles.dateFilterBlock}>
          <View style={styles.dateNavigator}>
            <Pressable
              style={styles.dateArrow}
              onPress={() => navigateDate(-1)}
              accessibilityRole="button"
              accessibilityLabel="Show previous day"
            >
              <Ionicons name="chevron-back" size={18} color={colors.muted} />
            </Pressable>
            <Pressable
              style={[styles.datePickerButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => setShowDatePicker(true)}
              accessibilityRole="button"
              accessibilityLabel={
                selectedDate
                  ? `Choose date, currently ${formatDate(selectedDate)}`
                  : "Choose a date, currently showing all dates"
              }
            >
              <Ionicons name="calendar-outline" size={16} color={colors.primary} />
              <Text style={[styles.datePickerText, { color: colors.foreground }]} numberOfLines={1}>
                {selectedDate ? formatDate(selectedDate) : "All dates"}
              </Text>
              <Ionicons name="chevron-down" size={15} color={colors.muted} />
            </Pressable>
            <Pressable
              style={[styles.dateArrow, (!selectedDate || selectedDate >= todayDate) && styles.disabledDateArrow]}
              onPress={() => navigateDate(1)}
              disabled={!selectedDate || selectedDate >= todayDate}
              accessibilityRole="button"
              accessibilityLabel="Show next day"
              accessibilityState={{ disabled: !selectedDate || selectedDate >= todayDate }}
            >
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Pressable>
          </View>
          <View style={styles.dateActions}>
            {selectedDate !== todayDate && (
              <Pressable
                onPress={() => setSelectedDate(todayDate)}
                accessibilityRole="button"
                style={styles.dateAction}
              >
                <Text style={[styles.dateActionText, { color: colors.primary }]}>Today</Text>
              </Pressable>
            )}
            {selectedDate && (
              <Pressable
                onPress={() => setSelectedDate(null)}
                accessibilityRole="button"
                style={styles.dateAction}
              >
                <Text style={[styles.dateActionText, { color: colors.muted }]}>All dates</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Category Filter Chips */}
        <View style={{ marginTop: 10 }}>
          <CategoryChips selected={category} onSelect={setCategory} />
        </View>

        {/* Sort/Filter options toggle */}
        {showSortFilter && (
          <View style={{ marginTop: 8 }}>
            <SortSelector selected={sortBy} onSelect={setSortBy} />
          </View>
        )}

        {/* Summary Card matching Mockup Screen 2 */}
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
            <Text style={[styles.summaryKicker, { color: colors.muted }]}>
              {summaryLabel}
            </Text>
            <Text style={[styles.summarySubLabel, { color: colors.subtle }]}>Transactions</Text>
            <Text style={[styles.summaryValue, { color: colors.foreground }]}>
              {filtered.length}
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.summaryCol}>
            <Text style={[styles.summaryKicker, { color: colors.muted }]}>TOTAL EXPENSE</Text>
            <Text style={[styles.summarySubLabel, { color: colors.subtle }]}>
              {category === "All" ? "All Categories" : category}
            </Text>
            <Text style={[styles.summaryValue, { color: colors.foreground }]}>
              {formatMoney(total)}
            </Text>
          </View>
        </View>

        {filtered.length > 0 && <View style={styles.listHeaderGap} />}
      </View>
    ),
    [category, colors, dark, filtered.length, hasActiveFilters, navigateDate, query, selectedDate, setCategory, setQuery, setSortBy, showSortFilter, sortBy, summaryLabel, todayDate, total]
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
          title={
            selectedDate && !hasTransactionsForSelectedDate
              ? "No records for this date"
              : hasActiveFilters
                ? "No matching records"
                : "No records found"
          }
          description={
            hasActiveFilters
              ? selectedDate
                ? hasTransactionsForSelectedDate
                  ? `No transactions on ${formatDate(selectedDate)} match your search or category filter.`
                  : `No transactions were recorded on ${formatDate(selectedDate)}. Try another date or clear filters.`
                : "No transactions match your search or category filter. Try clearing filters."
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
    [colors.border, colors.primary, colors.primarySoft, colors.surface, dark, hasActiveFilters, hasTransactionsForSelectedDate, resetFilters, selectedDate]
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
      <DatePickerModal
        visible={showDatePicker}
        selectedDate={selectedDate}
        maxDate={todayDate}
        onClose={() => setShowDatePicker(false)}
        onSelect={(date) => {
          setSelectedDate(date);
          setShowDatePicker(false);
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingTop: 12,
    paddingBottom: 96,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 8,
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
    marginTop: 14,
    marginBottom: 16,
  },
  summaryCol: {
    flex: 1,
    alignItems: "center",
  },
  summaryKicker: {
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  summarySubLabel: {
    fontSize: 11,
    fontWeight: "500",
    marginBottom: 4,
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
  dateFilterBlock: {
    marginTop: 14,
  },
  dateNavigator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  dateArrow: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  disabledDateArrow: {
    opacity: 0.35,
  },
  datePickerButton: {
    flex: 1,
    minWidth: 120,
    height: 42,
    paddingHorizontal: 12,
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  datePickerText: {
    fontSize: 13,
    fontWeight: "700",
    flexShrink: 1,
  },
  dateActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 18,
    marginTop: 4,
    minHeight: 24,
  },
  dateAction: {
    minHeight: 28,
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  dateActionText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
