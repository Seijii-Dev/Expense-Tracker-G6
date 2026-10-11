import React, { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Platform,
  StyleProp,
  ViewStyle,
} from "react-native";
import { useReducedMotion } from "react-native-reanimated";

interface MotionEntranceProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  translateY?: number;
  scale?: number;
  style?: StyleProp<ViewStyle>;
}

export function MotionEntrance({
  children,
  delay = 0,
  duration = 280,
  translateY = 14,
  scale = 0.98,
  style,
}: MotionEntranceProps) {
  const isWeb = Platform.OS === "web";
  const animValue = useRef(new Animated.Value(0)).current;
  const systemReduceMotion = useReducedMotion();
  const [reduceMotion, setReduceMotion] = useState(systemReduceMotion);

  useEffect(() => {
    let isMounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (isMounted) setReduceMotion(enabled);
      })
      .catch(() => undefined);
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      animValue.setValue(1);
      return;
    }

    let animation: Animated.CompositeAnimation | null = null;
    const timer = setTimeout(() => {
      if (isWeb) {
        animation = Animated.timing(animValue, {
          toValue: 1,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        });
      } else {
        animation = Animated.spring(animValue, {
          toValue: 1,
          damping: 22,
          stiffness: 220,
          mass: 0.8,
          useNativeDriver: true,
        });
      }
      animation.start();
    }, delay);

    return () => {
      clearTimeout(timer);
      animation?.stop();
    };
  }, [animValue, delay, duration, isWeb, reduceMotion]);

  if (reduceMotion) {
    return <Animated.View style={style}>{children}</Animated.View>;
  }

  const opacity = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const transformY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [translateY, 0],
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
          transform: [{ translateY: transformY }, { scale: transformScale }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
