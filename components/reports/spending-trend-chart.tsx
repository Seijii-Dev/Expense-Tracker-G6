import React, { useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
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
  const [measuredWidth, setMeasuredWidth] = useState(0);
  const chartOpacity = useSharedValue(1);
  const isFirstTimeline = useRef(true);

  // Compute exact chart width to match container width
  const fallbackWidth = Math.min(windowWidth - (windowWidth < 360 ? 24 : windowWidth < 480 ? 32 : 48), 440);
  const chartWidth = measuredWidth > 0 ? measuredWidth : fallbackWidth;
  const chartHeight = 170;
  const paddingLeft = 24;
  const paddingRight = 20;
  const paddingTop = 26;
  const paddingBottom = 24;
  const innerWidth = Math.max(10, chartWidth - paddingLeft - paddingRight);
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  if (!timeline?.points || timeline.points.length === 0) {
    return null;
  }

  const maxVal = Math.max(...timeline.points.map((point) => point.amount), 1) * 1.15;

  useEffect(() => {
    setSelectedPointKey(null);
    if (isFirstTimeline.current) {
      isFirstTimeline.current = false;
      return;
    }

    chartOpacity.value = 0.72;
    chartOpacity.value = withTiming(1, { duration: 180 });
  }, [chartOpacity, timeline.interval, timeline.startDate, timeline.endDate]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: chartOpacity.value,
  }));

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
  const lastPoint = points[points.length - 1] || points[0];
  const areaD = `${pathD} L ${lastPoint.x} ${baselineY} L ${points[0].x} ${baselineY} Z`;
  const activePoint =
    points.find((point) => point.key === selectedPointKey) ?? lastPoint;
  const tooltipLeft = Math.max(16, Math.min(activePoint.x - 48, chartWidth - 110));

  return (
    <Animated.View
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        if (w > 0 && Math.abs(w - measuredWidth) > 1) {
          setMeasuredWidth(w);
        }
      }}
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: dark ? "#000000" : "#1A1D20",
          shadowOpacity: dark ? 0.35 : 0.04,
        },
        animatedContainerStyle,
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleBlock}>
          <Text style={[styles.kicker, { color: colors.muted }]}>SPENDING TREND</Text>
          <View style={styles.amountRow}>
            <Text style={[styles.amountText, { color: colors.foreground }]}>
              {formatMoney(timeline.total)}
            </Text>
          </View>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            {timeline.intervalLabel} · {timeline.rangeLabel}
          </Text>
        </View>
        <View
          style={[
            styles.trendPill,
            {
              backgroundColor: dark ? "rgba(232, 74, 63, 0.15)" : "#FFF0ED",
              borderColor: dark ? "rgba(232, 74, 63, 0.3)" : "#FED7D2",
            },
          ]}
        >
          <Text style={styles.trendPillText}>{timeline.intervalLabel}</Text>
        </View>
      </View>

      <View style={styles.chartWrapper}>
        {/* Floating Tooltip Pill */}
        <View
          style={[
            styles.floatingBadge,
            {
              left: tooltipLeft,
              top: Math.max(6, activePoint.y - 32),
              backgroundColor: dark ? "#1E293B" : "#0F172A",
            },
          ]}
          accessibilityLiveRegion="polite"
        >
          <Text style={styles.floatingBadgeLabel}>{activePoint.label}: </Text>
          <Text style={styles.floatingBadgeText}>{formatMoney(activePoint.amount)}</Text>
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
            <LinearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#E84A3F" stopOpacity="0.22" />
              <Stop offset="85%" stopColor="#E84A3F" stopOpacity="0.02" />
              <Stop offset="100%" stopColor="#E84A3F" stopOpacity="0" />
            </LinearGradient>
          </Defs>

          {/* Horizontal grid lines */}
          {[0.25, 0.5, 0.75, 1].map((percent, index) => {
            const y = paddingTop + innerHeight * (1 - percent);
            return (
              <Line
                key={index}
                x1={paddingLeft}
                y1={y}
                x2={chartWidth - paddingRight}
                y2={y}
                stroke={dark ? "rgba(255,255,255,0.06)" : "#ECEEF2"}
                strokeDasharray="3 3"
                strokeWidth="1"
              />
            );
          })}

          {/* Gradient area */}
          <Path d={areaD} fill="url(#chartGradient)" />

          {/* Trajectory smooth curve line */}
          <Path
            d={pathD}
            fill="none"
            stroke="#E84A3F"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data point beacons */}
          {points.map((point) => {
            const isSelected = point.key === activePoint.key;
            return (
              <React.Fragment key={point.key}>
                {isSelected && (
                  <Circle
                    cx={point.x}
                    cy={point.y}
                    r={8}
                    fill="#E84A3F"
                    fillOpacity={0.2}
                  />
                )}
                <Circle
                  cx={point.x}
                  cy={point.y}
                  r={isSelected ? 4.5 : 3.5}
                  fill="#FFFFFF"
                  stroke="#E84A3F"
                  strokeWidth={isSelected ? 3 : 2}
                  onPress={() => setSelectedPointKey(point.key)}
                  accessibilityLabel={`${point.label}: ${formatMoney(point.amount)}`}
                />
              </React.Fragment>
            );
          })}
        </Svg>
      </View>

      {/* Horizontal Axis */}
      <View style={[styles.xAxisRow, { paddingLeft, paddingRight }]}>
        {timeline.points.map((point) => {
          const isSelected = point.key === activePoint.key;
          return (
            <Text
              key={point.key}
              style={[
                styles.axisText,
                {
                  color: isSelected ? "#E84A3F" : colors.muted,
                  fontWeight: isSelected ? "700" : "500",
                },
              ]}
              numberOfLines={1}
            >
              {point.label}
            </Text>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: 1,
    paddingTop: 16,
    paddingBottom: 14,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 2,
    position: "relative",
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  titleBlock: {
    flex: 1,
  },
  kicker: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  amountText: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
  },
  trendPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  trendPillText: {
    color: "#E84A3F",
    fontSize: 10.5,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  chartWrapper: {
    position: "relative",
    width: "100%",
  },
  floatingBadge: {
    position: "absolute",
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  floatingBadgeLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 10,
    fontWeight: "500",
  },
  floatingBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  xAxisRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 2,
    marginTop: 2,
  },
  axisText: {
    flex: 1,
    textAlign: "center",
    fontSize: 9.5,
  },
});
