import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme-store";

interface StatCardProps {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export function StatCard({ label, value, icon }: StatCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.stat, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Ionicons name={icon} size={16} color={colors.primary} />
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stat: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  statValue: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 6,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "500",
    marginTop: 2,
  },
});
