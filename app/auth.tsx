import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/lib/auth-store";
import { useTheme } from "@/lib/theme-store";

export default function AuthScreen() {
  const { register, login } = useAuth();
  const { colors, dark } = useTheme();

  const [mode, setMode] = useState<"welcome" | "login" | "register">("welcome");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const submit = async (overrideMode?: "login" | "register") => {
    const activeMode = overrideMode || (mode === "welcome" ? "register" : mode);
    const cleanEmail = email.trim();
    const cleanName = name.trim();

    if (activeMode === "register") {
      if (!cleanName) {
        setErrorMessage("Please enter your name.");
        return;
      }
      if (!cleanEmail || !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
        setErrorMessage("Please enter a valid email address.");
        return;
      }
      if (password.length < 6) {
        setErrorMessage("Password must be at least 6 characters.");
        return;
      }
    } else {
      if (!cleanEmail) {
        setErrorMessage("Please enter your email address.");
        return;
      }
      if (!password) {
        setErrorMessage("Please enter your password.");
        return;
      }
    }

    setBusy(true);
    try {
      const result =
        activeMode === "register"
          ? await register(cleanName, cleanEmail, password)
          : await login(cleanEmail, password);

      if (!result.ok) {
        setErrorMessage(result.message || "Please check your details and try again.");
        return;
      }
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    } catch {
      setErrorMessage("We couldn’t complete your request. Please check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  // ==========================================
  // LANDING PAGE (WELCOME MODE)
  // ==========================================
  if (mode === "welcome") {
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
              <Image source={require("../assets/images/icon.png")} style={styles.brandLogo} />
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
                setMode("login");
              }}
            >
              <Text style={[styles.navSignInText, { color: colors.foreground }]}>Sign In</Text>
            </Pressable>
          </View>

          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.kickerBadge}>
              <Ionicons name="sparkles" size={13} color="#EB6F61" />
              <Text style={styles.kickerText}>REIMAGINE YOUR FINANCES</Text>
            </View>

            <Text style={[styles.heroTitle, { color: colors.foreground }]}>
              Master your money.{"\n"}
              <Text style={styles.titleGradient}>Grow every peso</Text>
              <Text style={styles.dot}>.</Text>
            </Text>

            <Text style={[styles.heroSubtitle, { color: colors.muted }]}>
              The calm, intelligent spending tracker and budget planner. Record expenses in seconds, unlock
              visual insights, and build real savings without the headache.
            </Text>

            {/* Display Logo Hero Card */}
            <View style={[styles.heroDisplayCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.displayLogoWrapper}>
                <Image source={require("../assets/images/icon.png")} style={styles.heroLargeLogo} />
                <View style={styles.livePulseDot} />
              </View>

              <View style={styles.heroStatsRow}>
                <View style={styles.heroStatItem}>
                  <Text style={[styles.heroStatValue, { color: colors.foreground }]}>+₱8,450</Text>
                  <Text style={[styles.heroStatLabel, { color: colors.muted }]}>Saved this month</Text>
                </View>
                <View style={[styles.heroStatDivider, { backgroundColor: colors.border }]} />
                <View style={styles.heroStatItem}>
                  <Text style={[styles.heroStatValue, { color: "#5A9E7E" }]}>24% Under</Text>
                  <Text style={[styles.heroStatLabel, { color: colors.muted }]}>Target budget</Text>
                </View>
              </View>

              {/* Floating feature pills */}
              <View style={styles.heroFeaturePills}>
                <View style={[styles.heroPill, { backgroundColor: dark ? "#1E2C26" : "#EDF8F1" }]}>
                  <Ionicons name="cloud-done-outline" size={13} color="#5A9E7E" />
                  <Text style={[styles.heroPillText, { color: "#5A9E7E" }]}>Real-Time Cloud Sync</Text>
                </View>
                <View style={[styles.heroPill, { backgroundColor: dark ? "#2D261E" : "#FFF7ED" }]}>
                  <Ionicons name="flash-outline" size={13} color="#D18B38" />
                  <Text style={[styles.heroPillText, { color: "#D18B38" }]}>Offline Ready</Text>
                </View>
              </View>
            </View>

            {/* Primary Calls To Action */}
            <View style={styles.ctaGroup}>
              <Pressable
                style={({ pressed }) => [styles.primaryCta, pressed && styles.pressed]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setMode("register");
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
                  setMode("login");
                }}
              >
                <Ionicons name="log-in-outline" size={18} color={colors.foreground} />
                <Text style={[styles.secondaryCtaText, { color: colors.foreground }]}>Sign In to Account</Text>
              </Pressable>
            </View>

            <Text style={[styles.guaranteeText, { color: colors.subtle }]}>
              ✓ 100% Free Forever • ✓ Instant Setup • ✓ No Credit Card Required
            </Text>
          </View>

          {/* Metric Highlights Strip */}
          <View style={[styles.proofStrip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ProofItem value="< 3s" label="Fast Log" colors={colors} />
            <View style={[styles.proofDivider, { backgroundColor: colors.border }]} />
            <ProofItem value="100%" label="Offline Cache" colors={colors} />
            <View style={[styles.proofDivider, { backgroundColor: colors.border }]} />
            <ProofItem value="8" label="Categories" colors={colors} />
            <View style={[styles.proofDivider, { backgroundColor: colors.border }]} />
            <ProofItem value="₱0" label="Free Forever" colors={colors} />
          </View>

          {/* Clear Feature Sections */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionKicker}>BUILT FOR SPEED & PEACE OF MIND</Text>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Everything you need to spend smartly
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.muted }]}>
              Designed from the ground up for simplicity, clarity, and daily reliability.
            </Text>

            <View style={styles.featureGrid}>
              <FeatureCard
                icon="flash-outline"
                iconColor="#EB6F61"
                iconBg={dark ? "#3A211E" : "#FFF0ED"}
                title="Lightning-Fast Logging"
                description="Record any purchase in under three seconds with smart category pills and payment presets."
                colors={colors}
              />
              <FeatureCard
                icon="notifications-outline"
                iconColor="#D18B38"
                iconBg={dark ? "#362C1C" : "#FFF8ED"}
                title="Proactive Budget Nudges"
                description="Set monthly spending targets and receive clear visual warnings before you cross your limit."
                colors={colors}
              />
              <FeatureCard
                icon="pie-chart-outline"
                iconColor="#4D8AF0"
                iconBg={dark ? "#1D283A" : "#EEF4FF"}
                title="Deep Spending Visuals"
                description="Understand your habits at a glance with interactive donut charts and category percentages."
                colors={colors}
              />
              <FeatureCard
                icon="shield-checkmark-outline"
                iconColor="#5A9E7E"
                iconBg={dark ? "#1B3127" : "#EDF8F1"}
                title="Secure Cloud & Offline"
                description="Your ledger syncs safely to the cloud while keeping an instant local cache on your device."
                colors={colors}
              />
            </View>
          </View>

          {/* Testimonial / Philosophy Card */}
          <View style={[styles.quoteCard, { backgroundColor: dark ? "#1E2B25" : "#EDF5F1", borderColor: colors.border }]}>
            <Ionicons name="chatbubble-ellipses-outline" size={24} color="#5A9E7E" />
            <Text style={[styles.quoteText, { color: colors.foreground }]}>
              “A calm, deliberate way to understand where your money goes. No complex spreadsheets, no confusing graphs.”
            </Text>
            <Text style={[styles.quoteAuthor, { color: colors.muted }]}>Ledgerly Philosophy</Text>
          </View>

          {/* Bottom Prominent Call to Action */}
          <View style={[styles.bottomCtaCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Image source={require("../assets/images/icon.png")} style={styles.bottomCtaLogo} />
            <Text style={[styles.bottomCtaTitle, { color: colors.foreground }]}>
              Ready to take charge of your financial story?
            </Text>
            <Text style={[styles.bottomCtaCopy, { color: colors.muted }]}>
              Join users tracking everyday spending with confidence and clarity.
            </Text>

            <Pressable
              style={({ pressed }) => [styles.primaryCta, styles.bottomBtn, pressed && styles.pressed]}
              onPress={() => {
                Haptics.selectionAsync();
                setMode("register");
              }}
            >
              <Text style={styles.primaryCtaText}>Create Free Account</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </Pressable>

            <Pressable
              style={styles.bottomSignInLink}
              onPress={() => {
                Haptics.selectionAsync();
                setMode("login");
              }}
            >
              <Text style={[styles.bottomSignInText, { color: colors.muted }]}>
                Already have an account? <Text style={{ color: "#EB6F61", fontWeight: "700" }}>Sign In</Text>
              </Text>
            </Pressable>
          </View>

          <Text style={[styles.footerText, { color: colors.subtle }]}>
            Ledgerly • Smart Spending & Savings Tracker v1.0.0
          </Text>
        </ScrollView>
      </View>
    );
  }

  // ==========================================
  // AUTH FORM (LOGIN / REGISTER MODE)
  // ==========================================
  const isRegister = mode === "register";

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.formScroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back Link */}
        <Pressable
          style={styles.backButton}
          onPress={() => {
            Haptics.selectionAsync();
            setMode("welcome");
          }}
        >
          <Ionicons name="arrow-back" size={18} color={colors.muted} />
          <Text style={[styles.backLinkText, { color: colors.muted }]}>Back to home</Text>
        </Pressable>

        {/* Brand Header */}
        <View style={styles.formHeader}>
          <Image source={require("../assets/images/icon.png")} style={styles.formLogo} />
          <Text style={[styles.formTitle, { color: colors.foreground }]}>
            {isRegister ? "Start your ledger" : "Welcome back"}
            <Text style={styles.dot}>.</Text>
          </Text>
          <Text style={[styles.formSubtitle, { color: colors.muted }]}>
            {isRegister
              ? "Create your account to sync your expenses and track savings."
              : "Sign in to access your cloud-synced expense records."}
          </Text>
        </View>

        {/* Segmented Mode Selector */}
        <View style={[styles.segmentContainer, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}>
          <Pressable
            style={[
              styles.segmentBtn,
              !isRegister && [styles.segmentBtnActive, { backgroundColor: colors.surface }],
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              setMode("login");
            }}
          >
            <Text
              style={[
                styles.segmentText,
                { color: !isRegister ? colors.foreground : colors.muted },
                !isRegister && styles.segmentTextActive,
              ]}
            >
              Sign In
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.segmentBtn,
              isRegister && [styles.segmentBtnActive, { backgroundColor: colors.surface }],
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              setMode("register");
            }}
          >
            <Text
              style={[
                styles.segmentText,
                { color: isRegister ? colors.foreground : colors.muted },
                isRegister && styles.segmentTextActive,
              ]}
            >
              Create Account
            </Text>
          </Pressable>
        </View>

        {/* Form Fields */}
        <View style={styles.formFields}>
          {isRegister && (
            <View>
              <Text style={[styles.fieldLabel, { color: colors.subtle }]}>FULL NAME</Text>
              <View style={[styles.fieldWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="person-outline" size={18} color={colors.muted} />
                <TextInput
                  placeholder="e.g. Maria Santos"
                  placeholderTextColor={colors.subtle}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  style={[styles.input, { color: colors.foreground }]}
                />
              </View>
            </View>
          )}

          <View>
            <Text style={[styles.fieldLabel, { color: colors.subtle }]}>EMAIL ADDRESS</Text>
            <View style={[styles.fieldWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="mail-outline" size={18} color={colors.muted} />
              <TextInput
                placeholder="you@example.com"
                placeholderTextColor={colors.subtle}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={[styles.input, { color: colors.foreground }]}
              />
            </View>
          </View>

          <View>
            <Text style={[styles.fieldLabel, { color: colors.subtle }]}>PASSWORD</Text>
            <View style={[styles.fieldWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.muted} />
              <TextInput
                placeholder={isRegister ? "At least 6 characters" : "Your password"}
                placeholderTextColor={colors.subtle}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                style={[styles.input, { color: colors.foreground }]}
              />
              <Pressable hitSlop={10} onPress={() => setShowPassword((v) => !v)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color={colors.muted}
                />
              </Pressable>
            </View>
          </View>
        </View>

        {isRegister && (
          <Text style={[styles.helperNote, { color: colors.subtle }]}>
            Protected with industry-standard hashing and secure token sessions.
          </Text>
        )}

        {/* Submit Button */}
        <Pressable
          disabled={busy}
          style={({ pressed }) => [
            styles.primaryCta,
            styles.formSubmitBtn,
            pressed && styles.pressed,
            busy && { opacity: 0.65 },
          ]}
          onPress={() => submit()}
        >
          <Text style={styles.primaryCtaText}>
            {busy ? "Please wait…" : isRegister ? "Create Free Account" : "Sign In"}
          </Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </Pressable>

        {/* Mode Switch text */}
        <Pressable
          style={styles.switchMode}
          onPress={() => {
            Haptics.selectionAsync();
            setMode(isRegister ? "login" : "register");
          }}
        >
          <Text style={[styles.switchText, { color: colors.muted }]}>
            {isRegister ? "Already have an account? " : "New to Ledgerly? "}
            <Text style={styles.switchAccent}>{isRegister ? "Sign in" : "Create one now"}</Text>
          </Text>
        </Pressable>

        {/* Trust Footnote */}
        <View style={styles.trustBadge}>
          <Ionicons name="shield-checkmark" size={16} color="#5A9E7E" />
          <Text style={[styles.trustText, { color: colors.subtle }]}>
            Private & Encrypted • Instant Offline Caching
          </Text>
        </View>
      </ScrollView>

      {/* Error Dialog Modal */}
      <Modal visible={Boolean(errorMessage)} transparent animationType="fade" onRequestClose={() => setErrorMessage(null)}>
        <View style={dialogStyles.backdrop}>
          <View style={[dialogStyles.card, { backgroundColor: colors.surface }]}>
            <View style={dialogStyles.icon}>
              <Ionicons name="alert-circle-outline" size={24} color="#EB6F61" />
            </View>
            <Text style={[dialogStyles.title, { color: colors.foreground }]}>
              {isRegister ? "Registration Notice" : "Sign In Notice"}
            </Text>
            <Text style={[dialogStyles.copy, { color: colors.muted }]}>{errorMessage}</Text>
            <Pressable style={dialogStyles.button} onPress={() => setErrorMessage(null)}>
              <Text style={dialogStyles.buttonText}>Got It</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

// ==========================================
// SUBCOMPONENTS
// ==========================================
function ProofItem({ value, label, colors }: { value: string; label: string; colors: any }) {
  return (
    <View style={styles.proofCol}>
      <Text style={[styles.proofValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.proofLabel, { color: colors.muted }]}>{label}</Text>
    </View>
  );
}

function FeatureCard({
  icon,
  iconColor,
  iconBg,
  title,
  description,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  colors: any;
}) {
  return (
    <View style={[styles.featureCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.featureIconWrap, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <Text style={[styles.featureTitle, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.featureCopy, { color: colors.muted }]}>{description}</Text>
    </View>
  );
}

// ==========================================
// STYLES
// ==========================================
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
  kickerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "#FFF0ED",
    marginBottom: 14,
  },
  kickerText: {
    color: "#EB6F61",
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
  titleGradient: {
    color: "#5A9E7E",
  },
  dot: {
    color: "#EB6F61",
  },
  heroSubtitle: {
    fontSize: 13,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 12,
    maxWidth: 340,
  },
  heroDisplayCard: {
    width: "100%",
    padding: 22,
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
    marginBottom: 16,
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
  heroStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
    paddingVertical: 10,
  },
  heroStatItem: {
    alignItems: "center",
  },
  heroStatValue: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 20,
    fontWeight: "700",
  },
  heroStatLabel: {
    fontSize: 10,
    fontWeight: "500",
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    height: 28,
  },
  heroFeaturePills: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },
  heroPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  heroPillText: {
    fontSize: 10,
    fontWeight: "700",
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
    backgroundColor: "#EB6F61",
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
  guaranteeText: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 14,
    textAlign: "center",
  },
  proofStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 30,
  },
  proofCol: {
    alignItems: "center",
    flex: 1,
  },
  proofValue: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 16,
    fontWeight: "700",
  },
  proofLabel: {
    fontSize: 9,
    fontWeight: "600",
    marginTop: 2,
  },
  proofDivider: {
    width: 1,
    height: 24,
  },
  featuresSection: {
    marginTop: 36,
  },
  sectionKicker: {
    color: "#EB6F61",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
    textAlign: "center",
  },
  sectionTitle: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.8,
    textAlign: "center",
    marginTop: 6,
  },
  sectionSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 20,
    maxWidth: 320,
    alignSelf: "center",
  },
  featureGrid: {
    gap: 12,
  },
  featureCard: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
  },
  featureIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  featureCopy: {
    fontSize: 12,
    lineHeight: 18,
  },
  quoteCard: {
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 28,
    gap: 10,
  },
  quoteText: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 14,
    lineHeight: 22,
    fontStyle: "italic",
  },
  quoteAuthor: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  bottomCtaCard: {
    padding: 24,
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  bottomCtaLogo: {
    width: 58,
    height: 58,
    borderRadius: 16,
    marginBottom: 12,
  },
  bottomCtaTitle: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.6,
    textAlign: "center",
  },
  bottomCtaCopy: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 6,
    maxWidth: 280,
  },
  bottomBtn: {
    width: "100%",
    marginTop: 20,
  },
  bottomSignInLink: {
    marginTop: 14,
  },
  bottomSignInText: {
    fontSize: 12,
  },
  footerText: {
    textAlign: "center",
    fontSize: 10,
    marginTop: 28,
  },

  // Form styles
  formScroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 56 : 38,
    paddingBottom: 40,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  backLinkText: {
    fontSize: 12,
    fontWeight: "600",
  },
  formHeader: {
    marginBottom: 24,
  },
  formLogo: {
    width: 54,
    height: 54,
    borderRadius: 16,
    marginBottom: 14,
  },
  formTitle: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -1.2,
  },
  formSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
  segmentContainer: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  segmentBtn: {
    flex: 1,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
  },
  segmentBtnActive: {
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: "600",
  },
  segmentTextActive: {
    fontWeight: "800",
  },
  formFields: {
    gap: 14,
  },
  fieldLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 6,
  },
  fieldWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 13,
  },
  helperNote: {
    fontSize: 10,
    lineHeight: 15,
    marginTop: 8,
  },
  formSubmitBtn: {
    marginTop: 22,
  },
  switchMode: {
    alignItems: "center",
    marginTop: 18,
  },
  switchText: {
    fontSize: 12,
  },
  switchAccent: {
    color: "#EB6F61",
    fontWeight: "700",
  },
  trustBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 32,
  },
  trustText: {
    fontSize: 10,
    fontWeight: "600",
  },
});

const dialogStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "rgba(18, 27, 24, 0.65)",
  },
  card: {
    padding: 24,
    borderRadius: 22,
    maxWidth: 360,
    alignSelf: "center",
    width: "100%",
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFF0ED",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: {
    fontFamily: "Fraunces_700Bold",
    fontSize: 20,
    fontWeight: "700",
  },
  copy: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
  button: {
    height: 44,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EB6F61",
    marginTop: 20,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
});
