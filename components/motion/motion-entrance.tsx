import React from "react";
import { StyleProp, View, ViewStyle } from "react-native";

export interface MotionEntranceProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  translateY?: number;
  enableLayoutTransition?: boolean;
  direction?: "down" | "up" | "fade";
  style?: StyleProp<ViewStyle>;
}

/** Keeps the shared layout wrapper while rendering children without motion. */
export function MotionEntrance({ children, style }: MotionEntranceProps) {
  return <View style={style}>{children}</View>;
}
