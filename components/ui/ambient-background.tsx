import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "@/lib/theme-store";

function DriftBlob({
  color,
  size,
  style,
  delay,
  travel,
}: {
  color: string;
  size: number;
  style: object;
  delay: number;
  travel: number;
}) {
  const t = useSharedValue(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      t.value = withRepeat(
        withTiming(1, { duration: 9000 + delay, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      );
    }, delay);
    return () => clearTimeout(timeout);
  }, [delay, t]);

  const animated = useAnimatedStyle(() => ({
    transform: [
      { translateY: t.value * travel },
      { translateX: t.value * (travel * 0.45) },
      { scale: 1 + t.value * 0.08 },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        style,
        animated,
      ]}
    />
  );
}

export function AmbientBackground() {
  const { dark, colors } = useTheme();

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={
          dark
            ? ["#08141C", "#0C1C22", "#101018"]
            : ["#E7F1F6", "#DCE8E4", "#E8E4F4"]
        }
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <DriftBlob color={colors.blobSky} size={340} delay={0} travel={28} style={{ top: -90, right: -80 }} />
      <DriftBlob color={colors.blobCoral} size={280} delay={400} travel={22} style={{ top: 180, left: -110 }} />
      <DriftBlob color={colors.blobSage} size={260} delay={800} travel={26} style={{ bottom: 80, right: -70 }} />
      <DriftBlob color={colors.blobLilac} size={220} delay={1200} travel={18} style={{ bottom: 240, left: 40 }} />
    </View>
  );
}
