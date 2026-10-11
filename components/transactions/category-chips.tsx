import React, { useMemo } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Category } from "@/types/expense";
import { useExpenses } from "@/lib/expense-store";
import { useTheme } from "@/lib/theme-store";
import { getCategoryStyle } from "@/constants/categories";

interface CategoryChipsProps {
  selected: "All" | Category;
  onSelect: (category: "All" | Category) => void;
  countMap?: Record<string, number>;
}

export function CategoryChips({ selected, onSelect, countMap }: CategoryChipsProps) {
  const { colors, dark } = useTheme();
  const { allCategories, customCategories } = useExpenses();

  const options: ("All" | Category)[] = useMemo(
    () => ["All", ...allCategories],
    [allCategories]
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chips}
    >
      {options.map((item) => {
        const isActive = selected === item;
        const isAll = item === "All";
        const catStyle = isAll
          ? { color: colors.primary, soft: colors.primarySoft }
          : getCategoryStyle(item, customCategories);
        const count = countMap ? countMap[item] : undefined;

        return (
          <Pressable
            key={item}
            onPress={() => {
              onSelect(item);
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: isActive
                  ? colors.primary
                  : dark
                  ? "rgba(255, 255, 255, 0.04)"
                  : "#FFFFFF",
                borderColor: isActive
                  ? colors.primary
                  : dark
                  ? "rgba(255, 255, 255, 0.08)"
                  : colors.border,
                shadowColor: isActive ? colors.primary : "#1A1D20",
                shadowOpacity: isActive ? 0.24 : 0.02,
                shadowRadius: isActive ? 8 : 4,
                elevation: isActive ? 3 : 1,
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.96 : 1 }],
              },
            ]}
          >
            {/* Small colored dot for categories when not active */}
            {!isActive && !isAll && (
              <View style={[styles.colorDot, { backgroundColor: catStyle.color }]} />
            )}

            <Text
              style={[
                styles.chipText,
                {
                  color: isActive ? "#FFFFFF" : colors.foreground,
                  fontWeight: isActive ? "700" : "500",
                },
              ]}
            >
              {item}
            </Text>

            {/* Optional count pill for All */}
            {isAll && count !== undefined && (
              <View
                style={[
                  styles.countPill,
                  {
                    backgroundColor: isActive
                      ? "rgba(255, 255, 255, 0.25)"
                      : dark
                      ? "rgba(255, 255, 255, 0.08)"
                      : colors.surfaceSubtle,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.countText,
                    { color: isActive ? "#FFFFFF" : colors.muted },
                  ]}
                >
                  {count}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chips: {
    gap: 8,
    paddingVertical: 2,
    paddingRight: 16,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    gap: 6,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  colorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chipText: {
    fontSize: 12.5,
  },
  countPill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 999,
  },
  countText: {
    fontSize: 10,
    fontWeight: "700",
  },
});
