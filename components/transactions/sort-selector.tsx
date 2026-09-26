import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/lib/theme-store";
import { SortOption } from "@/hooks/useFilteredExpenses";

const SORT_OPTIONS: readonly { key: SortOption; label: string }[] = [
  { key: "newest", label: "Newest" },
  { key: "oldest", label: "Oldest" },
  { key: "highest", label: "Highest ₱" },
  { key: "lowest", label: "Lowest ₱" },
] as const;

interface SortSelectorProps {
  selected: SortOption;
  onSelect: (option: SortOption) => void;
}

export function SortSelector({ selected, onSelect }: SortSelectorProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.sortRow}>
      <Text style={[styles.filterLabel, { color: colors.subtle }]}>SORT BY:</Text>
      {SORT_OPTIONS.map((opt) => {
        const isActive = selected === opt.key;
        return (
          <Pressable
            key={opt.key}
            onPress={() => {
              Haptics.selectionAsync();
              onSelect(opt.key);
            }}
            style={[
              styles.sortChip,
              { borderColor: colors.border, backgroundColor: colors.surface },
              isActive && {
                borderColor: colors.primary,
                backgroundColor: colors.primarySoft,
              },
            ]}
          >
            <Text
              style={[
                styles.sortChipText,
                { color: colors.muted },
                isActive && { color: colors.primary, fontWeight: "700" },
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  sortRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
    marginBottom: 10,
  },
  filterLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginRight: 4,
  },
  sortChip: {
    height: 28,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 7,
    borderWidth: 1,
  },
  sortChipText: {
    fontSize: 10,
    fontWeight: "600",
  },
});
