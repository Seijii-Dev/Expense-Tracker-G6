import React, { useEffect, useRef, useState } from "react";
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
  [key: string]: any;
}

export function AppLottieView({
  source,
  autoPlay = true,
  loop = true,
  speed = 1,
  style,
  onAnimationFinish,
}: AppLottieViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animInstance = useRef<AnimationItem | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

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
    if (!containerRef.current) return;

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
        onAnimationFinish?.(false);
      };

      animInstance.current.addEventListener("complete", handleComplete);

      return () => {
        animInstance.current?.removeEventListener("complete", handleComplete);
        animInstance.current?.destroy();
        animInstance.current = null;
      };
    } catch (e) {
      console.warn("Failed to load Lottie animation on web:", e);
    }
  }, [source, autoPlay, loop, speed, reduceMotion, onAnimationFinish]);

  const flatStyle = StyleSheet.flatten(style) || {};
  const width = flatStyle.width ?? 100;
  const height = flatStyle.height ?? 100;

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
});
