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
import { LinearGradient } from "expo-linear-gradient";
import { ScreenContainer } from "@/components/screen-container";
import { GlassSurface } from "@/components/ui/glass-surface";
import { ExpenseRow } from "@/components/ui/expense-row";
import { ProfileAvatar } from "@/components/account/profile-avatar";
import { ExpenseModal } from "@/components/expense-modal";
import { DonutChart } from "@/components/overview/donut-chart";
import { CategoryLegend } from "@/components/overview/category-legend";
import { DailyRhythm } from "@/components/overview/daily-rhythm";
import { SpendingInsight } from "@/components/overview/spending-insight";
import { MotionEntrance, PressableScale } from "@/components/motion";
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
              <View style={styles.brandBadgeRow}>
                <View style={[styles.brandIconBox, { backgroundColor: colors.primarySoft }]}>
                  <Ionicons name="sparkles" size={16} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.brandSuperText, { color: colors.muted }]}>LEDGERLY</Text>
                  <Text style={[styles.brandTitle, { color: colors.foreground }]}>Overview</Text>
                </View>
              </View>
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
                    styles.iconCircle,
                    {
                      backgroundColor: dark ? "rgba(255,255,255,0.06)" : colors.surfaceSubtle,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Ionicons name="notifications-outline" size={18} color={colors.foreground} />
                  <View style={[styles.notificationDot, { backgroundColor: colors.primary }]} />
                </View>
              </PressableScale>

              {/* Profile Avatar Button */}
              <PressableScale
                onPress={() => router.push("/(tabs)/account")}
                accessibilityRole="button"
                accessibilityLabel="Open Account Profile"
              >
                <View style={[styles.avatarCircle, { borderColor: colors.primary }]}>
                  <ProfileAvatar
                    account={account}
                    size={36}
                    backgroundColor={colors.primary}
                    textColor="#FFFFFF"
                    fontSize={14}
                  />
                </View>
              </PressableScale>
            </View>
          </View>
        </MotionEntrance>

        {/* 1. HERO FINANCIAL CARD: Warm Architectural Coral-Terracotta Mesh */}
        <MotionEntrance delay={50}>
          <View style={styles.heroCardContainer}>
            <LinearGradient
              colors={["#FF5A4E", "#E84A3F", "#C83226"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCardGradient}
            >
              {/* Ambient Aura Blobs */}
              <View pointerEvents="none" style={styles.heroAuraOne} />
              <View pointerEvents="none" style={styles.heroAuraTwo} />

              {/* Top Action Strip */}
              <View style={styles.heroTopStrip}>
                <PressableScale
                  onPress={toggleBalanceHidden}
                  style={styles.heroBalanceLabelRow}
                  accessibilityRole="button"
                  accessibilityLabel="Toggle Balance Visibility"
                >
                  <Text style={styles.heroBalanceLabel}>TOTAL BALANCE</Text>
                  <Ionicons
                    name={isBalanceHidden ? "eye-off-outline" : "eye-outline"}
                    size={15}
                    color="rgba(255, 255, 255, 0.85)"
                    style={{ marginLeft: 6 }}
                  />
                </PressableScale>

                <View style={styles.heroCurrencyPill}>
                  <View style={styles.currencyDot} />
                  <Text style={styles.currencyText}>PHP (₱)</Text>
                </View>
              </View>

              {/* Prominent Monetary Display */}
              <Text style={styles.heroAmount}>
                {isBalanceHidden ? "••••••••" : formatMoney(displayBalance)}
              </Text>

              {/* Sub-indicator Growth Metric Pill */}
              <View style={styles.heroPillRow}>
                <View style={styles.heroSubPill}>
                  <Ionicons
                    name={budgetPercent < 100 ? "trending-up" : "alert-circle"}
                    size={15}
                    color="#FFFFFF"
                  />
                  <Text style={styles.heroSubPillText}>
                    {budgetPercent < 100
                      ? `${100 - budgetPercent}% remaining budget`
                      : `${budgetPercent - 100}% over monthly limit`}
                  </Text>
                </View>

                <View style={styles.heroTagPill}>
                  <Text style={styles.heroTagText}>
                    {budgetPercent < 100 ? "On Track" : "Ceiling"}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </MotionEntrance>

        {/* 2. QUICK FINANCIAL METRIC TILES (Income / Expenses / Remaining Budget) */}
        <MotionEntrance delay={100}>
          <View style={styles.metricsGrid}>
            {/* Monthly Budget Target */}
            <View
              style={[
                styles.metricTile,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.metricTileTop}>
                <Text style={[styles.metricTileLabel, { color: colors.muted }]}>BUDGET</Text>
                <View style={[styles.metricTileIconCircle, { backgroundColor: dark ? "rgba(16,185,129,0.18)" : "#ECFDF5" }]}>
                  <Ionicons name="arrow-down" size={13} color={colors.success} />
                </View>
              </View>
              <Text style={[styles.metricTileValue, { color: colors.foreground }]} numberOfLines={1}>
                {formatMoney(budget)}
              </Text>
              <Text style={[styles.metricTileSub, { color: colors.success }]}>Monthly Target</Text>
            </View>

            {/* Month Expenses */}
            <View
              style={[
                styles.metricTile,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.metricTileTop}>
                <Text style={[styles.metricTileLabel, { color: colors.muted }]}>SPENDING</Text>
                <View style={[styles.metricTileIconCircle, { backgroundColor: colors.primarySoft }]}>
                  <Ionicons name="arrow-up" size={13} color={colors.primary} />
                </View>
              </View>
              <Text style={[styles.metricTileValue, { color: colors.primary }]} numberOfLines={1}>
                {formatMoney(monthTotal)}
              </Text>
              <Text style={[styles.metricTileSub, { color: colors.primary }]}>
                {monthExpenses.length} transactions
              </Text>
            </View>

            {/* Savings / Remaining */}
            <View
              style={[
                styles.metricTile,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.metricTileTop}>
                <Text style={[styles.metricTileLabel, { color: colors.muted }]}>REMAINING</Text>
                <View style={[styles.metricTileIconCircle, { backgroundColor: dark ? "rgba(245,158,11,0.18)" : "#FFFBEB" }]}>
                  <Ionicons name="wallet-outline" size={13} color={colors.warning} />
                </View>
              </View>
              <Text style={[styles.metricTileValue, { color: colors.foreground }]} numberOfLines={1}>
                {formatMoney(remaining)}
              </Text>
              {/* Progress Bar */}
              <View style={[styles.tileProgressTrack, { backgroundColor: colors.surfaceSubtle }]}>
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
            </View>
          </View>
        </MotionEntrance>

        {/* 3. SPENDING BY CATEGORY PANEL */}
        <MotionEntrance delay={150}>
          <GlassSurface style={styles.panel} contentStyle={[styles.panelInner, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <View style={styles.panelHeader}>
              <View>
                <Text style={[styles.panelSectionTitle, { color: colors.foreground }]}>
                  Spending by Category
                </Text>
                <Text style={[styles.panelSubText, { color: colors.muted }]}>
                  Current calendar month allocation
                </Text>
              </View>
              <PressableScale
                onPress={() => router.push("/(tabs)/reports")}
                style={styles.viewAllBtn}
              >
                <Text style={[styles.viewAllText, { color: colors.primary }]}>View all</Text>
                <Ionicons name="chevron-forward" size={14} color={colors.primary} />
              </PressableScale>
            </View>

            <View style={[styles.overviewRow, isNarrowMobile && styles.overviewRowNarrow]}>
              <DonutChart total={monthTotal} expenses={monthExpenses} />
              <CategoryLegend expenses={monthExpenses} />
            </View>
          </GlassSurface>
        </MotionEntrance>

        {/* 4. RECENT EXPENSES PANEL */}
        <MotionEntrance delay={200}>
          <GlassSurface style={styles.panel} contentStyle={[styles.panelInner, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <View style={styles.panelHeader}>
              <View>
                <Text style={[styles.panelSectionTitle, { color: colors.foreground }]}>
                  Recent Expenses
                </Text>
                <Text style={[styles.panelSubText, { color: colors.muted }]}>
                  Last recorded transactions
                </Text>
              </View>
              <PressableScale
                onPress={() => router.push("/(tabs)/transactions")}
                style={styles.viewAllBtn}
              >
                <Text style={[styles.viewAllText, { color: colors.primary }]}>See All</Text>
                <Ionicons name="chevron-forward" size={14} color={colors.primary} />
              </PressableScale>
            </View>

            {recentExpenses.length === 0 ? (
              <View style={styles.emptyRecent}>
                <View style={[styles.emptyIconCircle, { backgroundColor: colors.surfaceSubtle }]}>
                  <Ionicons name="receipt-outline" size={24} color={colors.subtle} />
                </View>
                <Text style={[styles.emptyRecentText, { color: colors.foreground }]}>
                  No transactions yet
                </Text>
                <Text style={[styles.emptyRecentSub, { color: colors.muted }]}>
                  Tap the "+" button below to record your first transaction.
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
        </MotionEntrance>

        {/* 5. 7-DAY VELOCITY DAILY RHYTHM BAR CHART */}
        <MotionEntrance delay={250}>
          <DailyRhythm expenses={sortedExpenses} />
        </MotionEntrance>

        {/* 6. WARM MOTIVATIONAL NOTE / DELIGHT TOUCH */}
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
    paddingBottom: 96,
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
  },
  brandBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brandIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  brandSuperText: {
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
    marginTop: 1,
  },
  headerRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerIconBtn: {
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
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
  avatarBtn: {
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  heroCardContainer: {
    borderRadius: 26,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#E84A3F",
    shadowOpacity: 0.32,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  heroCardGradient: {
    padding: 22,
    position: "relative",
    overflow: "hidden",
  },
  heroAuraOne: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255, 255, 255, 0.14)",
  },
  heroAuraTwo: {
    position: "absolute",
    bottom: -40,
    left: -40,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(0, 0, 0, 0.12)",
  },
  heroTopStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  heroBalanceLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  heroBalanceLabel: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  heroCurrencyPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  currencyDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#6EE7B7",
  },
  currencyText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  heroAmount: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -1,
    marginVertical: 4,
  },
  heroPillRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    flexWrap: "wrap",
  },
  heroSubPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.20)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  heroSubPillText: {
    color: "#FFFFFF",
    fontSize: 11.5,
    fontWeight: "600",
  },
  heroTagPill: {
    backgroundColor: "rgba(16, 185, 129, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  heroTagText: {
    color: "#FFFFFF",
    fontSize: 10.5,
    fontWeight: "700",
  },
  metricsGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  metricTile: {
    flex: 1,
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    shadowColor: "#1A1D20",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
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
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.3,
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
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: "#1A1D20",
    shadowOpacity: 0.04,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  panelSectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.3,
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
  overviewRowNarrow: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingVertical: 8,
  },
  emptyRecent: {
    paddingVertical: 24,
    alignItems: "center",
  },
  emptyIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  emptyRecentText: {
    fontSize: 13.5,
    fontWeight: "700",
  },
  emptyRecentSub: {
    fontSize: 11.5,
    marginTop: 4,
    textAlign: "center",
    maxWidth: 240,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
