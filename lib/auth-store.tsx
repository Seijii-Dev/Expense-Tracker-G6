import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import { api, RemoteAccount } from "@/lib/api-client";
import { Account, AuthContextValue } from "@/types/auth";
import { STORAGE_KEYS } from "@/constants/storage";

export type { Account, AuthContextValue };

const AuthContext = createContext<AuthContextValue | null>(null);

async function safeSecureSet(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    await AsyncStorage.setItem(key, value);
    return;
  }
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    await AsyncStorage.setItem(key, value);
  }
}

async function safeSecureGet(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    return AsyncStorage.getItem(key);
  }
  try {
    const val = await SecureStore.getItemAsync(key);
    if (val !== null) return val;
    return await AsyncStorage.getItem(key);
  } catch {
    return AsyncStorage.getItem(key);
  }
}

async function safeSecureDelete(key: string): Promise<void> {
  if (Platform.OS === "web") {
    await AsyncStorage.removeItem(key);
    return;
  }
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    // Ignore error
  }
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // Ignore error
  }
}

function isNetworkError(message?: string): boolean {
  if (!message) return false;
  const lower = message.toLowerCase();
  return (
    lower.includes("reach the server") ||
    lower.includes("connection") ||
    lower.includes("network") ||
    lower.includes("offline") ||
    lower.includes("timeout") ||
    lower.includes("failed to fetch")
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // On app start: read cached account & token so app opens instantly, even offline
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const [savedToken, cachedAccountStr] = await Promise.all([
          safeSecureGet(STORAGE_KEYS.authToken),
          AsyncStorage.getItem(STORAGE_KEYS.cachedAccount),
        ]);

        let localAccount: Account | null = null;
        if (cachedAccountStr) {
          try {
            localAccount = JSON.parse(cachedAccountStr) as Account;
          } catch {
            localAccount = null;
          }
        }

        // If we have cached account and token, authenticate locally immediately
        if (localAccount && savedToken) {
          if (mounted) {
            setToken(savedToken);
            setAccount(localAccount);
            setLoading(false);
          }
        }

        if (!savedToken) {
          if (mounted) setLoading(false);
          return;
        }

        // If local token, no need to query server
        if (savedToken.startsWith("local-token-")) {
          if (mounted) setLoading(false);
          return;
        }

        // Query server to validate / refresh token in background
        const result = await api.me(savedToken);
        if (!mounted) return;

        if (result.ok) {
          setToken(savedToken);
          setAccount(result.account);
          await AsyncStorage.setItem(STORAGE_KEYS.cachedAccount, JSON.stringify(result.account));
        } else {
          // If server explicitly rejected token (not a network error), clear session
          if (!isNetworkError(result.message)) {
            await Promise.all([
              safeSecureDelete(STORAGE_KEYS.authToken),
              AsyncStorage.removeItem(STORAGE_KEYS.cachedAccount),
            ]);
            setToken(null);
            setAccount(null);
          }
          // If it was just a network error, keep the cached local session!
        }
      } catch {
        // Keep cached session on unexpected errors
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    try {
      const result = await api.register(cleanName, cleanEmail, password);
      if (result.ok) {
        await Promise.all([
          safeSecureSet(STORAGE_KEYS.authToken, result.token),
          AsyncStorage.setItem(STORAGE_KEYS.cachedAccount, JSON.stringify(result.account)),
          safeSecureSet(STORAGE_KEYS.userPassword(cleanEmail), password),
        ]);
        setToken(result.token);
        setAccount(result.account);
        return { ok: true };
      }

      // If network is unreachable, register locally so user is never blocked offline
      if (isNetworkError(result.message)) {
        const localAccount: Account = {
          id: `local-${Date.now()}`,
          name: cleanName,
          email: cleanEmail,
          budget: 5000,
        };
        const localToken = `local-token-${Date.now()}`;
        await Promise.all([
          safeSecureSet(STORAGE_KEYS.authToken, localToken),
          AsyncStorage.setItem(STORAGE_KEYS.cachedAccount, JSON.stringify(localAccount)),
          safeSecureSet(STORAGE_KEYS.userPassword(cleanEmail), password),
        ]);
        setToken(localToken);
        setAccount(localAccount);
        return { ok: true };
      }

      return { ok: false, message: result.message };
    } catch {
      // Local fallback on exception
      const localAccount: Account = {
        id: `local-${Date.now()}`,
        name: cleanName,
        email: cleanEmail,
        budget: 5000,
      };
      const localToken = `local-token-${Date.now()}`;
      await Promise.all([
        safeSecureSet(STORAGE_KEYS.authToken, localToken),
        AsyncStorage.setItem(STORAGE_KEYS.cachedAccount, JSON.stringify(localAccount)),
        safeSecureSet(STORAGE_KEYS.userPassword(cleanEmail), password),
      ]);
      setToken(localToken);
      setAccount(localAccount);
      return { ok: true };
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();

    try {
      const result = await api.login(cleanEmail, password);
      if (result.ok) {
        await Promise.all([
          safeSecureSet(STORAGE_KEYS.authToken, result.token),
          AsyncStorage.setItem(STORAGE_KEYS.cachedAccount, JSON.stringify(result.account)),
          safeSecureSet(STORAGE_KEYS.userPassword(cleanEmail), password),
        ]);
        setToken(result.token);
        setAccount(result.account);
        return { ok: true };
      }

      // If server unreachable, check offline credentials
      if (isNetworkError(result.message)) {
        const savedPassword = await safeSecureGet(STORAGE_KEYS.userPassword(cleanEmail));
        const cachedAccountStr = await AsyncStorage.getItem(STORAGE_KEYS.cachedAccount);
        const cached = cachedAccountStr ? (JSON.parse(cachedAccountStr) as Account) : null;

        if (savedPassword && savedPassword === password) {
          const localAccount: Account =
            cached && cached.email === cleanEmail
              ? cached
              : {
                  id: `local-${Date.now()}`,
                  name: cleanEmail.split("@")[0],
                  email: cleanEmail,
                  budget: 5000,
                };
          const localToken = `local-token-${cleanEmail}`;
          await Promise.all([
            safeSecureSet(STORAGE_KEYS.authToken, localToken),
            AsyncStorage.setItem(STORAGE_KEYS.cachedAccount, JSON.stringify(localAccount)),
          ]);
          setToken(localToken);
          setAccount(localAccount);
          return { ok: true };
        }

        return {
          ok: false,
          message:
            "Could not reach server and no offline record matches this login. Create an account to start offline.",
        };
      }

      return { ok: false, message: result.message };
    } catch {
      // Local check fallback
      const savedPassword = await safeSecureGet(STORAGE_KEYS.userPassword(cleanEmail));
      if (savedPassword && savedPassword === password) {
        const cachedAccountStr = await AsyncStorage.getItem(STORAGE_KEYS.cachedAccount);
        const cached = cachedAccountStr ? (JSON.parse(cachedAccountStr) as Account) : null;
        const localAccount: Account =
          cached && cached.email === cleanEmail
            ? cached
            : {
                id: `local-${Date.now()}`,
                name: cleanEmail.split("@")[0],
                email: cleanEmail,
                budget: 5000,
              };
        const localToken = `local-token-${cleanEmail}`;
        await Promise.all([
          safeSecureSet(STORAGE_KEYS.authToken, localToken),
          AsyncStorage.setItem(STORAGE_KEYS.cachedAccount, JSON.stringify(localAccount)),
        ]);
        setToken(localToken);
        setAccount(localAccount);
        return { ok: true };
      }
      return { ok: false, message: "Couldn't reach the server. Please check your connection and try again." };
    }
  }, []);

  const logout = useCallback(async () => {
    await Promise.all([
      safeSecureDelete(STORAGE_KEYS.authToken),
      AsyncStorage.removeItem(STORAGE_KEYS.cachedAccount),
    ]);
    setToken(null);
    setAccount(null);
  }, []);

  const refreshAccount = useCallback((updated: RemoteAccount) => {
    setAccount(updated);
    AsyncStorage.setItem(STORAGE_KEYS.cachedAccount, JSON.stringify(updated)).catch(() => undefined);
  }, []);

  const value = useMemo(
    () => ({ account, token, loading, register, login, logout, refreshAccount }),
    [account, token, loading, register, login, logout, refreshAccount]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
