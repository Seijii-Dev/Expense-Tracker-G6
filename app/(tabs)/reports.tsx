import React from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
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

export default function ReportsScreen() {
  const { expenses, refreshExpenses, syncing, hydrated, allCategories, customCategories } = useExpenses();
  const { colors, dark } = useTheme();

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
        />

        {/* Hero Card with LinearGradient */}
        <LinearGradient
          colors={
            dark
              ? ["#132A26", "#0B1917", "#070D0C"]
              : ["#0F3832", "#13423B", "#0A2823"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          {/* Subtle top specular line */}
          <LinearGradient
            colors={["rgba(255,255,255,0.3)", "rgba(255,255,255,0.02)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.specularLine}
          />

          <View style={styles.heroContent}>
            <View style={styles.heroLeft}>
              <View style={styles.kickerBadge}>
                <View style={styles.pulseDot} />
                <Text style={styles.kickerLight}>THIS MONTH'S OUTFLOW</Text>
              </View>
              <Text style={styles.heroValue} numberOfLines={1} adjustsFontSizeToFit>
                {formatMoney(monthTotal)}
              </Text>
              <View style={styles.heroFootRow}>
                <Ionicons name="analytics-outline" size={13} color="#A5D0BE" />
                <Text style={styles.heroFootText}>
                  Avg: {averageExpenseSize} per record
                </Text>
              </View>
            </View>

            <View style={styles.heroRing}>
              <Text style={styles.heroRingNumber}>{activeCategoryCount}</Text>
              <Text style={styles.heroRingLabel}>Active</Text>
              <Text style={styles.heroRingSubLabel}>Categories</Text>
            </View>
          </View>
        </LinearGradient>

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
    paddingBottom: 40,
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
