import React, { useEffect } from "react";
import { Platform, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export interface DayNightSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export function DayNightSwitch({ value, onValueChange, disabled = false }: DayNightSwitchProps) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    const nextValue = value ? 1 : 0;
    progress.value = reduceMotion
      ? nextValue
      : withTiming(nextValue, { duration: 180 });
  }, [progress, reduceMotion, value]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], ["#F2B544", "#344054"]),
  }));
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(progress.value, [0, 1], [0, 22]) }],
  }));

  return (
    <Pressable
      onPress={() => !disabled && onValueChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel="Toggle color appearance mode"
      disabled={disabled}
      hitSlop={6}
      style={({ pressed }) => [
        styles.pressable,
        Platform.OS === "web" ? ({ cursor: disabled ? "default" : "pointer" } as any) : null,
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.disabled : null,
      ]}
    >
      <Animated.View style={[styles.track, trackStyle]}>
        <Ionicons
          name={value ? "moon" : "sunny"}
          size={12}
          color={value ? "#E7ECF5" : "#FFFFFF"}
          style={value ? styles.moonIcon : styles.sunIcon}
        />
        <Animated.View style={[styles.thumb, thumbStyle]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    padding: 2,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
  track: {
    width: 50,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    overflow: "hidden",
  },
  thumb: {
    position: "absolute",
    left: 3,
    top: 3,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  sunIcon: {
    position: "absolute",
    right: 4,
  },
  moonIcon: {
    position: "absolute",
    left: 5,
  },
});
