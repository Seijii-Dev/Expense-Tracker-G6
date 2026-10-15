import React from "react";
import {
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

import { useTheme } from "@/lib/theme-store";

export interface SegmentOption<T extends string = string> {
  id: T;
  label: string;
  count?: number;
}

export interface MotionSegmentedControlProps<T extends string = string> {
  options: ReadonlyArray<SegmentOption<T>> | Array<SegmentOption<T>>;
  selectedId: T;
  onSelect: (id: T) => void;
  style?: StyleProp<ViewStyle>;
  activePillColor?: string;
  activeTextColor?: string;
  inactiveTextColor?: string;
  pillRadius?: number;
}

/** Keeps selected-tab state and interaction with a static active indicator. */
export function MotionSegmentedControl<T extends string = string>({
  options,
  selectedId,
  onSelect,
  style,
  activePillColor,
  activeTextColor = "#FFFFFF",
  inactiveTextColor,
  pillRadius = 10,
}: MotionSegmentedControlProps<T>) {
  const { colors, dark } = useTheme();
  const activeColor = activePillColor || colors.primary;
  const inactiveColor = inactiveTextColor || colors.muted;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: dark ? "rgba(255,255,255,0.06)" : colors.surfaceSubtle },
        style,
      ]}
    >
      {options.map((opt) => {
        const isActive = opt.id === selectedId;

        return (
          <Pressable
            key={opt.id}
            onPress={() => onSelect(opt.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`${opt.label} filter option`}
            style={({ pressed }) => [
              styles.tab,
              isActive && { backgroundColor: activeColor, borderRadius: pillRadius },
              pressed && styles.pressedTab,
              Platform.OS === "web" ? ({ cursor: "pointer" } as any) : null,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: isActive ? activeTextColor : inactiveColor,
                  fontWeight: isActive ? "700" : "500",
                },
              ]}
              numberOfLines={1}
            >
              {opt.label}
              {typeof opt.count === "number" ? ` (${opt.count})` : ""}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 3,
    borderRadius: 14,
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  pressedTab: {
    opacity: 0.75,
  },
  tabText: {
    fontFamily: "DMSans_700Bold",
    fontSize: 12.5,
    letterSpacing: -0.1,
  },
});
