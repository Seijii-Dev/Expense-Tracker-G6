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
  placeholder = "Search transactions...",
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
          backgroundColor: dark ? "rgba(255,255,255,0.05)" : colors.surface,
          borderColor: isFocused ? "#10B981" : colors.border,
        },
        isFocused && styles.searchFocused,
      ]}
    >
      <Ionicons
        name="search"
        size={18}
        color={isFocused ? "#10B981" : colors.subtle}
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
            } catch {
              // Non-fatal
            }
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
            } catch {
              // Non-fatal
            }
            onPressFilter();
          }}
          accessibilityRole="button"
          accessibilityLabel="Filter transactions"
          style={[
            styles.filterBtn,
            hasActiveFilters && { backgroundColor: dark ? "rgba(16, 185, 129, 0.2)" : "#E6F9F2" },
          ]}
        >
          <Ionicons
            name="funnel-outline"
            size={16}
            color={hasActiveFilters ? "#10B981" : colors.muted}
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
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  searchFocused: {
    shadowColor: "#FF6554",
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
  },
  filterBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
});

