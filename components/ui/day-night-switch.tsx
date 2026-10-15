import React from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface DayNightSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export function DayNightSwitch({ value, onValueChange, disabled = false }: DayNightSwitchProps) {
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
      <View style={[styles.track, { backgroundColor: value ? "#344054" : "#F2B544" }]}>
        <Ionicons
          name={value ? "moon" : "sunny"}
          size={12}
          color={value ? "#E7ECF5" : "#FFFFFF"}
          style={value ? styles.moonIcon : styles.sunIcon}
        />
        <View style={[styles.thumb, value && styles.thumbOn]} />
      </View>
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
  thumbOn: {
    left: 25,
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
