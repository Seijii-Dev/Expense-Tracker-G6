import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@/lib/theme-store";

export function AmbientBackground() {
  const { dark, colors } = useTheme();

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {/* Base Foundation Gradient */}
      <LinearGradient
        colors={
          dark
            ? ["#060E14", "#0A161E", "#081016"]
            : ["#E4EDF3", "#DBE7E4", "#E5E1F0"]
        }
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Static Ambient Atmospheric Aura (Zero CPU/GPU overhead) */}
      <View
        style={[
          styles.blob,
          {
            width: 360,
            height: 360,
            borderRadius: 180,
            backgroundColor: colors.blobSky,
            top: -100,
            right: -80,
          },
        ]}
      />
      <View
        style={[
          styles.blob,
          {
            width: 300,
            height: 300,
            borderRadius: 150,
            backgroundColor: colors.blobCoral,
            top: 200,
            left: -120,
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
            backgroundColor: colors.blobSage,
            bottom: 60,
            right: -80,
          },
        ]}
      />
      <View
        style={[
          styles.blob,
          {
            width: 240,
            height: 240,
            borderRadius: 120,
            backgroundColor: colors.blobLilac,
            bottom: 220,
            left: 20,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: "absolute",
  },
});
