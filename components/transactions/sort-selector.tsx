import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@/lib/theme-store";
import { SortOption } from "@/hooks/useFilteredExpenses";

const SORT_OPTIONS: readonly {
  key: SortOption;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: "newest", label: "Newest", icon: "time-outline" },
  { key: "oldest", label: "Oldest", icon: "hourglass-outline" },
  { key: "highest", label: "Highest ₱", icon: "trending-up-outline" },
  { key: "lowest", label: "Lowest ₱", icon: "trending-down-outline" },
] as const;

interface SortSelectorProps {
  selected: SortOption;
  onSelect: (option: SortOption) => void;
}

export function SortSelector({ selected, onSelect }: SortSelectorProps) {
  const { colors, dark } = useTheme();

  return (
    <View style={styles.sortRow}>
      <Text style={[styles.filterLabel, { color: colors.muted }]}>SORT:</Text>
      <View style={styles.chipsWrap}>
        {SORT_OPTIONS.map((opt) => {
          const isActive = selected === opt.key;
          return (
            <Pressable
              key={opt.key}
              onPress={() => {
                onSelect(opt.key);
              }}
              style={({ pressed }) => [
                styles.sortChip,
                {
                  borderColor: isActive ? colors.primary : colors.border,
                  backgroundColor: isActive
                    ? dark
                      ? "rgba(232, 74, 63, 0.18)"
                      : colors.primarySoft
                    : dark
                    ? "rgba(255,255,255,0.04)"
                    : "#FFFFFF",
                },
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name={opt.icon}
                size={13}
                color={isActive ? colors.primary : colors.muted}
              />
              <Text
                style={[
                  styles.sortChipText,
                  {
                    color: isActive ? colors.primary : colors.muted,
                    fontWeight: isActive ? "700" : "500",
                  },
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sortRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 0.9,
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    flex: 1,
  },
  sortChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    height: 32,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  sortChipText: {
    fontSize: 11,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
});
