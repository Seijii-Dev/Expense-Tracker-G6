import React, { useState } from "react";
import { Platform, Pressable, StyleSheet, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@/lib/theme-store";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onPressFilter?: () => void;
  hasActiveFilters?: boolean;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = "Search transactions, notes, or stores...",
  onPressFilter,
  hasActiveFilters,
}: SearchBarProps) {
  const { colors, dark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View
      style={[
        styles.search,
        {
          backgroundColor: colors.inputBg,
          borderColor: isFocused ? colors.primary : colors.border,
        },
      ]}
    >
      <Ionicons
        name="search-outline"
        size={20}
        color={isFocused ? colors.primary : colors.muted}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        placeholderTextColor={colors.subtle}
        style={[styles.searchInput, { color: colors.foreground }]}
      />
      {value.length > 0 && (
        <Pressable
          hitSlop={8}
          onPress={() => {
            onChangeText("");
          }}
          accessibilityRole="button"
          accessibilityLabel="Clear search input"
          style={{ marginRight: onPressFilter ? 6 : 0 }}
        >
          <Ionicons name="close-circle" size={18} color={colors.subtle} />
        </Pressable>
      )}

      {onPressFilter && (
        <Pressable
          hitSlop={8}
          onPress={() => {
            onPressFilter();
          }}
          accessibilityRole="button"
          accessibilityLabel="Filter transactions"
          style={[
            styles.filterBtn,
            {
              backgroundColor: hasActiveFilters
                ? colors.primarySoft
                : dark
                ? "rgba(255,255,255,0.06)"
                : colors.surfaceSubtle,
            },
          ]}
        >
          <Ionicons
            name="options-outline"
            size={17}
            color={hasActiveFilters ? colors.primary : colors.muted}
          />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: "500",
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
});
