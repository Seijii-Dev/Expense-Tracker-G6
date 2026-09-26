import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Expense } from "@/types/expense";
import { useTheme } from "@/lib/theme-store";
import { GlassSurface } from "@/components/ui/glass-surface";
import { formatMoney } from "@/utils/formatters";
import { getPhilippinesDate, getWeekdayShort, normalizeDate } from "@/utils/date";

interface DailyRhythmProps {
  expenses: Expense[];
}

export const DailyRhythm = React.memo(function DailyRhythm({ expenses }: DailyRhythmProps) {
  const { colors } = useTheme();

  const { days, max, weekTotal } = React.useMemo(() => {
    const anchor = new Date(`${getPhilippinesDate()}T12:00:00Z`);
    const dayList = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(anchor);
      date.setUTCDate(anchor.getUTCDate() - (6 - index));
      const key = getPhilippinesDate(date);
      return {
        key,
        dayName: getWeekdayShort(date),
        label: key.slice(8).replace(/^0/, ""),
        total: 0,
      };
    });

    const dayMap = new Map<string, number>();
    for (const d of dayList) {
      dayMap.set(d.key, 0);
    }

    for (const exp of expenses) {
      const k = normalizeDate(exp.date);
      if (dayMap.has(k)) {
        dayMap.set(k, (dayMap.get(k) || 0) + (exp.amount || 0));
      }
    }

    let wTotal = 0;
    for (const d of dayList) {
      d.total = dayMap.get(d.key) || 0;
      wTotal += d.total;
    }

    const m = Math.max(...dayList.map((day) => day.total), 1);
    return { days: dayList, max: m, weekTotal: wTotal };
  }, [expenses]);

  return (
    <GlassSurface style={styles.panel} contentStyle={styles.panelInner}>
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
    </GlassSurface>
  );
});

const styles = StyleSheet.create({
  panel: {
    marginBottom: 16,
  },
  panelInner: {
    padding: 18,
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
