import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type LocalAccount = { name: string; email: string; password: string };
type AuthContextValue = { account: LocalAccount | null; loading: boolean; register: (name: string, email: string, password: string) => Promise<{ ok: boolean; message?: string }>; login: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>; logout: () => Promise<void> };

const ACCOUNT_KEY = "expense-tracker-local-account";
const SESSION_KEY = "expense-tracker-local-session";
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<LocalAccount | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(ACCOUNT_KEY), AsyncStorage.getItem(SESSION_KEY)]).then(([storedAccount, session]) => {
      if (storedAccount && session === "active") setAccount(JSON.parse(storedAccount));
    }).catch(() => undefined).finally(() => setLoading(false));
  }, []);

  const register = async (name: string, email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!name.trim() || !normalizedEmail || password.length < 6) return { ok: false, message: "Use your name, email, and a password with 6+ characters." };
    const next = { name: name.trim(), email: normalizedEmail, password };
    await AsyncStorage.setItem(ACCOUNT_KEY, JSON.stringify(next));
    await AsyncStorage.setItem(SESSION_KEY, "active");
    setAccount(next);
    return { ok: true };
  };

  const login = async (email: string, password: string) => {
    const stored = await AsyncStorage.getItem(ACCOUNT_KEY);
    const saved: LocalAccount | null = stored ? JSON.parse(stored) : null;
    if (!saved || saved.email !== email.trim().toLowerCase() || saved.password !== password) return { ok: false, message: "We couldn’t match those details on this phone." };
    await AsyncStorage.setItem(SESSION_KEY, "active");
    setAccount(saved);
    return { ok: true };
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
