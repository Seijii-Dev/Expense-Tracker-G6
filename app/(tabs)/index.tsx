import React, { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { ScreenContainer } from "@/components/screen-container";
import { MetricCard } from "@/components/ui/metric-card";
import { ExpenseRow } from "@/components/ui/expense-row";
import { ExpenseModal } from "@/components/expense-modal";
import {
  Category,
  Expense,
  categoryMeta,
  getPhilippinesDate,
  getPhilippinesMonth,
  normalizeDate,
  useExpenses,
} from "@/lib/expense-store";
import { useAuth } from "@/lib/auth-store";
import { useTheme } from "@/lib/theme-store";
import { formatMoney, getWeekdayShort } from "@/lib/formatters";

const categories: Category[] = ["Food", "Transport", "School", "Shopping", "Bills", "Fun", "Health", "Other"];

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

  // Time & date greetings
  const philippinesNow = new Date();
  const philippinesHour = Number(
    new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Manila", hour: "numeric", hour12: false }).format(
      philippinesNow
    )
  );
  const greeting = philippinesHour < 12 ? "Good morning" : philippinesHour < 18 ? "Good afternoon" : "Good evening";
  const todayLabel = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    weekday: "long",
    month: "long",
    day: "numeric",
  })
    .format(philippinesNow)
    .toUpperCase();
  const monthLabel = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    month: "long",
    year: "numeric",
  }).format(philippinesNow);

  const currentMonth = getPhilippinesMonth();
  const monthExpenses = useMemo(
    () => sortedExpenses.filter((expense) => normalizeDate(expense.date).startsWith(currentMonth)),
    [sortedExpenses, currentMonth]
  );

  const showPulseAlert = () => {
    if (budgetPercent >= 100) {
      Alert.alert(
        "Budget Limit Reached",
        `You have used ${budgetPercent}% of your monthly budget of ${formatMoney(budget)} (Spent: ${formatMoney(monthTotal)}).`
      );
    } else if (budgetPercent >= 80) {
      Alert.alert(
        "Approaching Budget",
        `You've used ${budgetPercent}% of your monthly budget. Remaining balance is ${formatMoney(remaining)}.`
      );
    } else {
      Alert.alert(
        "Spending Pulse",
        `Looking good! You've used ${budgetPercent}% of your ${formatMoney(budget)} budget with ${formatMoney(remaining)} remaining.`
      );
    }
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
            <Text style={styles.kicker}>{todayLabel}</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>
              {greeting}, {account?.name?.split(" ")[0] || "there"}
              <Text style={styles.dot}>.</Text>
            </Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>Here’s your financial pulse for today.</Text>
          </View>
          <Pressable
            style={[styles.bell, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={showPulseAlert}
          >
            <Ionicons name="notifications-outline" size={20} color={colors.muted} />
            <View style={styles.notificationDot} />
          </Pressable>
        </View>

        {/* Action Row */}
        <View style={styles.actionRow}>
          <View style={[styles.monthPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="calendar-outline" size={15} color={colors.primary} />
            <Text style={[styles.monthText, { color: colors.foreground }]}>{monthLabel}</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
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
              <Text style={styles.kicker}>MONEY MAP</Text>
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
            <Text style={[styles.footerValue, { color: colors.foreground }]}>{topCategory(monthExpenses)}</Text>
          </View>
        </View>

        {/* Daily Rhythm Weekly Chart */}
        <DailyRhythm expenses={sortedExpenses} />

        {/* Latest Activity Panel */}
        <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.kicker}>LATEST ACTIVITY</Text>
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
        <View style={styles.insight}>
          <View style={styles.insightIcon}>
            <Ionicons name="sparkles" size={17} color="#FFFFFF" />
          </View>
          <Text style={styles.kickerLight}>SPENDING INSIGHT</Text>
          <Text style={styles.insightTitle}>Your wallet has a pattern.</Text>
          <Text style={styles.insightCopy}>
            {monthExpenses.length
              ? `${topCategoryName(monthExpenses)} is currently your largest category this month.`
              : "Add your first expense to unlock spending insights and intelligent breakdowns."}
          </Text>
        </View>
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
    </ScreenContainer>
  );
}

function DonutChart({ total, expenses }: { total: number; expenses: Expense[] }) {
  const { colors } = useTheme();
  const totals = categories
    .map((category) => ({
      category,
      total: expenses
        .filter((expense) => expense.category === category)
        .reduce((sum, expense) => sum + (expense.amount || 0), 0),
    }))
    .filter((item) => item.total > 0);

  const radius = 55;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <View style={styles.donutWrap}>
      <Svg width={135} height={135} viewBox="0 0 135 135" style={{ transform: [{ rotate: "-90deg" }] }}>
        <Circle cx="67.5" cy="67.5" r={radius} stroke={colors.border} strokeWidth="24" fill="none" />
        {totals.map(({ category, total: categoryTotal }) => {
          const length = total > 0 ? (categoryTotal / total) * circumference : 0;
          const segment = (
            <Circle
              key={category}
              cx="67.5"
              cy="67.5"
              r={radius}
              stroke={categoryMeta[category].color}
              strokeWidth="24"
              fill="none"
              strokeDasharray={[length, Math.max(0, circumference - length)]}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
          offset += length;
          return segment;
        })}
      </Svg>
      <View style={[styles.donutHole, { backgroundColor: colors.surface }]}>
        <Text style={[styles.donutTotal, { color: colors.foreground }]}>{formatMoney(total)}</Text>
        <Text style={[styles.donutLabel, { color: colors.subtle }]}>total spent</Text>
      </View>
    </View>
  );
}

function CategoryLegend({ expenses }: { expenses: Expense[] }) {
  const { colors } = useTheme();
  const totals = useMemo(
    () =>
      categories
        .map((category) => ({
          category,
          total: expenses
            .filter((expense) => expense.category === category)
            .reduce((sum, expense) => sum + (expense.amount || 0), 0),
        }))
        .filter((item) => item.total > 0)
        .sort((a, b) => b.total - a.total)
        .slice(0, 5),
    [expenses]
  );

  if (totals.length === 0) {
    return (
      <View style={styles.legendEmpty}>
        <Text style={[styles.legendEmptyText, { color: colors.muted }]}>No category spending yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.legend}>
      {totals.map(({ category, total }) => (
        <View style={styles.legendRow} key={category}>
          <View style={styles.legendName}>
            <View style={[styles.legendDot, { backgroundColor: categoryMeta[category].color }]} />
            <Text style={[styles.legendText, { color: colors.muted }]}>{category}</Text>
          </View>
          <Text style={[styles.legendAmount, { color: colors.foreground }]}>{formatMoney(total)}</Text>
        </View>
      ))}
    </View>
  );
}

function DailyRhythm({ expenses }: { expenses: Expense[] }) {
  const { colors } = useTheme();
  const anchor = new Date(`${getPhilippinesDate()}T12:00:00Z`);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(anchor);
    date.setUTCDate(anchor.getUTCDate() - (6 - index));
    const key = getPhilippinesDate(date);
    return {
      key,
      dayName: getWeekdayShort(date),
      label: key.slice(8).replace(/^0/, ""),
      total: expenses
        .filter((expense) => normalizeDate(expense.date) === key)
        .reduce((sum, expense) => sum + (expense.amount || 0), 0),
    };
  });
  const max = Math.max(...days.map((day) => day.total), 1);
  const weekTotal = days.reduce((sum, day) => sum + day.total, 0);

  return (
    <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.panelHeader}>
        <View>
          <Text style={styles.kicker}>DAILY RHYTHM</Text>
          <Text style={[styles.panelTitle, { color: colors.foreground }]}>This week</Text>
        </View>
        <Text style={[styles.smallMuted, { color: colors.subtle }]}>
          {days[0].key.slice(5).replace("-", "/")} – {days[6].key.slice(5).replace("-", "/")}
        </Text>
      </View>
      <Text style={[styles.weekTotal, { color: colors.foreground }]}>{formatMoney(weekTotal)}</Text>
      <View style={[styles.bars, { borderBottomColor: colors.border }]}>
        {days.map((day, index) => (
          <View style={styles.barColumn} key={day.key}>
            <View
              style={[
                styles.bar,
                { height: `${day.total ? Math.max(8, (day.total / max) * 100) : 0}%` },
                index === days.length - 1 && styles.barToday,
              ]}
            />
            <Text style={[styles.barLabel, { color: colors.subtle }, index === days.length - 1 && styles.barLabelToday]}>
              {day.dayName}
            </Text>
          </View>
        ))}
      </View>
      <View style={styles.weekChange}>
        <Ionicons name="analytics-outline" size={13} color="#5A9E7E" />
        <Text style={[styles.weekChangeText, { color: colors.success }]}>
          {weekTotal ? `${days.filter((day) => day.total > 0).length} active days this week` : "No spending recorded this week"}
        </Text>
      </View>
    </View>
  );
}

