import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Expense } from "@/types/expense";
import { getCategoryStyle } from "@/constants/categories";
import { useExpenses } from "@/lib/expense-store";
import { useTheme } from "@/lib/theme-store";
import { formatMoney } from "@/utils/formatters";

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
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <View style={styles.donutWrap}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={styles.svg}>
        {/* Background Track Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={dark ? "rgba(255, 255, 255, 0.07)" : colors.surfaceSubtle}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Category Segments */}
        {totals.map(({ category, total: categoryTotal }) => {
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
          {
            backgroundColor: dark ? "#0F1A18" : "#FFFFFF",
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.kickerLabel, { color: colors.primary }]}>THIS MONTH</Text>
        <Text style={[styles.donutTotal, { color: colors.foreground }]} numberOfLines={1}>
          {formatMoney(total)}
        </Text>
        <Text style={[styles.donutLabel, { color: colors.muted }]}>total tracked</Text>
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
    borderRadius: 48,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    paddingHorizontal: 6,
  },
  kickerLabel: {
    fontSize: 7.5,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  donutTotal: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 14.5,
    letterSpacing: -0.3,
    textAlign: "center",
  },
  donutLabel: {
    fontSize: 8.5,
    fontWeight: "500",
    marginTop: 2,
  },
});

