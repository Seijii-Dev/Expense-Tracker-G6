import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme-store";

interface AccountRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  copy: string;
  onPress: () => void;
  last?: boolean;
}

export function AccountRow({ icon, title, copy, onPress, last = false }: AccountRowProps) {
  const { colors, dark } = useTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        !last && [styles.rowBorder, { borderBottomColor: colors.border }],
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <View
        style={[
          styles.rowIcon,
          {
            backgroundColor: dark ? `${colors.primary}20` : colors.primarySoft,
            borderColor: `${colors.primary}30`,
          },
        ]}
      >
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={styles.rowBody}>
        <Text style={[styles.rowTitle, { color: colors.foreground }]}>{title}</Text>
        <Text style={[styles.rowCopy, { color: colors.muted }]}>{copy}</Text>
      </View>
      <View
        style={[
          styles.arrowWrap,
          { backgroundColor: dark ? "rgba(255,255,255,0.04)" : colors.surfaceSubtle },
        ]}
      >
        <Ionicons name="chevron-forward" size={14} color={colors.muted} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 14,
  },
  rowBorder: {
    borderBottomWidth: 1,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  rowBody: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  rowCopy: {
    fontSize: 11,
    marginTop: 2,
  },
  arrowWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
});

