import React from "react";
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/lib/theme-store";

interface WelcomeHeroProps {
  onSignIn: () => void;
  onRegister: () => void;
}

export function WelcomeHero({ onSignIn, onRegister }: WelcomeHeroProps) {
  const { colors, dark } = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Ambient background glow */}
      <View style={[styles.heroGlow, { backgroundColor: dark ? "#1E3B30" : "#E2EFE7" }]} />
      <View style={[styles.heroGlowSecondary, { backgroundColor: dark ? "#2B2220" : "#FCEEEA" }]} />

      <ScrollView
        contentContainerStyle={styles.welcomeScroll}
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
              { backgroundColor: colors.surface, borderColor: colors.border },
              pressed && styles.pressed,
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              onSignIn();
            }}
          >
            <Text style={[styles.navSignInText, { color: colors.foreground }]}>Sign In</Text>
          </Pressable>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>
            Master your money.{"\n"}
            <Text style={styles.titleGradient}>Grow every peso</Text>
            <Text style={[styles.dot, { color: colors.primary }]}>.</Text>
          </Text>

          {/* Display Logo Hero Card */}
          <View style={[styles.heroDisplayCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.displayLogoWrapper}>
              <Image source={require("@/assets/images/icon.png")} style={styles.heroLargeLogo} />
              <View style={styles.livePulseDot} />
            </View>
          </View>

          {/* Primary Calls To Action */}
          <View style={styles.ctaGroup}>
            <Pressable
              style={({ pressed }) => [
                styles.primaryCta,
                { backgroundColor: colors.primary },
                pressed && styles.pressed,
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                onRegister();
              }}
            >
              <Text style={styles.primaryCtaText}>Start Tracking Free</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.secondaryCta,
                { backgroundColor: colors.surface, borderColor: colors.border },
                pressed && styles.pressed,
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                onSignIn();
              }}
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
  heroGlow: {
    position: "absolute",
    width: 380,
    height: 380,
    top: -120,
    right: -100,
    borderRadius: 190,
  },
  heroGlowSecondary: {
    position: "absolute",
    width: 280,
    height: 280,
    top: 250,
    left: -100,
    borderRadius: 140,
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
    marginBottom: 26,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brandLogo: {
    width: 36,
    height: 36,
    borderRadius: 11,
  },
  brandTitle: {
    fontFamily: "Fraunces_700Bold",
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
    borderRadius: 10,
    borderWidth: 1,
  },
  navSignInText: {
    fontSize: 12,
    fontWeight: "700",
  },
  heroSection: {
    alignItems: "center",
    marginTop: 8,
  },
  heroTitle: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 38,
    fontWeight: "700",
    letterSpacing: -1.6,
    lineHeight: 44,
    textAlign: "center",
  },
  titleGradient: {
    color: "#5A9E7E",
  },
  dot: {
    fontWeight: "700",
  },
  heroDisplayCard: {
    width: "100%",
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    marginTop: 26,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  displayLogoWrapper: {
    position: "relative",
  },
  heroLargeLogo: {
    width: 105,
    height: 105,
    borderRadius: 28,
  },
  livePulseDot: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#5A9E7E",
    borderWidth: 2.5,
    borderColor: "#FFFFFF",
  },
  ctaGroup: {
    width: "100%",
    gap: 12,
    marginTop: 24,
  },
  primaryCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: 14,
    shadowColor: "#EB6F61",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  primaryCtaText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  secondaryCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
  },
  secondaryCtaText: {
    fontSize: 13,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
