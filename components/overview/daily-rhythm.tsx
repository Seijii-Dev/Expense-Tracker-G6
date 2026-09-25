import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Expense } from "@/types/expense";
import { useTheme } from "@/lib/theme-store";
import { formatMoney } from "@/utils/formatters";
import { getPhilippinesDate, getWeekdayShort, normalizeDate } from "@/utils/date";

interface DailyRhythmProps {
  expenses: Expense[];
}

export function DailyRhythm({ expenses }: DailyRhythmProps) {
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
          <Text style={[styles.kicker, { color: colors.primary }]}>DAILY RHYTHM</Text>
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
                index === days.length - 1 && [styles.barToday, { backgroundColor: colors.primary }],
              ]}
            />
            <Text
              style={[
                styles.barLabel,
                { color: colors.subtle },
                index === days.length - 1 && [styles.barLabelToday, { color: colors.primary }],
              ]}
            >
              {day.dayName}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.weekChange}>
        <Ionicons name="analytics-outline" size={13} color={colors.success} />
        <Text style={[styles.weekChangeText, { color: colors.success }]}>
          {weekTotal ? `${days.filter((day) => day.total > 0).length} active days this week` : "No spending recorded this week"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    padding: 18,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  kicker: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  panelTitle: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.4,
    marginTop: 4,
  },
  smallMuted: {
    fontSize: 10,
    marginTop: 3,
  },
  weekTotal: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 26,
    fontWeight: "700",
    marginTop: 16,
  },
  bars: {
    height: 130,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 12,
    borderBottomWidth: 1,
  },
  barColumn: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
  },
  bar: {
    width: 22,
    borderRadius: 6,
    backgroundColor: "#9ACCAF",
  },
  barToday: {},
  barLabel: {
    fontSize: 9,
    fontWeight: "600",
    marginBottom: 6,
  },
  barLabelToday: {
    fontWeight: "800",
  },
  weekChange: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 12,
  },
  weekChangeText: {
    fontSize: 10,
    fontWeight: "600",
  },
});
