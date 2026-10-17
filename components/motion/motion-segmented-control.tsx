import React, { useEffect, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

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

interface LayoutItem {
  x: number;
  width: number;
}

/** Moves one selected pill between the available options. */
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
  const reduceMotion = useReducedMotion();

  const [layouts, setLayouts] = useState<Record<string, LayoutItem>>({});
  const isInitialRender = useRef(true);

  const pillX = useSharedValue(0);
  const pillWidth = useSharedValue(0);
  const pillOpacity = useSharedValue(0);

  const activeColor = activePillColor || colors.primary;
  const inactiveColor = inactiveTextColor || colors.muted;

  const handleItemLayout = (id: string, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    setLayouts((prev) => {
      if (prev[id]?.x === x && prev[id]?.width === width) return prev;
      return {
        ...prev,
        [id]: { x, width },
      };
    });
  };

  useEffect(() => {
    // Short, damped movement keeps the selected option easy to follow.
    const springConfig = {
      damping: 24,
      stiffness: 240,
      mass: 0.65,
    };

    const currentLayout = layouts[selectedId];
    if (!selectedId || !currentLayout) {
      pillOpacity.value = withSpring(0, springConfig);
      return;
    }

    if (reduceMotion || isInitialRender.current) {
      pillX.value = currentLayout.x;
      pillWidth.value = currentLayout.width;
      pillOpacity.value = 1;
      isInitialRender.current = false;
      return;
    }

    pillX.value = withSpring(currentLayout.x, springConfig);
    pillWidth.value = withSpring(currentLayout.width, springConfig);
    pillOpacity.value = withSpring(1, springConfig);
  }, [selectedId, layouts, reduceMotion]);

  const animatedPillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillX.value }],
    width: pillWidth.value,
    opacity: pillOpacity.value,
  }));

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: dark ? "rgba(255,255,255,0.06)" : colors.surfaceSubtle,
        },
        style,
      ]}
    >
      {/* Shared Layout Active Indicator Pill */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.activeIndicator,
          {
            backgroundColor: activeColor,
            borderRadius: pillRadius,
            shadowColor: activeColor,
          },
          animatedPillStyle,
        ]}
      />

      {/* Tabs */}
      {options.map((opt) => {
        const isActive = opt.id === selectedId;

        return (
          <Pressable
            key={opt.id}
            onLayout={(e) => handleItemLayout(opt.id, e)}
            onPress={() => onSelect(opt.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`${opt.label} filter option`}
            style={({ pressed }) => [
              styles.tab,
              pressed && styles.pressedTab,
              Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {},
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
    position: "relative",
    overflow: "hidden",
  },
  activeIndicator: {
    position: "absolute",
    top: 3,
    bottom: 3,
    left: 0,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.28,
    shadowRadius: 5,
    elevation: 2,
    zIndex: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
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
