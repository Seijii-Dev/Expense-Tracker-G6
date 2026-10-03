import React, { useState } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/lib/theme-store";
import { AmbientBackground } from "@/components/ui/ambient-background";

interface AuthFormProps {
  mode: "login" | "register";
  onModeChange: (mode: "login" | "register") => void;
  onBack: () => void;
  onSubmit: (values: { name: string; email: string; password: string }) => void;
  busy: boolean;
}

export function AuthForm({ mode, onModeChange, onBack, onSubmit, busy }: AuthFormProps) {
  const { colors, dark } = useTheme();
  const isRegister = mode === "register";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
        contentContainerStyle={styles.formScroll}
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
            try {
              Haptics.selectionAsync();
            } catch {
              // Non-fatal
            }
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
              try {
                Haptics.selectionAsync();
              } catch {
                // Non-fatal
              }
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
              try {
                Haptics.selectionAsync();
              } catch {
                // Non-fatal
              }
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

        {/* Form Fields */}
        <View style={styles.formFields}>
          {isRegister && (
            <View>
              <Text style={[styles.fieldLabel, { color: colors.subtle }]}>FULL NAME</Text>
              <View
                style={[
                  styles.fieldWrap,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.fieldIconWrap,
                    { backgroundColor: dark ? "rgba(255,255,255,0.04)" : colors.surfaceSubtle },
                  ]}
                >
                  <Ionicons name="person-outline" size={17} color={colors.primary} />
                </View>
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
            <View
              style={[
                styles.fieldWrap,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.fieldIconWrap,
                  { backgroundColor: dark ? "rgba(255,255,255,0.04)" : colors.surfaceSubtle },
                ]}
              >
                <Ionicons name="mail-outline" size={17} color={colors.primary} />
              </View>
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
            <View
              style={[
                styles.fieldWrap,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.fieldIconWrap,
                  { backgroundColor: dark ? "rgba(255,255,255,0.04)" : colors.surfaceSubtle },
                ]}
              >
                <Ionicons name="lock-closed-outline" size={17} color={colors.primary} />
              </View>
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
            { backgroundColor: colors.primary },
            pressed && styles.pressed,
            busy && { opacity: 0.65 },
          ]}
          onPress={handleSubmit}
          accessibilityRole="button"
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
            try {
              Haptics.selectionAsync();
            } catch {
              // Non-fatal
            }
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
    fontFamily: "Fraunces_700Bold",
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -1.2,
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
    gap: 16,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 7,
  },
  fieldWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    height: 54,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  fieldIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },
  primaryCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 54,
    borderRadius: 16,
    shadowColor: "#FF6554",
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 7 },
    elevation: 6,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  primaryCtaText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  formSubmitBtn: {
    marginTop: 24,
  },
  switchMode: {
    alignItems: "center",
    marginTop: 20,
    ...(Platform.OS === "web" ? ({ cursor: "pointer" } as any) : {}),
  },
  switchText: {
    fontSize: 13,
  },
  switchAccent: {
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});

