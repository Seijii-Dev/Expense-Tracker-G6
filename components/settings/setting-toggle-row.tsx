import React, { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { spacing } from "@/constants/design-tokens";
import { useTheme } from "@/lib/theme-store";

interface SettingToggleRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  iconColor?: string;
  iconBackgroundColor?: string;
  last?: boolean;
}

/** One accessible, full-row toggle with a consistent animated control. */
export function SettingToggleRow({
  icon,
  title,
  description,
  value,
  onValueChange,
  iconColor,
  iconBackgroundColor,
  last = false,
}: SettingToggleRowProps) {
  const { colors, dark } = useTheme();
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(value ? 1 : 0);
  const resolvedIconColor = iconColor ?? colors.primary;
  const inactiveTrackColor = dark ? "#3A4049" : "#DCE1E8";

  useEffect(() => {
    const nextValue = value ? 1 : 0;
    progress.value = reduceMotion ? nextValue : withTiming(nextValue, { duration: 160 });
  }, [progress, reduceMotion, value]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [inactiveTrackColor, colors.primary]
    ),
  }));
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(progress.value, [0, 1], [0, 22]) }],
  }));

  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      accessibilityRole="switch"
      accessibilityLabel={title}
      accessibilityHint="Double tap to change this setting."
      accessibilityState={{ checked: value }}
      style={({ pressed }) => [
        styles.row,
        last ? styles.lastRow : { borderBottomColor: colors.border },
        pressed && styles.pressed,
        Platform.OS === "web" ? { cursor: "pointer" } : null,
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: iconBackgroundColor ?? colors.primarySoft },
        ]}
      >
        <Ionicons name={icon} size={19} color={resolvedIconColor} />
      </View>

      <View style={styles.copy}>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[styles.description, { color: colors.muted }]} numberOfLines={2}>
          {description}
        </Text>
      </View>

      <View style={styles.trackClip} pointerEvents="none">
        <Animated.View style={[styles.track, trackStyle]}>
          <Animated.View style={[styles.thumb, thumbStyle]} />
        </Animated.View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  pressed: {
    opacity: 0.76,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
  },
  trackClip: {
    width: 54,
    height: 32,
    justifyContent: "center",
  },
  track: {
    width: 50,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
  },
  thumb: {
    position: "absolute",
    left: 3,
    top: 3,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
  },
});
