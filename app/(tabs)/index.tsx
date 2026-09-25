import React, { useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ScreenContainer } from "@/components/screen-container";
import { MetricCard } from "@/components/ui/metric-card";
import { ExpenseRow } from "@/components/ui/expense-row";
import { ExpenseModal } from "@/components/expense-modal";
import { DonutChart } from "@/components/overview/donut-chart";
import { CategoryLegend } from "@/components/overview/category-legend";
import { DailyRhythm } from "@/components/overview/daily-rhythm";
import { SpendingInsight } from "@/components/overview/spending-insight";
import { Expense } from "@/types/expense";
import { PulseDialog } from "@/components/common/pulse-dialog";
import * as Haptics from "expo-haptics";
import { useExpenses } from "@/lib/expense-store";
import { useAuth } from "@/lib/auth-store";
import { useTheme } from "@/lib/theme-store";
import { formatMoney } from "@/utils/formatters";
import {
  getFormattedMonthHeader,
  getFormattedTodayHeader,
  getPhilippinesMonth,
  getTimeGreeting,
  normalizeDate,
} from "@/utils/date";

export default function OverviewScreen() {
  const {
    hydrated,
    monthTotal,
    todayTotal,
    remaining,
    budget,
    budgetPercent,
    sortedExpenses,
    addExpense,
    updateExpense,
    removeExpense,
    refreshExpenses,
    syncing,
  } = useExpenses();
  const { account } = useAuth();
  const { colors } = useTheme();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showPulseModal, setShowPulseModal] = useState(false);

  const greeting = getTimeGreeting();
  const todayLabel = getFormattedTodayHeader();
  const monthLabel = getFormattedMonthHeader();

  const currentMonth = getPhilippinesMonth();
  const monthExpenses = useMemo(
    () => sortedExpenses.filter((expense) => normalizeDate(expense.date).startsWith(currentMonth)),
    [sortedExpenses, currentMonth]
  );

  const topCategorySummary = useMemo(() => {
    const totals = monthExpenses.reduce<Record<string, number>>(
      (map, exp) => ({ ...map, [exp.category]: (map[exp.category] || 0) + (exp.amount || 0) }),
      {}
    );
    const top = Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
    if (!top) return "No spending yet";
    return `${top[0]}  ${formatMoney(top[1])}`;
  }, [monthExpenses]);

  const showPulseAlert = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowPulseModal(true);
  };

  if (!hydrated) {
    return (
      <ScreenContainer>
        <View style={styles.loadingState}>
          <Ionicons name="sync-outline" size={26} color={colors.primary} />
          <Text style={[styles.loadingTitle, { color: colors.foreground }]}>Loading your ledger</Text>
          <Text style={[styles.loadingCopy, { color: colors.muted }]}>Restoring your saved expenses…</Text>
        </View>
      </ScreenContainer>
    );
  }

  const firstName = account?.name?.trim().split(/\s+/)[0] || "there";

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
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.kicker, { color: colors.primary }]}>{todayLabel}</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>
              {greeting}, {firstName}
              <Text style={[styles.dot, { color: colors.primary }]}>.</Text>
            </Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>Here’s your financial pulse for today.</Text>
          </View>
          <Pressable
            style={[styles.bell, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={showPulseAlert}
          >
            <Ionicons name="notifications-outline" size={20} color={colors.muted} />
            <View style={[styles.notificationDot, { backgroundColor: colors.primary }]} />
          </Pressable>
        </View>

        {/* Action Row */}
        <View style={styles.actionRow}>
          <View style={[styles.monthPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="calendar-outline" size={15} color={colors.primary} />
            <Text style={[styles.monthText, { color: colors.foreground }]}>{monthLabel}</Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.addButton,
              { backgroundColor: colors.primary },
              pressed && styles.pressed,
            ]}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add expense</Text>
          </Pressable>
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricGrid}>
          <MetricCard
            label="Spent this month"
            value={formatMoney(monthTotal)}
            icon={<Ionicons name="trending-up" size={16} color="#EB6F61" />}
            tone="coral"
            foot={monthTotal > 0 ? "Live from your records" : "No records yet"}
          />
          <MetricCard
            label="Spent today"
            value={formatMoney(todayTotal)}
            icon={<Ionicons name="cash-outline" size={16} color="#4D8AF0" />}
            tone="blue"
            foot={todayTotal > 0 ? "Updated live" : "No spending today"}
          />
          <MetricCard
            label="Remaining budget"
            value={formatMoney(remaining)}
            icon={<Ionicons name="wallet-outline" size={16} color="#5A9E7E" />}
            tone={budgetPercent >= 100 ? "warning" : "green"}
            foot={`${budgetPercent}% of ${formatMoney(budget)} used`}
            progress={budgetPercent}
          />
        </View>

        {/* Money Map Panel */}
        <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={[styles.kicker, { color: colors.primary }]}>MONEY MAP</Text>
              <Text style={[styles.panelTitle, { color: colors.foreground }]}>Spending overview</Text>
            </View>
            <Text style={[styles.smallMuted, { color: colors.subtle }]}>This month</Text>
          </View>

          <View style={styles.overviewRow}>
            <DonutChart total={monthTotal} expenses={monthExpenses} />
            <CategoryLegend expenses={monthExpenses} />
          </View>

          <View style={[styles.panelFooter, { borderTopColor: colors.border }]}>
            <Text style={[styles.footerLabel, { color: colors.muted }]}>Highest spending category</Text>
            <Text style={[styles.footerValue, { color: colors.foreground }]}>{topCategorySummary}</Text>
          </View>
        </View>

        {/* Daily Rhythm Weekly Chart */}
        <DailyRhythm expenses={sortedExpenses} />

        {/* Latest Activity Panel */}
        <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={[styles.kicker, { color: colors.primary }]}>LATEST ACTIVITY</Text>
              <Text style={[styles.panelTitle, { color: colors.foreground }]}>Recent transactions</Text>
            </View>
            <Ionicons name="arrow-up" size={17} color={colors.primary} />
          </View>

          {sortedExpenses.length === 0 ? (
            <View style={styles.emptyRecent}>
              <Text style={[styles.emptyRecentText, { color: colors.muted }]}>No transactions yet</Text>
            </View>
          ) : (
            sortedExpenses
              .slice(0, 5)
              .map((expense) => (
                <ExpenseRow
                  key={expense.id}
                  expense={expense}
                  onEdit={() => setEditingExpense(expense)}
                  onDelete={() => removeExpense(expense.id)}
                />
              ))
          )}
        </View>

        {/* Spending Insight Card */}
        <SpendingInsight expenses={monthExpenses} />
      </ScrollView>

      {/* Unified Add/Edit Expense Modal */}
      <ExpenseModal
        visible={showAddModal || editingExpense !== null}
        initialExpense={editingExpense}
        onClose={() => {
          setShowAddModal(false);
          setEditingExpense(null);
        }}
        onSubmit={(data) => {
          if (editingExpense) {
            updateExpense(editingExpense.id, data);
          } else {
            addExpense(data);
          }
        }}
      />

      {/* Spending Pulse Notification Modal */}
      <PulseDialog
        visible={showPulseModal}
        onClose={() => setShowPulseModal(false)}
        budgetPercent={budgetPercent}
        monthTotal={monthTotal}
        budget={budget}
        remaining={remaining}
        formatMoney={formatMoney}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loadingState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  loadingTitle: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 8,
  },
  loadingCopy: {
    fontSize: 12,
    textAlign: "center",
  },
  scroll: {
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingTop: 8,
    marginBottom: 18,
  },
  kicker: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  title: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -1.2,
    marginTop: 6,
  },
  dot: {
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  bell: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
  },
  notificationDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  monthPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
  },
  monthText: {
    fontSize: 12,
    fontWeight: "600",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 38,
    paddingHorizontal: 15,
    borderRadius: 10,
    shadowColor: "#EB6F61",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  metricGrid: {
    gap: 10,
    marginBottom: 16,
  },
  panel: {
    padding: 18,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  panelTitle: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.4,
    marginTop: 4,
  },
  smallMuted: {
    fontSize: 10,
    marginTop: 3,
  },
  overviewRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    minHeight: 180,
    gap: 10,
    marginVertical: 8,
  },
  panelFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 14,
    borderTopWidth: 1,
  },
  footerLabel: {
    fontSize: 10,
    fontWeight: "500",
  },
  footerValue: {
    fontSize: 11,
    fontWeight: "700",
  },
  emptyRecent: {
    paddingVertical: 24,
    alignItems: "center",
  },
  emptyRecentText: {
    fontSize: 12,
  },
});
