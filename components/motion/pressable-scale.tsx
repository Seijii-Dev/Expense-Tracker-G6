import React, { useRef } from "react";
import {
  Animated,
  GestureResponderEvent,
  Platform,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";
import * as Haptics from "expo-haptics";

export interface PressableScaleProps extends Omit<PressableProps, "style"> {
  children: React.ReactNode;
  activeScale?: number;
  hapticFeedback?: "light" | "medium" | "selection" | "none";
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

export function PressableScale({
  children,
  activeScale = 0.96,
  hapticFeedback = "none",
  style,
  containerStyle,
  onPressIn,
  onPressOut,
  disabled,
  ...rest
}: PressableScaleProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Split layout properties for the outer Pressable vs inner Animated.View
  const flatStyle = (StyleSheet.flatten(style) || {}) as ViewStyle;
  const {
    flex,
    flexGrow,
    flexShrink,
    flexBasis,
    alignSelf,
    margin,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    marginHorizontal,
    marginVertical,
    ...visualStyle
  } = flatStyle;

  const outerLayoutStyle: ViewStyle = {
    flex,
    flexGrow,
    flexShrink,
    flexBasis,
    alignSelf,
    margin,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    marginHorizontal,
    marginVertical,
  };

  const handlePressIn = (event: GestureResponderEvent) => {
    if (disabled) return;
    if (hapticFeedback !== "none") {
      try {
        if (hapticFeedback === "selection") {
          Haptics.selectionAsync();
        } else if (hapticFeedback === "light") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else if (hapticFeedback === "medium") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      } catch {
        // Haptics non-fatal
      }
    }

    Animated.spring(scaleAnim, {
      toValue: activeScale,
      damping: 18,
      stiffness: 320,
      mass: 0.6,
      useNativeDriver: true,
    }).start();

    onPressIn?.(event);
  };

  const handlePressOut = (event: GestureResponderEvent) => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      damping: 14,
      stiffness: 260,
      mass: 0.7,
      useNativeDriver: true,
    }).start();

    onPressOut?.(event);
  };

  return (
    <Pressable
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        outerLayoutStyle,
        containerStyle,
        Platform.OS === "web" ? ({ cursor: disabled ? "default" : "pointer" } as any) : {},
      ]}
      {...rest}
    >
      <Animated.View
        style={[
          visualStyle,
          flex !== undefined ? { width: "100%" } : null,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}
