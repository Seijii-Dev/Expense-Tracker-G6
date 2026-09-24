import React, { useMemo } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ScreenContainer } from "@/components/screen-container";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Category,
  Payment,
  categoryMeta,
  getPhilippinesMonth,
  normalizeDate,
  useExpenses,
} from "@/lib/expense-store";
import { useTheme } from "@/lib/theme-store";
import { formatMoney, formatPercent } from "@/lib/formatters";

const categories: Category[] = ["Food", "Transport", "School", "Shopping", "Bills", "Fun", "Health", "Other"];
const payments: Payment[] = ["Cash", "GCash", "Card", "Bank"];

export default function ReportsScreen() {
  const { expenses, monthTotal, refreshExpenses, syncing } = useExpenses();
  const { colors } = useTheme();

  const currentMonth = getPhilippinesMonth();
  const monthExpenses = useMemo(
    () => expenses.filter((expense) => normalizeDate(expense.date).startsWith(currentMonth)),
    [expenses, currentMonth]
  );

  // Category totals
  const categoryTotals = useMemo(
    () =>
      categories
        .map((category) => {
          const total = monthExpenses
            .filter((expense) => expense.category === category)
            .reduce((sum, expense) => sum + (expense.amount || 0), 0);
          return { category, total };
        })
        .sort((a, b) => b.total - a.total),
    [monthExpenses]
  );

  // Payment method totals
  const paymentTotals = useMemo(
    () =>
      payments
        .map((payment) => {
          const total = monthExpenses
            .filter((expense) => expense.payment === payment)
            .reduce((sum, expense) => sum + (expense.amount || 0), 0);
          return { payment, total };
        })
        .filter((item) => item.total > 0)
        .sort((a, b) => b.total - a.total),
    [monthExpenses]
  );

  const maxCategorySpend = Math.max(...categoryTotals.map((item) => item.total), 1);
  const topCategory = categoryTotals.find((item) => item.total > 0) ?? null;
  const activeCategoryCount = categoryTotals.filter((item) => item.total > 0).length;

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
            <Text style={styles.kicker}>MAKE SENSE OF IT</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>
              Spending reports<Text style={styles.dot}>.</Text>
            </Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              A clear, insightful view of where your money is flowing this month.
            </Text>
          </View>
          <Ionicons name="calendar-outline" size={22} color={colors.primary} />
        </View>

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
        <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.kicker}>BREAKDOWN</Text>
              <Text style={[styles.panelTitle, { color: colors.foreground }]}>By category</Text>
            </View>
            <Ionicons name="pie-chart-outline" size={19} color={colors.subtle} />
          </View>

          {activeCategoryCount === 0 ? (
            <EmptyState
              icon="pie-chart-outline"
              title="No spending this month"
              description="Log expenses to see your category breakdown and spending share."
            />
          ) : (
            <View style={styles.bars}>
              {categoryTotals.map(({ category, total }) => {
                const meta = categoryMeta[category];
                const pct = monthTotal > 0 ? (total / monthTotal) * 100 : 0;
                return (
                  <View key={category} style={styles.barRow}>
                    <View style={styles.barLabels}>
                      <View style={styles.labelLeft}>
                        <View style={[styles.dotMark, { backgroundColor: meta.color }]} />
                        <Text style={[styles.categoryLabel, { color: colors.foreground }]}>{category}</Text>
                        <Text style={[styles.categoryPct, { color: colors.subtle }]}>
                          ({formatPercent(total, monthTotal)})
                        </Text>
                      </View>
                      <Text style={[styles.categoryAmount, { color: colors.foreground }]}>{formatMoney(total)}</Text>
                    </View>
                    <View style={[styles.track, { backgroundColor: colors.border }]}>
                      <View
                        style={[
                          styles.fill,
                          {
                            width: total > 0 ? `${(total / maxCategorySpend) * 100}%` : "0%",
                            backgroundColor: meta.color,
                          },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Payment Methods Panel */}
        {paymentTotals.length > 0 && (
          <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.panelHeader}>
              <View>
                <Text style={styles.kicker}>PAYMENT CHANNELS</Text>
                <Text style={[styles.panelTitle, { color: colors.foreground }]}>How you paid</Text>
              </View>
              <Ionicons name="wallet-outline" size={19} color={colors.subtle} />
            </View>
            <View style={styles.paymentGrid}>
              {paymentTotals.map(({ payment, total }) => (
                <View
                  key={payment}
                  style={[styles.paymentCard, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}
                >
                  <Text style={[styles.paymentMethod, { color: colors.foreground }]}>{payment}</Text>
                  <Text style={[styles.paymentAmount, { color: colors.primary }]}>{formatMoney(total)}</Text>
                  <Text style={[styles.paymentPct, { color: colors.subtle }]}>
                    {formatPercent(total, monthTotal)} of total
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Observations Panel */}
        <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.kicker}>WORTH NOTING</Text>
              <Text style={[styles.panelTitle, { color: colors.foreground }]}>Spending highlights</Text>
            </View>
            <Ionicons name="sparkles" size={19} color={colors.subtle} />
          </View>

          <Note
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
          <Note
            number="02"
            title={`${expenses.length} expense ${expenses.length === 1 ? "record" : "records"} so far`}
            copy={
              expenses.length
                ? "Your records automatically sync to your secure account and remain cached offline."
                : "Your transaction activity patterns will appear here once you log expenses."
            }
          />
          <Note
            number="03"
            title="Average expense size"
            copy={
              monthExpenses.length
                ? `Your average transaction this month is ${formatMoney(monthTotal / monthExpenses.length)}.`
                : "Add transactions to calculate your average expense size."
            }
            last
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function Note({ number, title, copy, last }: { number: string; title: string; copy: string; last?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.note, { borderBottomColor: colors.border }, last && styles.lastNote]}>
      <Text style={styles.noteNumber}>{number}</Text>
      <View style={styles.noteBody}>
        <Text style={[styles.noteTitle, { color: colors.foreground }]}>{title}</Text>
        <Text style={[styles.noteCopy, { color: colors.muted }]}>{copy}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: 12, paddingBottom: 32 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  kicker: { color: "#EB6F61", fontSize: 10, fontWeight: "800", letterSpacing: 1.4 },
  kickerLight: { color: "#A5C9BB", fontSize: 9, fontWeight: "800", letterSpacing: 1.3 },
  title: { fontFamily: "Fraunces_700Bold", fontSize: 32, fontWeight: "700", letterSpacing: -1.2, marginTop: 6 },
  dot: { color: "#EB6F61" },
  subtitle: { fontSize: 12, marginTop: 4 },
  hero: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 160, paddingHorizontal: 20, marginTop: 8, marginBottom: 16, borderRadius: 18, backgroundColor: "#2A4740" },
  heroValue: { fontFamily: "Fraunces_700Bold", color: "#FFFFFF", fontSize: 36, fontWeight: "700", letterSpacing: -1.2, marginTop: 6 },
  heroFootRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  heroFootText: { color: "#B5D0C7", fontSize: 11, fontWeight: "600" },
  heroRing: { width: 96, height: 96, alignItems: "center", justifyContent: "center", borderRadius: 48, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.3)" },
  heroRingNumber: { fontFamily: "Fraunces_700Bold", color: "#FFFFFF", fontSize: 24, fontWeight: "700" },
  heroRingLabel: { color: "#B5D0C7", fontSize: 9, fontWeight: "600" },
  panel: { padding: 18, marginBottom: 16, borderRadius: 16, borderWidth: 1 },
  panelHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 },
  panelTitle: { fontFamily: "Fraunces_700Bold", fontSize: 20, fontWeight: "700", letterSpacing: -0.4, marginTop: 4 },
  bars: { gap: 16, marginTop: 10 },
  barRow: {},
  barLabels: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  labelLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  dotMark: { width: 8, height: 8, borderRadius: 4 },
  categoryLabel: { fontSize: 12, fontWeight: "600" },
  categoryPct: { fontSize: 10 },
  categoryAmount: { fontFamily: "Fraunces_700Bold", fontSize: 13, fontWeight: "700" },
  track: { height: 8, overflow: "hidden", borderRadius: 8 },
  fill: { height: "100%", borderRadius: 8 },
  paymentGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 4 },
  paymentCard: { flex: 1, minWidth: "45%", padding: 14, borderRadius: 12, borderWidth: 1 },
  paymentMethod: { fontSize: 12, fontWeight: "700" },
  paymentAmount: { fontFamily: "Fraunces_700Bold", fontSize: 16, fontWeight: "700", marginTop: 4 },
  paymentPct: { fontSize: 9, marginTop: 2 },
  note: { flexDirection: "row", gap: 14, paddingVertical: 14, borderBottomWidth: 1 },
  noteBody: { flex: 1 },
  lastNote: { borderBottomWidth: 0, paddingBottom: 0 },
  noteNumber: { color: "#EB6F61", fontSize: 15, fontWeight: "800" },
  noteTitle: { fontSize: 13, fontWeight: "700" },
  noteCopy: { fontSize: 11, lineHeight: 16, marginTop: 4 },
});
