import { useMemo, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { ScreenContainer } from "@/components/screen-container";
import {
  Category,
  Expense,
  Payment,
  categoryMeta,
  getPhilippinesDate,
  getPhilippinesMonth,
  normalizeDate,
  useExpenses,
} from "@/lib/expense-store";
import { useAuth } from "@/lib/auth-store";
import { useTheme } from "@/lib/theme-store";

const categories: Category[] = ["Food", "Transport", "School", "Shopping", "Bills", "Fun", "Health", "Other"];
const payments: Payment[] = ["Cash", "GCash", "Card", "Bank"];
const money = (value: number) => `₱${(value || 0).toLocaleString("en-PH", { maximumFractionDigits: 0 })}`;
const prettyDate = (date: string) => {
  try {
    const clean = (date || "").slice(0, 10);
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
      new Date(`${clean}T12:00:00`)
    );
  } catch {
    return date || "";
  }
};

export default function OverviewScreen() {
  const { hydrated, monthTotal, todayTotal, remaining, budget, budgetPercent, sortedExpenses, addExpense } =
    useExpenses();
  const { account } = useAuth();
  const { colors, dark } = useTheme();

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
  const monthExpenses = sortedExpenses.filter((expense) => normalizeDate(expense.date).startsWith(currentMonth));

  const [showAdd, setShowAdd] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("Food");
  const [payment, setPayment] = useState<Payment>("Cash");

  const submit = () => {
    const numeric = parseFloat(amount);
    if (isNaN(numeric) || numeric <= 0) {
      Alert.alert("Invalid amount", "Please enter a valid expense amount greater than 0.");
      return;
    }
    if (!description.trim()) {
      Alert.alert("Missing description", "Please enter what this expense was for.");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addExpense({
      amount: Math.round(numeric * 100) / 100,
      description: description.trim(),
      category,
      payment,
      date: getPhilippinesDate(),
    });
    setAmount("");
    setDescription("");
    setCategory("Food");
    setPayment("Cash");
    setShowAdd(false);
  };

  const showPulseAlert = () => {
    if (budgetPercent >= 100) {
      Alert.alert(
        "Budget Limit Reached",
        `You have used ${budgetPercent}% of your monthly budget of ${money(budget)} (Spent: ${money(monthTotal)}).`
      );
    } else if (budgetPercent >= 80) {
      Alert.alert(
        "Approaching Budget",
        `You've used ${budgetPercent}% of your monthly budget. Remaining balance is ${money(remaining)}.`
      );
    } else {
      Alert.alert(
        "Spending Pulse",
        `Looking good! You've used ${budgetPercent}% of your ${money(budget)} budget. ${money(remaining)} remaining this month.`
      );
    }
  };

  if (!hydrated) {
    return (
      <ScreenContainer>
        <View style={styles.loadingState}>
          <Ionicons name="sync-outline" size={24} color={colors.primary} />
          <Text style={[styles.loadingTitle, { color: colors.foreground }]}>Loading your ledger</Text>
          <Text style={[styles.loadingCopy, { color: colors.muted }]}>Restoring your saved expenses.</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View>
            <Text style={styles.kicker}>{todayLabel}</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>
              {greeting}, {account?.name || "there"}
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

        <View style={styles.actionRow}>
          <View style={[styles.monthPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="calendar-outline" size={15} color={colors.primary} />
            <Text style={[styles.monthText, { color: colors.foreground }]}>{monthLabel}</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
            onPress={() => setShowAdd(true)}
          >
            <Ionicons name="add" size={17} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add expense</Text>
          </Pressable>
        </View>

        <View style={styles.metricGrid}>
          <Metric
            label="Spent this month"
            value={money(monthTotal)}
            icon={<Ionicons name="trending-up" size={16} color="#EB6F61" />}
            tone="coral"
            foot={monthTotal ? "Live from your records" : "No records yet"}
          />
          <Metric
            label="Spent today"
            value={money(todayTotal)}
            icon={<Ionicons name="cash-outline" size={16} color="#4D8AF0" />}
            tone="blue"
            foot={todayTotal ? "Updated live" : "No records today"}
          />
          <Metric
            label="Remaining budget"
            value={money(remaining)}
            icon={<Ionicons name="wallet-outline" size={16} color="#5A9E7E" />}
            tone="green"
            foot={`${budgetPercent}% of ${money(budget)} used`}
            progress={budgetPercent}
          />
        </View>

        <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.kicker}>MONEY MAP</Text>
              <Text style={[styles.panelTitle, { color: colors.foreground }]}>Spending overview</Text>
            </View>
            <Text style={[styles.smallMuted, { color: colors.subtle }]}>This month</Text>
          </View>
          <View style={styles.overviewRow}>
            <Donut total={monthTotal} expenses={monthExpenses} />
            <CategoryLegend expenses={monthExpenses} />
          </View>
          <View style={[styles.panelFooter, { borderTopColor: colors.border }]}>
            <Text style={[styles.footerLabel, { color: colors.muted }]}>Highest spending category</Text>
            <Text style={[styles.footerValue, { color: colors.foreground }]}>{topCategory(monthExpenses)}</Text>
          </View>
        </View>

        <DailyRhythm expenses={sortedExpenses} />

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
            sortedExpenses.slice(0, 5).map((expense) => <Transaction key={expense.id} expense={expense} />)
          )}
        </View>

        <View style={styles.insight}>
          <View style={styles.insightIcon}>
            <Ionicons name="sparkles" size={17} color="#FFFFFF" />
          </View>
          <Text style={styles.kickerLight}>SPENDING INSIGHT</Text>
          <Text style={styles.insightTitle}>Your wallet has a pattern.</Text>
          <Text style={styles.insightCopy}>
            {monthExpenses.length
              ? `${topCategoryName(monthExpenses)} is currently your largest category this month.`
              : "Add your first expense to unlock spending insights."}
          </Text>
        </View>
      </ScrollView>

      <Modal visible={showAdd} transparent animationType="slide" onRequestClose={() => setShowAdd(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.kicker}>NEW RECORD</Text>
                <Text style={[styles.modalTitle, { color: colors.foreground }]}>Add an expense</Text>
                <Text style={[styles.modalCopy, { color: colors.muted }]}>Keep your spending story up to date.</Text>
              </View>
              <Pressable onPress={() => setShowAdd(false)}>
                <Ionicons name="close" size={20} color={colors.muted} />
              </Pressable>
            </View>

            <Text style={[styles.inputLabel, { color: colors.subtle }]}>AMOUNT</Text>
            <View style={[styles.amountInput, { backgroundColor: dark ? colors.surfaceSubtle : "#FFFAF9" }]}>
              <Text style={styles.currency}>₱</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={colors.subtle}
                style={[styles.amountTextInput, { color: colors.foreground }]}
                autoFocus
              />
            </View>

            <Text style={[styles.inputLabel, { color: colors.subtle }]}>DESCRIPTION</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="What was this for?"
              placeholderTextColor={colors.subtle}
              style={[
                styles.input,
                { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground },
              ]}
            />

            <Text style={[styles.inputLabel, { color: colors.subtle }]}>CATEGORY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {categories.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setCategory(item)}
                  style={[
                    styles.chip,
                    { borderColor: colors.border, backgroundColor: colors.surface },
                    category === item && {
                      backgroundColor: categoryMeta[item].soft,
                      borderColor: categoryMeta[item].color,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: colors.muted },
                      category === item && { color: categoryMeta[item].color, fontWeight: "700" },
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={[styles.inputLabel, { color: colors.subtle }]}>PAYMENT</Text>
            <View style={styles.chipRow}>
              {payments.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setPayment(item)}
                  style={[
                    styles.chip,
                    { borderColor: colors.border, backgroundColor: colors.surface },
                    payment === item && styles.paymentChip,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: colors.muted },
                      payment === item && styles.paymentText,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]} onPress={submit}>
              <Text style={styles.saveButtonText}>Save expense</Text>
              <Ionicons name="arrow-up" size={17} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

function Metric({
  label,
  value,
  icon,
  tone,
  foot,
  progress,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: "coral" | "blue" | "green";
  foot: string;
  progress?: number;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.metric, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.metricTop}>
        <Text style={[styles.metricLabel, { color: colors.muted }]}>{label}</Text>
        <View
          style={[
            styles.metricIcon,
            tone === "coral" && styles.metricCoral,
            tone === "blue" && styles.metricBlue,
            tone === "green" && styles.metricGreen,
          ]}
        >
          {icon}
        </View>
      </View>
      <Text style={[styles.metricValue, { color: colors.foreground }]}>{value}</Text>
      {progress !== undefined && (
        <View style={[styles.progress, { backgroundColor: colors.border }]}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      )}
      <Text style={[styles.metricFoot, { color: colors.subtle }]}>{foot}</Text>
    </View>
  );
}

function Donut({ total, expenses }: { total: number; expenses: Expense[] }) {
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
        <Text style={[styles.donutTotal, { color: colors.foreground }]}>{money(total)}</Text>
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
          <Text style={[styles.legendAmount, { color: colors.foreground }]}>{money(total)}</Text>
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
      <Text style={[styles.weekTotal, { color: colors.foreground }]}>{money(weekTotal)}</Text>
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
              {day.label}
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

function Transaction({ expense }: { expense: Expense }) {
  const { colors } = useTheme();
  const meta = categoryMeta[expense.category] || categoryMeta.Other;
  return (
    <View style={[styles.transaction, { borderBottomColor: colors.border }]}>
      <View style={[styles.transactionIcon, { backgroundColor: meta.soft }]}>
        <Ionicons name="card-outline" size={16} color={meta.color} />
      </View>
      <View style={styles.transactionBody}>
        <Text style={[styles.transactionTitle, { color: colors.foreground }]}>{expense.description}</Text>
        <Text style={[styles.transactionMeta, { color: colors.subtle }]}>
          {expense.category} · {expense.payment}
        </Text>
      </View>
      <View>
        <Text style={[styles.transactionAmount, { color: colors.foreground }]}>−{money(expense.amount)}</Text>
        <Text style={[styles.transactionDate, { color: colors.subtle }]}>{prettyDate(expense.date)}</Text>
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
  return name === "No spending yet" ? name : `${name}  ${money(total)}`;
}

const styles = StyleSheet.create({
  loadingState: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  loadingTitle: { fontSize: 17, fontWeight: "700", marginTop: 8 },
  loadingCopy: { fontSize: 11, textAlign: "center" },
  scroll: { paddingBottom: 30 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingTop: 8, marginBottom: 18 },
  kicker: { color: "#EB6F61", fontSize: 10, fontWeight: "800", letterSpacing: 1.4 },
  kickerLight: { color: "#A4C8BA", fontSize: 10, fontWeight: "800", letterSpacing: 1.4 },
  title: { fontFamily: "Fraunces_700Bold", fontSize: 33, fontWeight: "700", letterSpacing: -1.3, marginTop: 8 },
  dot: { color: "#EB6F61" },
  subtitle: { fontFamily: "Fraunces_700Bold", fontSize: 12, marginTop: 6 },
  bell: { width: 38, height: 38, alignItems: "center", justifyContent: "center", borderRadius: 12, borderWidth: 1 },
  notificationDot: { position: "absolute", top: 9, right: 9, width: 6, height: 6, borderRadius: 5, backgroundColor: "#EB6F61", borderWidth: 1, borderColor: "#FFFFFF" },
  actionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  monthPill: { flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 10, height: 35, borderRadius: 9, borderWidth: 1 },
  monthText: { fontSize: 11 },
  addButton: { flexDirection: "row", alignItems: "center", gap: 7, height: 38, paddingHorizontal: 14, borderRadius: 10, backgroundColor: "#EB6F61", shadowColor: "#EB6F61", shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  addButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
  metricGrid: { gap: 10, marginBottom: 15 },
  metric: { minHeight: 115, padding: 16, borderRadius: 14, borderWidth: 1 },
  metricTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  metricLabel: { fontSize: 11 },
  metricIcon: { width: 29, height: 29, alignItems: "center", justifyContent: "center", borderRadius: 9 },
  metricCoral: { backgroundColor: "#FFF0ED" },
  metricBlue: { backgroundColor: "#EEF4FF" },
  metricGreen: { backgroundColor: "#EDF8F1" },
  metricValue: { fontSize: 26, fontWeight: "700", letterSpacing: -0.8, marginTop: 10 },
  metricFoot: { fontSize: 10, marginTop: 8 },
  progress: { height: 5, marginTop: 12, borderRadius: 8, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 8, backgroundColor: "#5A9E7E" },
  panel: { padding: 17, marginBottom: 15, borderRadius: 15, borderWidth: 1 },
  panelHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  panelTitle: { fontFamily: "Fraunces_700Bold", fontSize: 20, fontWeight: "700", letterSpacing: -0.4, marginTop: 6 },
  smallMuted: { fontSize: 10, marginTop: 3 },
  overviewRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-around", minHeight: 190, gap: 9 },
  donutWrap: { width: 135, height: 135, alignItems: "center", justifyContent: "center", position: "relative" },
  donutHole: { position: "absolute", width: 87, height: 87, alignItems: "center", justifyContent: "center", borderRadius: 50 },
  donutTotal: { fontSize: 16, fontWeight: "700" },
  donutLabel: { fontSize: 8, marginTop: 3 },
  legend: { flex: 1, gap: 11 },
  legendEmpty: { flex: 1, alignItems: "center", justifyContent: "center" },
  legendEmptyText: { fontSize: 11 },
  legendRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  legendName: { flexDirection: "row", alignItems: "center", gap: 7 },
  legendDot: { width: 7, height: 7, borderRadius: 5 },
  legendText: { fontSize: 10 },
  legendAmount: { fontSize: 10, fontWeight: "700" },
  panelFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 13, borderTopWidth: 1 },
  footerLabel: { fontSize: 10 },
  footerValue: { fontSize: 10, fontWeight: "700" },
  weekTotal: { fontSize: 28, fontWeight: "700", marginTop: 22 },
  bars: { height: 130, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 11, marginTop: 12, borderBottomWidth: 1 },
  barColumn: { flex: 1, height: "100%", alignItems: "center", justifyContent: "flex-end", gap: 7 },
  bar: { width: 22, borderRadius: 6, backgroundColor: "#9ACCAF" },
  barToday: { backgroundColor: "#EB6F61" },
  barLabel: { fontSize: 9, marginBottom: 6 },
  barLabelToday: { color: "#EB6F61", fontWeight: "700" },
  weekChange: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 12 },
  weekChangeText: { fontSize: 10, fontWeight: "600" },
  emptyRecent: { paddingVertical: 20, alignItems: "center" },
  emptyRecentText: { fontSize: 12 },
  transaction: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 62, borderBottomWidth: 1 },
  transactionIcon: { width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 10 },
  transactionBody: { flex: 1 },
  transactionTitle: { fontSize: 11, fontWeight: "700" },
  transactionMeta: { fontSize: 9, marginTop: 4 },
  transactionAmount: { fontSize: 12, fontWeight: "700", textAlign: "right" },
  transactionDate: { fontSize: 9, textAlign: "right", marginTop: 4 },
  insight: { minHeight: 200, padding: 20, marginBottom: 15, borderRadius: 15, backgroundColor: "#27453F" },
  insightIcon: { width: 34, height: 34, alignItems: "center", justifyContent: "center", marginBottom: 20, borderRadius: 10, backgroundColor: "#EB6F61" },
  insightTitle: { fontFamily: "Fraunces_700Bold", color: "#FFFFFF", fontSize: 25, fontWeight: "700", letterSpacing: -0.7, marginTop: 9 },
  insightCopy: { color: "#B8CEC5", fontSize: 11, lineHeight: 18, marginTop: 10, maxWidth: 280 },
  modalBackdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(24,31,28,.45)" },
  modalCard: { padding: 22, paddingBottom: 35, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  modalTitle: { fontSize: 27, fontWeight: "700", marginTop: 7 },
  modalCopy: { fontSize: 11, marginTop: 5 },
  inputLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1.2, marginTop: 14, marginBottom: 7 },
  amountInput: { flexDirection: "row", alignItems: "center", height: 62, paddingHorizontal: 15, borderRadius: 11, borderWidth: 1, borderColor: "#F2B8B0" },
  currency: { color: "#EB6F61", fontSize: 26, fontWeight: "700" },
  amountTextInput: { flex: 1, fontSize: 27, fontWeight: "700", paddingLeft: 5 },
  input: { height: 42, paddingHorizontal: 12, fontSize: 11, borderRadius: 9, borderWidth: 1 },
  chipRow: { flexDirection: "row", gap: 7 },
  chip: { paddingHorizontal: 11, height: 33, alignItems: "center", justifyContent: "center", borderRadius: 8, borderWidth: 1 },
  chipText: { fontSize: 10, fontWeight: "600" },
  paymentChip: { borderColor: "#F2B8B0", backgroundColor: "#FFF0ED" },
  paymentText: { color: "#EB6F61" },
  saveButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, height: 46, marginTop: 23, borderRadius: 10, backgroundColor: "#EB6F61" },
  saveButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
});
