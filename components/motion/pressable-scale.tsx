import React from "react";
import {
  GestureResponderEvent,
  Platform,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface PressableScaleProps extends Omit<PressableProps, "style"> {
  children: React.ReactNode;
  activeScale?: number;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

export function PressableScale({
  children,
  activeScale = 0.96,
  style,
  containerStyle,
  onPressIn,
  onPressOut,
  disabled,
  ...rest
}: PressableScaleProps) {
  const scale = useSharedValue(1);
  const reduceMotion = useReducedMotion();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (event: GestureResponderEvent) => {
    if (disabled) return;
    if (!reduceMotion) {
      scale.value = withSpring(activeScale, {
        damping: 20,
        stiffness: 280,
        mass: 0.65,
      });
    }

    onPressIn?.(event);
  };

  const handlePressOut = (event: GestureResponderEvent) => {
    if (disabled) return;
    if (!reduceMotion) {
      scale.value = withSpring(1, {
        damping: 18,
        stiffness: 200,
        mass: 0.7,
      });
    }

    onPressOut?.(event);
  };

  return (
    <AnimatedPressable
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        style,
        containerStyle,
        Platform.OS === "web" ? ({ cursor: disabled ? "default" : "pointer" } as any) : {},
        !reduceMotion ? animatedStyle : null,
      ]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
