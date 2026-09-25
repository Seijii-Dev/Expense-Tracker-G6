import React from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import * as Haptics from "expo-haptics";
import { Category } from "@/types/expense";
import { CATEGORIES } from "@/constants/categories";
import { useTheme } from "@/lib/theme-store";

interface CategoryChipsProps {
  selected: "All" | Category;
  onSelect: (category: "All" | Category) => void;
}

const ALL_CATEGORIES: ("All" | Category)[] = ["All", ...CATEGORIES];

export function CategoryChips({ selected, onSelect }: CategoryChipsProps) {
  const { colors } = useTheme();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
      {ALL_CATEGORIES.map((item) => {
        const isActive = selected === item;
        return (
          <Pressable
            key={item}
            onPress={() => {
              Haptics.selectionAsync();
              onSelect(item);
            }}
            style={[
              styles.chip,
              { borderColor: colors.border, backgroundColor: colors.surface },
              isActive && styles.chipActive,
            ]}
          >
            <Text
              style={[
                styles.chipText,
                { color: colors.muted },
                isActive && styles.chipTextActive,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chips: {
    gap: 8,
    paddingBottom: 6,
  },
  chip: {
    height: 32,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
  },
  chipActive: {
    borderColor: "#F2B8B0",
    backgroundColor: "#FFF0ED",
  },
  chipText: {
    fontSize: 11,
    fontWeight: "500",
  },
  chipTextActive: {
    color: "#EB6F61",
    fontWeight: "700",
  },
});
