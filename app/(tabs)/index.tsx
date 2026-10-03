import React, { useCallback, useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ScreenContainer } from "@/components/screen-container";
import { GlassSurface } from "@/components/ui/glass-surface";
import { MetricCard } from "@/components/ui/metric-card";
import { ExpenseRow } from "@/components/ui/expense-row";
import { ExpenseModal } from "@/components/expense-modal";
import { DonutChart } from "@/components/overview/donut-chart";
import { CategoryLegend } from "@/components/overview/category-legend";
import { DailyRhythm } from "@/components/overview/daily-rhythm";
import { SpendingInsight } from "@/components/overview/spending-insight";
import { Expense, NewExpenseData } from "@/types/expense";
import { PulseDialog } from "@/components/common/pulse-dialog";
import * as Haptics from "expo-haptics";
import { useExpenses } from "@/lib/expense-store";
import { useAuth } from "@/lib/auth-store";
import { useTheme } from "@/lib/theme-store";
import { formatMoney } from "@/utils/formatters";
import { DashboardSkeleton } from "@/components/ui/dashboard-skeleton";
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
  const { colors, dark } = useTheme();

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

  const recentExpenses = useMemo(() => sortedExpenses.slice(0, 5), [sortedExpenses]);

  const topCategorySummary = useMemo(() => {
    const totals = monthExpenses.reduce<Record<string, number>>(
      (map, exp) => ({ ...map, [exp.category]: (map[exp.category] || 0) + (exp.amount || 0) }),
      {}
    );
    const top = Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
    if (!top) return "No spending yet";
    return `${top[0]}  ${formatMoney(top[1])}`;
  }, [monthExpenses]);

  const showPulseAlert = useCallback(() => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Non-fatal
    }
    setShowPulseModal(true);
  }, []);

  const handleClosePulse = useCallback(() => {
    setShowPulseModal(false);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowAddModal(false);
    setEditingExpense(null);
  }, []);

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

  if (!hydrated) {
    return (
      <ScreenContainer>
        <DashboardSkeleton />
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
          <View style={styles.headerLeft}>
            <View
              style={[
                styles.kickerPill,
                {
                  backgroundColor: dark ? "rgba(255, 117, 101, 0.14)" : colors.primarySoft,
                  borderColor: dark ? "rgba(255, 117, 101, 0.28)" : "rgba(255, 101, 84, 0.22)",
                },
              ]}
            >
              <View style={[styles.kickerDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.kicker, { color: colors.primary }]}>{todayLabel}</Text>
            </View>

            <Text style={[styles.title, { color: colors.foreground }]}>
              {greeting}, {firstName}
              <Text style={[styles.dot, { color: colors.primary }]}>.</Text>
            </Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              Here’s your financial pulse for today.
            </Text>
          </View>

          <Pressable
            onPress={showPulseAlert}
            style={({ pressed }) => [styles.bellWrap, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Financial Pulse Health"
          >
            <GlassSurface variant="pill" radius={18} contentStyle={styles.bell}>
              <Ionicons name="pulse" size={18} color={colors.primary} />
              <View style={[styles.notificationDot, { backgroundColor: colors.primary }]} />
            </GlassSurface>
          </Pressable>
        </View>

        {/* Action Row */}
        <View style={styles.actionRow}>
          <GlassSurface variant="pill" radius={14} contentStyle={styles.monthPill}>
            <Ionicons name="calendar-outline" size={15} color={colors.primary} />
            <Text style={[styles.monthText, { color: colors.foreground }]}>{monthLabel}</Text>
          </GlassSurface>

          <Pressable
            style={({ pressed }) => [
              styles.addButton,
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
            icon={<Ionicons name="trending-up" size={17} color="#FF6554" />}
            tone="coral"
            foot={monthTotal > 0 ? "Live from your records" : "No records yet"}
          />
          <MetricCard
            label="Spent today"
            value={formatMoney(todayTotal)}
            icon={<Ionicons name="cash-outline" size={17} color="#0EA5E9" />}
            tone="blue"
            foot={todayTotal > 0 ? "Updated live today" : "No spending logged today"}
          />
          <MetricCard
            label="Remaining budget"
            value={formatMoney(remaining)}
            icon={<Ionicons name="wallet-outline" size={17} color="#10B981" />}
            tone={budgetPercent >= 100 ? "coral" : budgetPercent >= 80 ? "warning" : "green"}
            foot={`${budgetPercent}% of ${formatMoney(budget)} used`}
            progress={budgetPercent}
          />
        </View>

        {/* Money Map Panel */}
        <GlassSurface style={styles.panel} contentStyle={styles.panelInner}>
          <View style={styles.panelHeader}>
            <View>
              <View style={styles.panelKickerRow}>
                <View style={[styles.kickerDot, { backgroundColor: colors.primary }]} />
                <Text style={[styles.panelKicker, { color: colors.primary }]}>MONEY MAP</Text>
              </View>
              <Text style={[styles.panelTitle, { color: colors.foreground }]}>Spending overview</Text>
            </View>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: dark ? "rgba(255,255,255,0.06)" : colors.surfaceSubtle,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.smallMuted, { color: colors.muted }]}>This month</Text>
            </View>
          </View>

          <View style={styles.overviewRow}>
            <DonutChart total={monthTotal} expenses={monthExpenses} />
            <CategoryLegend expenses={monthExpenses} />
          </View>

          <View style={[styles.panelFooter, { borderTopColor: colors.border }]}>
            <Text style={[styles.footerLabel, { color: colors.muted }]}>Highest spending category</Text>
            <Text style={[styles.footerValue, { color: colors.foreground }]}>{topCategorySummary}</Text>
          </View>
        </GlassSurface>

        {/* Daily Rhythm Weekly Chart */}
        <DailyRhythm expenses={sortedExpenses} />

        {/* Latest Activity Panel */}
        <GlassSurface style={styles.panel} contentStyle={styles.panelInner}>
          <View style={styles.panelHeader}>
            <View>
              <View style={styles.panelKickerRow}>
                <View style={[styles.kickerDot, { backgroundColor: colors.success }]} />
                <Text style={[styles.panelKicker, { color: colors.success }]}>LATEST ACTIVITY</Text>
              </View>
              <Text style={[styles.panelTitle, { color: colors.foreground }]}>Recent transactions</Text>
            </View>
            <Pressable
              style={({ pressed }) => [styles.viewAllBtn, pressed && styles.pressed]}
              onPress={() => {
                try {
                  Haptics.selectionAsync();
                } catch {
                  // Non-fatal
                }
                router.push("/(tabs)/transactions");
              }}
            >
              <Text style={[styles.viewAllText, { color: colors.primary }]}>View all</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.primary} />
            </Pressable>
          </View>

          {recentExpenses.length === 0 ? (
            <View style={styles.emptyRecent}>
              <View style={[styles.emptyIconCircle, { backgroundColor: colors.surfaceSubtle }]}>
                <Ionicons name="receipt-outline" size={24} color={colors.subtle} />
              </View>
              <Text style={[styles.emptyRecentText, { color: colors.foreground }]}>No transactions yet</Text>
              <Text style={[styles.emptyRecentSub, { color: colors.muted }]}>
                Tap the "+ Add expense" button above to log your first record.
              </Text>
            </View>
          ) : (
            recentExpenses.map((expense) => (
              <ExpenseRow
                key={expense.id}
                expense={expense}
                onEdit={() => setEditingExpense(expense)}
                onDelete={() => removeExpense(expense.id)}
              />
            ))
          )}
        </GlassSurface>

        {/* Spending Insight Card */}
        <SpendingInsight expenses={monthExpenses} />
      </ScrollView>

      {/* Unified Add/Edit Expense Modal */}
      <ExpenseModal
        visible={showAddModal || editingExpense !== null}
        initialExpense={editingExpense}
        onClose={handleCloseModal}
        onSubmit={handleModalSubmit}
      />

      {/* Spending Pulse Notification Modal */}
      <PulseDialog
        visible={showPulseModal}
        onClose={handleClosePulse}
        budgetPercent={budgetPercent}
        monthTotal={monthTotal}
        budget={budget}
        remaining={remaining}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingTop: 8,
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
    paddingRight: 10,
  },
  kickerPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 999,
    borderWidth: 1,
  },
  kickerDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  kicker: {
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 1.1,
  },
  title: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -1.2,
    marginTop: 8,
    lineHeight: 38,
  },
  dot: {
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 12.5,
    marginTop: 4,
  },
  bellWrap: {
    paddingTop: 4,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  bell: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationDot: {
    position: "absolute",
    top: 10,
    right: 11,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    borderWidth: 1.5,
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
    paddingHorizontal: 13,
    height: 40,
  },
  monthText: {
    fontSize: 12,
    fontWeight: "600",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 14,
    shadowColor: "#FF6554",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  metricGrid: {
    gap: 12,
    marginBottom: 16,
  },
  panel: {
    marginBottom: 16,
  },
  panelInner: {
    padding: 20,
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  panelKickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  panelKicker: {
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  panelTitle: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.4,
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  smallMuted: {
    fontSize: 10,
    fontWeight: "600",
  },
  overviewRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    minHeight: 180,
    gap: 12,
    marginVertical: 10,
  },
  panelFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 14,
    borderTopWidth: 1,
  },
  footerLabel: {
    fontSize: 10.5,
    fontWeight: "500",
  },
  footerValue: {
    fontSize: 12,
    fontWeight: "700",
  },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  viewAllText: {
    fontSize: 11.5,
    fontWeight: "700",
  },
  emptyRecent: {
    paddingVertical: 28,
    alignItems: "center",
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  emptyRecentText: {
    fontSize: 13,
    fontWeight: "700",
  },
  emptyRecentSub: {
    fontSize: 11,
    marginTop: 4,
    textAlign: "center",
    maxWidth: 240,
  },
});
