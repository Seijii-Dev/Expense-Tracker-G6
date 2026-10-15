import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Expense } from "@/types/expense";
import { getCategoryStyle } from "@/constants/categories";
import { useExpenses } from "@/lib/expense-store";
import { useTheme } from "@/lib/theme-store";
import { formatMoney } from "@/utils/formatters";
import { radii } from "@/constants/design-tokens";

interface DonutChartProps {
  total: number;
  expenses: Expense[];
}

export const DonutChart = React.memo(function DonutChart({ total, expenses }: DonutChartProps) {
  const { colors, dark } = useTheme();
  const { customCategories } = useExpenses();

  const totals = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const exp of expenses) {
      if (exp.category) {
        map.set(exp.category, (map.get(exp.category) || 0) + (exp.amount || 0));
      }
    }
    return Array.from(map.entries())
      .map(([category, total]) => ({ category, total }))
      .filter((item) => item.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [expenses]);

  const size = 148;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const isEmpty = expenses.length === 0 || total <= 0;
  let offset = 0;

  // adjustsFontSizeToFit is a no-op on web, so fit the center label to the
  // 96px hole ourselves (digits ≈ 0.72em, separators ≈ 0.27em, ₱ ≈ 0.64em).
  // Keeps long totals like ₱10,500.00 from ellipsizing on any renderer.
  const totalLabel = formatMoney(total);
  const totalEmWidth = Math.max(
    1,
    totalLabel
      .split("")
      .reduce(
        (w, ch) => w + (ch === "." || ch === "," ? 0.27 : ch === "₱" ? 0.64 : 0.72),
        0
      ) - totalLabel.length * 0.027
  );
  const donutTotalFontSize = Math.max(9.5, Math.min(15, Math.floor((76 / totalEmWidth) * 10) / 10));

  return (
    <View style={styles.donutWrap}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={styles.svg}>
        {/* Background Track: solid rail for real data, dashed placeholder when empty */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={dark ? "rgba(255, 255, 255, 0.09)" : colors.border}
          strokeWidth={isEmpty ? strokeWidth - 5 : strokeWidth}
          strokeDasharray={isEmpty ? [3, 7] : undefined}
          strokeLinecap={isEmpty ? "round" : undefined}
          fill="none"
        />
        {/* Category Segments */}
        {!isEmpty && totals.map(({ category, total: categoryTotal }) => {
          const length = total > 0 ? (categoryTotal / total) * circumference : 0;
          const segment = (
            <Circle
              key={category}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={getCategoryStyle(category, customCategories).color || colors.primary}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={[Math.max(0, length - 2), Math.max(0, circumference - (length - 2))]}
              strokeDashoffset={-offset}
              strokeLinecap="round"
            />
          );
          offset += length;
          return segment;
        })}
      </Svg>

      {/* Donut Center Hole */}
      <View
        style={[
          styles.donutHole,
          isEmpty
            ? styles.donutHoleEmpty
            : { backgroundColor: colors.card, borderColor: colors.borderSubtle },
        ]}
      >
        {isEmpty ? (
          <Text style={[styles.emptyLabel, { color: colors.subtle }]}>EMPTY</Text>
        ) : (
          <>
            <Text style={[styles.kickerLabel, { color: colors.muted }]}>THIS MONTH</Text>
            <Text
              style={[styles.donutTotal, { color: colors.foreground, fontSize: donutTotalFontSize }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.68}
            >
              {totalLabel}
            </Text>
            <Text style={[styles.donutLabel, { color: colors.muted }]}>tracked</Text>
          </>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  donutWrap: {
    width: 152,
    height: 152,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  svg: {
    transform: [{ rotate: "-90deg" }],
  },
  donutHole: {
    position: "absolute",
    width: 96,
    height: 96,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    shadowColor: "#1A1D20",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    paddingHorizontal: 6,
  },
  donutHoleEmpty: {
    backgroundColor: "transparent",
    borderWidth: 0,
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  emptyLabel: {
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  kickerLabel: {
    fontSize: 7.5,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  donutTotal: {
    fontFamily: "DMSans_700Bold",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.4,
    fontVariant: ["tabular-nums"],
    textAlign: "center",
  },
  donutLabel: {
    fontSize: 9,
    fontWeight: "500",
    marginTop: 2,
  },
});
