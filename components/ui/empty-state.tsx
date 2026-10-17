import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme-store";
import { AppLottieView } from "@/components/ui/app-lottie-view";

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  lottieSource?: any;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon = "search-outline",
  lottieSource,
  title,
  description,
  action,
}: EmptyStateProps) {
  const { colors, dark } = useTheme();

  return (
    <View style={styles.container}>
      {lottieSource ? (
        <View style={styles.lottieWrap}>
          <AppLottieView
            source={lottieSource}
            style={styles.lottie}
            autoPlay
            loop
            fallback={<Ionicons name={icon} size={42} color={colors.primary} />}
          />
        </View>
      ) : (
        <View
          style={[
            styles.outerCircle,
            {
              backgroundColor: dark ? "rgba(255, 117, 101, 0.08)" : colors.primarySoft,
              borderColor: dark ? "rgba(255, 117, 101, 0.2)" : "rgba(255, 101, 84, 0.18)",
            },
          ]}
        >
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: dark ? "#111E1B" : "#FFFFFF",
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons name={icon} size={26} color={colors.primary} />
          </View>
        </View>
      )}

      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.muted }]}>{description}</Text>

      {action ? <View style={styles.actionWrap}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 36,
    paddingHorizontal: 20,
  },
  lottieWrap: {
    width: 96,
    height: 96,
    marginBottom: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  lottie: {
    width: 96,
    height: 96,
  },
  outerCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    maxWidth: 260,
    marginTop: 6,
  },
  actionWrap: {
    marginTop: 14,
  },
});

