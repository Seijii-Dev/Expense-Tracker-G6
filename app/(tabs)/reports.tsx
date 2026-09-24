import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ScreenContainer } from "@/components/screen-container";
import { Category, categoryMeta, getPhilippinesMonth, normalizeDate, useExpenses } from "@/lib/expense-store";
import { useTheme } from "@/lib/theme-store";

const categories: Category[] = ["Food", "Transport", "School", "Shopping", "Bills", "Fun", "Health", "Other"];
const money = (value: number) => `₱${(value || 0).toLocaleString("en-PH", { maximumFractionDigits: 0 })}`;

export default function ReportsScreen() {
  const { expenses, monthTotal } = useExpenses();
  const { colors } = useTheme();

  const currentMonth = getPhilippinesMonth();
  const monthExpenses = useMemo(
    () => expenses.filter((expense) => normalizeDate(expense.date).startsWith(currentMonth)),
    [expenses, currentMonth]
  );

  const totals = useMemo(
    () =>
      categories
        .map((category) => ({
          category,
          total: monthExpenses
            .filter((expense) => expense.category === category)
            .reduce((sum, expense) => sum + (expense.amount || 0), 0),
        }))
        .sort((a, b) => b.total - a.total),
    [monthExpenses]
  );

  const max = Math.max(...totals.map((item) => item.total), 1);
  const top = totals.find((item) => item.total > 0) ?? null;
  const activeCategoryCount = totals.filter((item) => item.total > 0).length;

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View>
            <Text style={styles.kicker}>MAKE SENSE OF IT</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>
              Spending reports<Text style={styles.dot}>.</Text>
            </Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              A clear view of where your money is going this month.
            </Text>
          </View>
          <Ionicons name="calendar-outline" size={21} color={colors.primary} />
        </View>

        <View style={styles.hero}>
          <View>
            <Text style={styles.kickerLight}>TOTAL THIS MONTH</Text>
            <Text style={styles.heroValue}>{money(monthTotal)}</Text>
            <View style={styles.heroFootRow}>
              <Ionicons name="analytics-outline" size={13} color="#A5D0BE" />
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

        <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.kicker}>BREAKDOWN</Text>
              <Text style={[styles.panelTitle, { color: colors.foreground }]}>By category</Text>
            </View>
            <Ionicons name="bar-chart-outline" size={19} color={colors.subtle} />
          </View>
          {activeCategoryCount === 0 ? (
            <View style={styles.emptyBreakdown}>
              <Text style={[styles.emptyBreakdownText, { color: colors.muted }]}>
                No category spending recorded this month yet.
              </Text>
            </View>
          ) : (
            <View style={styles.bars}>
              {totals.map(({ category, total }) => (
                <View key={category} style={styles.barRow}>
                  <View style={styles.barLabels}>
                    <View style={styles.labelLeft}>
                      <View style={[styles.dotMark, { backgroundColor: categoryMeta[category].color }]} />
                      <Text style={[styles.categoryLabel, { color: colors.muted }]}>{category}</Text>
                    </View>
                    <Text style={[styles.categoryAmount, { color: colors.foreground }]}>{money(total)}</Text>
                  </View>
                  <View style={[styles.track, { backgroundColor: colors.border }]}>
                    <View
                      style={[
                        styles.fill,
                        {
                          width: total > 0 ? `${(total / max) * 100}%` : "0%",
                          backgroundColor: categoryMeta[category].color,
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.kicker}>WORTH NOTING</Text>
              <Text style={[styles.panelTitle, { color: colors.foreground }]}>Little observations</Text>
            </View>
            <Ionicons name="sparkles" size={19} color={colors.subtle} />
          </View>
          <Note
            number="01"
            title={top ? `${top.category} is your largest category` : "No category data yet"}
            copy={
              top
                ? `You’ve logged ${money(top.total)} on ${top.category.toLowerCase()} this month.`
                : "Add expenses to see category insights."
            }
          />
          <Note
            number="02"
            title={`${expenses.length} expense ${expenses.length === 1 ? "record" : "records"} so far`}
            copy={
              expenses.length
                ? "Your daily rhythm updates as you record each expense."
                : "Your most active day will appear here."
            }
          />
          <Note
            number="03"
            title="Small wins add up"
            copy={
              monthExpenses.length
                ? `Your average transaction this month is ${money(monthTotal / monthExpenses.length)}.`
                : "Add your first expense to see your average spending size."
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
  scroll: { paddingTop: 13, paddingBottom: 28 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  kicker: { color: "#EB6F61", fontSize: 10, fontWeight: "800", letterSpacing: 1.4 },
  kickerLight: { color: "#A5C9BB", fontSize: 9, fontWeight: "800", letterSpacing: 1.3 },
  title: { fontFamily: "Fraunces_700Bold", fontSize: 35, fontWeight: "700", letterSpacing: -1.4, marginTop: 8 },
  dot: { color: "#EB6F61" },
  subtitle: { fontFamily: "Fraunces_700Bold", maxWidth: 300, fontSize: 12, marginTop: 6 },
  hero: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 177, paddingHorizontal: 20, marginTop: 24, marginBottom: 15, borderRadius: 16, backgroundColor: "#2A4740" },
  heroValue: { fontFamily: "Fraunces_700Bold", color: "#FFFFFF", fontSize: 37, fontWeight: "700", letterSpacing: -1.4, marginTop: 8 },
  heroFootRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 8 },
  heroFootText: { color: "#B5D0C7", fontSize: 10 },
  heroRing: { width: 105, height: 105, alignItems: "center", justifyContent: "center", borderRadius: 60, borderWidth: 1, borderColor: "rgba(255,255,255,.3)" },
  heroRingNumber: { color: "#FFFFFF", fontSize: 24, fontWeight: "700" },
  heroRingLabel: { color: "#B5D0C7", fontSize: 9 },
  panel: { padding: 17, marginBottom: 15, borderRadius: 15, borderWidth: 1 },
  panelHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  panelTitle: { fontFamily: "Fraunces_700Bold", fontSize: 20, fontWeight: "700", letterSpacing: -0.4, marginTop: 6 },
  emptyBreakdown: { paddingVertical: 25, alignItems: "center" },
  emptyBreakdownText: { fontSize: 11 },
  bars: { gap: 17, marginTop: 25 },
  barRow: {},
  barLabels: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 7 },
  labelLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  dotMark: { width: 7, height: 7, borderRadius: 5 },
  categoryLabel: { fontSize: 11 },
  categoryAmount: { fontSize: 12, fontWeight: "700" },
  track: { height: 8, overflow: "hidden", borderRadius: 8 },
  fill: { height: "100%", borderRadius: 8 },
  note: { flexDirection: "row", gap: 13, paddingVertical: 16, borderBottomWidth: 1 },
  noteBody: { flex: 1 },
  lastNote: { borderBottomWidth: 0, paddingBottom: 0 },
  noteNumber: { color: "#EB6F61", fontSize: 15, fontWeight: "700" },
  noteTitle: { fontSize: 12, fontWeight: "700" },
  noteCopy: { fontSize: 10, lineHeight: 15, marginTop: 5 },
});
