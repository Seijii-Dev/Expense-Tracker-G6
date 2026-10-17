import React, { useCallback, useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ScreenContainer } from "@/components/screen-container";
import { NeumorphicSurface } from "@/components/ui/neumorphic-surface";
import { BrandWordmark } from "@/components/ui/brand-wordmark";
import { ExpenseRow } from "@/components/ui/expense-row";
import { BalanceCard } from "@/components/overview/balance-card";
import { LedgerEmptyState } from "@/components/overview/ledger-empty-state";
import { ProfileAvatar } from "@/components/account/profile-avatar";
import { ExpenseModal } from "@/components/expense-modal";
import { DonutChart } from "@/components/overview/donut-chart";
import { CategoryLegend } from "@/components/overview/category-legend";
import { DailyRhythm } from "@/components/overview/daily-rhythm";
import { SpendingInsight } from "@/components/overview/spending-insight";
import { MotionEntrance, MotionNumber, PressableScale } from "@/components/motion";
import { Expense, NewExpenseData } from "@/types/expense";
import { PulseDialog } from "@/components/common/pulse-dialog";

import { useExpenses } from "@/lib/expense-store";
import { useAuth } from "@/lib/auth-store";
import { useTheme } from "@/lib/theme-store";
import { formatMoney } from "@/utils/formatters";
import { DashboardSkeleton } from "@/components/ui/dashboard-skeleton";
import {
  getExpenseDateKey,
  getPhilippinesMonth,
} from "@/utils/date";
import { spacing, typography } from "@/constants/design-tokens";

