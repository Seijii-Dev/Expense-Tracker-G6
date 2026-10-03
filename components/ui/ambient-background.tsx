import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@/lib/theme-store";

export const AmbientBackground = React.memo(function AmbientBackground() {
  const { dark, colors } = useTheme();

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {/* Base Foundation Gradient */}
      <LinearGradient
        colors={
          dark
            ? ["#060B0A", "#081210", "#050908"]
            : ["#F9FBFA", "#F2F6F4", "#EFF4F2"]
        }
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Atmospheric Luminous Aura (Zero-overhead ambient glow) */}
      <View
        style={[
          styles.blob,
          {
            width: 420,
            height: 420,
            borderRadius: 210,
            backgroundColor: colors.blobSage,
            top: -120,
            right: -100,
            opacity: dark ? 0.95 : 0.85,
          },
        ]}
      />
      <View
        style={[
          styles.blob,
          {
            width: 360,
            height: 360,
            borderRadius: 180,
            backgroundColor: colors.blobCoral,
            top: 220,
            left: -140,
            opacity: dark ? 0.9 : 0.75,
          },
        ]}
      />
      <View
        style={[
          styles.blob,
          {
            width: 320,
            height: 320,
            borderRadius: 160,
            backgroundColor: colors.blobSky,
            bottom: 80,
            right: -90,
            opacity: dark ? 0.85 : 0.7,
          },
        ]}
      />
      <View
        style={[
          styles.blob,
          {
            width: 280,
            height: 280,
            borderRadius: 140,
            backgroundColor: colors.blobLilac,
            bottom: 240,
            left: 20,
            opacity: dark ? 0.8 : 0.65,
          },
        ]}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  blob: {
    position: "absolute",
    filter: "blur(40px)", // for web support
  },
});
