import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Platform } from "react-native";
import { api, RemoteAccount } from "@/lib/api-client";
import { Account, AuthContextValue, ProfileBannerMedia } from "@/types/auth";
import { STORAGE_KEYS } from "@/constants/storage";

export type { Account, AuthContextValue };

const AuthContext = createContext<AuthContextValue | null>(null);

function parseProfileBanner(value: string | null): ProfileBannerMedia | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<ProfileBannerMedia>;
    if (
      typeof parsed.uri !== "string" ||
      (parsed.type !== "image" && parsed.type !== "video") ||
      (parsed.type === "video" && (!Number.isFinite(parsed.durationMs) || (parsed.durationMs ?? Infinity) > 10_000))
    ) {
      return null;
    }
    return {
      uri: parsed.uri,
      type: parsed.type,
      ...(parsed.type === "video" ? { durationMs: parsed.durationMs } : {}),
    };
  } catch {
    return null;
  }
}

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

function isAccount(value: unknown): value is Account {
  if (!value || typeof value !== "object") return false;
  const account = value as Partial<Account>;
  return (
    typeof account.id === "string" &&
    typeof account.name === "string" &&
    typeof account.email === "string" &&
    Number.isFinite(account.budget)
  );
}

async function getOfflineAccounts(): Promise<Account[]> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.localAccounts);
    const parsed: unknown = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed.filter(isAccount) : [];
  } catch {
    return [];
  }
}

async function rememberOfflineAccount(account: Account): Promise<void> {
  const accounts = await getOfflineAccounts();
  const updated = accounts.filter((saved) => saved.email.toLowerCase() !== account.email.toLowerCase());
  updated.push(account);
  await AsyncStorage.setItem(STORAGE_KEYS.localAccounts, JSON.stringify(updated));
}

