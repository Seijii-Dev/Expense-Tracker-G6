import { Easing as NativeEasing } from "react-native";
import { Easing as ReanimatedEasing } from "react-native-reanimated";

/** Shared motion language: quick feedback, calm transitions, and soft landings. */
export const motionDuration = {
  pressIn: 80,
  control: 190,
  standard: 220,
  section: 220,
  modal: 220,
  number: 180,
  splashIn: 360,
  splashOut: 220,
  layout: 200,
} as const;

export const motionEasing = {
  standard: ReanimatedEasing.bezier(0.2, 0, 0, 1),
  enter: ReanimatedEasing.bezier(0.16, 1, 0.3, 1),
  exit: ReanimatedEasing.bezier(0.4, 0, 1, 1),
} as const;

/** Equivalent curves for React Native's core Animated API. */
export const nativeMotionEasing = {
  standard: NativeEasing.bezier(0.2, 0, 0, 1),
  enter: NativeEasing.bezier(0.16, 1, 0.3, 1),
  exit: NativeEasing.bezier(0.4, 0, 1, 1),
} as const;

export const motionSpring = {
  press: { damping: 22, stiffness: 300, mass: 0.6 },
  control: { damping: 24, stiffness: 280, mass: 0.68 },
  chart: { damping: 22, stiffness: 220, mass: 0.78 },
  modal: { damping: 24, stiffness: 260, mass: 0.72 },
} as const;


