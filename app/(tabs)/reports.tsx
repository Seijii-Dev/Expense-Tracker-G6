import React from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
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

export default function ReportsScreen() {
  const { expenses, refreshExpenses, syncing, hydrated, allCategories, customCategories } = useExpenses();
  const { colors } = useTheme();

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
          kicker="MAKE SENSE OF IT"
          title="Spending reports"
          subtitle="A clear, insightful view of where your money is flowing this month."
          rightAction={<Ionicons name="calendar-outline" size={22} color={colors.primary} />}
        />

        {/* Hero Card */}
        <View style={styles.hero}>
          <View>
            <Text style={styles.kickerLight}>TOTAL THIS MONTH</Text>
            <Text style={styles.heroValue}>{formatMoney(monthTotal)}</Text>
            <View style={styles.heroFootRow}>
              <Ionicons name="analytics-outline" size={14} color="#A5D0BE" />
              <Text style={styles.heroFootText}>
                {activeCategoryCount} active {activeCategoryCount === 1 ? "category" : "categories"}
              </Text>
            </View>
          </View>
          <View style={styles.heroRing}>
            <Text style={styles.heroRingNumber}>{activeCategoryCount}</Text>
            <Text style={styles.heroRingLabel}>categories</Text>
          </View>
        </View>

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
        <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={[styles.kicker, { color: colors.primary }]}>WORTH NOTING</Text>
              <Text style={[styles.panelTitle, { color: colors.foreground }]}>Spending highlights</Text>
            </View>
            <Ionicons name="sparkles" size={19} color={colors.subtle} />
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
    paddingBottom: 32,
  },
  kicker: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  kickerLight: {
    color: "#A5C9BB",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.3,
  },
  hero: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 160,
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 18,
    backgroundColor: "#2A4740",
  },
  heroValue: {
    fontFamily: "Fraunces_700Bold",
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "700",
    letterSpacing: -1.2,
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
    fontSize: 11,
    fontWeight: "600",
  },
  heroRing: {
    width: 96,
    height: 96,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 48,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.3)",
  },
  heroRingNumber: {
    fontFamily: "Fraunces_700Bold",
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
  },
  heroRingLabel: {
    color: "#B5D0C7",
    fontSize: 9,
    fontWeight: "600",
  },
  panel: {
    padding: 18,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  panelTitle: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.4,
    marginTop: 4,
  },
});