async function getOfflineAccount(email: string): Promise<Account | null> {
  const accounts = await getOfflineAccounts();
  const saved = accounts.find((item) => item.email.toLowerCase() === email.toLowerCase());
  if (saved) return saved;

  try {
    const cached = await AsyncStorage.getItem(STORAGE_KEYS.cachedAccount);
    const parsed: unknown = cached ? JSON.parse(cached) : null;
    return isAccount(parsed) && parsed.email.toLowerCase() === email.toLowerCase() ? parsed : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const accountRef = useRef<Account | null>(null);
  accountRef.current = account;

  useEffect(() => {
    const email = account?.email;
    if (!email) return;

    let mounted = true;
    Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.profilePicture(email)).catch(() => null),
      AsyncStorage.getItem(STORAGE_KEYS.profileBanner(email)).catch(() => null),
    ])
      .then(([uri, savedBanner]) => {
        if (!mounted) return;
        const profileBanner = savedBanner ? parseProfileBanner(savedBanner) : null;
        setAccount((current) =>
          current?.email === email &&
          (current.profilePictureUri !== uri ||
            current.profileBanner?.uri !== profileBanner?.uri ||
            current.profileBanner?.type !== profileBanner?.type)
            ? {
                ...current,
                profilePictureUri: uri,
                profileBanner,
              }
            : current
        );
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, [account?.email]);

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
            const parsed: unknown = JSON.parse(cachedAccountStr);
            localAccount = isAccount(parsed) ? parsed : null;
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
          const [profilePictureUri, savedBanner] = await Promise.all([
            AsyncStorage.getItem(STORAGE_KEYS.profilePicture(result.account.email)).catch(() => null),
            AsyncStorage.getItem(STORAGE_KEYS.profileBanner(result.account.email)).catch(() => null),
          ]);
          const cachedBanner =
            accountRef.current?.email === result.account.email ? accountRef.current.profileBanner : null;
          const refreshedAccount: Account = {
            ...result.account,
            profilePictureUri,
            profileBanner: savedBanner === null ? null : parseProfileBanner(savedBanner) ?? cachedBanner,
          };
          setToken(savedToken);
          setAccount(refreshedAccount);
          await AsyncStorage.setItem(STORAGE_KEYS.cachedAccount, JSON.stringify(refreshedAccount));
          await rememberOfflineAccount(refreshedAccount);
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

    const registerOffline = async () => {
      const [savedPassword, offlineAccount] = await Promise.all([
        safeSecureGet(STORAGE_KEYS.userPassword(cleanEmail)),
        getOfflineAccount(cleanEmail),
      ]);
      if (savedPassword || offlineAccount) {
        return { ok: false, message: "An account for this email is already saved on this device. Sign in instead." };
      }

      const localAccount: Account = {
        id: `local-${Date.now()}`,
        name: cleanName,
        email: cleanEmail,
        budget: 5000,
      };
      const localToken = `local-token-${cleanEmail}`;
      await Promise.all([
        rememberOfflineAccount(localAccount),
        AsyncStorage.setItem(STORAGE_KEYS.cachedAccount, JSON.stringify(localAccount)),
        safeSecureSet(STORAGE_KEYS.authToken, localToken),
        safeSecureSet(STORAGE_KEYS.userPassword(cleanEmail), password),
      ]);
      setToken(localToken);
      setAccount(localAccount);
      return { ok: true };
    };

    try {
      const result = await api.register(cleanName, cleanEmail, password);
      if (result.ok) {
        await Promise.all([
          safeSecureSet(STORAGE_KEYS.authToken, result.token),
          AsyncStorage.setItem(STORAGE_KEYS.cachedAccount, JSON.stringify(result.account)),
          safeSecureSet(STORAGE_KEYS.userPassword(cleanEmail), password),
          rememberOfflineAccount(result.account),
        ]);
        setToken(result.token);
        setAccount(result.account);
        return { ok: true };
      }

      // If network is unreachable, register locally so user is never blocked offline
      if (isNetworkError(result.message)) {
        return await registerOffline();
      }

      return { ok: false, message: result.message };
    } catch {
      return { ok: false, message: "We couldn’t save your account on this device. Please try again." };
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();

    const loginOffline = async (
      knownAccount?: Account | null,
      knownPassword?: string | null
    ) => {
      const savedPassword = knownPassword ?? await safeSecureGet(STORAGE_KEYS.userPassword(cleanEmail));
      if (!savedPassword || savedPassword !== password) {
        return {
          ok: false,
          message: "Could not reach the server and no offline sign-in matches this email and password.",
        };
      }

      const savedAccount = knownAccount ?? await getOfflineAccount(cleanEmail);
      const localAccount: Account = savedAccount ?? {
        id: `local-${Date.now()}`,
        name: cleanEmail.split("@")[0],
        email: cleanEmail,
        budget: 5000,
      };
      const localToken = `local-token-${cleanEmail}`;
      await Promise.all([
        rememberOfflineAccount(localAccount),
        AsyncStorage.setItem(STORAGE_KEYS.cachedAccount, JSON.stringify(localAccount)),
        safeSecureSet(STORAGE_KEYS.authToken, localToken),
      ]);
      setToken(localToken);
      setAccount(localAccount);
      return { ok: true };
    };

    try {
      const result = await api.login(cleanEmail, password);
      if (result.ok) {
        await Promise.all([
          safeSecureSet(STORAGE_KEYS.authToken, result.token),
          AsyncStorage.setItem(STORAGE_KEYS.cachedAccount, JSON.stringify(result.account)),
          safeSecureSet(STORAGE_KEYS.userPassword(cleanEmail), password),
          rememberOfflineAccount(result.account),
        ]);
        setToken(result.token);
        setAccount(result.account);
        return { ok: true };
      }

      // If server unreachable, check offline credentials
      if (isNetworkError(result.message)) {
        return await loginOffline();
      }

      // A device-only account may be used while online too; the API correctly
      // rejects it because it has no remote record.
      const [offlineAccount, savedPassword] = await Promise.all([
        getOfflineAccount(cleanEmail),
        safeSecureGet(STORAGE_KEYS.userPassword(cleanEmail)).catch(() => null),
      ]);
      if (offlineAccount?.id.startsWith("local-") && savedPassword === password) {
        return await loginOffline(offlineAccount, savedPassword);
      }

      return { ok: false, message: result.message };
    } catch {
      return { ok: false, message: "We couldn’t complete sign-in on this device. Please try again." };
    }
  }, []);

  const logout = useCallback(async () => {
    accountRef.current = null;
    setToken(null);
    setAccount(null);
    await Promise.all([
      safeSecureDelete(STORAGE_KEYS.authToken).catch(() => undefined),
      AsyncStorage.removeItem(STORAGE_KEYS.cachedAccount).catch(() => undefined),
    ]);
  }, []);

  const refreshAccount = useCallback((updated: RemoteAccount) => {
    const current = accountRef.current;
    const nextAccount: Account = {
      ...updated,
      profilePictureUri:
        current?.email === updated.email ? current.profilePictureUri : updated.profilePictureUri,
      profileBanner:
        current?.email === updated.email ? current.profileBanner : updated.profileBanner,
    };
    if (
      current &&
      current.id === nextAccount.id &&
      current.email === nextAccount.email &&
      current.name === nextAccount.name &&
      current.budget === nextAccount.budget &&
      current.profilePictureUri === nextAccount.profilePictureUri &&
      current.profileBanner?.uri === nextAccount.profileBanner?.uri &&
      current.profileBanner?.type === nextAccount.profileBanner?.type
    ) return;

    accountRef.current = nextAccount;
    setAccount(nextAccount);
    AsyncStorage.setItem(STORAGE_KEYS.cachedAccount, JSON.stringify(nextAccount)).catch(() => undefined);
    rememberOfflineAccount(nextAccount).catch(() => undefined);
  }, []);

  const updateProfilePicture = useCallback(async (uri: string | null) => {
    const current = accountRef.current;
    if (!current) throw new Error("Sign in to update your profile picture.");

    const email = current.email;
    const key = STORAGE_KEYS.profilePicture(email);
    if (uri) await AsyncStorage.setItem(key, uri);
    else await AsyncStorage.removeItem(key);

    const latest = accountRef.current;
    if (!latest || latest.email !== email) {
      if (current.profilePictureUri) await AsyncStorage.setItem(key, current.profilePictureUri);
      else await AsyncStorage.removeItem(key);
      throw new Error("Your account changed before the photo could be saved.");
    }

    const updated = { ...latest, profilePictureUri: uri };
    accountRef.current = updated;
    setAccount(updated);
    AsyncStorage.setItem(STORAGE_KEYS.cachedAccount, JSON.stringify(updated)).catch(() => undefined);
    rememberOfflineAccount(updated).catch(() => undefined);
  }, []);

  const updateProfileBanner = useCallback(async (banner: ProfileBannerMedia | null) => {
    const current = accountRef.current;
    if (!current) throw new Error("Sign in to update your profile banner.");

    const email = current.email;
    const key = STORAGE_KEYS.profileBanner(email);
    if (banner) await AsyncStorage.setItem(key, JSON.stringify(banner));
    else await AsyncStorage.removeItem(key);

    const latest = accountRef.current;
    if (!latest || latest.email !== email) {
      if (current.profileBanner) await AsyncStorage.setItem(key, JSON.stringify(current.profileBanner));
      else await AsyncStorage.removeItem(key);
      throw new Error("Your account changed before the banner could be saved.");
    }

    const updated = { ...latest, profileBanner: banner };
    accountRef.current = updated;
    setAccount(updated);
    AsyncStorage.setItem(STORAGE_KEYS.cachedAccount, JSON.stringify(updated)).catch(() => undefined);
    rememberOfflineAccount(updated).catch(() => undefined);
  }, []);

  const value = useMemo(
    () => ({ account, token, loading, register, login, logout, refreshAccount, updateProfilePicture, updateProfileBanner }),
    [account, token, loading, register, login, logout, refreshAccount, updateProfilePicture, updateProfileBanner]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
