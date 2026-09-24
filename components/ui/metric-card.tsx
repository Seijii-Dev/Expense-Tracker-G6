import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/lib/theme-store";

export type MetricTone = "coral" | "blue" | "green" | "warning";

interface MetricCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone?: MetricTone;
  foot?: string;
  progress?: number;
  progressColor?: string;
}

export function MetricCard({
  label,
  value,
  icon,
  tone = "coral",
  foot,
  progress,
  progressColor,
}: MetricCardProps) {
  const { colors, dark } = useTheme();

  const getToneStyle = () => {
    switch (tone) {
      case "blue":
        return { backgroundColor: dark ? "#1E2C3D" : "#EEF4FF" };
      case "green":
        return { backgroundColor: dark ? "#1B3127" : "#EDF8F1" };
      case "warning":
        return { backgroundColor: dark ? "#362B1D" : "#FFF8ED" };
      case "coral":
      default:
        return { backgroundColor: dark ? "#362220" : "#FFF0ED" };
    }
  };

  const getProgressFillColor = () => {
    if (progressColor) return progressColor;
    if (progress !== undefined) {
      if (progress >= 100) return colors.error;
      if (progress >= 80) return colors.warning;
    }
    return colors.success;
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.topRow}>
        <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
        <View style={[styles.iconWrap, getToneStyle()]}>{icon}</View>
      </View>
      <Text style={[styles.value, { color: colors.foreground }]}>{value}</Text>
      {progress !== undefined && (
        <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(100, Math.max(0, progress))}%`,
                backgroundColor: getProgressFillColor(),
              },
            ]}
          />
        </View>
      )}
      {foot ? <Text style={[styles.foot, { color: colors.subtle }]}>{foot}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 112,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  iconWrap: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  value: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 27,
    fontWeight: "700",
    letterSpacing: -0.8,
    marginTop: 8,
  },
  progressTrack: {
    height: 6,
    marginTop: 12,
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 6,
  },
  foot: {
    fontSize: 10,
    fontWeight: "500",
    marginTop: 8,
  },
});
