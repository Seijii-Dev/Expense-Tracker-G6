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

interface AuthFormProps {
  mode: "login" | "register";
  onModeChange: (mode: "login" | "register") => void;
  onBack: () => void;
  onSubmit: (values: { name: string; email: string; password: string }) => void;
  busy: boolean;
}

export function AuthForm({ mode, onModeChange, onBack, onSubmit, busy }: AuthFormProps) {
  const { colors } = useTheme();
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
            onBack();
          }}
        >
          <Ionicons name="arrow-back" size={18} color={colors.muted} />
          <Text style={[styles.backLinkText, { color: colors.muted }]}>Back to home</Text>
        </Pressable>

        {/* Brand Header */}
        <View style={styles.formHeader}>
          <Image source={require("@/assets/images/icon.png")} style={styles.formLogo} />
          <Text style={[styles.formTitle, { color: colors.foreground }]}>
            {isRegister ? "Start your ledger" : "Welcome back"}
            <Text style={[styles.dot, { color: colors.primary }]}>.</Text>
          </Text>
          <Text style={[styles.formSubtitle, { color: colors.muted }]}>
            {isRegister
              ? "Create your account to sync your expenses and track savings."
              : "Sign in to access your saved transactions and budget."}
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
              onModeChange("login");
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
              onModeChange("register");
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
            { backgroundColor: colors.primary },
            pressed && styles.pressed,
            busy && { opacity: 0.65 },
          ]}
          onPress={handleSubmit}
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
            onModeChange(isRegister ? "login" : "register");
          }}
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
  dot: {
    fontWeight: "700",
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
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
