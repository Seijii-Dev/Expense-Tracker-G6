import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Expense } from "@/types/expense";
import { useTheme } from "@/lib/theme-store";
import { GlassSurface } from "@/components/ui/glass-surface";
import { formatDate, formatMoney } from "@/utils/formatters";
import { addCalendarDays, getExpenseDateKey, getPhilippinesDate, getWeekdayShort } from "@/utils/date";
import { DatePickerModal } from "@/components/common/date-picker-modal";

interface DailyRhythmProps {
  expenses: Expense[];
}

export const DailyRhythm = React.memo(function DailyRhythm({ expenses }: DailyRhythmProps) {
  const { colors, dark } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const isNarrow = windowWidth < 360;
  const todayKey = getPhilippinesDate();
  const [selectedDayKey, setSelectedDayKey] = useState(todayKey);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { days, max, weekTotal } = useMemo(() => {
    const dayList = Array.from({ length: 7 }, (_, index) => {
      const key = addCalendarDays(selectedDayKey, index - 6);
      const [year, month, day] = key.split("-").map(Number);
      const date = new Date(Date.UTC(year, month - 1, day, 12));
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
      const k = getExpenseDateKey(exp.date);
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
  }, [expenses, selectedDayKey]);

  const activeDay = days[days.length - 1];
  const selectedExpenses = useMemo(
    () =>
      expenses
        .filter((expense) => getExpenseDateKey(expense.date) === selectedDayKey)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [expenses, selectedDayKey]
  );

  const changeDay = (direction: -1 | 1) => {
    try {
      Haptics.selectionAsync();
    } catch {
      // Non-fatal
    }
    const nextDay = addCalendarDays(selectedDayKey, direction);
    if (direction < 0 || nextDay <= todayKey) setSelectedDayKey(nextDay);
  };

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

        <Pressable
          style={[
            styles.datePill,
            {
              backgroundColor: dark ? "rgba(255,255,255,0.06)" : colors.surfaceSubtle,
              borderColor: colors.border,
            },
          ]}
          onPress={() => setShowDatePicker(true)}
          accessibilityRole="button"
          accessibilityLabel={`Choose Daily Rhythm date. Currently ${formatDate(selectedDayKey)}`}
        >
          <Ionicons name="calendar-outline" size={14} color={colors.primary} />
          <Text style={[styles.smallMuted, { color: colors.foreground }]} numberOfLines={1}>
            {formatDate(selectedDayKey)}
          </Text>
          <Ionicons name="chevron-down" size={12} color={colors.muted} />
        </Pressable>
      </View>

      <View style={styles.dateNavigation}>
        <Pressable
          onPress={() => changeDay(-1)}
          accessibilityRole="button"
          accessibilityLabel="Show previous day"
          hitSlop={8}
          style={[styles.dateNavButton, { borderColor: colors.border, backgroundColor: colors.surfaceSubtle }]}
        >
          <Ionicons name="chevron-back" size={17} color={colors.muted} />
        </Pressable>
        <Text style={[styles.rangeText, { color: colors.muted }]} numberOfLines={1}>
          {formatDate(days[0].key)} – {formatDate(days[6].key)}
        </Text>
        <Pressable
          onPress={() => changeDay(1)}
          disabled={selectedDayKey >= todayKey}
          accessibilityRole="button"
          accessibilityLabel="Show next day"
          accessibilityState={{ disabled: selectedDayKey >= todayKey }}
          hitSlop={8}
          style={[
            styles.dateNavButton,
            { borderColor: colors.border, backgroundColor: colors.surfaceSubtle },
            selectedDayKey >= todayKey && styles.disabledNavButton,
          ]}
        >
          <Ionicons name="chevron-forward" size={17} color={colors.muted} />
        </Pressable>
        {selectedDayKey !== todayKey && (
          <Pressable
            onPress={() => setSelectedDayKey(todayKey)}
            accessibilityRole="button"
            accessibilityLabel="Return to today"
            style={[styles.todayButton, { backgroundColor: dark ? "rgba(16,185,129,0.18)" : colors.primarySoft }]}
          >
            <Ionicons name="today-outline" size={13} color={colors.primary} />
            <Text style={[styles.todayText, { color: colors.primary }]}>Today</Text>
          </Pressable>
        )}
      </View>

      {/* Week Total & Selected Day Readout */}
      <View style={styles.amountRow}>
        <View>
            <Text style={[styles.amountLabel, { color: colors.muted }]}>7-DAY TOTAL</Text>
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
            <Text style={[styles.selectedDayName, { color: colors.primary }]} numberOfLines={1}>
              {selectedDayKey === todayKey ? "TODAY" : formatDate(selectedDayKey)}
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
          const isToday = day.key === todayKey;
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
                  { color: isSelected || isToday ? colors.primary : colors.muted },
                  (isSelected || isToday) && styles.barLabelToday,
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

      <View style={[styles.activityDivider, { borderTopColor: colors.border }]}>
        <Text style={[styles.activityHeading, { color: colors.muted }]}>
          {selectedDayKey === todayKey ? "TODAY'S ACTIVITY" : `${formatDate(selectedDayKey).toUpperCase()} ACTIVITY`}
        </Text>
        <Text style={[styles.activityCount, { color: colors.subtle }]}>
          {selectedExpenses.length} {selectedExpenses.length === 1 ? "expense" : "expenses"}
        </Text>
      </View>
      {selectedExpenses.length ? (
        <View style={styles.expenseList}>
          {selectedExpenses.map((expense) => (
            <View key={expense.id} style={[styles.expenseRow, { borderBottomColor: colors.border }]}>
              <View style={styles.expenseText}>
                <Text style={[styles.expenseDescription, { color: colors.foreground }]} numberOfLines={1}>
                  {expense.description || expense.category}
                </Text>
                <Text style={[styles.expenseMeta, { color: colors.muted }]} numberOfLines={1}>
                  {expense.category} · {expense.payment}
                </Text>
              </View>
              <Text style={[styles.expenseAmount, { color: colors.foreground }]}>{formatMoney(expense.amount)}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={[styles.emptyActivity, { color: colors.muted }]}>No spending recorded for this date.</Text>
      )}

      <DatePickerModal
        visible={showDatePicker}
        selectedDate={selectedDayKey}
        maxDate={todayKey}
        title="Choose a Daily Rhythm date"
        onClose={() => setShowDatePicker(false)}
        onSelect={(date) => {
          setSelectedDayKey(date);
          setShowDatePicker(false);
        }}
      />
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
  dateNavigation: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 10,
  },
  dateNavButton: {
    width: 34,
    height: 34,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledNavButton: { opacity: 0.35 },
  rangeText: { flex: 1, textAlign: "center", fontSize: 10, fontWeight: "600" },
  todayButton: {
    minHeight: 34,
    paddingHorizontal: 10,
    borderRadius: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  todayText: { fontSize: 10, fontWeight: "800" },
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
  activityDivider: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 14,
    paddingTop: 12,
  },
  activityHeading: { fontSize: 9, fontWeight: "800", letterSpacing: 0.9, flex: 1 },
  activityCount: { fontSize: 10, fontWeight: "600", marginLeft: 10 },
  expenseList: { marginTop: 4 },
  expenseRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  expenseText: { flex: 1, minWidth: 0 },
  expenseDescription: { fontSize: 12, fontWeight: "700" },
  expenseMeta: { fontSize: 10, fontWeight: "500", marginTop: 3 },
  expenseAmount: { fontSize: 12, fontWeight: "800" },
  emptyActivity: { fontSize: 11, marginTop: 8 },
});
