import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, RemoteAccount } from "@/lib/api-client";

type Account = { id: string; name: string; email: string; budget: number };
type AuthContextValue = {
  account: Account | null;
  token: string | null;
  loading: boolean;
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  login: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshAccount: (account: RemoteAccount) => void;
};

const TOKEN_KEY = "expense-tracker-auth-token";
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // On app start, check for a saved token and validate it against the server.
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const savedToken = await SecureStore.getItemAsync(TOKEN_KEY);
        if (!savedToken) return;
        const result = await api.me(savedToken);
        if (!mounted) return;
        if (result.ok) {
          setToken(savedToken);
          setAccount(result.account);
        } else {
          // Token expired or invalid — clear it so the user isn't stuck.
          await SecureStore.deleteItemAsync(TOKEN_KEY);
        }
      } catch {
        // Network error on startup: leave the user logged out rather than guessing.
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const register = async (name: string, email: string, password: string) => {
    const result = await api.register(name, email, password);
    if (!result.ok) return { ok: false, message: result.message };
    await SecureStore.setItemAsync(TOKEN_KEY, result.token);
    setToken(result.token);
    setAccount(result.account);
    return { ok: true };
  };

  const login = async (email: string, password: string) => {
    const result = await api.login(email, password);
    if (!result.ok) return { ok: false, message: result.message };
    await SecureStore.setItemAsync(TOKEN_KEY, result.token);
    setToken(result.token);
    setAccount(result.account);
    return { ok: true };
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setToken(null);
    setAccount(null);
  };

  const refreshAccount = (updated: RemoteAccount) => setAccount(updated);

  const value = useMemo(() => ({ account, token, loading, register, login, logout, refreshAccount }), [account, token, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
