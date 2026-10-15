import { ApiResult, RemoteAccount, RemoteExpense } from "@/types/api";
import { getExpenseDateKey } from "@/utils/date";

export type { ApiResult, RemoteAccount, RemoteExpense };

// The API URL is public and bundled into the app. The environment variable can
// override it for alternate deployments; production has a safe default so a
// build still works if the CI environment does not forward the variable.
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://expense-tracker-apis-gamma.vercel.app";

if (!API_URL && __DEV__) {
  console.warn(
    "EXPO_PUBLIC_API_URL is not set. Add it to your .env file, e.g. EXPO_PUBLIC_API_URL=https://your-project.vercel.app"
  );
}

async function request<T>(
  path: string,
  options: { method?: string; token?: string | null; body?: unknown } = {}
): Promise<ApiResult<T>> {
  if (!API_URL) {
    return { ok: false, message: "The app isn't configured with a server address yet." };
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch(`${API_URL.replace(/\/+$/, "")}${path}`, {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });
    const text = await response.text().catch(() => "");
    let data: Record<string, unknown> | null = null;
    if (text) {
      try {
        const parsed: unknown = JSON.parse(text);
        data = parsed && typeof parsed === "object" && !Array.isArray(parsed)
          ? (parsed as Record<string, unknown>)
          : null;
      } catch {
        data = null;
      }
    } else {
      data = {};
    }

    if (!response.ok) {
      return {
        ok: false,
        message: typeof data?.message === "string" ? data.message : "Something went wrong. Please try again.",
      };
    }
    if (data && data.ok === false) {
      return {
        ok: false,
        message: typeof data.message === "string" ? data.message : "Something went wrong. Please try again.",
      };
    }
    if (text && !data) return { ok: false, message: "The server returned an unreadable response. Please try again." };
    return { ok: true, ...(data || {}) } as ApiResult<T>;
  } catch {
    return { ok: false, message: "Couldn't reach the server. Check your connection and try again." };
  } finally {
    clearTimeout(timeout);
  }
}

function isRemoteAccount(value: unknown): value is RemoteAccount {
  if (!value || typeof value !== "object") return false;
  const account = value as Partial<RemoteAccount>;
  return (
    typeof account.id === "string" &&
    typeof account.name === "string" && account.name.trim().length > 0 &&
    typeof account.email === "string" && account.email.includes("@") &&
    typeof account.budget === "number" &&
    Number.isFinite(account.budget) && account.budget >= 0
  );
}

function isRemoteExpense(value: unknown): value is RemoteExpense {
  if (!value || typeof value !== "object") return false;
  const expense = value as Partial<RemoteExpense>;
  return (
    typeof expense.id === "string" &&
    typeof expense.amount === "number" &&
    Number.isFinite(expense.amount) && expense.amount > 0 &&
    typeof expense.category === "string" &&
    typeof expense.payment === "string" &&
    typeof expense.description === "string" &&
    typeof expense.date === "string" && Boolean(getExpenseDateKey(expense.date))
  );
}

function invalidResponse<T>(): Extract<ApiResult<T>, { ok: false }> {
  return { ok: false, message: "The server returned incomplete data. Please try again." };
}

async function requestAuthenticatedAccount(path: string, token?: string): Promise<ApiResult<{ account: RemoteAccount }>> {
  const result = await request<{ account: RemoteAccount }>(path, { token });
  return result.ok && isRemoteAccount(result.account) ? result : result.ok ? invalidResponse() : result;
}

export const api = {
  register: async (name: string, email: string, password: string) => {
    const result = await request<{ token: string; account: RemoteAccount }>("/api/auth/register", {
      method: "POST",
      body: { name, email, password },
    });
    return result.ok && typeof result.token === "string" && isRemoteAccount(result.account)
      ? result
      : result.ok ? invalidResponse() : result;
  },

  login: async (email: string, password: string) => {
    const result = await request<{ token: string; account: RemoteAccount }>("/api/auth/login", {
      method: "POST",
      body: { email, password },
    });
    return result.ok && typeof result.token === "string" && isRemoteAccount(result.account)
      ? result
      : result.ok ? invalidResponse() : result;
  },

  me: (token: string) => requestAuthenticatedAccount("/api/auth/me", token),

  listExpenses: async (token: string) => {
    const result = await request<{ expenses: RemoteExpense[] }>("/api/expenses", { token });
    return result.ok && Array.isArray(result.expenses) && result.expenses.every(isRemoteExpense)
      ? result
      : result.ok ? invalidResponse() : result;
  },

  createExpense: async (token: string, expense: Omit<RemoteExpense, "id">) => {
    const result = await request<{ expense: RemoteExpense }>("/api/expenses", {
      method: "POST",
      token,
      body: expense,
    });
    return result.ok && isRemoteExpense(result.expense) ? result : result.ok ? invalidResponse() : result;
  },

  updateExpense: async (token: string, id: string, expense: Omit<RemoteExpense, "id">) => {
    const result = await request<{ expense: RemoteExpense }>(`/api/expenses/${encodeURIComponent(id)}`, {
      method: "PUT",
      token,
      body: expense,
    });
    return result.ok && isRemoteExpense(result.expense) ? result : result.ok ? invalidResponse() : result;
  },

  deleteExpense: (token: string, id: string) =>
    request<{}>(`/api/expenses/${encodeURIComponent(id)}`, { method: "DELETE", token }),

  updateBudget: async (token: string, budget: number) => {
    const result = await request<{ budget: number }>("/api/budget", {
      method: "PUT",
      token,
      body: { budget },
    });
    return result.ok && typeof result.budget === "number" && Number.isFinite(result.budget)
      ? result
      : result.ok ? invalidResponse() : result;
  },
};
