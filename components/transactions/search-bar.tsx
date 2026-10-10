import React, { useState } from "react";
import { Platform, Pressable, StyleSheet, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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
          backgroundColor: dark ? "rgba(255,255,255,0.04)" : "#FFFFFF",
          borderColor: isFocused ? colors.primary : colors.border,
        },
        isFocused && styles.searchFocused,
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
            try {
              Haptics.selectionAsync();
            } catch {}
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
            try {
              Haptics.selectionAsync();
            } catch {}
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
    borderWidth: 1.5,
    shadowColor: "#1A1D20",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  searchFocused: {
    shadowColor: "#E84A3F",
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: "500",
  },
  filterBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
});
