import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Expense } from "@/types/expense";
import { CATEGORIES, CATEGORY_META } from "@/constants/categories";
import { useTheme } from "@/lib/theme-store";
import { formatMoney } from "@/utils/formatters";

interface DonutChartProps {
  total: number;
  expenses: Expense[];
}

export function DonutChart({ total, expenses }: DonutChartProps) {
  const { colors } = useTheme();

  const totals = CATEGORIES.map((category) => ({
    category,
    total: expenses
      .filter((expense) => expense.category === category)
      .reduce((sum, expense) => sum + (expense.amount || 0), 0),
  })).filter((item) => item.total > 0);

  const radius = 55;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <View style={styles.donutWrap}>
      <Svg width={135} height={135} viewBox="0 0 135 135" style={styles.svg}>
        <Circle cx="67.5" cy="67.5" r={radius} stroke={colors.border} strokeWidth="24" fill="none" />
        {totals.map(({ category, total: categoryTotal }) => {
          const length = total > 0 ? (categoryTotal / total) * circumference : 0;
          const segment = (
            <Circle
              key={category}
              cx="67.5"
              cy="67.5"
              r={radius}
              stroke={CATEGORY_META[category].color}
              strokeWidth="24"
              fill="none"
              strokeDasharray={[length, Math.max(0, circumference - length)]}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
          offset += length;
          return segment;
        })}
      </Svg>
      <View style={[styles.donutHole, { backgroundColor: colors.surface }]}>
        <Text style={[styles.donutTotal, { color: colors.foreground }]}>{formatMoney(total)}</Text>
        <Text style={[styles.donutLabel, { color: colors.subtle }]}>total spent</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  donutWrap: {
    width: 135,
    height: 135,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  svg: {
    transform: [{ rotate: "-90deg" }],
  },
  donutHole: {
    position: "absolute",
    width: 87,
    height: 87,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 45,
  },
  donutTotal: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 15,
    fontWeight: "700",
  },
  donutLabel: {
    fontSize: 8,
    marginTop: 2,
  },
});