export default function OverviewScreen() {
  const {
    hydrated,
    monthTotal,
    remaining,
    budget,
    budgetPercent,
    sortedExpenses,
    addExpense,
    updateExpense,
    removeExpense,
    refreshExpenses,
    syncing,
    isBalanceHidden,
    toggleBalanceHidden,
  } = useExpenses();
  const { account } = useAuth();
  const { colors, dark } = useTheme();
  const { width: windowWidth } = useWindowDimensions();

  const isNarrowMobile = windowWidth < 380;

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showPulseModal, setShowPulseModal] = useState(false);

  const currentMonth = getPhilippinesMonth();
  const monthExpenses = useMemo(
    () => sortedExpenses.filter((expense) => getExpenseDateKey(expense.date).startsWith(currentMonth)),
    [sortedExpenses, currentMonth]
  );

  const recentExpenses = useMemo(() => sortedExpenses.slice(0, 5), [sortedExpenses]);

  const showPulseAlert = useCallback(() => {
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

  const firstName = account?.name?.trim().split(/\s+/)[0] || "Alex";
  const displayBalance = remaining > 0 ? remaining : Math.max(0, budget - monthTotal);
  const isLedgerEmpty = sortedExpenses.length === 0;
  const openBudgetSettings = () => router.push("/(tabs)/settings");

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
        {/* Top Header Strip: Brand + Notifications + User Avatar */}
        <MotionEntrance delay={0}>
          <View style={styles.topHeader}>
            <View style={styles.headerLeft}>
              <BrandWordmark />
              <Text style={[styles.headerTitle, { color: colors.foreground }]}>Overview</Text>
              <Text style={[styles.welcomeSubtext, { color: colors.muted }]}>
                {isLedgerEmpty ? "Welcome, let's get started!" : `Welcome back, ${firstName}`}
              </Text>
            </View>

            <View style={styles.headerRightActions}>
              {/* Notification Bell */}
              <PressableScale
                onPress={showPulseAlert}
                accessibilityRole="button"
                accessibilityLabel="Notifications"
              >
                <View
                  style={[
                    styles.iconButton,
                    {
                      backgroundColor: dark ? "rgba(255,255,255,0.06)" : colors.surfaceSubtle,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Ionicons name="notifications-outline" size={19} color={colors.foreground} />
                  <View style={[styles.notificationDot, { backgroundColor: colors.primary }]} />
                </View>
              </PressableScale>

              {/* Profile Avatar Button -> routes to Account */}
              <PressableScale
                onPress={() => router.push("/(tabs)/account")}
                accessibilityRole="button"
                accessibilityLabel="Open Account and Profile"
              >
                <View
                  style={[
                    styles.avatarButton,
                    {
                      borderColor: colors.primary,
                      backgroundColor: dark ? "rgba(255,255,255,0.06)" : colors.surfaceSubtle,
                    },
                  ]}
                >
                  <ProfileAvatar
                    account={account}
                    size={32}
                    borderRadius={9}
                    backgroundColor={colors.primary}
                    textColor="#FFFFFF"
                    fontSize={13}
                  />
                </View>
              </PressableScale>
            </View>
          </View>
        </MotionEntrance>

        {/* Main Balance Card */}
        <MotionEntrance delay={50}>
          <BalanceCard
            amount={displayBalance}
            isHidden={isBalanceHidden}
            onToggleHidden={toggleBalanceHidden}
            budget={budget}
            monthTotal={monthTotal}
            remaining={remaining}
            budgetPercent={budgetPercent}
            onPressBudgetHealth={openBudgetSettings}
          />
        </MotionEntrance>

        {/* First-run empty state: replaces the metric tiles until records exist */}
        {isLedgerEmpty ? (
          <MotionEntrance delay={100}>
            <LedgerEmptyState
              onLogExpense={() => setShowAddModal(true)}
              onSetBudget={openBudgetSettings}
            />
          </MotionEntrance>
        ) : (
          <>
            {/* Quick Financial Metrics */}
            <MotionEntrance delay={100}>
              <View style={[styles.metricsGrid, isNarrowMobile && styles.metricsGridNarrow]}>
                {/* Monthly Budget Target */}
                <NeumorphicSurface
                  variant="card"
                  radius={18}
                  style={[styles.metricTileWrap, isNarrowMobile && styles.metricTileNarrow]}
                  contentStyle={styles.metricTileContent}
                >
                  <View style={styles.metricTileTop}>
                    <Text style={[styles.metricTileLabel, { color: colors.muted }]}>BUDGET</Text>
                    <View style={[styles.metricTileIconCircle, { backgroundColor: colors.successSoft }]}>
                      <Ionicons name="arrow-down" size={13} color={colors.success} />
                    </View>
                  </View>
                  <MotionNumber
                    value={budget}
                    formatter={formatMoney}
                    style={[styles.metricTileValue, { color: colors.foreground }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.75}
                  />
                  <Text style={[styles.metricTileSub, { color: colors.success }]}>Monthly Target</Text>
                </NeumorphicSurface>

                {/* Total Spending */}
                <NeumorphicSurface
                  variant="card"
                  radius={18}
                  style={[styles.metricTileWrap, isNarrowMobile && styles.metricTileNarrow]}
                  contentStyle={styles.metricTileContent}
                >
                  <View style={styles.metricTileTop}>
                    <Text style={[styles.metricTileLabel, { color: colors.muted }]}>SPENDING</Text>
                    <View style={[styles.metricTileIconCircle, { backgroundColor: colors.primarySoft }]}>
                      <Ionicons name="arrow-up" size={13} color={colors.primary} />
                    </View>
                  </View>
                  <MotionNumber
                    value={monthTotal}
                    formatter={formatMoney}
                    style={[styles.metricTileValue, { color: colors.primary }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.75}
                  />
                  <Text style={[styles.metricTileSub, { color: colors.primary }]}>
                    {monthExpenses.length} transactions
                  </Text>
                </NeumorphicSurface>

                {/* Remaining Savings */}
                <NeumorphicSurface
                  variant="card"
                  radius={18}
                  style={[styles.metricTileWrap, isNarrowMobile && styles.metricTileWide]}
                  contentStyle={styles.metricTileContent}
                >
                  <View style={styles.metricTileTop}>
                    <Text style={[styles.metricTileLabel, { color: colors.muted }]}>REMAINING</Text>
                    <View style={[styles.metricTileIconCircle, { backgroundColor: colors.warningSoft }]}>
                      <Ionicons name="wallet-outline" size={13} color={colors.warning} />
                    </View>
                  </View>
                  <MotionNumber
                    value={remaining}
                    formatter={formatMoney}
                    style={[styles.metricTileValue, { color: colors.foreground }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.75}
                  />
                  <View style={[styles.tileProgressTrack, { backgroundColor: dark ? "rgba(255,255,255,0.08)" : colors.surfaceSubtle }]}>
                    <View
                      style={[
                        styles.tileProgressFill,
                        {
                          backgroundColor: budgetPercent > 90 ? colors.primary : colors.success,
                          width: `${Math.min(100, Math.max(0, budgetPercent))}%`,
                        },
                      ]}
                    />
                  </View>
                </NeumorphicSurface>
              </View>
            </MotionEntrance>
          </>
        )}

        {/* Spending Breakdown */}
        <MotionEntrance delay={150}>
          <NeumorphicSurface variant="card" radius={24} style={styles.panel} contentStyle={styles.panelInner}>
            <View style={styles.panelHeader}>
              <View style={styles.panelHeaderText}>
                <Text style={[styles.panelSectionTitle, { color: colors.foreground }]}>
                  Spending by Category
                </Text>
                <Text style={[styles.panelSubText, { color: colors.muted }]}>
                  {isLedgerEmpty ? "Waiting for data..." : "Current month distribution"}
                </Text>
              </View>
              {!isLedgerEmpty && (
                <PressableScale
                  onPress={() => router.push("/(tabs)/reports")}
                  style={styles.viewAllBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Open category reports"
                >
                  <Text style={[styles.viewAllText, { color: colors.primary }]}>Details</Text>
                  <Ionicons name="chevron-forward" size={14} color={colors.primary} />
                </PressableScale>
              )}
            </View>

            <View style={styles.overviewRow}>
              <DonutChart total={monthTotal} expenses={monthExpenses} />
              <CategoryLegend expenses={monthExpenses} />
            </View>
          </NeumorphicSurface>
        </MotionEntrance>

        {/* Recent Transactions */}
        {recentExpenses.length > 0 && (
          <MotionEntrance delay={200}>
            <NeumorphicSurface variant="card" radius={24} style={styles.panel} contentStyle={styles.panelInner}>
              <View style={styles.panelHeader}>
                <View style={styles.panelHeaderText}>
                  <Text style={[styles.panelSectionTitle, { color: colors.foreground }]}>
                    Recent Activity
                  </Text>
                  <Text style={[styles.panelSubText, { color: colors.muted }]}>
                    Latest logged expenses
                  </Text>
                </View>
                <PressableScale
                  onPress={() => router.push("/(tabs)/transactions")}
                  style={styles.viewAllBtn}
                  accessibilityRole="button"
                  accessibilityLabel="View all transactions"
                >
                  <Text style={[styles.viewAllText, { color: colors.primary }]}>View all</Text>
                  <Ionicons name="chevron-forward" size={14} color={colors.primary} />
                </PressableScale>
              </View>

              {recentExpenses.map((expense) => (
                <ExpenseRow
                  key={expense.id}
                  expense={expense}
                  onPress={() =>
                    router.push({ pathname: "/transaction/[id]", params: { id: expense.id } })
                  }
                  onEdit={() => setEditingExpense(expense)}
                  onDelete={() => removeExpense(expense.id)}
                />
              ))}
            </NeumorphicSurface>
          </MotionEntrance>
        )}

        {/* Daily Expense Chart */}
        {sortedExpenses.length > 0 && (
          <MotionEntrance delay={250}>
            <DailyRhythm expenses={sortedExpenses} />
          </MotionEntrance>
        )}

        {/* Financial Insight */}
        <MotionEntrance delay={300}>
          <SpendingInsight expenses={monthExpenses} />
        </MotionEntrance>

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
    paddingBottom: 104,
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
  },
  headerTitle: {
    ...typography.screenTitle,
    fontSize: 26,
    lineHeight: 31,
    letterSpacing: -0.7,
    marginTop: 6,
  },
  welcomeSubtext: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    marginTop: 2,
  },
  headerRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: 8,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  metricsGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  metricsGridNarrow: {
    flexWrap: "wrap",
  },
  metricTileWrap: {
    flex: 1,
    minWidth: 0,
  },
  metricTileContent: {
    padding: spacing.md,
  },
  metricTileNarrow: {
    flexBasis: "48%",
  },
  metricTileWide: {
    flexBasis: "100%",
  },
  metricTileTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  metricTileLabel: {
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  metricTileIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  metricTileValue: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.25,
    fontVariant: ["tabular-nums"],
  },
  metricTileSub: {
    fontSize: 9.5,
    fontWeight: "600",
    marginTop: 4,
  },
  tileProgressTrack: {
    height: 4,
    borderRadius: 2,
    marginTop: 6,
    overflow: "hidden",
  },
  tileProgressFill: {
    height: "100%",
    borderRadius: 2,
  },
  panel: {
    marginBottom: 16,
  },
  panelInner: {
    padding: spacing.lg,
  },

  panelHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  panelHeaderText: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
  },
  panelSectionTitle: {
    ...typography.sectionTitle,
  },
  panelSubText: {
    fontSize: 11.5,
    fontWeight: "500",
    marginTop: 2,
  },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingTop: 2,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  viewAllText: {
    fontSize: 12.5,
    fontWeight: "700",
  },
  overviewRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    minHeight: 170,
    gap: 12,
    marginVertical: 6,
  },
});
