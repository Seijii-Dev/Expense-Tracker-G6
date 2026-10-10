import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { useTheme } from "@/lib/theme-store";
import { GlassSurface } from "@/components/ui/glass-surface";

export type MetricTone = "coral" | "blue" | "green" | "warning";

interface MetricCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone?: MetricTone;
  foot?: string;
  progress?: number;
  progressColor?: string;
  style?: StyleProp<ViewStyle>;
}

export function MetricCard({
  label,
  value,
  icon,
  tone = "coral",
  foot,
  progress,
  progressColor,
  style,
}: MetricCardProps) {
  const { colors, dark } = useTheme();

  const toneColor =
    tone === "blue"
      ? "#0EA5E9"
      : tone === "green"
      ? colors.success
      : tone === "warning"
      ? colors.warning
      : colors.primary;

  const fill =
    progressColor ??
    (progress !== undefined && progress >= 100
      ? colors.error
      : progress !== undefined && progress >= 80
      ? colors.warning
      : colors.success);

  return (
    <GlassSurface radius={20} style={style} contentStyle={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.labelRow}>
          <View style={[styles.toneDot, { backgroundColor: toneColor }]} />
          <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
        </View>
        <View
          style={[
            styles.iconWrap,
            {
              backgroundColor: dark ? `${toneColor}22` : `${toneColor}15`,
            },
          ]}
        >
          {icon}
        </View>
      </View>

      <Text
        style={[styles.value, { color: colors.foreground }]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>

      {progress !== undefined ? (
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressTrack,
              { backgroundColor: dark ? "rgba(255,255,255,0.08)" : colors.surfaceSubtle },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(100, Math.max(0, progress))}%`,
                  backgroundColor: fill,
                },
              ]}
            />
          </View>
        </View>
      ) : null}

      {foot ? (
        <View style={styles.footRow}>
          <Text style={[styles.foot, { color: colors.muted }]}>{foot}</Text>
        </View>
      ) : null}
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 114,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: "#1A1D20",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  toneDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  iconWrap: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  value: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginTop: 8,
  },
  progressContainer: {
    marginTop: 10,
  },
  progressTrack: {
    height: 5,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  footRow: {
    marginTop: 8,
  },
  foot: {
    fontSize: 11,
    fontWeight: "600",
  },
});
