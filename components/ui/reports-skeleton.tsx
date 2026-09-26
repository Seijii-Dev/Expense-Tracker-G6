import React from "react";
import { StyleSheet, View } from "react-native";
import { Skeleton, SkeletonCircle, SkeletonText } from "@/components/ui/skeleton";
import { useTheme } from "@/lib/theme-store";

export function ReportsSkeleton() {
  const { colors, dark } = useTheme();

  return (
    <View style={styles.container}>
      {/* Header Skeleton */}
      <SkeletonText width={110} height={10} borderRadius={4} style={styles.mb6} />
      <SkeletonText width={190} height={28} borderRadius={8} style={styles.mb8} />
      <SkeletonText width={260} height={13} borderRadius={6} style={styles.mb16} />

      {/* Hero Card Skeleton */}
      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: dark ? "rgba(255,255,255,0.06)" : "#EAF4EE",
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.heroLeft}>
          <SkeletonText width={90} height={10} borderRadius={4} style={styles.mb8} />
          <SkeletonText width={140} height={32} borderRadius={8} style={styles.mb12} />
          <SkeletonText width={110} height={12} borderRadius={4} />
        </View>
        <SkeletonCircle size={64} />
      </View>

      {/* Category Breakdown Panel Skeleton */}
      <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.panelHeaderRow}>
          <View>
            <SkeletonText width={80} height={10} borderRadius={4} style={styles.mb6} />
            <SkeletonText width={130} height={18} borderRadius={6} />
          </View>
          <SkeletonCircle size={22} />
        </View>

        {[1, 2, 3, 4].map((index) => (
          <View key={index} style={styles.breakdownRow}>
            <View style={styles.breakdownLabels}>
              <View style={styles.labelLeft}>
                <SkeletonCircle size={18} />
                <SkeletonText width={70} height={12} borderRadius={4} />
              </View>
              <SkeletonText width={60} height={12} borderRadius={4} />
            </View>
            <Skeleton width="100%" height={8} borderRadius={4} />
          </View>
        ))}
      </View>

      {/* Payment Methods Panel Skeleton */}
      <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <SkeletonText width={90} height={10} borderRadius={4} style={styles.mb6} />
        <SkeletonText width={140} height={18} borderRadius={6} style={styles.mb14} />

        <View style={styles.grid2x2}>
          {[1, 2, 3, 4].map((index) => (
            <View
              key={index}
              style={[styles.payMethodCard, { borderColor: colors.border, backgroundColor: colors.surfaceSubtle }]}
            >
              <SkeletonCircle size={24} style={styles.mb8} />
              <SkeletonText width={50} height={12} borderRadius={4} style={styles.mb6} />
              <SkeletonText width={70} height={14} borderRadius={5} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    paddingBottom: 32,
  },
  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 22,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  heroLeft: {
    flex: 1,
  },
  panel: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 16,
  },
  panelHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  breakdownRow: {
    marginBottom: 14,
  },
  breakdownLabels: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  labelLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  grid2x2: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  payMethodCard: {
    width: "48%",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  mb6: {
    marginBottom: 6,
  },
  mb8: {
    marginBottom: 8,
  },
  mb12: {
    marginBottom: 12,
  },
  mb14: {
    marginBottom: 14,
  },
  mb16: {
    marginBottom: 16,
  },
});
