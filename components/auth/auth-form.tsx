import React, { useCallback, useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  useReducedMotion,
  interpolateColor,
  interpolate,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/lib/theme-store";
import { AmbientBackground } from "@/components/ui/ambient-background";

/* ─── Animated Floating Input ──────────────────────────────────── */

interface FloatingInputProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: TextInput["props"]["keyboardType"];
  autoCapitalize?: TextInput["props"]["autoCapitalize"];
  autoCorrect?: boolean;
  returnKeyType?: TextInput["props"]["returnKeyType"];
  onSubmitEditing?: () => void;
  inputRef?: React.RefObject<TextInput | null>;
  trailingContent?: React.ReactNode;
}

const springConfig = { damping: 18, stiffness: 260, mass: 0.7 };

function FloatingInput({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  autoCorrect,
  returnKeyType,
  onSubmitEditing,
  inputRef,
  trailingContent,
}: FloatingInputProps) {
  const { colors, dark } = useTheme();
  const reduceMotion = useReducedMotion();
  const localInputRef = useRef<TextInput | null>(null);
  const setInputRef = useCallback((input: TextInput | null) => {
    localInputRef.current = input;
    if (inputRef) inputRef.current = input;
  }, [inputRef]);
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;
  const focusProgress = useSharedValue(0);
  const labelProgress = useSharedValue(hasValue ? 1 : 0);
  const isFloated = isFocused || hasValue;

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    focusProgress.value = reduceMotion ? 1 : withSpring(1, springConfig);
    labelProgress.value = reduceMotion ? 1 : withSpring(1, springConfig);
  }, [focusProgress, labelProgress, reduceMotion]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    focusProgress.value = reduceMotion ? 0 : withSpring(0, springConfig);
    labelProgress.value = reduceMotion
      ? value.length > 0 ? 1 : 0
      : withSpring(value.length > 0 ? 1 : 0, springConfig);
  }, [focusProgress, labelProgress, reduceMotion, value]);

  React.useEffect(() => {
    if (isFocused) return;
    const nextValue = hasValue ? 1 : 0;
    labelProgress.value = reduceMotion ? nextValue : withSpring(nextValue, springConfig);
  }, [hasValue, isFocused, labelProgress, reduceMotion]);

  const labelStyle = useAnimatedStyle(() => {
    const floated = labelProgress.value;
    return {
      transform: [
        { translateY: interpolate(floated, [0, 1], [0, -22]) },
        { scale: interpolate(floated, [0, 1], [1, 0.8]) },
      ],
      opacity: interpolate(floated, [0, 1], [0.5, 1]),
    };
  });

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      focusProgress.value,
      [0, 1],
      [dark ? "rgba(255,255,255,0.10)" : "#E2E8F0", colors.primary]
    ),
  }));

  const focusBgColor = isFocused
    ? dark
      ? "rgba(232, 74, 63, 0.06)"
      : "rgba(232, 74, 63, 0.03)"
    : dark
    ? "rgba(255,255,255,0.04)"
    : colors.surface;

  return (
    <Pressable
      onPress={() => localInputRef.current?.focus()}
      accessibilityRole="none"
    >
      <Animated.View
        style={[
          styles.floatingFieldWrap,
          borderStyle,
          {
            backgroundColor: focusBgColor,
          },
        ]}
      >
        {/* Leading Icon */}
        <View
          style={[
            styles.floatingIconWrap,
            {
              backgroundColor: isFocused
                ? dark
                  ? "rgba(232, 74, 63, 0.18)"
                  : colors.primarySoft
                : dark
                ? "rgba(255,255,255,0.06)"
                : colors.surfaceSubtle,
            },
          ]}
        >
          <Ionicons
            name={icon}
            size={16}
            color={isFocused ? colors.primary : colors.muted}
          />
        </View>

        {/* Floating Label + Input */}
        <View style={styles.floatingInputArea}>
          <Animated.Text
            style={[
              styles.floatingLabel,
              labelStyle,
              {
                color: isFocused ? colors.primary : colors.subtle,
              },
            ]}
            numberOfLines={1}
          >
            {label}
          </Animated.Text>
          <TextInput
            ref={setInputRef}
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={isFloated ? placeholder : undefined}
            placeholderTextColor={colors.subtle}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            autoCorrect={autoCorrect}
            returnKeyType={returnKeyType}
            onSubmitEditing={onSubmitEditing}
            style={[
              styles.floatingInput,
              {
                color: colors.foreground,
                marginTop: isFloated ? 10 : 0,
              },
            ]}
            accessibilityLabel={label}
            accessibilityHint={placeholder}
          />
        </View>

        {/* Trailing content (e.g. password visibility toggle) */}
        {trailingContent}

        {/* Focused glow accent line */}
        {isFocused && (
          <View
            style={[
              styles.focusAccentLine,
              { backgroundColor: colors.primary },
            ]}
          />
        )}
      </Animated.View>
    </Pressable>
  );
}

