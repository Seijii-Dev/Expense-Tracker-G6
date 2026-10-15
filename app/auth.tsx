import React, { useState } from "react";
import { router } from "expo-router";

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
  const { register, login, account } = useAuth();
  const { colors } = useTheme();

  const [mode, setMode] = useState<"welcome" | "login" | "register">("welcome");
  const [busy, setBusy] = useState(false);
  const [authError, setAuthError] = useState<{ title: string; message: string } | null>(null);

  const changeMode = (nextMode: "welcome" | "login" | "register") => {
    setAuthError(null);
    setMode(nextMode);
  };

  // If already authenticated or just authenticated, route to dashboard automatically
  React.useEffect(() => {
    if (account) {
      router.replace("/(tabs)");
    }
  }, [account]);

  const handleSubmit = async (values: { name: string; email: string; password: string }) => {
    if (busy) return;
    const activeMode = mode === "welcome" ? "register" : mode;
    const validationError = validateAuthInput(activeMode, values);

    if (validationError) {
      setAuthError({ title: "Check your details", message: validationError });
      return;
    }

    setAuthError(null);
    setBusy(true);
    try {
      const result =
        activeMode === "register"
          ? await register(values.name.trim(), values.email.trim(), values.password)
          : await login(values.email.trim(), values.password);

      if (!result.ok) {
        setAuthError({
          title: activeMode === "register" ? "Account not created" : "Unable to sign in",
          message: result.message || "Please check your details and try again.",
        });
        return;
      }



      router.replace("/(tabs)");
    } catch (err) {
      console.warn("Auth submit exception:", err);
      setAuthError({
        title: activeMode === "register" ? "Account not created" : "Unable to sign in",
        message: "We couldn’t complete that request. Please try again.",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {mode === "welcome" ? (
        <WelcomeHero
          onSignIn={() => changeMode("login")}
          onRegister={() => changeMode("register")}
        />
      ) : (
        <AuthForm
          mode={mode}
          onModeChange={(nextMode) => changeMode(nextMode)}
          onBack={() => changeMode("welcome")}
          onSubmit={handleSubmit}
          busy={busy}
        />
      )}

      {/* Error Dialog Modal */}
      <ConfirmDialog
        visible={Boolean(authError)}
        title={authError?.title || "Authentication"}
        message={authError?.message || ""}
        icon="alert-circle-outline"
        iconColor={colors.primary}
        iconBgColor={colors.primarySoft}
        variant="info"
        confirmText="Okay"
        onConfirm={() => setAuthError(null)}
      />
    </>
  );
}
