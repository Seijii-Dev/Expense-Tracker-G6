import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Path, Stop, Line } from "react-native-svg";
import { useTheme } from "@/lib/theme-store";
import { formatMoney } from "@/utils/formatters";
import { SpendingTimeline } from "@/utils/spending-trajectory";

interface SpendingTrendChartProps {
  timeline: SpendingTimeline;
}

export function SpendingTrendChart({ timeline }: SpendingTrendChartProps) {
  const { colors, dark } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const [selectedPointKey, setSelectedPointKey] = useState<string | null>(null);
  const chartOpacity = useRef(new Animated.Value(1)).current;
  const isFirstTimeline = useRef(true);

  const chartWidth = Math.min(windowWidth - (windowWidth < 360 ? 48 : 56), 420);
  const chartHeight = 164;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 22;
  const paddingBottom = 22;
  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;
  const maxVal = Math.max(...timeline.points.map((point) => point.amount), 1) * 1.15;

  useEffect(() => {
    setSelectedPointKey(null);
    if (isFirstTimeline.current) {
      isFirstTimeline.current = false;
      return;
    }

    chartOpacity.setValue(0.72);
    const animation = Animated.timing(chartOpacity, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [chartOpacity, timeline.interval, timeline.startDate, timeline.endDate]);

  const points = timeline.points.map((point, index) => {
    const x = paddingLeft + (index / Math.max(timeline.points.length - 1, 1)) * innerWidth;
    const y = paddingTop + innerHeight - (point.amount / maxVal) * innerHeight;
    return { ...point, x, y };
  });

  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    const controlX = current.x + (next.x - current.x) / 2;
    pathD += ` C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`;
  }

  const baselineY = paddingTop + innerHeight;
  const areaD = `${pathD} L ${points[points.length - 1].x} ${baselineY} L ${points[0].x} ${baselineY} Z`;
  const activePoint =
    points.find((point) => point.key === selectedPointKey) ?? points[points.length - 1];
  const tooltipLeft = Math.max(44, Math.min(activePoint.x - 38, chartWidth - 86));

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: dark ? "#000000" : "#0A1F1C",
          shadowOpacity: dark ? 0.35 : 0.04,
          opacity: chartOpacity,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleBlock}>
          <Text style={[styles.title, { color: colors.foreground }]}>Spending Trajectory</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            {timeline.intervalLabel} · {timeline.rangeLabel}
          </Text>
        </View>
        <View style={styles.trendPill}>
          <Text style={styles.trendPillText}>{timeline.intervalLabel}</Text>
        </View>
      </View>

      <Svg
        width={chartWidth}
        height={chartHeight}
        accessibilityRole="image"
        accessibilityLabel={`${timeline.intervalLabel} spending from ${timeline.rangeLabel}. Total ${formatMoney(
          timeline.total
        )}. Tap a data point to inspect its amount.`}
      >
        <Defs>
          <LinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#10B981" stopOpacity="0.32" />
            <Stop offset="70%" stopColor="#10B981" stopOpacity="0.08" />
            <Stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {[0.25, 0.5, 0.75, 1].map((percent, index) => {
          const y = paddingTop + innerHeight * (1 - percent);
          return (
            <Line
              key={index}
              x1={paddingLeft}
              y1={y}
              x2={chartWidth - paddingRight}
              y2={y}
              stroke={dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)"}
              strokeDasharray="4 4"
              strokeWidth="1"
            />
          );
        })}

        <Path d={areaD} fill="url(#areaGradient)" />
        <Path
          d={pathD}
          fill="none"
          stroke="#10B981"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((point) => (
          <Circle
            key={point.key}
            cx={point.x}
            cy={point.y}
            r={point.key === activePoint.key ? 5 : 3}
            fill={point.key === activePoint.key ? "#10B981" : colors.surface}
            stroke="#10B981"
            strokeWidth="2"
            onPress={() => setSelectedPointKey(point.key)}
            accessibilityLabel={`${point.label}: ${formatMoney(point.amount)}`}
          />
        ))}
      </Svg>

      <View
        style={[
          styles.floatingBadge,
          {
            left: tooltipLeft,
            top: Math.max(48, activePoint.y + 24),
            backgroundColor: "#16382B",
            borderColor: "#10B981",
          },
        ]}
        accessibilityLiveRegion="polite"
      >
        <Text style={styles.floatingBadgeLabel}>{activePoint.label}</Text>
        <Text style={styles.floatingBadgeText}>{formatMoney(activePoint.amount)}</Text>
      </View>

      <View style={[styles.xAxisRow, { paddingLeft, paddingRight }]}>
        {timeline.points.map((point) => (
          <Text
            key={point.key}
            style={[styles.axisText, { color: colors.subtle }]}
            numberOfLines={1}
          >
            {point.label}
          </Text>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 22,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
    position: "relative",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    marginBottom: 6,
    gap: 8,
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 16,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 10.5,
    fontWeight: "500",
    marginTop: 3,
  },
  trendPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
  },
  trendPillText: {
    color: "#10B981",
    fontSize: 10,
    fontWeight: "700",
  },
  floatingBadge: {
    position: "absolute",
    minWidth: 68,
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  floatingBadgeLabel: {
    color: "#A7F3D0",
    fontSize: 8.5,
    fontWeight: "600",
  },
  floatingBadgeText: {
    color: "#FFFFFF",
    fontSize: 10.5,
    fontWeight: "700",
  },
  xAxisRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 3,
    marginTop: 4,
  },
  axisText: {
    flex: 1,
    textAlign: "center",
    fontSize: 9,
    fontWeight: "600",
  },
});
