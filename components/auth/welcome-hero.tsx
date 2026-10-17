import React from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@/lib/theme-store";
import { AmbientBackground } from "@/components/ui/ambient-background";

interface WelcomeHeroProps {
  onSignIn: () => void;
  onRegister: () => void;
}

export function WelcomeHero({ onSignIn, onRegister }: WelcomeHeroProps) {
  const { colors, dark } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const isSmallScreen = windowWidth < 360;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <AmbientBackground />

      <ScrollView
        contentContainerStyle={[
          styles.welcomeScroll,
          { paddingHorizontal: isSmallScreen ? 14 : 22 },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Top Brand Navbar */}
        <View style={styles.navBar}>
          <View style={styles.brandRow}>
            <Image source={require("@/assets/images/icon.png")} style={styles.brandLogo} />
            <View>
              <Text style={[styles.brandTitle, { color: colors.foreground }]}>Ledgerly</Text>
              <Text style={[styles.brandBadge, { color: colors.muted }]}>Smart Spending Tracker</Text>
            </View>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.navSignInBtn,
              {
                backgroundColor: dark ? "rgba(255,255,255,0.06)" : colors.surface,
                borderColor: colors.border,
              },
              pressed && styles.pressed,
            ]}
            onPress={() => {
              onSignIn();
            }}
            accessibilityRole="button"
          >
            <Text style={[styles.navSignInText, { color: colors.foreground }]}>Sign In</Text>
          </Pressable>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>
            Know where your money goes.{"\n"}
            <Text style={{ color: colors.primary }}>Plan what comes next</Text>
            <Text style={{ color: colors.accent }}>.</Text>
          </Text>

          {/* Primary Calls To Action */}
          <View style={styles.ctaGroup}>
            <Pressable
              style={({ pressed }) => [
                styles.primaryCta,
                { backgroundColor: colors.primary },
                pressed && styles.pressed,
              ]}
              onPress={() => {
                onRegister();
              }}
              accessibilityRole="button"
            >
              <Text style={styles.primaryCtaText}>Start Tracking Free</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.secondaryCta,
                {
                  backgroundColor: dark ? "rgba(255,255,255,0.04)" : colors.surface,
                  borderColor: colors.border,
                },
                pressed && styles.pressed,
              ]}
              onPress={() => {
                onSignIn();
              }}
              accessibilityRole="button"
            >
              <Ionicons name="log-in-outline" size={18} color={colors.foreground} />
              <Text style={[styles.secondaryCtaText, { color: colors.foreground }]}>Sign In to Account</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  welcomeScroll: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: Platform.OS === "ios" ? 56 : 42,
    paddingBottom: 40,
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brandLogo: {
    width: 36,
    height: 36,
    borderRadius: 12,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  brandBadge: {
    fontSize: 10,
    fontWeight: "600",
  },
  navSignInBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  navSignInText: {
    fontSize: 12,
    fontWeight: "700",
  },
  heroSection: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: "700",
    letterSpacing: -1.2,
    lineHeight: 42,
    textAlign: "center",
  },
  ctaGroup: {
    width: "100%",
    gap: 12,
    marginTop: 24,
  },
  primaryCta: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: 16,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  primaryCtaText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  secondaryCta: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  secondaryCtaText: {
    fontSize: 14,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
});

