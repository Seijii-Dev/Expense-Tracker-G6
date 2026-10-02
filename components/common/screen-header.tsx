import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/lib/theme-store";

interface ScreenHeaderProps { kicker: string; title: string; subtitle?: string; rightAction?: React.ReactNode; }

export function ScreenHeader({ kicker, title, subtitle, rightAction }: ScreenHeaderProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.header}>
      <View style={styles.titleArea}>
        <View style={[styles.kickerPill, { backgroundColor: colors.primarySoft }]}>
          <View style={[styles.kickerDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.kicker, { color: colors.primary }]}>{kicker}</Text>
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>{title}<Text style={{ color: colors.primary }}>.</Text></Text>
        {subtitle ? <Text style={[styles.subtitle, { color: colors.muted }]}>{subtitle}</Text> : null}
      </View>
      {rightAction ? <View style={styles.rightAction}>{rightAction}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingTop: 8, marginBottom: 18 },
  titleArea: { flex: 1, paddingRight: 12 },
  kickerPill: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999 },
  kickerDot: { width: 5, height: 5, borderRadius: 3 },
  kicker: { fontSize: 9, fontWeight: "800", letterSpacing: 1.2 },
  title: { fontFamily: "Fraunces_700Bold", fontSize: 34, fontWeight: "700", letterSpacing: -1.3, marginTop: 10 },
  subtitle: { fontSize: 12, lineHeight: 18, marginTop: 5, maxWidth: 340 },
  rightAction: { alignItems: "center", justifyContent: "center", paddingTop: 8 },
});
