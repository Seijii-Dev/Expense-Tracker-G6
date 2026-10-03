import React, { useMemo } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { Category } from "@/types/expense";
import { useExpenses } from "@/lib/expense-store";
import { useTheme } from "@/lib/theme-store";
import { getCategoryIconName, getCategoryStyle } from "@/constants/categories";

interface CategoryChipsProps {
  selected: "All" | Category;
  onSelect: (category: "All" | Category) => void;
}

export function CategoryChips({ selected, onSelect }: CategoryChipsProps) {
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
        const iconName = isAll
          ? "layers-outline"
          : getCategoryIconName(item, customCategories);

        return (
          <Pressable
            key={item}
            onPress={() => {
              try {
                Haptics.selectionAsync();
              } catch {
                // Non-fatal
              }
              onSelect(item);
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: isActive
                  ? dark
                    ? `${catStyle.color}22`
                    : catStyle.soft
                  : colors.surface,
                borderColor: isActive ? catStyle.color : colors.border,
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.96 : 1 }],
              },
            ]}
          >
            <View
              style={[
                styles.iconWrap,
                {
                  backgroundColor: isActive
                    ? catStyle.color
                    : dark
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(0,0,0,0.04)",
                },
              ]}
            >
              <Ionicons
                name={iconName}
                size={12}
                color={isActive ? "#FFFFFF" : colors.muted}
              />
            </View>
            <Text
              style={[
                styles.chipText,
                {
                  color: isActive
                    ? dark
                      ? "#FFFFFF"
                      : catStyle.color
                    : colors.muted,
                  fontWeight: isActive ? "700" : "500",
                },
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
    paddingVertical: 4,
    paddingRight: 16,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
    gap: 6,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  iconWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: {
    fontSize: 12,
  },
});

