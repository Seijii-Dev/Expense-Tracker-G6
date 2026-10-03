import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Expense } from "@/types/expense";
import { useTheme } from "@/lib/theme-store";
import { GlassSurface } from "@/components/ui/glass-surface";
import { formatMoney } from "@/utils/formatters";
import { getPhilippinesDate, getWeekdayShort, normalizeDate } from "@/utils/date";

interface DailyRhythmProps {
  expenses: Expense[];
}

export const DailyRhythm = React.memo(function DailyRhythm({ expenses }: DailyRhythmProps) {
  const { colors, dark } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const isNarrow = windowWidth < 360;
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);


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

  const activeDay = selectedDayKey
    ? days.find((d) => d.key === selectedDayKey)
    : days[days.length - 1];

  return (
    <GlassSurface style={styles.panel} contentStyle={styles.panelInner}>
      {/* Header */}
      <View style={styles.panelHeader}>
        <View>
          <View style={styles.kickerRow}>
            <View style={[styles.kickerDot, { backgroundColor: colors.success }]} />
            <Text style={[styles.kicker, { color: colors.success }]}>DAILY RHYTHM</Text>
          </View>
          <Text style={[styles.panelTitle, { color: colors.foreground }]}>7-Day Velocity</Text>
        </View>

        <View
          style={[
            styles.datePill,
            {
              backgroundColor: dark ? "rgba(255,255,255,0.06)" : colors.surfaceSubtle,
              borderColor: colors.border,
            },
          ]}
        >
          <Ionicons name="calendar-outline" size={12} color={colors.muted} />
          <Text style={[styles.smallMuted, { color: colors.muted }]}>
            {days[0].key.slice(5).replace("-", "/")} – {days[6].key.slice(5).replace("-", "/")}
          </Text>
        </View>
      </View>

      {/* Week Total & Selected Day Readout */}
      <View style={styles.amountRow}>
        <View>
          <Text style={[styles.amountLabel, { color: colors.muted }]}>THIS WEEK</Text>
          <Text style={[styles.weekTotal, { color: colors.foreground }]}>{formatMoney(weekTotal)}</Text>
        </View>
        {activeDay && (
          <View
            style={[
              styles.selectedDayBadge,
              {
                backgroundColor: dark ? "rgba(255, 117, 101, 0.14)" : colors.primarySoft,
                borderColor: dark ? "rgba(255, 117, 101, 0.3)" : "rgba(255, 101, 84, 0.25)",
              },
            ]}
          >
            <Text style={[styles.selectedDayName, { color: colors.primary }]}>
              {activeDay.dayName} ({activeDay.label})
            </Text>
            <Text style={[styles.selectedDayAmount, { color: colors.primary }]}>
              {formatMoney(activeDay.total)}
            </Text>
          </View>
        )}
      </View>

      {/* Bars Chart */}
      <View style={[styles.bars, { borderBottomColor: colors.border }, isNarrow && { gap: 4 }]}>
        {days.map((day, index) => {
          const isToday = index === days.length - 1;
          const isSelected = selectedDayKey === day.key;
          const pct = day.total ? Math.max(10, (day.total / max) * 100) : 0;

          return (
            <Pressable
              key={day.key}
              style={styles.barColumn}
              onPress={() => {
                try {
                  Haptics.selectionAsync();
                } catch {
                  // Non-fatal
                }
                setSelectedDayKey(day.key);
              }}
            >
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${pct}%`,
                      width: isNarrow ? 16 : 22,
                      backgroundColor: isToday
                        ? colors.primary
                        : isSelected
                        ? colors.success
                        : dark
                        ? "rgba(52, 211, 153, 0.35)"
                        : "rgba(16, 185, 129, 0.45)",
                    },
                    (isToday || isSelected) && styles.barActiveShadow,
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.barLabel,
                  { color: isToday ? colors.primary : colors.muted },
                  isToday && styles.barLabelToday,
                ]}
              >
                {day.dayName}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Bottom Insights */}
      <View style={styles.weekChange}>
        <Ionicons name="sparkles" size={13} color={colors.success} />
        <Text style={[styles.weekChangeText, { color: colors.success }]}>
          {weekTotal
            ? `${days.filter((day) => day.total > 0).length} of 7 active days logged`
            : "No transactions recorded in the past 7 days"}
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
  kickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  kickerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  kicker: {
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  panelTitle: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.4,
    marginTop: 4,
  },
  datePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  smallMuted: {
    fontSize: 10,
    fontWeight: "600",
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 14,
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: 9.5,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  weekTotal: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.8,
    marginTop: 2,
  },
  selectedDayBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "flex-end",
  },
  selectedDayName: {
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  selectedDayAmount: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 13,
    fontWeight: "700",
  },
  bars: {
    height: 136,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 10,
    borderBottomWidth: 1,
  },
  barColumn: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  barTrack: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 6,
  },
  bar: {
    width: 22,
    borderRadius: 8,
    minHeight: 6,
  },
  barActiveShadow: {
    shadowColor: "#FF6554",
    shadowOpacity: 0.35,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  barLabel: {
    fontSize: 9.5,
    fontWeight: "600",
    marginBottom: 6,
  },
  barLabelToday: {
    fontWeight: "800",
  },
  weekChange: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
  },
  weekChangeText: {
    fontSize: 10.5,
    fontWeight: "600",
  },
});

