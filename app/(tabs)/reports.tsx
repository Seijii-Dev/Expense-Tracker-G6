import React, { useMemo, useState } from "react";
import { Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ScreenContainer } from "@/components/screen-container";
import { CategoryBreakdown } from "@/components/reports/category-breakdown";
import { PaymentMethods } from "@/components/reports/payment-methods";
import { ReportNote } from "@/components/reports/report-note";
import { useExpenses } from "@/lib/expense-store";
import { useTheme } from "@/lib/theme-store";
import { formatMoney, formatPercent } from "@/utils/formatters";
import { useReportMetrics } from "@/hooks/useReportMetrics";
import { ReportsSkeleton } from "@/components/ui/reports-skeleton";
import { exportExpensesToCsv } from "@/utils/export-csv";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { GlassSurface } from "@/components/ui/glass-surface";

import { SpendingTrendChart } from "@/components/reports/spending-trend-chart";
import { MotionEntrance, MotionSegmentedControl, PressableScale } from "@/components/motion";
import { getExpenseDateKey, getPhilippinesDate } from "@/utils/date";
import { DatePickerModal } from "@/components/common/date-picker-modal";
import { radii, spacing, typography } from "@/constants/design-tokens";
import { getCategoryDisplayName } from "@/constants/categories";
import {
  buildSpendingTimeline,
  shiftTrajectoryAnchorDate,
  TrajectoryInterval,
} from "@/utils/spending-trajectory";

