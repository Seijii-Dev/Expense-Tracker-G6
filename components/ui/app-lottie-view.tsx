import React, { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Platform,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import LottieView, { LottieViewProps } from "lottie-react-native";

export interface AppLottieViewProps extends Partial<LottieViewProps> {
  source: any;
  autoPlay?: boolean;
  loop?: boolean;
  speed?: number;
  style?: StyleProp<ViewStyle>;
  onAnimationFinish?: (isCancelled: boolean) => void;
}

export function AppLottieView({
  source,
  autoPlay = true,
  loop = true,
  speed = 1,
  style,
  onAnimationFinish,
  ...rest
}: AppLottieViewProps) {
  const lottieRef = useRef<LottieView>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [hasRenderError, setHasRenderError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (isMounted) setReduceMotion(enabled);
    });

    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      (enabled) => setReduceMotion(enabled)
    );

    return () => {
      isMounted = false;
      subscription?.remove?.();
    };
  }, []);

  if (hasRenderError) {
    return <View style={[styles.fallbackBox, style]} />;
  }

  return (
    <View style={[styles.container, style]} pointerEvents="none">
      <LottieView
        ref={lottieRef}
        source={source}
        autoPlay={!reduceMotion && autoPlay}
        loop={!reduceMotion && loop}
        speed={speed}
        style={styles.fill}
        resizeMode="contain"
        onAnimationFinish={onAnimationFinish}
        onAnimationFailure={() => setHasRenderError(true)}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  fill: {
    width: "100%",
    height: "100%",
  },
  fallbackBox: {
    opacity: 0.8,
  },
});
