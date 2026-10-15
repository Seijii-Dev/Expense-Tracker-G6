import React, { useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Path, Stop, Line } from "react-native-svg";
import { useTheme } from "@/lib/theme-store";
import { formatMoney } from "@/utils/formatters";
import { SpendingTimeline } from "@/utils/spending-trajectory";
import { radii, spacing } from "@/constants/design-tokens";

import { GlassSurface } from "@/components/ui/glass-surface";

interface SpendingTrendChartProps {
  timeline: SpendingTimeline;
}

export function SpendingTrendChart({ timeline }: SpendingTrendChartProps) {
  const { colors, dark } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const [selectedPointKey, setSelectedPointKey] = useState<string | null>(null);
  const [measuredWidth, setMeasuredWidth] = useState(0);

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

  const pointsData = timeline?.points ?? [];
  const maxVal = Math.max(...pointsData.map((point) => point.amount), 1) * 1.15;

  useEffect(() => {
    setSelectedPointKey(null);
  }, [timeline?.interval, timeline?.startDate, timeline?.endDate]);

  if (pointsData.length === 0) {
    return null;
  }

  const points = pointsData.map((point, index) => {
    const x = paddingLeft + (index / Math.max(pointsData.length - 1, 1)) * innerWidth;
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
  const tooltipWidth = Math.min(chartWidth - 24, 144);
  const tooltipLeft = Math.max(12, Math.min(activePoint.x - tooltipWidth / 2, chartWidth - tooltipWidth - 12));

  return (
    <GlassSurface
        variant="card"
        radius={24}
        style={styles.container}
        contentStyle={styles.containerContent}
        onLayout={(e: any) => {
          const w = e.nativeEvent.layout.width;
          if (w > 0 && Math.abs(w - measuredWidth) > 1) {
            setMeasuredWidth(w);
          }
        }}
      >
        <View style={styles.headerRow}>

        <View style={styles.titleBlock}>
          <Text style={[styles.kicker, { color: colors.muted }]}>SPENDING TREND</Text>
          <View style={styles.amountRow}>
            <Text
              style={[styles.amountText, { color: colors.foreground }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
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
              backgroundColor: colors.primarySoft,
              borderColor: colors.primary,
            },
          ]}
        >
          <Text style={[styles.trendPillText, { color: colors.primary }]}>{timeline.intervalLabel}</Text>
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
              backgroundColor: dark ? colors.cardElevated : colors.foreground,
              width: tooltipWidth,
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
              <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.22" />
              <Stop offset="85%" stopColor={colors.primary} stopOpacity="0.02" />
              <Stop offset="100%" stopColor={colors.primary} stopOpacity="0" />
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
            stroke={colors.primary}
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
                    fill={colors.primary}
                    fillOpacity={0.2}
                  />
                )}
                <Circle
                  cx={point.x}
                  cy={point.y}
                  r={isSelected ? 4.5 : 3.5}
                  fill="#FFFFFF"
                  stroke={colors.primary}
                  strokeWidth={isSelected ? 3 : 2}
                />
                <Circle
                  cx={point.x}
                  cy={point.y}
                  r={24}
                  fill="transparent"
                  onPress={() => setSelectedPointKey(point.key)}
                  accessibilityLabel={`${point.label}: ${formatMoney(point.amount)}`}
                />
              </React.Fragment>
            );
          })}
        </Svg>
      </View>

      {/* Horizontal Axis with interactive inspection */}
      <View style={[styles.xAxisRow, { paddingLeft, paddingRight }]}>
        {timeline.points.map((point) => {
          const isSelected = point.key === activePoint.key;
          return (
            <Pressable
              key={point.key}
              onPress={() => setSelectedPointKey(point.key)}
              hitSlop={6}
              style={[
                styles.axisButton,
                isSelected && {
                  backgroundColor: dark ? "rgba(232, 74, 63, 0.16)" : colors.primarySoft,
                  borderColor: colors.primary,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${point.label}: ${formatMoney(point.amount)}`}
            >
              <Text
                style={[
                  styles.axisText,
                  {
                    color: isSelected ? colors.primary : colors.muted,
                    fontWeight: isSelected ? "700" : "500",
                  },
                ]}
                numberOfLines={1}
              >
                {point.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      </GlassSurface>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  containerContent: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
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
    fontFamily: "DMSans_700Bold",
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.6,
    fontVariant: ["tabular-nums"],
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
    fontFamily: "DMSans_700Bold",
    flexShrink: 1,
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
  axisButton: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  axisText: {
    textAlign: "center",
    fontSize: 9.5,
  },
});
