import React, { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Platform,
  StyleProp,
  View,
  ViewStyle,
} from "react-native";
import { useReducedMotion } from "react-native-reanimated";

export interface MotionEntranceProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  translateY?: number;
  scale?: number;
  enableLayoutTransition?: boolean;
  direction?: "down" | "up" | "fade";
  style?: StyleProp<ViewStyle>;
}

export function MotionEntrance({
  children,
  delay = 0,
  duration = 260,
  translateY = 14,
  scale = 0.97,
  direction = "down",
  style,
}: MotionEntranceProps) {
  const isWeb = Platform.OS === "web";
  const animValue = useRef(new Animated.Value(0)).current;
  const systemReduceMotion = useReducedMotion();
  const [reduceMotion, setReduceMotion] = useState(Boolean(systemReduceMotion));
  const hasAnimated = useRef(false);

  useEffect(() => {
    let isMounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (isMounted && enabled) {
          setReduceMotion(true);
          animValue.setValue(1);
        }
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, [animValue]);

  useEffect(() => {
    if (reduceMotion) {
      animValue.setValue(1);
      hasAnimated.current = true;
      return;
    }

    if (hasAnimated.current) {
      // Keep rendered without restarting entrance on re-renders
      animValue.setValue(1);
      return;
    }

    const timer = setTimeout(() => {
      Animated.spring(animValue, {
        toValue: 1,
        damping: 22,
        stiffness: 280,
        mass: 0.6,
        useNativeDriver: true,
      }).start(() => {
        hasAnimated.current = true;
      });
    }, Math.max(0, delay));

    return () => {
      clearTimeout(timer);
    };
  }, [animValue, delay, duration, reduceMotion]);

  if (reduceMotion) {
    return <View style={style}>{children}</View>;
  }

  const opacity = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const effectiveTranslateY = direction === "fade" ? 0 : direction === "up" ? -translateY : translateY;

  const transformY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [effectiveTranslateY, 0],
  });

  const transformScale = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [scale, 1],
  });

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [
            { translateY: transformY },
            direction !== "fade" ? { scale: transformScale } : { scale: 1 },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

