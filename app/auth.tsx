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
            <Text style={[styles.heroTitle, { color: colors.foreground }]}>
              Master your money.{"\n"}
              <Text style={styles.titleGradient}>Grow every peso</Text>
              <Text style={styles.dot}>.</Text>
            </Text>

            {/* Display Logo Hero Card */}
            <View style={[styles.heroDisplayCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.displayLogoWrapper}>
                <Image source={require("../assets/images/icon.png")} style={styles.heroLargeLogo} />
                <View style={styles.livePulseDot} />
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
          </View>
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
              : "Sign in to access"}
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
