import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface SplashScreenProps {
  isReady: boolean;
  onFinish?: () => void;
  dark?: boolean;
}

/**
 * High-fidelity branded application launch screen displaying the official
 * Ledgerly logo with smooth entrance, pulsing glow, and seamless exit transition.
 */
export function SplashScreen({ isReady, onFinish, dark = false }: SplashScreenProps) {
  const [visible, setVisible] = useState(true);

  // Animations
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.88)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;
  const exitOpacityAnim = useRef(new Animated.Value(1)).current;
  const exitScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Entrance animation (fade in & gentle scale up)
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Subtle ambient pulse loop
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.9,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.4,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    return () => {
      pulseLoop.stop();
    };
  }, []);

  // Handle exit once the application is ready
  useEffect(() => {
    if (!isReady) return;

    // Minimum display time ensures the user sees the logo smoothly without abrupt flashing
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(exitOpacityAnim, {
          toValue: 0,
          duration: 380,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(exitScaleAnim, {
          toValue: 1.05,
          duration: 380,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setVisible(false);
        onFinish?.();
      });
    }, 700);

    return () => clearTimeout(timer);
  }, [isReady]);

  if (!visible) return null;

  const bgColor = dark ? "#0A1714" : "#F7FAF8";
  const textColor = dark ? "#F2F7F5" : "#173129";
  const kickerColor = "#FF6554";
  const ringColor = dark ? "rgba(255, 101, 84, 0.25)" : "rgba(255, 101, 84, 0.18)";

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
        {/* Glowing Logo Wrap */}
        <View style={styles.logoOuter}>
          <Animated.View
            style={[
              styles.glowRing,
              {
                borderColor: ringColor,
                opacity: glowAnim,
                transform: [
                  {
                    scale: glowAnim.interpolate({
                      inputRange: [0.4, 0.9],
                      outputRange: [1, 1.08],
                    }),
                  },
                ],
              },
            ]}
          />
          <View
            style={[
              styles.logoCard,
              {
                backgroundColor: dark ? "#142621" : "#FFFFFF",
                borderColor: dark ? "rgba(255,255,255,0.08)" : "rgba(23, 49, 41, 0.08)",
              },
            ]}
          >
            <Image
              source={require("@/assets/images/icon.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Brand Name & Tagline */}
        <Text style={[styles.brandTitle, { color: textColor }]}>Ledgerly</Text>
        <Text style={[styles.brandKicker, { color: kickerColor }]}>
          SMART SPENDING & SAVINGS
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
  logoOuter: {
    width: 104,
    height: 104,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  glowRing: {
    position: "absolute",
    width: 104,
    height: 104,
    borderRadius: 34,
    borderWidth: 2,
  },
  logoCard: {
    width: 88,
    height: 88,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF6554",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 6,
    overflow: "hidden",
  },
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: 24,
  },
  brandTitle: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 32,
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
