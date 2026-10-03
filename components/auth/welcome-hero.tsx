import React from "react";
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/lib/theme-store";
import { AmbientBackground } from "@/components/ui/ambient-background";

interface WelcomeHeroProps {
  onSignIn: () => void;
  onRegister: () => void;
}

export function WelcomeHero({ onSignIn, onRegister }: WelcomeHeroProps) {
  const { colors, dark } = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <AmbientBackground />

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
              {
                backgroundColor: dark ? "rgba(255,255,255,0.06)" : colors.surface,
                borderColor: colors.border,
              },
              pressed && styles.pressed,
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              onSignIn();
            }}
            accessibilityRole="button"
          >
            <Text style={[styles.navSignInText, { color: colors.foreground }]}>Sign In</Text>
          </Pressable>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.badgeRow}>
            <View style={styles.pulseDot} />
            <Text style={[styles.badgeText, { color: colors.primary }]}>INTELLIGENT FINANCE FOR EVERY PESO</Text>
          </View>

          <Text style={[styles.heroTitle, { color: colors.foreground }]}>
            Master your money.{"\n"}
            <Text style={{ color: colors.primary }}>Grow every peso</Text>
            <Text style={{ color: colors.accent }}>.</Text>
          </Text>

          <Text style={[styles.heroSubtitle, { color: colors.muted }]}>
            Effortless expense logging, visual rhythm charts, and budget insights designed for peace of mind.
          </Text>

          {/* Interactive Mock Fintech Card */}
          <View
            style={[
              styles.mockCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                shadowColor: dark ? "#000000" : "#0A1F1C",
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: dark ? 0.45 : 0.08,
                shadowRadius: 20,
                elevation: 6,
              },
            ]}
          >
            <LinearGradient
              colors={
                dark
                  ? ["#132A26", "#0B1917", "#070D0C"]
                  : ["#0F3832", "#13423B", "#0A2823"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.mockInnerGradient}
            >
              {/* Specular line */}
              <LinearGradient
                colors={["rgba(255,255,255,0.3)", "rgba(255,255,255,0.02)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.specularLine}
              />

              <View style={styles.mockTopRow}>
                <View style={styles.mockBrand}>
                  <Image source={require("@/assets/images/icon.png")} style={styles.mockLogo} />
                  <Text style={styles.mockBrandName}>Ledgerly Card</Text>
                </View>
                <View style={styles.mockStatusChip}>
                  <View style={styles.livePulseDot} />
                  <Text style={styles.mockStatusText}>Active</Text>
                </View>
              </View>

              <View style={styles.mockBalanceWrap}>
                <Text style={styles.mockBalanceLabel}>OCTOBER CASHFLOW</Text>
                <Text style={styles.mockBalanceAmount}>₱24,850.00</Text>
              </View>

              <View style={styles.mockBottomRow}>
                <View style={styles.mockStatItem}>
                  <Text style={styles.mockStatLabel}>SAVED THIS MONTH</Text>
                  <Text style={styles.mockStatVal}>₱6,150.00 (78%)</Text>
                </View>
                <View style={styles.mockChipGrowth}>
                  <Ionicons name="trending-up" size={12} color="#10B981" />
                  <Text style={styles.mockGrowthText}>+14.2%</Text>
                </View>
              </View>
            </LinearGradient>
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
                Haptics.selectionAsync();
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
    borderRadius: 12,
    borderWidth: 1,
  },
  navSignInText: {
    fontSize: 12,
    fontWeight: "700",
  },
  heroSection: {
    alignItems: "center",
    marginTop: 6,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  heroTitle: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 38,
    fontWeight: "700",
    letterSpacing: -1.6,
    lineHeight: 44,
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 10,
    paddingHorizontal: 14,
  },
  mockCard: {
    width: "100%",
    borderRadius: 24,
    borderWidth: 1,
    marginTop: 24,
    overflow: "hidden",
  },
  mockInnerGradient: {
    padding: 20,
    position: "relative",
  },
  specularLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  mockTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  mockBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  mockLogo: {
    width: 24,
    height: 24,
    borderRadius: 7,
  },
  mockBrandName: {
    fontFamily: "Fraunces_700Bold",
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  mockStatusChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },
  mockStatusText: {
    color: "#A5D0BE",
    fontSize: 10,
    fontWeight: "700",
  },
  mockBalanceWrap: {
    marginVertical: 18,
  },
  mockBalanceLabel: {
    color: "#A5C9BB",
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 1.1,
  },
  mockBalanceAmount: {
    fontFamily: "Fraunces_700Bold",
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -1,
    marginTop: 4,
  },
  mockBottomRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    paddingTop: 14,
  },
  mockStatItem: {},
  mockStatLabel: {
    color: "#A5D0BE",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  mockStatVal: {
    fontFamily: "Fraunces_700Bold",
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
  },
  mockChipGrowth: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(16,185,129,0.18)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  mockGrowthText: {
    color: "#10B981",
    fontSize: 11,
    fontWeight: "800",
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
    borderRadius: 16,
    shadowColor: "#FF6554",
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  primaryCtaText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  secondaryCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
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

