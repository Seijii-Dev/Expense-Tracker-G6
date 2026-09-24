import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme-store";

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

export function EmptyState({
  icon = "search-outline",
  title,
  description,
}: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: colors.surfaceSubtle }]}>
        <Ionicons name={icon} size={28} color={colors.subtle} />
      </View>
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.muted }]}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 8,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  title: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  description: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    maxWidth: 260,
  },
});
