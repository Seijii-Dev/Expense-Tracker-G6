import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useTheme } from "@/lib/theme-store";

export const AmbientBackground = React.memo(function AmbientBackground() {
  const { dark, colors } = useTheme();
  const isWeb = Platform.OS === "web";

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

      {isWeb ? (
        /* Zero-overhead GPU-cached radial ambient aura on web — buttery smooth 60fps transitions */
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundImage: `radial-gradient(circle 380px at 85% -10%, ${colors.blobSage} 0%, transparent 70%),
                radial-gradient(circle 340px at 10% 35%, ${colors.blobCoral} 0%, transparent 70%),
                radial-gradient(circle 300px at 90% 80%, ${colors.blobSky} 0%, transparent 70%),
                radial-gradient(circle 280px at 20% 75%, ${colors.blobLilac} 0%, transparent 70%)`,
              opacity: dark ? 0.95 : 0.8,
            } as any,
          ]}
        />
      ) : (
        /* Atmospheric Luminous Aura on Native */
        <>
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
                opacity: dark ? 0.75 : 0.6,
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
                opacity: dark ? 0.7 : 0.55,
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
                opacity: dark ? 0.65 : 0.5,
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
                opacity: dark ? 0.6 : 0.45,
              },
            ]}
          />
        </>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  blob: {
    position: "absolute",
  },
});
