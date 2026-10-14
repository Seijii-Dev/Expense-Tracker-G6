import React, { useEffect } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

export interface DayNightSwitchProps {
  value: boolean; // true = dark mode (night), false = light mode (day)
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

// 4-pointed sparkle star SVG path
function StarIcon({ size = 12 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M 10 0 Q 10 10 20 10 Q 10 10 10 20 Q 10 10 0 10 Q 10 10 10 0 Z"
        fill="#FFFFFF"
      />
    </Svg>
  );
}

/**
 * Animated Day/Night Toggle Switch component inspired by RiccardoRapelli's jolly-chicken-91 on Uiverse.
 * Features an animated sliding sun/moon orb with craters, radiant sun rays, puffy daytime clouds,
 * and twinkling night stars.
 */
export function DayNightSwitch({
  value,
  onValueChange,
  disabled = false,
}: DayNightSwitchProps) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(value ? 1 : 0);
  const twinkle = useSharedValue(1);

  // Sync external state changes
  useEffect(() => {
    if (reduceMotion) {
      progress.value = value ? 1 : 0;
      return;
    }
    progress.value = withTiming(value ? 1 : 0, {
      duration: 380,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [progress, reduceMotion, value]);

  // Subtle star twinkling loop
  useEffect(() => {
    if (reduceMotion) return;
    twinkle.value = withRepeat(
      withSequence(
        withTiming(0.65, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [reduceMotion, twinkle]);

  // Track Background Animation
  const trackAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      ["#2196F3", "#0B1322"]
    );
    return {
      backgroundColor,
    };
  });

  // Sun / Moon Orb translation, rotation, and background
  const orbAnimatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(progress.value, [0, 1], [0, 22]);
    const rotate = `${interpolate(progress.value, [0, 1], [0, 360])}deg`;
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      ["#FFD027", "#FFFFFF"]
    );
    return {
      transform: [{ translateX }, { rotate }],
      backgroundColor,
    };
  });

  // Sun Light Rays Opacity
  const lightRaysAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.45], [1, 0]),
  }));

  // Moon Craters Opacity
  const moonCratersAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.45, 1], [0, 1]),
  }));

  // Daytime Clouds (slide & fade out on night)
  const cloudsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.7], [1, 0]),
    transform: [
      {
        translateX: interpolate(progress.value, [0, 1], [0, 8]),
      },
    ],
  }));

  // Night Stars (slide down into view and twinkle)
  const starsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.3, 1], [0, 1]),
    transform: [
      {
        translateY: interpolate(progress.value, [0, 1], [-22, 0]),
      },
      {
        scale: twinkle.value,
      },
    ],
  }));

  const handlePress = (e?: any) => {
    e?.stopPropagation?.();
    if (disabled) return;
    onValueChange(!value);
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel="Toggle color appearance mode"
      disabled={disabled}
      style={({ pressed }) => [
        styles.pressableWrap,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Animated.View style={[styles.track, trackAnimatedStyle]}>
        {/* Night Stars Container */}
        <Animated.View
          pointerEvents="none"
          style={[styles.starsContainer, starsAnimatedStyle]}
        >
          {/* Star 1 */}
          <View style={[styles.starWrap, { top: 3, left: 4 }]}>
            <StarIcon size={10} />
          </View>
          {/* Star 2 */}
          <View style={[styles.starWrap, { top: 14, left: 3 }]}>
            <StarIcon size={5} />
          </View>
          {/* Star 3 */}
          <View style={[styles.starWrap, { top: 16, left: 10 }]}>
            <StarIcon size={6} />
          </View>
          {/* Star 4 */}
          <View style={[styles.starWrap, { top: 2, left: 15 }]}>
            <StarIcon size={8} />
          </View>
        </Animated.View>

        {/* Daytime Puffy Clouds Container */}
        <Animated.View
          pointerEvents="none"
          style={[styles.cloudsContainer, cloudsAnimatedStyle]}
        >
          {/* Darker base cloud puffs */}
          <View style={[styles.cloudCircle, styles.cloudDark1]} />
          <View style={[styles.cloudCircle, styles.cloudDark2]} />
          <View style={[styles.cloudCircle, styles.cloudDark3]} />

          {/* Lighter front cloud puffs */}
          <View style={[styles.cloudCircle, styles.cloudLight1]} />
          <View style={[styles.cloudCircle, styles.cloudLight2]} />
          <View style={[styles.cloudCircle, styles.cloudLight3]} />
        </Animated.View>

        {/* Sliding Sun / Moon Orb */}
        <Animated.View style={[styles.orb, orbAnimatedStyle]}>
          {/* Sun Light Rays (Rings expanding behind the sun) */}
          <Animated.View
            pointerEvents="none"
            style={[styles.lightRaysWrap, lightRaysAnimatedStyle]}
          >
            <View style={[styles.lightRayRing, styles.lightRay1]} />
            <View style={[styles.lightRayRing, styles.lightRay2]} />
            <View style={[styles.lightRayRing, styles.lightRay3]} />
          </Animated.View>

          {/* Moon Crater Dots (Visible in dark mode) */}
          <Animated.View
            pointerEvents="none"
            style={[styles.moonCratersWrap, moonCratersAnimatedStyle]}
          >
            <View style={[styles.moonDot, styles.moonDot1]} />
            <View style={[styles.moonDot, styles.moonDot2]} />
            <View style={[styles.moonDot, styles.moonDot3]} />
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressableWrap: {
    padding: 2,
    ...(Platform.OS === "web" ? ({ cursor: "pointer", userSelect: "none" } as any) : {}),
  },
  pressed: {
    transform: [{ scale: 0.96 }],
  },
  disabled: {
    opacity: 0.5,
  },
  track: {
    width: 50,
    height: 28,
    borderRadius: 14,
    position: "relative",
    overflow: "hidden",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  orb: {
    position: "absolute",
    left: 3,
    top: 3,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 3,
  },
  // Light rays
  lightRaysWrap: {
    position: "absolute",
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  lightRayRing: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  lightRay1: {
    width: 32,
    height: 32,
  },
  lightRay2: {
    width: 42,
    height: 42,
  },
  lightRay3: {
    width: 52,
    height: 52,
  },
  // Moon craters
  moonCratersWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  moonDot: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "#A0AEC0",
  },
  moonDot1: {
    left: 8.5,
    top: 2.5,
    width: 5,
    height: 5,
  },
  moonDot2: {
    left: 2,
    top: 8.5,
    width: 7,
    height: 7,
  },
  moonDot3: {
    left: 12.5,
    top: 14,
    width: 3,
    height: 3,
  },
  // Daytime Clouds
  cloudsContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 32,
  },
  cloudCircle: {
    position: "absolute",
    borderRadius: 999,
  },
  cloudDark1: {
    backgroundColor: "#CFD8DC",
    left: 8,
    top: 12,
    width: 18,
    height: 18,
  },
  cloudDark2: {
    backgroundColor: "#CFD8DC",
    left: 17,
    top: 7,
    width: 13,
    height: 13,
  },
  cloudDark3: {
    backgroundColor: "#CFD8DC",
    left: 1,
    top: 17,
    width: 14,
    height: 14,
  },
  cloudLight1: {
    backgroundColor: "#ECEFF1",
    left: 11,
    top: 14,
    width: 18,
    height: 18,
  },
  cloudLight2: {
    backgroundColor: "#ECEFF1",
    left: 19,
    top: 9,
    width: 13,
    height: 13,
  },
  cloudLight3: {
    backgroundColor: "#ECEFF1",
    left: 4,
    top: 18,
    width: 14,
    height: 14,
  },
  // Night Stars
  starsContainer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 28,
  },
  starWrap: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
});
