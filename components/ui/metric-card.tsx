import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/lib/theme-store";
import { GlassSurface } from "@/components/ui/glass-surface";

export type MetricTone = "coral" | "blue" | "green" | "warning";
interface MetricCardProps { label: string; value: string; icon: React.ReactNode; tone?: MetricTone; foot?: string; progress?: number; progressColor?: string; }

export function MetricCard({ label, value, icon, tone = "coral", foot, progress, progressColor }: MetricCardProps) {
  const { colors, dark } = useTheme();
  const toneColor = tone === "blue" ? "#4D8AF0" : tone === "green" ? colors.success : tone === "warning" ? colors.warning : colors.primary;
  const fill = progressColor ?? (progress !== undefined && progress >= 100 ? colors.error : progress !== undefined && progress >= 80 ? colors.warning : colors.success);
  return (
    <GlassSurface radius={22} contentStyle={styles.card}>
      <View style={styles.topRow}>
        <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
        <View style={[styles.iconWrap, { backgroundColor: dark ? `${toneColor}24` : `${toneColor}18` }]}>{icon}</View>
      </View>
      <Text style={[styles.value, { color: colors.foreground }]}>{value}</Text>
      {progress !== undefined ? <View style={[styles.progressTrack, { backgroundColor: colors.surfaceSubtle }]}><View style={[styles.progressFill, { width: `${Math.min(100, Math.max(0, progress))}%`, backgroundColor: fill }]} /></View> : null}
      {foot ? <Text style={[styles.foot, { color: colors.subtle }]}>{foot}</Text> : null}
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  card: { minHeight: 118, padding: 16 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  label: { fontSize: 11, fontWeight: "700", letterSpacing: 0.1 },
  iconWrap: { width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 12 },
  value: { fontFamily: "Fraunces_700Bold", fontSize: 28, fontWeight: "700", letterSpacing: -0.8, marginTop: 10 },
  progressTrack: { height: 7, marginTop: 12, borderRadius: 999, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 999 },
  foot: { fontSize: 10, fontWeight: "600", marginTop: 8 },
});
