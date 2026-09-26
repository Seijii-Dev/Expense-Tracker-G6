import React from "react";
import { StyleSheet, View } from "react-native";
import { Skeleton, SkeletonCircle, SkeletonText } from "@/components/ui/skeleton";
import { useTheme } from "@/lib/theme-store";

export function TransactionsSkeleton() {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {/* Header Skeleton */}
      <SkeletonText width={120} height={10} borderRadius={4} style={styles.mb6} />
      <SkeletonText width={160} height={28} borderRadius={8} style={styles.mb8} />
      <SkeletonText width={260} height={13} borderRadius={6} style={styles.mb16} />

      {/* Summary Card Skeleton */}
      <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.summaryCol}>
          <SkeletonText width={60} height={9} borderRadius={4} style={styles.mb6} />
          <SkeletonText width={80} height={20} borderRadius={6} />
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.summaryCol}>
          <SkeletonText width={80} height={9} borderRadius={4} style={styles.mb6} />
          <SkeletonText width={100} height={20} borderRadius={6} />
        </View>
      </View>

      {/* Search Bar Skeleton */}
      <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <SkeletonCircle size={18} />
        <SkeletonText width={160} height={14} borderRadius={5} />
      </View>

      {/* Sort Chips Skeleton */}
      <View style={styles.chipRow}>
        <Skeleton width={60} height={30} borderRadius={15} />
        <Skeleton width={75} height={30} borderRadius={15} />
        <Skeleton width={80} height={30} borderRadius={15} />
        <Skeleton width={70} height={30} borderRadius={15} />
      </View>

      {/* Category Chips Skeleton */}
      <View style={styles.chipRow}>
        <Skeleton width={45} height={32} borderRadius={8} />
        <Skeleton width={65} height={32} borderRadius={8} />
        <Skeleton width={85} height={32} borderRadius={8} />
        <Skeleton width={70} height={32} borderRadius={8} />
        <Skeleton width={80} height={32} borderRadius={8} />
      </View>

      {/* Transaction Rows Skeleton */}
      <View style={[styles.listContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {[1, 2, 3, 4, 5].map((index) => (
          <View
            key={index}
            style={[styles.row, index < 5 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
          >
            <SkeletonCircle size={38} />
            <View style={styles.rowBody}>
              <SkeletonText width={130} height={14} borderRadius={5} style={styles.mb6} />
              <View style={styles.metaRow}>
                <Skeleton width={45} height={12} borderRadius={4} />
                <SkeletonText width={50} height={10} borderRadius={4} />
                <SkeletonText width={60} height={10} borderRadius={4} />
              </View>
            </View>
            <Skeleton width={70} height={16} borderRadius={6} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    paddingBottom: 32,
  },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 14,
    marginBottom: 16,
  },
  summaryCol: {
    alignItems: "center",
  },
  divider: {
    width: 1,
    height: 32,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  listContainer: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
  rowBody: {
    flex: 1,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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
});