/* ─── Password Strength Indicator ──────────────────────────────── */

function PasswordStrength({ password }: { password: string }) {
  const { colors, dark } = useTheme();

  if (!password) return null;

  let strength = 0;
  if (password.length >= 6) strength++;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  const levels = [
    { label: "Weak", color: "#EF4444", bars: 1 },
    { label: "Weak", color: "#EF4444", bars: 1 },
    { label: "Fair", color: "#F59E0B", bars: 2 },
    { label: "Good", color: "#10B981", bars: 3 },
    { label: "Strong", color: "#10B981", bars: 4 },
    { label: "Very Strong", color: "#059669", bars: 4 },
  ];

  const level = levels[strength];

  return (
    <View style={styles.strengthWrap}>
      <View style={styles.strengthBars}>
        {[1, 2, 3, 4].map((bar) => (
          <View
            key={bar}
            style={[
              styles.strengthBar,
              {
                backgroundColor:
                  bar <= level.bars
                    ? level.color
                    : dark
                    ? "rgba(255,255,255,0.08)"
                    : "#E2E8F0",
              },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.strengthLabel, { color: level.color }]}>
        {level.label}
      </Text>
    </View>
  );
}

/* ─── Main Auth Form ───────────────────────────────────────────── */

interface AuthFormProps {
  mode: "login" | "register";
  onModeChange: (mode: "login" | "register") => void;
  onBack: () => void;
  onSubmit: (values: { name: string; email: string; password: string }) => void;
  busy: boolean;
}

export function AuthForm({ mode, onModeChange, onBack, onSubmit, busy }: AuthFormProps) {
  const { colors, dark } = useTheme();
  const insets = useSafeAreaInsets();
  const isRegister = mode === "register";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const emailRef = useRef<TextInput | null>(null);
  const passwordRef = useRef<TextInput | null>(null);

  const handleSubmit = () => {
    onSubmit({ name, email, password });
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <AmbientBackground />

      <ScrollView
        contentContainerStyle={[
          styles.formScroll,
          { paddingTop: Math.max(insets.top + 10, Platform.OS === "ios" ? 56 : 38) },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back Link */}
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            {
              backgroundColor: dark ? "rgba(255,255,255,0.06)" : colors.surface,
              borderColor: colors.border,
            },
            pressed && styles.pressed,
          ]}
          onPress={() => {
            onBack();
          }}
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={16} color={colors.foreground} />
          <Text style={[styles.backLinkText, { color: colors.foreground }]}>Back</Text>
        </Pressable>

        {/* Brand Header */}
        <View style={styles.formHeader}>
          <View
            style={[
              styles.logoPlate,
              {
                backgroundColor: dark ? `${colors.primary}20` : colors.primarySoft,
                borderColor: `${colors.primary}30`,
              },
            ]}
          >
            <Image source={require("@/assets/images/icon.png")} style={styles.formLogo} />
          </View>
          <Text style={[styles.formTitle, { color: colors.foreground }]}>
            {isRegister ? "Start your ledger" : "Welcome back"}
            <Text style={{ color: colors.primary }}>.</Text>
          </Text>
          <Text style={[styles.formSubtitle, { color: colors.muted }]}>
            {isRegister
              ? "Create your account to sync your expenses and track savings."
              : "Sign in to access your saved transactions and budget."}
          </Text>
        </View>

        {/* Segmented Mode Selector */}
        <View
          style={[
            styles.segmentContainer,
            {
              backgroundColor: dark ? "rgba(255,255,255,0.04)" : colors.surfaceSubtle,
              borderColor: colors.border,
            },
          ]}
        >
          <Pressable
            style={[
              styles.segmentBtn,
              !isRegister && [
                styles.segmentBtnActive,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ],
            ]}
            onPress={() => {
              onModeChange("login");
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: !isRegister }}
          >
            <Text
              style={[
                styles.segmentText,
                {
                  color: !isRegister ? colors.foreground : colors.muted,
                  fontWeight: !isRegister ? "800" : "600",
                },
              ]}
            >
              Sign In
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.segmentBtn,
              isRegister && [
                styles.segmentBtnActive,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ],
            ]}
            onPress={() => {
              onModeChange("register");
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: isRegister }}
          >
            <Text
              style={[
                styles.segmentText,
                {
                  color: isRegister ? colors.foreground : colors.muted,
                  fontWeight: isRegister ? "800" : "600",
                },
              ]}
            >
              Create Account
            </Text>
          </Pressable>
        </View>

        {/* Form Fields with Floating Labels */}
        <View style={styles.formFields}>
          {isRegister && (
            <FloatingInput
              label="Full Name"
              icon="person-outline"
              value={name}
              onChangeText={setName}
              placeholder="e.g. Maria Santos"
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
            />
          )}

          <FloatingInput
            label="Email Address"
            icon="mail-outline"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            inputRef={emailRef}
            onSubmitEditing={() => passwordRef.current?.focus()}
          />

          <View>
            <FloatingInput
              label="Password"
              icon="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              placeholder={isRegister ? "At least 6 characters" : "Your password"}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              returnKeyType="done"
              inputRef={passwordRef}
              onSubmitEditing={handleSubmit}
              trailingContent={
                <Pressable
                  hitSlop={12}
                  onPress={() => setShowPassword((v) => !v)}
                  style={styles.eyeToggle}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                >
                  <View
                    style={[
                      styles.eyeToggleBg,
                      {
                        backgroundColor: dark
                          ? "rgba(255,255,255,0.06)"
                          : colors.surfaceSubtle,
                      },
                    ]}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={16}
                      color={colors.muted}
                    />
                  </View>
                </Pressable>
              }
            />
            {isRegister && <PasswordStrength password={password} />}
          </View>
        </View>

        {/* Submit Button with Gradient */}
        <Pressable
          disabled={busy}
          style={({ pressed }) => [
            styles.formSubmitBtn,
            pressed && styles.pressed,
            busy && { opacity: 0.65 },
          ]}
          onPress={handleSubmit}
          accessibilityRole="button"
        >
          <LinearGradient
            colors={["#FF5A4E", "#E84A3F", "#D43C32"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitGradient}
          >
            {busy ? (
              <Text style={styles.submitText}>Please wait…</Text>
            ) : (
              <>
                <Text style={styles.submitText}>
                  {isRegister ? "Create Free Account" : "Sign In"}
                </Text>
                <View style={styles.submitArrowCircle}>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </View>
              </>
            )}
          </LinearGradient>
        </Pressable>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.subtle }]}>or</Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        </View>

        {/* Mode Switch text */}
        <Pressable
          style={styles.switchMode}
          onPress={() => {
            onModeChange(isRegister ? "login" : "register");
          }}
          accessibilityRole="button"
        >
          <Text style={[styles.switchText, { color: colors.muted }]}>
            {isRegister ? "Already have an account? " : "New to Ledgerly? "}
            <Text style={[styles.switchAccent, { color: colors.primary }]}>
              {isRegister ? "Sign in" : "Create one now"}
            </Text>
          </Text>
        </Pressable>

        {/* Terms footer */}
        {isRegister && (
          <Text style={[styles.termsText, { color: colors.subtle }]}>
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
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
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  backLinkText: {
    fontSize: 12,
    fontWeight: "700",
  },
  formHeader: {
    marginBottom: 24,
  },
  formLogo: {
    width: 48,
    height: 48,
    borderRadius: 14,
  },
  logoPlate: {
    width: 64,
    height: 64,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  formTitle: {
    fontFamily: "DMSans_700Bold",
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: -0.8,
  },
  formSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  segmentContainer: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 22,
  },
  segmentBtn: {
    flex: 1,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  segmentBtnActive: {
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  segmentText: {
    fontSize: 12,
  },
  formFields: {
    gap: 14,
  },

  /* ─── Floating Input Styles ───────────────────────────────── */
  floatingFieldWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 60,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    position: "relative",
    overflow: "hidden",
  },
  floatingIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  floatingInputArea: {
    flex: 1,
    justifyContent: "center",
    minHeight: 44,
    position: "relative",
  },
  floatingLabel: {
    position: "absolute",
    left: 0,
    top: 12,
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  floatingInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    paddingVertical: 0,
  },
  focusAccentLine: {
    position: "absolute",
    bottom: 0,
    left: 14,
    right: 14,
    height: 2,
    borderRadius: 1,
  },
  eyeToggle: {
    padding: 4,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  eyeToggleBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  /* ─── Password Strength ───────────────────────────────────── */
  strengthWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  strengthBars: {
    flexDirection: "row",
    gap: 4,
    flex: 1,
  },
  strengthBar: {
    flex: 1,
    height: 3,
    borderRadius: 1.5,
  },
  strengthLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
    minWidth: 70,
    textAlign: "right",
  },

  /* ─── Submit Button ───────────────────────────────────────── */
  formSubmitBtn: {
    marginTop: 24,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#FF6554",
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 7 },
    elevation: 6,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  submitGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 54,
    paddingHorizontal: 24,
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  submitArrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  /* ─── Divider ─────────────────────────────────────────────── */
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 22,
    marginBottom: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: "600",
  },

  /* ─── Mode Switch ─────────────────────────────────────────── */
  switchMode: {
    alignItems: "center",
    marginTop: 16,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  switchText: {
    fontSize: 13,
  },
  switchAccent: {
    fontWeight: "700",
  },

  /* ─── Terms ───────────────────────────────────────────────── */
  termsText: {
    textAlign: "center",
    fontSize: 10.5,
    lineHeight: 16,
    marginTop: 16,
    paddingHorizontal: 20,
  },

  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
