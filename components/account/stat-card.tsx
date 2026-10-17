import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme-store";
import { NeumorphicSurface } from "@/components/ui/neumorphic-surface";

interface StatCardProps {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export function StatCard({ label, value, icon }: StatCardProps) {
  const { colors, dark } = useTheme();

  return (
    <NeumorphicSurface radius={18} style={styles.stat}>
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: dark ? "rgba(255,255,255,0.06)" : colors.surfaceSubtle,
          },
        ]}
      >
        <Ionicons name={icon} size={15} color={colors.primary} />
      </View>
      <Text
        style={[styles.statValue, { color: colors.foreground }]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: colors.muted }]} numberOfLines={1}>
        {label}
      </Text>
    </NeumorphicSurface>
  );
}

const styles = StyleSheet.create({
  stat: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  statValue: {
    fontSize: 16,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginTop: 2,
    textTransform: "uppercase",
  },
});

