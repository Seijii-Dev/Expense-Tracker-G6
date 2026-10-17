import React from "react";
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppLottieView } from "@/components/ui/app-lottie-view";
import { useTheme } from "@/lib/theme-store";

interface SuccessOverlayProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  onDismiss: () => void;
  onAnimationFinish?: (isCancelled: boolean) => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Full-surface confirmation overlay used after a record is created, updated,
 * or deleted. Tapping anywhere (or the Lottie finish callback) dismisses it.
 */
export function SuccessOverlay({
  visible,
  title,
  subtitle = "Tap anywhere to continue",
  onDismiss,
  onAnimationFinish,
  style,
}: SuccessOverlayProps) {
  const { colors, dark } = useTheme();

  if (!visible) return null;

  return (
    <Pressable
      style={[styles.overlay, style]}
      onPress={onDismiss}
      accessibilityRole="button"
      accessibilityLabel="Dismiss confirmation"
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: dark ? colors.cardElevated : "#FFFFFF",
            borderColor: colors.border,
          },
        ]}
      >
        <AppLottieView
          source={require("@/assets/lottie/success-check.json")}
          style={styles.lottie}
          loop={false}
          autoPlay
          onAnimationFinish={onAnimationFinish}
          fallback={<Ionicons name="checkmark-circle" size={78} color={colors.primary} />}
        />
        <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: colors.muted }]}>{subtitle}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  card: {
    width: 220,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 10,
  },
  lottie: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 10,
    letterSpacing: -0.2,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
    textAlign: "center",
  },
});
