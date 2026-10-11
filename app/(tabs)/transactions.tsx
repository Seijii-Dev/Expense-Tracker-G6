import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ScreenContainer } from "@/components/screen-container";
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
import { MotionEntrance, PressableScale } from "@/components/motion";
import { TransactionsSkeleton } from "@/components/ui/transactions-skeleton";
import { DatePickerModal } from "@/components/common/date-picker-modal";
import { addCalendarDays, getExpenseDateKey, getPhilippinesDate, getYesterdayDate } from "@/utils/date";
import { exportExpensesToCsv } from "@/utils/export-csv";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { radii, spacing, typography } from "@/constants/design-tokens";

export default function TransactionsScreen() {
  const { sortedExpenses, removeExpense, updateExpense, addExpense, refreshExpenses, syncing, hydrated } =
    useExpenses();
  const { colors, dark } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const isNarrowScreen = windowWidth < 380;

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSortFilter, setShowSortFilter] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [exportNotice, setExportNotice] = useState<{
    title: string;
    message: string;
    variant: "success" | "danger" | "warning";
  } | null>(null);

  const todayDate = getPhilippinesDate();
  const yesterdayDate = getYesterdayDate();

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

  const handleExport = async () => {
    const res = await exportExpensesToCsv(sortedExpenses, false);
    setExportNotice({
      title: res.title,
      message: res.message,
      variant: res.success ? "success" : "danger",
    });
  };

  // Group filtered expenses by date key
  const groupedExpenses = useMemo(() => {
    const groups: { dateKey: string; label: string; items: Expense[]; subtotal: number }[] = [];
    const map = new Map<string, { dateKey: string; label: string; items: Expense[]; subtotal: number }>();

    for (const exp of filtered) {
      const k = getExpenseDateKey(exp.date);
      let group = map.get(k);
      if (!group) {
        let label = formatDate(k).toUpperCase();
        if (k === todayDate) label = "TODAY";
        else if (k === yesterdayDate) label = "YESTERDAY";

        group = { dateKey: k, label, items: [], subtotal: 0 };
        map.set(k, group);
        groups.push(group);
      }
      group.items.push(exp);
      group.subtotal += exp.amount || 0;
    }

    return groups;
  }, [filtered, todayDate, yesterdayDate]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: sortedExpenses.length };
    for (const exp of sortedExpenses) {
      counts[exp.category] = (counts[exp.category] || 0) + 1;
    }
    return counts;
  }, [sortedExpenses]);

  const hasTransactionsForSelectedDate = selectedDate
    ? sortedExpenses.some((expense) => getExpenseDateKey(expense.date) === selectedDate)
    : false;

  const ListHeader = useMemo(
    () => (
      <View>
        {/* Confident Screen Header & Month Switcher */}
        <View style={[styles.screenHeaderRow, isNarrowScreen && styles.screenHeaderRowCompact]}>
          <View style={[styles.headerLeft, isNarrowScreen && styles.headerLeftCompact]}>
            <Text style={[styles.kicker, { color: colors.muted }]}>LEDGER & HISTORY</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>Records</Text>
          </View>

          <View style={[styles.headerActions, isNarrowScreen && styles.headerActionsCompact]}>
            {/* Interactive Month Selector Pill */}
            <PressableScale
              onPress={() => setShowDatePicker(true)}
              style={[
                styles.monthPickerPill,
                {
                  backgroundColor: dark ? "rgba(255,255,255,0.06)" : "#FFFFFF",
                  borderColor: colors.border,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={selectedDate ? `Choose date, currently ${formatDate(selectedDate)}` : "Choose date or month"}
            >
              <Ionicons name="calendar-outline" size={14} color={colors.primary} />
              <Text style={[styles.monthPickerText, { color: colors.foreground }]}>
                {selectedDate ? formatDate(selectedDate) : "All Dates"}
              </Text>
              <Ionicons name="chevron-down" size={13} color={colors.muted} />
            </PressableScale>

            {/* Export Document Action */}
            <PressableScale
              onPress={handleExport}
              style={[
                styles.iconActionBtn,
                {
                  backgroundColor: dark ? "rgba(255,255,255,0.06)" : "#FFFFFF",
                  borderColor: colors.border,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Export Records to CSV"
            >
              <Ionicons name="share-outline" size={18} color={colors.foreground} />
            </PressableScale>

            {/* Add Expense Action */}
            <PressableScale
              style={[
                styles.addBtn,
                { backgroundColor: colors.primary },
              ]}
              onPress={() => {
                setShowAddModal(true);
              }}
              accessibilityRole="button"
              accessibilityLabel="Add new expense"
            >
              <Ionicons name="add" size={18} color="#FFFFFF" />
            </PressableScale>
          </View>
        </View>

        {/* Search Bar */}
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search transactions, notes, or stores..."
          onPressFilter={() => setShowSortFilter((prev) => !prev)}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Date Filter & Navigator Block */}
        <View style={styles.dateFilterBlock}>
          <View style={styles.dateNavigator}>
            <Pressable
              style={styles.dateArrow}
              onPress={() => navigateDate(-1)}
              accessibilityRole="button"
              accessibilityLabel="Show previous day"
            >
              <Ionicons name="chevron-back" size={17} color={colors.muted} />
            </Pressable>
            <Pressable
              style={[
                styles.datePickerButton,
                {
                  backgroundColor: dark ? "rgba(255,255,255,0.04)" : "#FFFFFF",
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setShowDatePicker(true)}
              accessibilityRole="button"
              accessibilityLabel={
                selectedDate
                  ? `Choose date, currently ${formatDate(selectedDate)}`
                  : "Choose a date, currently showing all dates"
              }
            >
              <Ionicons name="calendar-outline" size={15} color={colors.primary} />
              <Text style={[styles.datePickerText, { color: colors.foreground }]} numberOfLines={1}>
                {selectedDate ? formatDate(selectedDate) : "All dates"}
              </Text>
              <Ionicons name="chevron-down" size={14} color={colors.muted} />
            </Pressable>
            <Pressable
              style={[styles.dateArrow, (!selectedDate || selectedDate >= todayDate) && styles.disabledDateArrow]}
              onPress={() => navigateDate(1)}
              disabled={!selectedDate || selectedDate >= todayDate}
              accessibilityRole="button"
              accessibilityLabel="Show next day"
              accessibilityState={{ disabled: !selectedDate || selectedDate >= todayDate }}
            >
              <Ionicons name="chevron-forward" size={17} color={colors.muted} />
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

        {/* Horizontal Category Filter Chips */}
        <View style={{ marginTop: 6, marginBottom: 10 }}>
          <CategoryChips selected={category} onSelect={setCategory} countMap={categoryCounts} />
        </View>

        {/* Sort selector dropdown */}
        {showSortFilter && (
          <View style={{ marginBottom: 10 }}>
            <SortSelector selected={sortBy} onSelect={setSortBy} />
          </View>
        )}

        {/* Monthly Overview Ribbon / Summary Mini-Card */}
        <MotionEntrance delay={60}>
          <View
            style={[
              styles.monthlySummaryRibbon,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.ribbonLeft}>
              <View style={[styles.ribbonIconBox, { backgroundColor: colors.primarySoft }]}>
                <Ionicons name="analytics-outline" size={18} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.ribbonLabel, { color: colors.muted }]}>
                  {selectedDate ? `${formatDate(selectedDate).toUpperCase()} TOTAL` : "FILTERED TOTAL"}
                </Text>
                <View style={styles.ribbonAmountRow}>
                  <Text style={[styles.ribbonAmount, { color: colors.foreground }]}>
                    {formatMoney(total)}
                  </Text>
                  <Text style={[styles.ribbonTxCount, { color: colors.muted }]}>
                    • {filtered.length} txns
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.ribbonBadge, { backgroundColor: dark ? "rgba(16,185,129,0.18)" : "#ECFDF5" }]}>
              <Ionicons name="wallet-outline" size={13} color={colors.success} />
              <Text style={[styles.ribbonBadgeText, { color: colors.success }]}>
                {category === "All" ? "All" : category}
              </Text>
            </View>
          </View>
        </MotionEntrance>

        <View style={{ height: 12 }} />
      </View>
    ),
    [category, categoryCounts, colors, dark, filtered.length, handleExport, hasActiveFilters, isNarrowScreen, navigateDate, query, selectedDate, setCategory, setQuery, setSortBy, showSortFilter, sortBy, todayDate, total]
  );

  const renderGroup = useCallback(
    ({ item: group }: { item: { dateKey: string; label: string; items: Expense[]; subtotal: number } }) => {
      return (
        <View style={styles.dateGroupContainer}>
          {/* Date Header Ribbon */}
          <View style={styles.dateHeaderRibbon}>
            <View style={styles.dateHeaderLeft}>
              <Text style={[styles.dateGroupLabel, { color: colors.foreground }]}>
                {group.label}
              </Text>
              <Text style={[styles.dateGroupCount, { color: colors.muted }]}>
                {group.items.length} {group.items.length === 1 ? "record" : "records"}
              </Text>
            </View>
            <Text style={[styles.dateGroupSubtotal, { color: colors.primary }]}>
              −{formatMoney(group.subtotal)}
            </Text>
          </View>

          {/* Grouped Transaction Card Surface */}
          <MotionEntrance enableLayoutTransition delay={0}>
            <View
              style={[
                styles.transactionGroupCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              {group.items.map((item, index) => (
                <View key={item.id} style={{ paddingHorizontal: 14 }}>
                  <ExpenseRow
                    expense={item}
                    onEdit={() => setEditingExpense(item)}
                    onDelete={() => removeExpense(item.id)}
                  />
                </View>
              ))}
            </View>
          </MotionEntrance>
        </View>
      );
    },
    [colors.border, colors.card, colors.foreground, colors.muted, colors.primary, removeExpense]
  );

  const ListEmpty = useMemo(
    () => (
      <View
        style={[
          styles.emptyContainer,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <EmptyState
          icon="receipt-outline"
          lottieSource={require("@/assets/lottie/empty-ledger.json")}
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
                  ? `No transactions on ${formatDate(selectedDate)} match your search or filter.`
                  : `No transactions were recorded on ${formatDate(selectedDate)}.`
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
    [colors.border, colors.card, colors.primary, colors.primarySoft, hasActiveFilters, hasTransactionsForSelectedDate, resetFilters, selectedDate]
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
        data={groupedExpenses}
        renderItem={renderGroup}
        keyExtractor={(item) => item.dateKey}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        initialNumToRender={10}
        maxToRenderPerBatch={8}
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

      {/* Date Picker Modal */}
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

      {/* Export Feedback Modal */}
      {exportNotice && (
        <ConfirmDialog
          visible={Boolean(exportNotice)}
          title={exportNotice.title}
          message={exportNotice.message}
          confirmText="Done"
          onConfirm={() => setExportNotice(null)}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingTop: spacing.sm,
    paddingBottom: 96,
  },
  screenHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  screenHeaderRowCompact: {
    flexWrap: "wrap",
    rowGap: spacing.sm,
  },
  headerLeft: {
    flex: 1,
  },
  headerLeftCompact: {
    flexBasis: "100%",
  },
  kicker: {
    fontFamily: "DMSans_700Bold",
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  title: {
    ...typography.screenTitle,
    fontSize: 24,
    lineHeight: 30,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerActionsCompact: {
    flex: 1,
    justifyContent: "flex-end",
  },
  monthPickerPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    minHeight: 40,
    paddingHorizontal: 11,
    borderRadius: radii.pill,
    borderWidth: 1,
    shadowColor: "#1A1D20",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  monthPickerText: {
    fontFamily: "DMSans_700Bold",
    fontSize: 12,
    fontWeight: "700",
  },
  iconActionBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1A1D20",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#E84A3F",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  dateFilterBlock: {
    marginTop: 10,
    marginBottom: 4,
  },
  dateNavigator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  dateArrow: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  disabledDateArrow: {
    opacity: 0.35,
  },
  datePickerButton: {
    flex: 1,
    minWidth: 120,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  datePickerText: {
    fontFamily: "DMSans_700Bold",
    fontSize: 12.5,
    fontWeight: "700",
    flexShrink: 1,
  },
  dateActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
    marginTop: 2,
    minHeight: 22,
  },
  dateAction: {
    minHeight: 24,
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  dateActionText: {
    fontSize: 11,
    fontWeight: "700",
  },
  monthlySummaryRibbon: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#1A1D20",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  ribbonLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  ribbonIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  ribbonLabel: {
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  ribbonAmountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginTop: 2,
  },
  ribbonAmount: {
    fontFamily: "DMSans_700Bold",
    fontVariant: ["tabular-nums"],
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  ribbonTxCount: {
    fontSize: 11.5,
    fontWeight: "500",
  },
  ribbonBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  ribbonBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  dateGroupContainer: {
    marginBottom: 16,
  },
  dateHeaderRibbon: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  dateHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateGroupLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  dateGroupCount: {
    fontSize: 11,
    fontWeight: "500",
  },
  dateGroupSubtotal: {
    fontSize: 12,
    fontWeight: "700",
  },
  transactionGroupCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#1A1D20",
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
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
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
