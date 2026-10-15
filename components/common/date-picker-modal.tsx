import React, { useEffect, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Modal, Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/lib/theme-store";
import { getPhilippinesDate, shiftCalendarMonth } from "@/utils/date";
import { formatDate } from "@/utils/formatters";

type DatePickerModalProps = {
  visible: boolean;
  selectedDate: string | null;
  maxDate?: string;
  title?: string;
  onClose: () => void;
  onSelect: (date: string) => void;
};

export function DatePickerModal({
  visible,
  selectedDate,
  maxDate = getPhilippinesDate(),
  title = "Choose a date",
  onClose,
  onSelect,
}: DatePickerModalProps) {
  const { colors, dark } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const initialDate = selectedDate || maxDate;
  const [visibleMonth, setVisibleMonth] = useState(initialDate.slice(0, 7));

  useEffect(() => {
    if (visible) setVisibleMonth((selectedDate || maxDate).slice(0, 7));
  }, [visible, selectedDate, maxDate]);

  const monthParts = visibleMonth.split("-").map(Number);
  const year = monthParts[0];
  const month = monthParts[1];
  const monthDate = new Date(Date.UTC(year, month - 1, 1, 12));
  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(monthDate);
  const calendarDays = useMemo(() => {
    const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    return [
      ...Array.from({ length: firstWeekday }, () => null),
      ...Array.from({ length: daysInMonth }, (_, index) => {
        const day = String(index + 1).padStart(2, "0");
        return `${visibleMonth}-${day}`;
      }),
    ];
  }, [month, visibleMonth, year]);
  const canMoveForward = visibleMonth < maxDate.slice(0, 7);
  const columns = ["S", "M", "T", "W", "T", "F", "S"];
  const daySize = Math.min(44, Math.max(36, (width - 72) / 7));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close date picker" />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              paddingBottom: Math.max(insets.bottom, 20),
            },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={[styles.eyebrow, { color: colors.primary }]}>DATE FILTER</Text>
              <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
            </View>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close date picker"
              hitSlop={8}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={21} color={colors.muted} />
            </Pressable>
          </View>

          <View style={styles.monthHeader}>
            <Pressable
              onPress={() => setVisibleMonth((current) => shiftCalendarMonth(current, -1))}
              accessibilityRole="button"
              accessibilityLabel="Previous month"
              hitSlop={8}
              style={[styles.monthArrow, { borderColor: colors.border }]}
            >
              <Ionicons name="chevron-back" size={18} color={colors.muted} />
            </Pressable>
            <Text style={[styles.monthLabel, { color: colors.foreground }]}>{monthLabel}</Text>
            <Pressable
              onPress={() => setVisibleMonth((current) => shiftCalendarMonth(current, 1))}
              disabled={!canMoveForward}
              accessibilityRole="button"
              accessibilityLabel="Next month"
              accessibilityState={{ disabled: !canMoveForward }}
              hitSlop={8}
              style={[styles.monthArrow, { borderColor: colors.border, opacity: canMoveForward ? 1 : 0.35 }]}
            >
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Pressable>
          </View>

          <View style={styles.grid}>
            {columns.map((day, index) => (
              <View key={`${day}-${index}`} style={[styles.dayCell, { height: 28 }]}>
                <Text style={[styles.weekday, { color: colors.subtle }]}>{day}</Text>
              </View>
            ))}
            {calendarDays.map((date, index) => {
              if (!date) return <View key={`blank-${index}`} style={[styles.dayCell, { height: daySize }]} />;
              const selected = date === selectedDate;
              const disabled = date > maxDate;
              const today = date === maxDate;
              return (
                <Pressable
                  key={date}
                  onPress={() => onSelect(date)}
                  disabled={disabled}
                  accessibilityRole="button"
                  accessibilityLabel={formatDate(date)}
                  accessibilityState={{ selected, disabled }}
                  style={[styles.dayCell, { height: daySize }]}
                >
                  <View
                    style={[
                      styles.dayButton,
                      { width: daySize - 4, height: daySize - 4 },
                      selected && { backgroundColor: colors.primary },
                      today && !selected && { borderColor: colors.primary, borderWidth: 1 },
                      disabled && { opacity: 0.32 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        { color: selected ? "#FFFFFF" : colors.foreground },
                        today && !selected && { color: colors.primary, fontWeight: "800" },
                      ]}
                    >
                      {Number(date.slice(-2))}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.footer}>
            <Text style={[styles.selectedLabel, { color: colors.muted }]} numberOfLines={1}>
              {selectedDate ? formatDate(selectedDate) : "No date selected"}
            </Text>
            <Pressable
              onPress={() => onSelect(maxDate)}
              accessibilityRole="button"
              accessibilityLabel="Select today"
              style={[styles.todayButton, { backgroundColor: dark ? "rgba(16,185,129,0.18)" : colors.primarySoft }]}
            >
              <Ionicons name="today-outline" size={15} color={colors.primary} />
              <Text style={[styles.todayText, { color: colors.primary }]}>Today</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(7, 13, 12, 0.58)",
  },
  sheet: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerText: { flex: 1 },
  eyebrow: { fontSize: 9, fontWeight: "800", letterSpacing: 1.1 },
  title: { fontFamily: "DMSans_700Bold", fontSize: 22, fontWeight: "700", marginTop: 3 },
  closeButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  monthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  monthArrow: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 13,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  monthLabel: { fontSize: 15, fontWeight: "700" },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  dayCell: { width: "14.2857%", alignItems: "center", justifyContent: "center" },
  weekday: { fontSize: 11, fontWeight: "700" },
  dayButton: {
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  dayText: { fontSize: 13, fontWeight: "600" },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(128,128,128,0.3)",
    paddingTop: 14,
    marginTop: 8,
  },
  selectedLabel: { fontSize: 12, fontWeight: "600", flex: 1, marginRight: 12 },
  todayButton: {
    minHeight: 40,
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  todayText: { fontSize: 12, fontWeight: "800" },
});
