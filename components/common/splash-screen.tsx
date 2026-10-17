import React, { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import { motionDuration, nativeMotionEasing } from "@/constants/motion";

interface SplashScreenProps {
  isReady: boolean;
  onFinish?: () => void;
  dark?: boolean;
}

/**
 * Branded application launch screen with short entrance and exit transitions.
 */
export function SplashScreen({ isReady, onFinish, dark = false }: SplashScreenProps) {
  const [visible, setVisible] = useState(true);
  const systemReduceMotion = useReducedMotion();
  const [reduceMotion, setReduceMotion] = useState(systemReduceMotion);

  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  // Animations
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.94)).current;
  const exitOpacityAnim = useRef(new Animated.Value(1)).current;
  const exitScaleAnim = useRef(new Animated.Value(1)).current;
  const onFinishRef = useRef(onFinish);

  onFinishRef.current = onFinish;

  useEffect(() => {
    let isMounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (isMounted) setReduceMotion(enabled);
      })
      .catch(() => undefined);

    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      (enabled) => setReduceMotion(enabled)
    );

    return () => {
      isMounted = false;
      subscription?.remove?.();
    };
  }, []);

  // Guarantee minimum visible display duration so users see the branded intro
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 1100);

    return () => clearTimeout(timer);
  }, []);

  // Entrance animation starts on mount
  useEffect(() => {
    if (reduceMotion) {
      opacityAnim.setValue(1);
      scaleAnim.setValue(1);
      return;
    }

    // Fade in and gently scale up.
    const entrance = Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: motionDuration.splashIn,
        easing: nativeMotionEasing.enter,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 56,
        useNativeDriver: true,
      }),
    ]);
    entrance.start();

    return () => {
      entrance.stop();
    };
  }, [opacityAnim, reduceMotion, scaleAnim]);

  // Handle exit once both the application is ready and minimum display time elapsed
  useEffect(() => {
    if (!isReady || !minTimeElapsed) return;

    if (reduceMotion) {
      setVisible(false);
      onFinishRef.current?.();
      return;
    }

    const exitAnimation = Animated.parallel([
      Animated.timing(exitOpacityAnim, {
        toValue: 0,
        duration: motionDuration.splashOut,
        easing: nativeMotionEasing.exit,
        useNativeDriver: true,
      }),
      Animated.timing(exitScaleAnim, {
        toValue: 1.02,
        duration: motionDuration.splashOut,
        easing: nativeMotionEasing.exit,
        useNativeDriver: true,
      }),
    ]);

    exitAnimation.start(() => {
      setVisible(false);
      onFinishRef.current?.();
    });

    return () => {
      exitAnimation.stop();
    };
  }, [exitOpacityAnim, exitScaleAnim, isReady, minTimeElapsed, reduceMotion]);

  if (!visible) return null;

  const bgColor = dark ? "#0A1714" : "#F7FAF8";
  const textColor = dark ? "#F2F7F5" : "#173129";
  const kickerColor = "#FF6554";

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: bgColor,
          opacity: exitOpacityAnim,
          transform: [{ scale: exitScaleAnim }],
        },
      ]}
      pointerEvents={isReady ? "none" : "auto"}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Brand Name & Tagline */}
        <Text style={[styles.brandTitle, { color: textColor }]}>Ledgerly</Text>
        <Text style={[styles.brandKicker, { color: kickerColor }]}>
          EXPENSE TRACKER
        </Text>

        {/* Minimalist Loading Dots */}
        <View style={styles.loaderWrap}>
          <View style={[styles.loaderDot, { backgroundColor: kickerColor }]} />
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99999,
    justifyContent: "center",
    alignItems: "center",
    elevation: 999,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -0.8,
    marginBottom: 6,
  },
  brandKicker: {
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  loaderWrap: {
    marginTop: 28,
    height: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  loaderDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.75,
  },
});

