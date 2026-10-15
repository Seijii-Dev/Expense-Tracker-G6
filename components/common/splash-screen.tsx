import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

interface SplashScreenProps {
  isReady: boolean;
  onFinish?: () => void;
  dark?: boolean;
}

/** Keeps startup covered until fonts are ready and the branded minimum time passes. */
export function SplashScreen({ isReady, onFinish, dark = false }: SplashScreenProps) {
  const [visible, setVisible] = useState(true);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const onFinishRef = useRef(onFinish);
  const didFinishRef = useRef(false);

  onFinishRef.current = onFinish;

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), 1100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isReady || !minTimeElapsed || didFinishRef.current) return;

    didFinishRef.current = true;
    setVisible(false);
    onFinishRef.current?.();
  }, [isReady, minTimeElapsed]);

  if (!visible) return null;

  const bgColor = dark ? "#0A1714" : "#F7FAF8";
  const textColor = dark ? "#F2F7F5" : "#173129";
  const kickerColor = "#FF6554";

  return (
    <View
      style={[styles.container, { backgroundColor: bgColor }]}
      pointerEvents={isReady ? "none" : "auto"}
    >
      <View style={styles.content}>
        <Text style={[styles.brandTitle, { color: textColor }]}>Ledgerly</Text>
        <Text style={[styles.brandKicker, { color: kickerColor }]}>EXPENSE TRACKER</Text>
        <View style={styles.loaderWrap}>
          <View style={[styles.loaderDot, { backgroundColor: kickerColor }]} />
        </View>
      </View>
    </View>
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
  brandTitle: {
    fontFamily: "DMSans_700Bold",
    fontSize: 32,
    fontWeight: "700",
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
