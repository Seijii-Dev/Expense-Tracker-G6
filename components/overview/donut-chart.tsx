import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
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
  const progress = useSharedValue(0);

  const isFirstRender = React.useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      progress.value = withSpring(1, {
        damping: 20,
        stiffness: 220,
        mass: 0.7,
      });
    } else {
      progress.value = 0.92;
      progress.value = withSpring(1, {
        damping: 18,
        stiffness: 260,
        mass: 0.6,
      });
    }
  }, [total, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      {
        scale: interpolate(progress.value, [0, 1], [0.92, 1]),
      },
    ],
  }));

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
  let offset = 0;

  return (
    <Animated.View style={[styles.donutWrap, animatedStyle]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={styles.svg}>
        {/* Background Track Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={dark ? "rgba(255, 255, 255, 0.08)" : colors.surfaceSubtle}
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
            backgroundColor: colors.card,
            borderColor: colors.borderSubtle,
          },
        ]}
      >
        <Text style={[styles.kickerLabel, { color: colors.muted }]}>THIS MONTH</Text>
        <Text style={[styles.donutTotal, { color: colors.foreground }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.68}>
          {formatMoney(total)}
        </Text>
        <Text style={[styles.donutLabel, { color: colors.muted }]}>tracked</Text>
      </View>
    </Animated.View>
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