export default function ReportsScreen() {
  const { expenses, budget, refreshExpenses, syncing, hydrated, allCategories, customCategories } = useExpenses();
  const { colors, dark } = useTheme();

  const [timeframe, setTimeframe] = useState<TrajectoryInterval>("Monthly");
  const [selectedDate, setSelectedDate] = useState(() => getPhilippinesDate());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [exportNotice, setExportNotice] = useState<{
    title: string;
    message: string;
  } | null>(null);

  const todayDate = getPhilippinesDate();
  const timeline = useMemo(
    () => buildSpendingTimeline(expenses, timeframe, selectedDate),
    [expenses, timeframe, selectedDate]
  );

  const {
    monthExpenses: periodExpenses,
    monthTotal: periodTotal,
    categoryTotals,
    paymentTotals,
    activeCategoryCount,
    maxCategorySpend,
    topCategory,
  } = useReportMetrics(expenses, allCategories, timeline.expenses);

  const averageExpenseSize = periodExpenses.length
    ? formatMoney(periodTotal / periodExpenses.length)
    : formatMoney(0);

  const topExpense = useMemo(() => {
    if (!periodExpenses.length) return null;
    return periodExpenses.reduce((max, exp) => (exp.amount > (max?.amount || 0) ? exp : max), periodExpenses[0]);
  }, [periodExpenses]);

  const selectedMonth = selectedDate.slice(0, 7);
  const selectedMonthTotal = expenses.reduce(
    (total, expense) =>
      getExpenseDateKey(expense.date).startsWith(selectedMonth)
        ? total + (Number(expense.amount) || 0)
        : total,
    0
  );
  const budgetLeft = Math.max(0, budget - selectedMonthTotal);

  const navigateDate = (direction: -1 | 1) => {
    const nextDate = shiftTrajectoryAnchorDate(timeframe, selectedDate, direction);
    setSelectedDate(direction > 0 && nextDate > todayDate ? todayDate : nextDate);
  };

  const handleExportStatement = async () => {
    const res = await exportExpensesToCsv(periodExpenses, false);
    setExportNotice({
      title: res.title,
      message: res.message,
    });
  };

  if (!hydrated) {
    return (
      <ScreenContainer>
        <ReportsSkeleton />
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
        {/* Header with Export Action */}
        <MotionEntrance delay={0}>
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.kicker, { color: colors.muted }]}>ANALYTICS</Text>
              <Text style={[styles.screenTitle, { color: colors.foreground }]}>Financial Reports</Text>
            </View>
            <PressableScale
              style={[
                styles.exportBtn,
                {
                  backgroundColor: dark ? "rgba(255,255,255,0.06)" : colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={handleExportStatement}
              accessibilityRole="button"
              accessibilityLabel="Export Financial Statement"
            >
              <Ionicons name="share-outline" size={18} color={colors.foreground} />
            </PressableScale>
          </View>

          {/* Timeframe Segmented Control with Motion.dev Morphing Pill */}
          <MotionSegmentedControl<TrajectoryInterval>
            options={[
              { id: "Day", label: "Day" },
              { id: "Weekly", label: "Weekly" },
              { id: "Monthly", label: "Monthly" },
              { id: "Yearly", label: "Yearly" },
            ]}
            selectedId={timeframe}
            onSelect={(newTimeframe) => setTimeframe(newTimeframe)}
            style={{ marginBottom: 12 }}
          />
        </MotionEntrance>

        {/* Selected Period Navigator Sub-selector */}
        <MotionEntrance delay={40}>
          <View style={styles.dateNavigator}>
            <Pressable
              style={({ pressed }) => [
                styles.navArrowBtn,
                { backgroundColor: dark ? "rgba(255,255,255,0.04)" : colors.surfaceSubtle },
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => navigateDate(-1)}
              accessibilityRole="button"
              accessibilityLabel="Show previous period"
            >
              <Ionicons name="chevron-back" size={16} color={colors.muted} />
            </Pressable>

            <Pressable
              style={styles.dateLabelRow}
              onPress={() => setShowDatePicker(true)}
              accessibilityRole="button"
              accessibilityLabel={`Choose reporting date, currently ${timeline.rangeLabel}`}
            >
              <Ionicons name="calendar-outline" size={15} color="#E84A3F" style={{ marginRight: 6 }} />
              <Text
                style={[styles.dateNavigatorText, { color: colors.foreground }]}
                numberOfLines={1}
              >
                {timeline.rangeLabel}
              </Text>
              <Ionicons name="chevron-down" size={14} color={colors.muted} style={{ marginLeft: 4 }} />
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.navArrowBtn,
                { backgroundColor: dark ? "rgba(255,255,255,0.04)" : colors.surfaceSubtle },
                selectedDate >= todayDate && styles.disabledNavArrow,
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => navigateDate(1)}
              disabled={selectedDate >= todayDate}
              accessibilityRole="button"
              accessibilityLabel="Show next period"
            >
              <Ionicons name="chevron-forward" size={16} color={selectedDate >= todayDate ? colors.subtle : colors.muted} />
            </Pressable>
          </View>

          {selectedDate !== todayDate && (
            <View style={styles.todayActionRow}>
              <PressableScale
                onPress={() => setSelectedDate(todayDate)}
                accessibilityRole="button"
                accessibilityLabel="Show today's report"
                style={[
                  styles.todayAction,
                  {
                    backgroundColor: dark ? "rgba(232, 74, 63, 0.15)" : "#FFF0ED",
                    borderColor: dark ? "rgba(232, 74, 63, 0.3)" : "#FED7D2",
                  },
                ]}
              >
                <Ionicons name="today-outline" size={13} color="#E84A3F" />
                <Text style={styles.todayActionText}>Jump to Today</Text>
              </PressableScale>
            </View>
          )}
        </MotionEntrance>

        {/* Spending Trajectory Area Curve Chart */}
        <MotionEntrance delay={80}>
          <SpendingTrendChart timeline={timeline} />
        </MotionEntrance>

        {/* Performance Metric Grid */}
        <MotionEntrance delay={120}>
          <View style={styles.metricsGrid}>
            <View style={styles.metricsRow}>
              {/* Top Expense */}
              <GlassSurface variant="card" radius={16} style={styles.metricCard}>
                <View style={styles.metricTop}>
                  <Text style={[styles.metricKicker, { color: colors.muted }]}>TOP EXPENSE</Text>
                  <View
                    style={[
                      styles.metricIconBox,
                      { backgroundColor: dark ? "rgba(232, 74, 63, 0.15)" : "#FFF0ED" },
                    ]}
                  >
                    <Ionicons name="flame" size={15} color="#E84A3F" />
                  </View>
                </View>
                <Text style={[styles.metricValue, { color: colors.foreground }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.72}>
                  {topExpense ? formatMoney(topExpense.amount) : "₱0.00"}
                </Text>
                <Text style={[styles.metricSub, { color: colors.muted }]} numberOfLines={1}>
                  {topExpense ? getCategoryDisplayName(topExpense.category) : "No spend logged"}
                </Text>
              </GlassSurface>

              {/* Activity / Transactions */}
              <GlassSurface variant="card" radius={16} style={styles.metricCard}>
                <View style={styles.metricTop}>
                  <Text style={[styles.metricKicker, { color: colors.muted }]}>RECORDS</Text>
                  <View
                    style={[
                      styles.metricIconBox,
                      { backgroundColor: dark ? "rgba(16, 185, 129, 0.15)" : "#E6F4EA" },
                    ]}
                  >
                    <Ionicons name="receipt-outline" size={15} color="#10B981" />
                  </View>
                </View>
                <Text style={[styles.metricValue, { color: colors.success }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.72}>
                  {periodExpenses.length} {periodExpenses.length === 1 ? "Transaction" : "Transactions"}
                </Text>
                <Text style={[styles.metricSub, { color: colors.muted }]} numberOfLines={1}>
                  Avg: {averageExpenseSize}
                </Text>
              </GlassSurface>
            </View>

            <View style={styles.metricsRow}>
              {/* Remaining Budget */}
              <GlassSurface variant="card" radius={16} style={styles.metricCard}>
                <View style={styles.metricTop}>
                  <Text style={[styles.metricKicker, { color: colors.muted }]}>REMAINING BUDGET</Text>
                  <View
                    style={[
                      styles.metricIconBox,
                      { backgroundColor: dark ? "rgba(255,255,255,0.06)" : colors.surfaceSubtle },
                    ]}
                  >
                    <Ionicons name="wallet-outline" size={15} color={colors.foreground} />
                  </View>
                </View>
                <Text style={[styles.metricValue, { color: colors.foreground }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.72}>
                  {formatMoney(budgetLeft)}
                </Text>
                <Text style={[styles.metricSub, { color: colors.muted }]} numberOfLines={1}>
                  of {formatMoney(budget)} target
                </Text>
              </GlassSurface>
            </View>
          </View>
        </MotionEntrance>

        {/* Category Breakdown Panel */}
        <MotionEntrance delay={160}>
          <CategoryBreakdown
            categoryTotals={categoryTotals}
            periodTotal={timeline.total}
            maxCategorySpend={maxCategorySpend}
            activeCount={activeCategoryCount}
            customCategories={customCategories}
          />
        </MotionEntrance>

        {/* Payment Methods Panel */}
        <MotionEntrance delay={200}>
          <PaymentMethods paymentTotals={paymentTotals} periodTotal={timeline.total} />
        </MotionEntrance>

        {/* Spending Health Insight Banner */}
        <MotionEntrance delay={240}>
          <GlassSurface
            variant="card"
            radius={18}
            style={[
              styles.delightCard,
              {
                backgroundColor: dark ? "rgba(16, 185, 129, 0.08)" : "rgba(16, 185, 129, 0.06)",
                borderColor: dark ? "rgba(16, 185, 129, 0.25)" : "rgba(16, 185, 129, 0.2)",
              },
            ]}
          >
            <View style={styles.delightIcon}>
              <Ionicons name="sparkles" size={18} color="#FFFFFF" />
            </View>
            <View style={styles.delightContent}>
              <Text style={[styles.delightTitle, { color: colors.foreground }]}>
                {topCategory ? `${getCategoryDisplayName(topCategory.category)} is your top category` : "Spending summary"}
              </Text>
              <Text style={[styles.delightText, { color: colors.muted }]}>
                {topCategory
                  ? `You spent ${formatMoney(topCategory.total)} on ${getCategoryDisplayName(topCategory.category)} (${formatPercent(
                      topCategory.total,
                      timeline.total
                    )} of this period’s spending).`
                  : "Your spending summary will appear here after you add expenses."}
              </Text>
            </View>
          </GlassSurface>

          {/* Observations Panel */}
          <GlassSurface
            variant="card"
            radius={radii.panel}
            style={styles.panel}
          >
            <View style={styles.panelHeader}>
              <View>
                <Text style={[styles.kicker, { color: colors.muted }]}>SUMMARY</Text>
                <Text style={[styles.panelTitle, { color: colors.foreground }]}>Spending highlights</Text>
              </View>
              <View
                style={[
                  styles.iconWrap,
                  {
                    backgroundColor: dark ? "rgba(255,255,255,0.06)" : colors.surfaceSubtle,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons name="sparkles" size={16} color="#E84A3F" />
              </View>
            </View>

            <ReportNote
              number="01"
              title={topCategory ? `${getCategoryDisplayName(topCategory.category)} leads spending` : "No category data yet"}
              copy={
                topCategory
                  ? `You’ve logged ${formatMoney(topCategory.total)} on ${getCategoryDisplayName(topCategory.category).toLowerCase()} (${formatPercent(
                      topCategory.total,
                      timeline.total
                    )} of this period's spending).`
                  : "Add expenses to see a breakdown by category."
              }
            />
            <ReportNote
              number="02"
              title={`${periodExpenses.length} expense ${periodExpenses.length === 1 ? "record" : "records"} in this period`}
              copy={
                periodExpenses.length
                  ? "These expenses are included in the selected date range."
                  : "Add expenses to see them in this date range."
              }
            />
            <ReportNote
              number="03"
              title="Average expense size"
              copy={
                periodExpenses.length
                  ? `Your average transaction in this period is ${averageExpenseSize}.`
                  : "Add expenses to see your average amount."
              }
              last
            />
          </GlassSurface>
        </MotionEntrance>
      </ScrollView>

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={showDatePicker}
        selectedDate={selectedDate}
        maxDate={todayDate}
        title={timeframe === "Day" ? "Choose reporting day" : "Choose report date"}
        onClose={() => setShowDatePicker(false)}
        onSelect={(date) => {
          setSelectedDate(date);
          setShowDatePicker(false);
        }}
      />

      {/* Export Notice Modal */}
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
    paddingTop: spacing.md,
    paddingBottom: 104,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  kicker: {
    fontFamily: "DMSans_700Bold",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  screenTitle: {
    ...typography.screenTitle,
    fontSize: 22,
    lineHeight: 28,
  },
  exportBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  timeframeRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 3,
    borderRadius: 999,
    marginBottom: 14,
  },
  timeframeTab: {
    flex: 1,
    minHeight: 40,
    paddingVertical: 7.5,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  timeframeTabActive: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  timeframeText: {
    fontSize: 12.5,
  },
  dateNavigator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  navArrowBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  disabledNavArrow: {
    opacity: 0.35,
  },
  dateLabelRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  dateNavigatorText: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  todayActionRow: {
    alignItems: "flex-end",
    marginTop: -8,
    marginBottom: 12,
  },
  todayAction: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  todayActionText: {
    color: "#E84A3F",
    fontSize: 11,
    fontWeight: "700",
  },
  metricsGrid: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 10,
  },
  metricCard: {
    flex: 1,
    minWidth: 0,
    padding: 14,
  },
  metricTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  metricKicker: {
    fontSize: 9.5,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  metricIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  metricValue: {
    fontFamily: "DMSans_700Bold",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.4,
    fontVariant: ["tabular-nums"],
    marginBottom: 2,
  },
  metricSub: {
    fontSize: 11,
    fontWeight: "500",
  },
  delightCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
    marginBottom: 16,
  },
  delightIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  delightContent: {
    flex: 1,
  },
  delightTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    letterSpacing: -0.1,
    marginBottom: 2,
  },
  delightText: {
    fontSize: 12,
    lineHeight: 16,
  },
  panel: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