function topCategoryName(expenses: Expense[]) {
  const totals = expenses.reduce<Record<string, number>>(
    (map, expense) => ({ ...map, [expense.category]: (map[expense.category] || 0) + (expense.amount || 0) }),
    {}
  );
  const top = Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
  return top ? top[0] : "No spending yet";
}

function topCategory(expenses: Expense[]) {
  const name = topCategoryName(expenses);
  const total = expenses
    .filter((expense) => expense.category === name)
    .reduce((sum, expense) => sum + (expense.amount || 0), 0);
  return name === "No spending yet" ? name : `${name}  ${formatMoney(total)}`;
}

const styles = StyleSheet.create({
  loadingState: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  loadingTitle: { fontFamily: "Fraunces_700Bold", fontSize: 18, fontWeight: "700", marginTop: 8 },
  loadingCopy: { fontSize: 12, textAlign: "center" },
  scroll: { paddingBottom: 32 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingTop: 8, marginBottom: 18 },
  kicker: { color: "#EB6F61", fontSize: 10, fontWeight: "800", letterSpacing: 1.4 },
  kickerLight: { color: "#A4C8BA", fontSize: 10, fontWeight: "800", letterSpacing: 1.4 },
  title: { fontFamily: "Fraunces_700Bold", fontSize: 32, fontWeight: "700", letterSpacing: -1.2, marginTop: 6 },
  dot: { color: "#EB6F61" },
  subtitle: { fontSize: 12, marginTop: 4 },
  bell: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 12, borderWidth: 1 },
  notificationDot: { position: "absolute", top: 10, right: 10, width: 6, height: 6, borderRadius: 3, backgroundColor: "#EB6F61", borderWidth: 1, borderColor: "#FFFFFF" },
  actionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  monthPill: { flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 12, height: 38, borderRadius: 10, borderWidth: 1 },
  monthText: { fontSize: 12, fontWeight: "600" },
  addButton: { flexDirection: "row", alignItems: "center", gap: 6, height: 38, paddingHorizontal: 15, borderRadius: 10, backgroundColor: "#EB6F61", shadowColor: "#EB6F61", shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  addButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  metricGrid: { gap: 10, marginBottom: 16 },
  panel: { padding: 18, marginBottom: 16, borderRadius: 16, borderWidth: 1, shadowColor: "#000", shadowOpacity: 0.02, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  panelHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  panelTitle: { fontFamily: "Fraunces_700Bold", fontSize: 20, fontWeight: "700", letterSpacing: -0.4, marginTop: 4 },
  smallMuted: { fontSize: 10, marginTop: 3 },
  overviewRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-around", minHeight: 180, gap: 10, marginVertical: 8 },
  donutWrap: { width: 135, height: 135, alignItems: "center", justifyContent: "center", position: "relative" },
  donutHole: { position: "absolute", width: 87, height: 87, alignItems: "center", justifyContent: "center", borderRadius: 45 },
  donutTotal: { fontFamily: "Fraunces_700Bold", fontSize: 15, fontWeight: "700" },
  donutLabel: { fontSize: 8, marginTop: 2 },
  legend: { flex: 1, gap: 10 },
  legendEmpty: { flex: 1, alignItems: "center", justifyContent: "center" },
  legendEmptyText: { fontSize: 11 },
  legendRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  legendName: { flexDirection: "row", alignItems: "center", gap: 8 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, fontWeight: "500" },
  legendAmount: { fontSize: 11, fontWeight: "700" },
  panelFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 14, borderTopWidth: 1 },
  footerLabel: { fontSize: 10, fontWeight: "500" },
  footerValue: { fontSize: 11, fontWeight: "700" },
  weekTotal: { fontFamily: "Fraunces_700Bold", fontSize: 26, fontWeight: "700", marginTop: 16 },
  bars: { height: 130, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 10, marginTop: 12, borderBottomWidth: 1 },
  barColumn: { flex: 1, height: "100%", alignItems: "center", justifyContent: "flex-end", gap: 8 },
  bar: { width: 22, borderRadius: 6, backgroundColor: "#9ACCAF" },
  barToday: { backgroundColor: "#EB6F61" },
  barLabel: { fontSize: 9, fontWeight: "600", marginBottom: 6 },
  barLabelToday: { color: "#EB6F61", fontWeight: "800" },
  weekChange: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 12 },
  weekChangeText: { fontSize: 10, fontWeight: "600" },
  emptyRecent: { paddingVertical: 24, alignItems: "center" },
  emptyRecentText: { fontSize: 12 },
  insight: { minHeight: 190, padding: 20, marginBottom: 16, borderRadius: 16, backgroundColor: "#27453F" },
  insightIcon: { width: 34, height: 34, alignItems: "center", justifyContent: "center", marginBottom: 16, borderRadius: 10, backgroundColor: "#EB6F61" },
  insightTitle: { fontFamily: "Fraunces_700Bold", color: "#FFFFFF", fontSize: 24, fontWeight: "700", letterSpacing: -0.6, marginTop: 8 },
  insightCopy: { color: "#B8CEC5", fontSize: 11, lineHeight: 18, marginTop: 8, maxWidth: 290 },
});
