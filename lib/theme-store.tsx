import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-store";
import { ThemeColors, darkColors, lightColors } from "@/constants/theme";
import { STORAGE_KEYS } from "@/constants/storage";

export type { ThemeColors };
export { darkColors, lightColors };

export type ThemeContextValue = {
  dark: boolean;
  setDark: (value: boolean) => void;
  colors: ThemeColors;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { account } = useAuth();
  const [dark, setDark] = useState(false);
  const key = account ? STORAGE_KEYS.darkMode(account.email) : null;

  useEffect(() => {
    if (!key) {
      setDark(false);
      return;
    }
    AsyncStorage.getItem(key)
      .then((value) => setDark(value === "true"))
      .catch(() => setDark(false));
  }, [key]);

  const update = (value: boolean) => {
    setDark(value);
    if (key) {
      AsyncStorage.setItem(key, String(value)).catch(() => undefined);
    }
  };

  const colors = dark ? darkColors : lightColors;
  const context = useMemo(() => ({ dark, setDark: update, colors }), [dark, key, colors]);

  return <ThemeContext.Provider value={context}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used inside ThemeProvider");
  return value;
}
