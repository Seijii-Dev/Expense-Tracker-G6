import React from "react";
import {
  Platform,
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
} from "react-native";

export interface PressableScaleProps extends Omit<PressableProps, "style"> {
  children: React.ReactNode;
  activeScale?: number;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

/** Preserves the pressable API without applying a scale animation. */
export function PressableScale({
  children,
  activeScale: _activeScale,
  style,
  containerStyle,
  ...rest
}: PressableScaleProps) {
  void _activeScale;

  return (
    <Pressable
      style={[
        style,
        containerStyle,
        Platform.OS === "web" ? ({ cursor: rest.disabled ? "default" : "pointer" } as any) : null,
      ]}
      {...rest}
    >
      {children}
    </Pressable>
  );
}
