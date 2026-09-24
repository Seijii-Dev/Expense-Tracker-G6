import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type LocalAccount = { name: string; email: string };
type StoredAccount = LocalAccount & { password?: string };
type AuthContextValue = { account: LocalAccount | null; loading: boolean; register: (name: string, email: string, password: string) => Promise<{ ok: boolean; message?: string }>; login: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>; logout: () => Promise<void> };

const ACCOUNT_KEY = "expense-tracker-local-account";
const SESSION_KEY = "expense-tracker-local-session";
const passwordKey = (email: string) => `expense-tracker-password-${email}`;
const AuthContext = createContext<AuthContextValue | null>(null);
const storageError = "We couldn’t access this device’s local storage. Please try again.";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<LocalAccount | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([AsyncStorage.getItem(ACCOUNT_KEY), AsyncStorage.getItem(SESSION_KEY)]).then(async ([storedAccount, session]) => {
      if (!storedAccount || session !== "active") return;
      const parsed = JSON.parse(storedAccount) as StoredAccount;
      const safeAccount = { name: parsed.name, email: parsed.email };
      if (parsed.password) {
        try {
          await SecureStore.setItemAsync(passwordKey(parsed.email), parsed.password);
          await AsyncStorage.setItem(ACCOUNT_KEY, JSON.stringify(safeAccount));
        } catch {
          // Skip migration errors.
        }
      }
      if (mounted) setAccount(safeAccount);
    }).catch(() => undefined).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const register = async (name: string, email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!name.trim() || !normalizedEmail || password.length < 6) return { ok: false, message: "Use your name, email, and a password with 6+ characters." };
    const next = { name: name.trim(), email: normalizedEmail };
    try {
      await AsyncStorage.setItem(ACCOUNT_KEY, JSON.stringify(next));
      await SecureStore.setItemAsync(passwordKey(normalizedEmail), password);
      await AsyncStorage.setItem(SESSION_KEY, "active");
      setAccount(next);
      return { ok: true };
    } catch {
      return { ok: false, message: storageError };
    }
  };

  const login = async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    try {
      const stored = await AsyncStorage.getItem(ACCOUNT_KEY);
      const saved: StoredAccount | null = stored ? JSON.parse(stored) : null;
      const savedPassword = saved?.password ?? (saved ? await SecureStore.getItemAsync(passwordKey(saved.email)) : null);
      if (!saved || saved.email !== normalizedEmail || savedPassword !== password) return { ok: false, message: "We couldn’t match those details on this phone." };
      if (saved.password) {
        await SecureStore.setItemAsync(passwordKey(saved.email), saved.password);
        await AsyncStorage.setItem(ACCOUNT_KEY, JSON.stringify({ name: saved.name, email: saved.email }));
      }
      await AsyncStorage.setItem(SESSION_KEY, "active");
      setAccount({ name: saved.name, email: saved.email });
      return { ok: true };
    } catch {
      return { ok: false, message: storageError };
    }
  };

  const logout = async () => { await AsyncStorage.removeItem(SESSION_KEY); setAccount(null); };
  const value = useMemo(() => ({ account, loading, register, login, logout }), [account, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
