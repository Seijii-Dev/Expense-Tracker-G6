import React from "react";
import { StyleSheet, View } from "react-native";
import { Skeleton, SkeletonCircle, SkeletonText } from "@/components/ui/skeleton";
import { useTheme } from "@/lib/theme-store";

export function AccountSkeleton() {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {/* Header Skeleton */}
      <SkeletonText width={100} height={10} borderRadius={4} style={styles.mb6} />
      <SkeletonText width={170} height={28} borderRadius={8} style={styles.mb8} />
      <SkeletonText width={240} height={13} borderRadius={6} style={styles.mb16} />

      {/* Profile Card Skeleton */}
      <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Skeleton width={52} height={52} borderRadius={16} style={styles.mr14} />
        <View style={styles.profileBody}>
          <SkeletonText width={130} height={16} borderRadius={5} style={styles.mb6} />
          <SkeletonText width={160} height={11} borderRadius={4} style={styles.mb8} />
          <SkeletonText width={90} height={10} borderRadius={4} />
        </View>
        <SkeletonCircle size={20} />
      </View>

      {/* Stat Cards Skeleton */}
      <View style={styles.statsRow}>
        {[1, 2, 3].map((index) => (
          <View
            key={index}
            style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <SkeletonCircle size={18} style={styles.mb6} />
            <SkeletonText width={55} height={9} borderRadius={3} style={styles.mb6} />
            <SkeletonText width={70} height={16} borderRadius={5} />
          </View>
        ))}
      </View>

      {/* Action Rows Skeleton Panel */}
      <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {[1, 2, 3].map((index) => (
          <View
            key={index}
            style={[styles.actionRow, index < 3 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
          >
            <SkeletonCircle size={32} />
            <View style={styles.actionBody}>
              <SkeletonText width={120} height={14} borderRadius={5} style={styles.mb4} />
              <SkeletonText width={180} height={10} borderRadius={4} />
            </View>
            <SkeletonCircle size={16} />
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
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 14,
  },
  profileBody: {
    flex: 1,
  },
  mr14: {
    marginRight: 14,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  panel: {
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
  actionBody: {
    flex: 1,
  },
  mb4: {
    marginBottom: 4,
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
