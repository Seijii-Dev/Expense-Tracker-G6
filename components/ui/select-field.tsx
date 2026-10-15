import React from "react";
import { Platform, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme-store";

interface SelectFieldProps {
  /** Small uppercase label rendered above the field. */
  label?: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  onPress?: () => void;
  /** Shows a chevron affordance; keep disabled for purely informational fields. */
  expandable?: boolean;
  expanded?: boolean;
  iconColor?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

/**
 * Rounded, tappable "select" control (icon + value + chevron) used by the
 * transaction form and details screen for payment method and date pickers.
 */
export function SelectField({
  label,
  icon,
  value,
  onPress,
  expandable = true,
  expanded = false,
  iconColor,
  style,
  accessibilityLabel,
}: SelectFieldProps) {
  const { colors, dark } = useTheme();

  return (
    <View style={[styles.wrap, style]}>
      {label ? (
        <Text style={[styles.label, { color: colors.muted }]} numberOfLines={1}>
          {label}
        </Text>
      ) : null}

      <Pressable
        onPress={onPress}
        disabled={!onPress}
        accessibilityRole={onPress ? "button" : undefined}
        accessibilityLabel={accessibilityLabel ?? `${label ?? "Field"}: ${value}`}
        style={({ pressed }) => [
          styles.field,
          {
            backgroundColor: dark ? "rgba(255,255,255,0.05)" : colors.surfaceSubtle,
            borderColor: expanded ? colors.primary : colors.border,
          },
          pressed && onPress ? styles.pressed : null,
        ]}
      >
        <Ionicons name={icon} size={15} color={iconColor ?? colors.muted} />
        <Text style={[styles.value, { color: colors.foreground }]} numberOfLines={1}>
          {value}
        </Text>
        {expandable ? (
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={14}
            color={colors.muted}
          />
        ) : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 1.1,
    marginBottom: 7,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 46,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  value: {
    flex: 1,
    minWidth: 0,
    fontFamily: "DMSans_700Bold",
    fontSize: 13,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },
});
