import React from "react";
import { Platform, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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

import { useState } from "react";
import { Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { SpendingTrendChart } from "@/components/reports/spending-trend-chart";

export default function ReportsScreen() {
  const { expenses, refreshExpenses, syncing, hydrated, allCategories, customCategories } = useExpenses();
  const { colors, dark } = useTheme();

  const [timeframe, setTimeframe] = useState<"Monthly" | "Weekly" | "Yearly">("Monthly");
  const [currentDate] = useState(new Date());

  const formattedMonthYear = currentDate.toLocaleString("en-US", { month: "long", year: "numeric" });

  const {
    monthExpenses,
    monthTotal,
    categoryTotals,
    paymentTotals,
    activeCategoryCount,
    maxCategorySpend,
    topCategory,
  } = useReportMetrics(expenses, allCategories);

  const averageExpenseSize = monthExpenses.length
    ? formatMoney(monthTotal / monthExpenses.length)
    : "₱0";

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
          {(["Monthly", "Weekly", "Yearly"] as const).map((tab) => {
            const isActive = timeframe === tab;
            return (
              <Pressable
                key={tab}
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

        {/* Month Navigator Header (Screen 3 Mockup) */}
        <View style={styles.dateNavigator}>
          <Pressable style={styles.navArrowBtn}>
            <Ionicons name="chevron-back" size={18} color={colors.muted} />
          </Pressable>
          <View style={styles.dateLabelRow}>
            <Text style={[styles.dateNavigatorText, { color: colors.foreground }]}>
              {formattedMonthYear}
            </Text>
            <Ionicons name="calendar-outline" size={15} color="#10B981" style={{ marginLeft: 6 }} />
          </View>
          <Pressable style={styles.navArrowBtn}>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>
        </View>

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
                {formatMoney(monthTotal)}
              </Text>
            </View>
            <View style={styles.chartIconBadge}>
              <Ionicons name="bar-chart-outline" size={22} color="#10B981" />
            </View>
          </View>

          <View style={styles.spendTrendBadge}>
            <Ionicons name="arrow-down" size={13} color="#10B981" />
            <Text style={styles.spendTrendText}>12% vs. last month</Text>
          </View>
        </View>

        {/* Spending Trajectory Area Curve Chart */}
        <SpendingTrendChart expenses={monthExpenses} monthTotal={monthTotal} />

        {/* Category Breakdown Panel */}
        <CategoryBreakdown
          categoryTotals={categoryTotals}
          monthTotal={monthTotal}
          maxCategorySpend={maxCategorySpend}
          activeCount={activeCategoryCount}
          customCategories={customCategories}
        />

        {/* Payment Methods Panel */}
        <PaymentMethods paymentTotals={paymentTotals} monthTotal={monthTotal} />

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
                    monthTotal
                  )} of this month's spending).`
                : "Add expenses to see category breakdown insights."
            }
          />
          <ReportNote
            number="02"
            title={`${expenses.length} expense ${expenses.length === 1 ? "record" : "records"} so far`}
            copy={
              expenses.length
                ? "Your records automatically sync to your secure account and remain cached offline."
                : "Your transaction activity patterns will appear here once you log expenses."
            }
          />
          <ReportNote
            number="03"
            title="Average expense size"
            copy={
              monthExpenses.length
                ? `Your average transaction this month is ${averageExpenseSize}.`
                : "Add transactions to calculate your average expense size."
            }
            last
          />
        </View>
      </ScrollView>
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
  dateLabelRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateNavigatorText: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 16,
    letterSpacing: -0.2,
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
