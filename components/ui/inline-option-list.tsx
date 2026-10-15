import React from "react";
import { Platform, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme-store";

export interface OptionItem<T extends string> {
  value: T;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
}

interface InlineOptionListProps<T extends string> {
  options: OptionItem<T>[];
  selected: T;
  onSelect: (value: T) => void;
  title?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Dropdown-style option list rendered inline (no modal) beneath its trigger.
 * Used for payment method selection in the transaction form and details screens.
 */
export function InlineOptionList<T extends string>({
  options,
  selected,
  onSelect,
  title,
  style,
}: InlineOptionListProps<T>) {
  const { colors, dark } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: dark ? "rgba(255,255,255,0.03)" : colors.surfaceSubtle,
          borderColor: colors.border,
        },
        style,
      ]}
      accessibilityRole="radiogroup"
    >
      {title ? (
        <Text style={[styles.title, { color: colors.muted }]}>{title}</Text>
      ) : null}

      {options.map((option) => {
        const active = option.value === selected;
        return (
          <Pressable
            key={option.value}
            onPress={() => onSelect(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            accessibilityLabel={option.label}
            style={({ pressed }) => [
              styles.option,
              {
                backgroundColor: active
                  ? dark
                    ? "rgba(232, 74, 63, 0.16)"
                    : colors.primarySoft
                  : "transparent",
              },
              pressed && styles.pressed,
            ]}
          >
            {option.icon ? (
              <Ionicons
                name={option.icon}
                size={16}
                color={active ? colors.primary : option.color ?? colors.muted}
              />
            ) : null}
            <Text
              style={[
                styles.optionText,
                {
                  color: active ? colors.primary : colors.foreground,
                  fontWeight: active ? "700" : "500",
                },
              ]}
            >
              {option.label}
            </Text>
            {active ? <Ionicons name="checkmark" size={16} color={colors.primary} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 6,
  },
  title: {
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 1.1,
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 6,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 42,
    paddingHorizontal: 10,
    borderRadius: 11,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  optionText: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
  },
  pressed: {
    opacity: 0.7,
  },
});
