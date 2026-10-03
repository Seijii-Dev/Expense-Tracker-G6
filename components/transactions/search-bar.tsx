import React, { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/lib/theme-store";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = "Search description, category, or amount…",
}: SearchBarProps) {
  const { colors, dark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View
      style={[
        styles.search,
        {
          backgroundColor: dark ? "rgba(255,255,255,0.05)" : colors.surface,
          borderColor: isFocused ? colors.primary : colors.border,
        },
        isFocused && styles.searchFocused,
      ]}
    >
      <Ionicons
        name="search"
        size={17}
        color={isFocused ? colors.primary : colors.subtle}
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
        >
          <Ionicons name="close-circle" size={18} color={colors.subtle} />
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
});

