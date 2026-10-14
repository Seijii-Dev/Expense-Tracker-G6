import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { GlassSurface } from "@/components/ui/glass-surface";
import { EmptyState } from "@/components/ui/empty-state";
import { CategoryIcon } from "@/components/ui/category-icon";
import { getCategoryStyle } from "@/constants/categories";
import { CategoryTotal } from "@/hooks/useReportMetrics";
import { CustomCategory } from "@/types/expense";
import { useTheme } from "@/lib/theme-store";
import { formatMoney, formatPercent } from "@/utils/formatters";

interface CategoryBreakdownProps {
  categoryTotals: CategoryTotal[];
  periodTotal: number;
  maxCategorySpend: number;
  activeCount: number;
  customCategories?: CustomCategory[];
}

const CategoryProgressFill = React.memo(function CategoryProgressFill({
  fillPct,
  color,
}: {
  fillPct: number;
  color: string;
}) {
  const widthAnim = useSharedValue(0);

  useEffect(() => {
    widthAnim.value = withSpring(Math.min(100, Math.max(0, fillPct)), {
      damping: 22,
      stiffness: 200,
    });
  }, [fillPct, widthAnim]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${widthAnim.value}%`,
  }));

  return (
    <Animated.View
      style={[
        styles.miniFill,
        { backgroundColor: color },
        animatedStyle,
      ]}
    />
  );
});

export function CategoryBreakdown({
  categoryTotals,
  periodTotal,
  maxCategorySpend,
  activeCount,
  customCategories,
}: CategoryBreakdownProps) {
  const { colors, dark } = useTheme();

  return (
    <GlassSurface
      variant="card"
      radius={24}
      style={styles.panel}
      contentStyle={styles.panelContent}
    >
      <View style={styles.panelHeader}>

        <View>
          <Text style={[styles.kicker, { color: colors.muted }]}>BREAKDOWN</Text>
          <Text style={[styles.panelTitle, { color: colors.foreground }]}>Category Distribution</Text>
        </View>
        <View
          style={[
            styles.countBadge,
            {
              backgroundColor: dark ? "rgba(232, 74, 63, 0.15)" : "#FFF0ED",
              borderColor: dark ? "rgba(232, 74, 63, 0.3)" : "#FED7D2",
            },
          ]}
        >
          <Text style={styles.countBadgeText}>
            {activeCount} {activeCount === 1 ? "Category" : "Categories"}
          </Text>
        </View>
      </View>

      {activeCount === 0 ? (
        <EmptyState
          icon="pie-chart-outline"
          lottieSource={require("@/assets/lottie/empty-charts.json")}
          title="No spending in this period"
          description="Log expenses to see your category breakdown and spending share."
        />
      ) : (
        <View>
          {/* Multi-segmented Category Bar */}
          <View
            style={[
              styles.segmentedBar,
              { backgroundColor: dark ? "rgba(255,255,255,0.06)" : colors.surfaceSubtle },
            ]}
          >
            {categoryTotals.filter(({ total }) => total > 0).map(({ category, total }) => {
              const meta = getCategoryStyle(category, customCategories);
              return (
                <View
                  key={category}
                  style={[
                    styles.segmentSlice,
                    {
                      flex: Math.max(0.01, total),
                      backgroundColor: meta.color,
                    },
                  ]}
                />
              );
            })}
          </View>

          {/* Category Items List */}
          <View style={styles.list}>
            {categoryTotals.map(({ category, total }, index) => {
              const meta = getCategoryStyle(category, customCategories);
              const percentStr = formatPercent(total, periodTotal);
              const rank = index + 1;
              const fillPct =
                maxCategorySpend > 0
                  ? Math.min(100, Math.max(4, (total / maxCategorySpend) * 100))
                  : 0;

              return (
                <View
                  key={category}
                  style={[
                    styles.categoryRow,
                    index > 0 && [
                      styles.rowSeparator,
                      { borderTopColor: dark ? "rgba(255,255,255,0.05)" : colors.border },
                    ],
                  ]}
                >
                  <View style={styles.leftGroup}>
                    {/* Category Icon Container */}
                    <View
                      style={[
                        styles.iconContainer,
                        {
                          backgroundColor: dark ? `${meta.color}25` : meta.soft,
                        },
                      ]}
                    >
                      <CategoryIcon
                        category={category}
                        size={18}
                        customCategories={customCategories}
                      />
                    </View>

                    <View style={styles.textGroup}>
                      <View style={styles.titleRow}>
                        <Text
                          style={[styles.categoryTitle, { color: colors.foreground }]}
                          numberOfLines={1}
                        >
                          {category}
                        </Text>
                        <View
                          style={[
                            styles.pctBadge,
                            {
                              backgroundColor: dark ? `${meta.color}20` : meta.soft,
                            },
                          ]}
                        >
                          <Text style={[styles.pctText, { color: meta.color }]}>{percentStr}</Text>
                        </View>
                      </View>

                      {/* Mini Track */}
                      <View
                        style={[
                          styles.miniTrack,
                          {
                            backgroundColor: dark
                              ? "rgba(255,255,255,0.06)"
                              : "rgba(0,0,0,0.04)",
                          },
                        ]}
                      >
                        <CategoryProgressFill fillPct={fillPct} color={meta.color} />
                      </View>
                    </View>
                  </View>

                  <View style={styles.rightGroup}>
                    <Text style={[styles.amountText, { color: colors.foreground }]}>
                      {formatMoney(total)}
                    </Text>
                    <Text style={[styles.transCount, { color: colors.muted }]}>
                      {percentStr} share
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  panel: {
    marginBottom: 16,
  },
  panelContent: {
    padding: 18,
  },
  panelHeader: {

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  kicker: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  countBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 999,
    borderWidth: 1,
  },
  countBadgeText: {
    color: "#E84A3F",
    fontSize: 10.5,
    fontWeight: "700",
  },
  segmentedBar: {
    width: "100%",
    height: 9,
    borderRadius: 999,
    overflow: "hidden",
    flexDirection: "row",
    gap: 2,
    marginBottom: 14,
  },
  segmentSlice: {
    height: "100%",
    borderRadius: 999,
  },
  list: {
    gap: 0,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  rowSeparator: {
    borderTopWidth: 1,
  },
  leftGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    paddingRight: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  textGroup: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: -0.1,
    flexShrink: 1,
  },
  pctBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 999,
  },
  pctText: {
    fontSize: 9.5,
    fontWeight: "700",
  },
  miniTrack: {
    width: 90,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  miniFill: {
    width: "100%",
    height: "100%",
    borderRadius: 2,
    transformOrigin: "left center",
  },
  rightGroup: {
    alignItems: "flex-end",
  },
  amountText: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  transCount: {
    fontSize: 10.5,
    fontWeight: "500",
    marginTop: 1,
  },
});
