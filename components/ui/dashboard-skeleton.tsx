import React from "react";
import { StyleSheet, View } from "react-native";
import { Skeleton, SkeletonCircle, SkeletonText } from "@/components/ui/skeleton";
import { useTheme } from "@/lib/theme-store";

export function DashboardSkeleton() {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {/* Header Skeleton */}
      <View style={styles.header}>
        <View style={styles.headerTextCol}>
          <SkeletonText width={110} height={11} borderRadius={4} style={styles.mb8} />
          <SkeletonText width={190} height={26} borderRadius={8} style={styles.mb8} />
          <SkeletonText width={230} height={13} borderRadius={6} />
        </View>
        <SkeletonCircle size={44} />
      </View>

      {/* Action Row Skeleton */}
      <View style={styles.actionRow}>
        <Skeleton width={120} height={36} borderRadius={18} />
        <Skeleton width={110} height={36} borderRadius={18} />
      </View>

      {/* Metrics Grid Skeleton */}
      <View style={styles.metricsGrid}>
        <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.metricTop}>
            <SkeletonText width={70} height={10} borderRadius={4} />
            <SkeletonCircle size={22} />
          </View>
          <SkeletonText width={90} height={20} borderRadius={6} style={styles.my6} />
          <SkeletonText width={60} height={9} borderRadius={4} />
        </View>
        <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.metricTop}>
            <SkeletonText width={65} height={10} borderRadius={4} />
            <SkeletonCircle size={22} />
          </View>
          <SkeletonText width={80} height={20} borderRadius={6} style={styles.my6} />
          <SkeletonText width={75} height={9} borderRadius={4} />
        </View>
        <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.metricTop}>
            <SkeletonText width={80} height={10} borderRadius={4} />
            <SkeletonCircle size={22} />
          </View>
          <SkeletonText width={85} height={20} borderRadius={6} style={styles.my6} />
          <SkeletonText width={90} height={9} borderRadius={4} />
        </View>
      </View>

      {/* Money Map Panel Skeleton */}
      <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <SkeletonText width={80} height={10} borderRadius={4} style={styles.mb6} />
        <SkeletonText width={160} height={18} borderRadius={6} style={styles.mb16} />
        <View style={styles.donutRow}>
          <SkeletonCircle size={120} />
          <View style={styles.legendCol}>
            {[1, 2, 3].map((key) => (
              <View key={key} style={styles.legendRow}>
                <View style={styles.legendLeft}>
                  <SkeletonCircle size={18} />
                  <SkeletonText width={70} height={12} borderRadius={4} />
                </View>
                <SkeletonText width={50} height={12} borderRadius={4} />
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Recent Transactions Skeleton */}
      <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.panelHeaderRow}>
          <View>
            <SkeletonText width={70} height={10} borderRadius={4} style={styles.mb6} />
            <SkeletonText width={150} height={18} borderRadius={6} />
          </View>
          <Skeleton width={60} height={24} borderRadius={12} />
        </View>

        {[1, 2, 3].map((index) => (
          <View
            key={index}
            style={[styles.txRow, index < 3 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
          >
            <SkeletonCircle size={36} />
            <View style={styles.txBody}>
              <SkeletonText width={120} height={14} borderRadius={5} style={styles.mb6} />
              <SkeletonText width={80} height={10} borderRadius={4} />
            </View>
            <Skeleton width={65} height={18} borderRadius={6} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerTextCol: {
    flex: 1,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  metricsGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  metricTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  panel: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  panelHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  donutRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  legendCol: {
    flex: 1,
    gap: 12,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  legendLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  txBody: {
    flex: 1,
  },
  mb6: {
    marginBottom: 6,
  },
  mb8: {
    marginBottom: 8,
  },
  mb16: {
    marginBottom: 16,
  },
  my6: {
    marginVertical: 6,
  },
});
