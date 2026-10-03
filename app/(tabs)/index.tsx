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
    () => sortedExpenses.filter((expense) => normalizeDate(expense.date).startsWith(currentMonth)),
    [sortedExpenses, currentMonth]
  );

  const recentExpenses = useMemo(() => sortedExpenses.slice(0, 5), [sortedExpenses]);

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

  const firstName = account?.name?.trim().split(/\s+/)[0] || "Alex";

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
        {/* Brand & User Greeting Header (Screen 1 Mockup) */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.brandRow}>
              <View style={styles.logoBadge}>
                <Ionicons name="leaf" size={17} color="#10B981" />
              </View>
              <Text style={[styles.brandTitle, { color: colors.foreground }]}>Ledgerly</Text>
            </View>

            <View style={styles.greetingBlock}>
              <Text style={[styles.greetingLabel, { color: colors.muted }]}>Good morning,</Text>
              <Text style={[styles.userNameText, { color: colors.foreground }]}>
                {firstName} <Text style={styles.waveEmoji}>👋</Text>
              </Text>
              <Text style={[styles.greetingSubtitle, { color: colors.muted }]}>
                Here's your financial summary for this month.
              </Text>
            </View>
          </View>

          <View style={styles.headerRightActions}>
            {/* Notification Bell */}
            <Pressable
              onPress={showPulseAlert}
              style={({ pressed }) => [styles.headerIconBtn, pressed && styles.pressed]}
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
                <Ionicons name="notifications-outline" size={19} color={colors.foreground} />
                <View style={[styles.notificationDot, { backgroundColor: colors.primary }]} />
              </View>
            </Pressable>

            {/* Profile Avatar Button */}
            <Pressable
              onPress={() => router.push("/(tabs)/account")}
              style={({ pressed }) => [styles.avatarBtn, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel="Open Account Profile"
            >
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitials}>
                  {firstName.charAt(0).toUpperCase()}
                </Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* Hero Card: Available Balance (Screen 1 Mockup) */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <Pressable
              onPress={toggleBalanceHidden}
              style={styles.balanceLabelWrap}
              accessibilityRole="button"
              accessibilityLabel="Toggle Balance Visibility"
            >
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Ionicons
                name={isBalanceHidden ? "eye-off-outline" : "eye-outline"}
                size={17}
                color="#A5D0BE"
                style={{ marginLeft: 6 }}
              />
            </Pressable>
            <View style={styles.walletIconBox}>
              <Ionicons name="wallet-outline" size={20} color="#FFFFFF" />
            </View>
          </View>

          <Text style={styles.heroAmount}>
            {isBalanceHidden ? "••••••••" : formatMoney(remaining > 0 ? remaining : budget - monthTotal)}
          </Text>

          <View style={styles.heroSubBadge}>
            <Ionicons name="arrow-up" size={12} color="#6EE7B7" />
            <Text style={styles.heroSubBadgeText}>
              {budgetPercent < 100
                ? `${100 - budgetPercent}% under budget`
                : `${budgetPercent - 100}% over budget`}
            </Text>
          </View>
        </View>

        {/* Secondary 2-Column Metrics */}
        <View style={[styles.secondaryGrid, isNarrowMobile && styles.secondaryGridNarrow]}>
          <MetricCard
            label="Total Spending"
            value={isBalanceHidden ? "••••••" : formatMoney(monthTotal)}
            icon={<Ionicons name="receipt-outline" size={16} color="#FF6554" />}
            tone="coral"
            foot={monthExpenses.length ? `${monthExpenses.length} transactions` : "0 transactions"}
            style={styles.secondaryCard}
          />
          <MetricCard
            label="Remaining Budget"
            value={isBalanceHidden ? "••••••" : formatMoney(remaining)}
            icon={<Ionicons name="wallet-outline" size={16} color="#10B981" />}
            tone="green"
            progress={budgetPercent}
            foot={`${budgetPercent}% used`}
            style={styles.secondaryCard}
          />
        </View>

        {/* Spending by Category Card (Screen 1 Mockup) */}
        <GlassSurface style={styles.panel} contentStyle={styles.panelInner}>
          <View style={styles.panelHeader}>
            <Text style={[styles.panelSectionTitle, { color: colors.foreground }]}>
              Spending by Category
            </Text>
            <Pressable
              onPress={() => router.push("/(tabs)/reports")}
              style={({ pressed }) => [styles.viewAllBtn, pressed && styles.pressed]}
            >
              <Text style={[styles.viewAllText, { color: "#10B981" }]}>View all</Text>
              <Ionicons name="chevron-forward" size={14} color="#10B981" />
            </Pressable>
          </View>

          <View style={[styles.overviewRow, isNarrowMobile && styles.overviewRowNarrow]}>
            <DonutChart total={monthTotal} expenses={monthExpenses} />
            <CategoryLegend expenses={monthExpenses} />
          </View>
        </GlassSurface>

        {/* Recent Transactions Section (Screen 1 Mockup) */}
        <GlassSurface style={styles.panel} contentStyle={styles.panelInner}>
          <View style={styles.panelHeader}>
            <Text style={[styles.panelSectionTitle, { color: colors.foreground }]}>
              Recent Transactions
            </Text>
            <Pressable
              onPress={() => router.push("/(tabs)/transactions")}
              style={({ pressed }) => [styles.viewAllBtn, pressed && styles.pressed]}
            >
              <Text style={[styles.viewAllText, { color: "#10B981" }]}>View all</Text>
              <Ionicons name="chevron-forward" size={14} color="#10B981" />
            </Pressable>
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

        {/* Daily Rhythm Bar Chart */}
        <DailyRhythm expenses={sortedExpenses} />

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
    paddingBottom: 96,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingTop: 8,
    marginBottom: 18,
  },
  headerLeft: {
    flex: 1,
    paddingRight: 10,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 10,
  },
  logoBadge: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: "#E6F9F2",
    alignItems: "center",
    justifyContent: "center",
  },
  brandTitle: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 19,
    letterSpacing: -0.4,
  },
  greetingBlock: {
    marginTop: 2,
  },
  greetingLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  userNameText: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 24,
    letterSpacing: -0.5,
    marginTop: 1,
  },
  waveEmoji: {
    fontSize: 22,
  },
  greetingSubtitle: {
    fontSize: 12,
    marginTop: 3,
    lineHeight: 17,
  },
  headerRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 2,
  },
  headerIconBtn: {
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: 9,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#FF6554",
  },
  avatarBtn: {
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1B6A4B",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#10B981",
  },
  avatarInitials: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  heroCard: {
    backgroundColor: "#16382B",
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#16382B",
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  balanceLabelWrap: {
    flexDirection: "row",
    alignItems: "center",
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  balanceLabel: {
    color: "#A5D0BE",
    fontSize: 13,
    fontWeight: "600",
  },
  walletIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroAmount: {
    fontFamily: "Fraunces_700Bold",
    color: "#FFFFFF",
    fontSize: 34,
    letterSpacing: -1,
    lineHeight: 40,
    marginVertical: 4,
  },
  heroSubBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  heroSubBadgeText: {
    color: "#6EE7B7",
    fontSize: 11,
    fontWeight: "700",
  },
  panelSectionTitle: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 18,
    letterSpacing: -0.3,
  },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  viewAllText: {
    fontSize: 12.5,
    fontWeight: "700",
  },
  heroProgressFill: {
    height: "100%",
    borderRadius: 4,
  },
  heroBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  heroBudgetSubtext: {
    flex: 1,
    fontSize: 11.5,
    fontWeight: "500",
  },
  quickAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 38,
    paddingHorizontal: 15,
    borderRadius: 13,
    shadowColor: "#FF6554",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  quickAddText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  secondaryGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  secondaryGridNarrow: {
    flexDirection: "column",
  },
  secondaryCard: {
    flex: 1,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
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
  overviewRowNarrow: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
    paddingVertical: 8,
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
