import React, { useState } from "react";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { WelcomeHero } from "@/components/auth/welcome-hero";
import { AuthForm } from "@/components/auth/auth-form";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { useAuth } from "@/lib/auth-store";
import { useTheme } from "@/lib/theme-store";

function validateAuthInput(
  mode: "login" | "register",
  values: { name: string; email: string; password: string }
): string | null {
  const cleanEmail = values.email.trim();
  const cleanName = values.name.trim();

  if (mode === "register") {
    if (!cleanName) return "Please enter your name.";
    if (!cleanEmail || !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      return "Please enter a valid email address.";
    }
    if (values.password.length < 6) {
      return "Password must be at least 6 characters.";
    }
  } else {
    if (!cleanEmail) return "Please enter your email address.";
    if (!values.password) return "Please enter your password.";
  }
  return null;
}

export default function AuthScreen() {
  const { register, login } = useAuth();
  const { colors } = useTheme();

  const [mode, setMode] = useState<"welcome" | "login" | "register">("welcome");
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (values: { name: string; email: string; password: string }) => {
    const activeMode = mode === "welcome" ? "register" : mode;
    const validationError = validateAuthInput(activeMode, values);

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setBusy(true);
    try {
      const result =
        activeMode === "register"
          ? await register(values.name.trim(), values.email.trim(), values.password)
          : await login(values.email.trim(), values.password);

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

  return (
    <>
      {mode === "welcome" ? (
        <WelcomeHero
          onSignIn={() => setMode("login")}
          onRegister={() => setMode("register")}
        />
      ) : (
        <AuthForm
          mode={mode}
          onModeChange={setMode}
          onBack={() => setMode("welcome")}
          onSubmit={handleSubmit}
          busy={busy}
        />
      )}

      {/* Error Dialog Modal */}
      <ConfirmDialog
        visible={Boolean(errorMessage)}
        title={mode === "register" ? "Registration Notice" : "Sign In Notice"}
        message={errorMessage || ""}
        icon="alert-circle-outline"
        iconColor={colors.primary}
        iconBgColor={colors.primarySoft}
        confirmText="Got It"
        onConfirm={() => setErrorMessage(null)}
      />
    </>
  );
}
