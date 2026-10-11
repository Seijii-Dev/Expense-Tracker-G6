import React, { ReactNode, useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import lottie, { AnimationItem } from "lottie-web";

export interface AppLottieViewProps {
  source: any;
  autoPlay?: boolean;
  loop?: boolean;
  speed?: number;
  style?: StyleProp<ViewStyle>;
  onAnimationFinish?: (isCancelled: boolean) => void;
  fallback?: ReactNode;
  [key: string]: any;
}

export function AppLottieView({
  source,
  autoPlay = true,
  loop = true,
  speed = 1,
  style,
  onAnimationFinish,
  fallback,
}: AppLottieViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animInstance = useRef<AnimationItem | null>(null);
  const onAnimationFinishRef = useRef(onAnimationFinish);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [hasRenderError, setHasRenderError] = useState(false);

  onAnimationFinishRef.current = onAnimationFinish;

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

  useEffect(() => {
    if (reduceMotion && autoPlay) return;
    if (!containerRef.current) return;
    setHasRenderError(false);

    try {
      if (animInstance.current) {
        animInstance.current.destroy();
        animInstance.current = null;
      }

      const animData = typeof source === "object" ? source : null;
      const animPath = typeof source === "string" ? source : undefined;

      animInstance.current = lottie.loadAnimation({
        container: containerRef.current,
        renderer: "svg",
        loop: !reduceMotion && loop,
        autoplay: !reduceMotion && autoPlay,
        animationData: animData,
        path: animPath,
      });

      if (speed && speed !== 1) {
        animInstance.current.setSpeed(speed);
      }

      const handleComplete = () => {
        onAnimationFinishRef.current?.(false);
      };
      const handleFailure = () => {
        animInstance.current?.destroy();
        animInstance.current = null;
        setHasRenderError(true);
      };

      animInstance.current.addEventListener("complete", handleComplete);
      animInstance.current.addEventListener("data_failed", handleFailure);

      return () => {
        animInstance.current?.removeEventListener("complete", handleComplete);
        animInstance.current?.removeEventListener("data_failed", handleFailure);
        animInstance.current?.destroy();
        animInstance.current = null;
      };
    } catch (e) {
      console.warn("Failed to load Lottie animation on web:", e);
      setHasRenderError(true);
    }
  }, [source, autoPlay, loop, speed, reduceMotion]);

  const flatStyle = StyleSheet.flatten(style) || {};
  const width = flatStyle.width ?? 100;
  const height = flatStyle.height ?? 100;

  if (hasRenderError || (reduceMotion && autoPlay)) {
    return <View style={[styles.fallbackBox, style]}>{fallback}</View>;
  }

  return (
    <View style={[styles.container, style]} pointerEvents="none">
      <div
        ref={containerRef}
        style={{
          width: typeof width === "number" ? `${width}px` : (width as any),
          height: typeof height === "number" ? `${height}px` : (height as any),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  fallbackBox: {
    alignItems: "center",
    justifyContent: "center",
  },
});
