import React, { useMemo, useState } from "react";
import { Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ScreenContainer } from "@/components/screen-container";
import { ScreenHeader } from "@/components/common/screen-header";
import { CategoryBreakdown } from "@/components/reports/category-breakdown";
import { PaymentMethods } from "@/components/reports/payment-methods";
import { ReportNote } from "@/components/reports/report-note";
import { useExpenses } from "@/lib/expense-store";
import { useTheme } from "@/lib/theme-store";
import { formatMoney, formatPercent } from "@/utils/formatters";
import { useReportMetrics } from "@/hooks/useReportMetrics";
import { ReportsSkeleton } from "@/components/ui/reports-skeleton";

import * as Haptics from "expo-haptics";
import { SpendingTrendChart } from "@/components/reports/spending-trend-chart";
import { getPhilippinesDate } from "@/utils/date";
import { DatePickerModal } from "@/components/common/date-picker-modal";
import {
  buildSpendingTimeline,
  shiftTrajectoryAnchorDate,
  TrajectoryInterval,
} from "@/utils/spending-trajectory";

export default function ReportsScreen() {
  const { expenses, refreshExpenses, syncing, hydrated, allCategories, customCategories } = useExpenses();
  const { colors, dark } = useTheme();

  const [timeframe, setTimeframe] = useState<TrajectoryInterval>("Day");
  const [selectedDate, setSelectedDate] = useState(() => getPhilippinesDate());
  const [showDatePicker, setShowDatePicker] = useState(false);
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

  const navigateDate = (direction: -1 | 1) => {
    try {
      Haptics.selectionAsync();
    } catch {
      // Non-fatal
    }
    const nextDate = shiftTrajectoryAnchorDate(timeframe, selectedDate, direction);
    setSelectedDate(direction > 0 && nextDate > todayDate ? todayDate : nextDate);
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
        <ScreenHeader
          kicker="ANALYTICS & TRENDS"
          title="Financial Reports"
          subtitle="Get insights into your spending patterns"
        />

        {/* Timeframe Segmented Control (Screen 3 Mockup) */}
        <View style={[styles.timeframeRow, { backgroundColor: dark ? "rgba(255,255,255,0.06)" : colors.surfaceSubtle }]}>
          {(["Day", "Weekly", "Monthly", "Yearly"] as const).map((tab) => {
            const isActive = timeframe === tab;
            return (
              <Pressable
                key={tab}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                onPress={() => {
                  try {
                    Haptics.selectionAsync();
                  } catch {
                    // Non-fatal
                  }
                  setTimeframe(tab);
                }}
                style={[
                  styles.timeframeTab,
                  isActive && {
                    backgroundColor: "#16382B",
                    shadowColor: "#000",
                    shadowOpacity: 0.12,
                    shadowRadius: 4,
                    elevation: 2,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.timeframeText,
                    {
                      color: isActive ? "#FFFFFF" : colors.muted,
                      fontWeight: isActive ? "700" : "500",
                    },
                  ]}
                >
                  {tab}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Selected period navigation */}
        <View style={styles.dateNavigator}>
          <Pressable
            style={styles.navArrowBtn}
            onPress={() => navigateDate(-1)}
            accessibilityRole="button"
            accessibilityLabel="Show previous period"
          >
            <Ionicons name="chevron-back" size={18} color={colors.muted} />
          </Pressable>
          <Pressable
            style={styles.dateLabelRow}
            onPress={() => setShowDatePicker(true)}
            accessibilityRole="button"
            accessibilityLabel={`Choose reporting date, currently ${timeline.rangeLabel}`}
          >
            <Text
              style={[styles.dateNavigatorText, { color: colors.foreground }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {timeline.rangeLabel}
            </Text>
            <Ionicons name="calendar-outline" size={15} color="#10B981" style={{ marginLeft: 6 }} />
          </Pressable>
          <Pressable
            style={[styles.navArrowBtn, selectedDate >= todayDate && styles.disabledNavArrow]}
            onPress={() => navigateDate(1)}
            disabled={selectedDate >= todayDate}
            accessibilityRole="button"
            accessibilityLabel="Show next period"
          >
            <Ionicons name="chevron-forward" size={18} color={selectedDate >= todayDate ? colors.subtle : colors.muted} />
          </Pressable>
        </View>

        {selectedDate !== todayDate && (
          <View style={styles.todayActionRow}>
            <Pressable
              onPress={() => setSelectedDate(todayDate)}
              accessibilityRole="button"
              accessibilityLabel="Show today's report"
              style={[styles.todayAction, { backgroundColor: dark ? "rgba(16,185,129,0.18)" : colors.primarySoft }]}
            >
              <Ionicons name="today-outline" size={14} color={colors.primary} />
              <Text style={[styles.todayActionText, { color: colors.primary }]}>Today</Text>
            </Pressable>
          </View>
        )}

        {/* Total Spending Card matching Mockup Screen 3 */}
        <View
          style={[
            styles.spendCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowColor: dark ? "#000000" : "#0A1F1C",
              shadowOpacity: dark ? 0.35 : 0.04,
            },
          ]}
        >
          <View style={styles.spendCardHeader}>
            <View>
              <Text style={[styles.spendCardLabel, { color: colors.muted }]}>Total Spending</Text>
              <Text style={[styles.spendCardAmount, { color: colors.foreground }]}>
                {formatMoney(timeline.total)}
              </Text>
            </View>
            <View style={styles.chartIconBadge}>
              <Ionicons name="bar-chart-outline" size={22} color="#10B981" />
            </View>
          </View>

          <View style={styles.spendTrendBadge}>
            <Ionicons name="calendar-outline" size={13} color="#10B981" />
            <Text style={styles.spendTrendText}>{timeline.intervalLabel} spending · {timeline.rangeLabel}</Text>
          </View>
        </View>

        {/* Spending Trajectory Area Curve Chart */}
        <SpendingTrendChart timeline={timeline} />

        {/* Category Breakdown Panel */}
        <CategoryBreakdown
          categoryTotals={categoryTotals}
          periodTotal={timeline.total}
          maxCategorySpend={maxCategorySpend}
          activeCount={activeCategoryCount}
          customCategories={customCategories}
        />

        {/* Payment Methods Panel */}
        <PaymentMethods paymentTotals={paymentTotals} periodTotal={timeline.total} />

        {/* Observations Panel */}
        <View
          style={[
            styles.panel,
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
          <View style={styles.panelHeader}>
            <View>
              <View style={styles.kickerRow}>
                <View style={[styles.kickerDot, { backgroundColor: colors.warning }]} />
                <Text style={[styles.kicker, { color: colors.warning }]}>WORTH NOTING</Text>
              </View>
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
              <Ionicons name="sparkles" size={18} color={colors.warning} />
            </View>
          </View>

          <ReportNote
            number="01"
            title={topCategory ? `${topCategory.category} is your top category` : "No category data yet"}
            copy={
              topCategory
                ? `You’ve logged ${formatMoney(topCategory.total)} on ${topCategory.category.toLowerCase()} (${formatPercent(
                    topCategory.total,
                    timeline.total
                  )} of this period's spending).`
                : "Add expenses to see category breakdown insights."
            }
          />
          <ReportNote
            number="02"
            title={`${periodExpenses.length} expense ${periodExpenses.length === 1 ? "record" : "records"} in this period`}
            copy={
              periodExpenses.length
                ? "These records are included in the selected spending range. Your ledger remains available offline."
                : "Your transaction activity patterns will appear here once you log expenses."
            }
          />
          <ReportNote
            number="03"
            title="Average expense size"
            copy={
              periodExpenses.length
                ? `Your average transaction in this period is ${averageExpenseSize}.`
                : "Add transactions to calculate your average expense size."
            }
            last
          />
        </View>
      </ScrollView>
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
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingTop: 12,
    paddingBottom: 96,
  },
  timeframeRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
    borderRadius: 16,
    marginTop: 4,
    marginBottom: 14,
  },
  timeframeTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  timeframeText: {
    fontSize: 12.5,
  },
  dateNavigator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  navArrowBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  disabledNavArrow: {
    opacity: 0.45,
  },
  dateLabelRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateNavigatorText: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 16,
    letterSpacing: -0.2,
  },
  todayActionRow: {
    alignItems: "flex-end",
    marginTop: -10,
    marginBottom: 10,
  },
  todayAction: {
    minHeight: 34,
    borderRadius: 11,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  todayActionText: {
    fontSize: 11,
    fontWeight: "800",
  },
  spendCard: {
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  spendCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  spendCardLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  spendCardAmount: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 32,
    letterSpacing: -1,
    marginTop: 2,
  },
  chartIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  spendTrendBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 6,
  },
  spendTrendText: {
    color: "#10B981",
    fontSize: 11,
    fontWeight: "700",
  },
  hero: {
    position: "relative",
    overflow: "hidden",
    minHeight: 160,
    marginTop: 10,
    marginBottom: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    shadowColor: "#051A15",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 6,
  },
  specularLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  heroContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 22,
  },
  heroLeft: {
    flex: 1,
    paddingRight: 12,
  },
  kickerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },
  kickerLight: {
    color: "#A5D0BE",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  heroValue: {
    fontFamily: "Fraunces_700Bold",
    color: "#FFFFFF",
    fontSize: 34,
    letterSpacing: -1,
    marginTop: 6,
  },
  heroFootRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  heroFootText: {
    color: "#B5D0C7",
    fontSize: 12,
    fontWeight: "600",
  },
  heroRing: {
    width: 88,
    height: 88,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 44,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.22)",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  heroRingNumber: {
    fontFamily: "Fraunces_700Bold",
    color: "#FFFFFF",
    fontSize: 24,
  },
  heroRingLabel: {
    color: "#A5D0BE",
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: -2,
  },
  heroRingSubLabel: {
    color: "#A5D0BE",
    fontSize: 8,
    fontWeight: "600",
  },
  panel: {
    padding: 20,
    marginBottom: 16,
    borderRadius: 22,
    borderWidth: 1,
  },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  kickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  kickerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  kicker: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  panelTitle: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 22,
    letterSpacing: -0.4,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
