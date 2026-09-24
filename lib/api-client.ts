// The API URL is public and bundled into the app. The environment variable can
// override it for alternate deployments; production has a safe default so a
// build still works if the CI environment does not forward the variable.
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://expense-tracker-apis-gamma.vercel.app";

if (!API_URL && __DEV__) {
  console.warn(
    "EXPO_PUBLIC_API_URL is not set. Add it to your .env file, e.g. EXPO_PUBLIC_API_URL=https://your-project.vercel.app"
  );
}

export type ApiResult<T> = { ok: true } & T | { ok: false; message: string };

async function request<T>(path: string, options: { method?: string; token?: string | null; body?: unknown } = {}): Promise<ApiResult<T>> {
  if (!API_URL) {
    return { ok: false, message: "The app isn't configured with a server address yet." };
  }
  try {
    const response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data) {
      return { ok: false, message: data?.message ?? "Something went wrong. Please try again." };
    }
    return data as ApiResult<T>;
  } catch {
    return { ok: false, message: "Couldn't reach the server. Check your connection and try again." };
  }
}

export type RemoteAccount = { id: string; name: string; email: string; budget: number };
export type RemoteExpense = { id: string; amount: number; category: string; payment: string; description: string; date: string };

export const api = {
  register: (name: string, email: string, password: string) =>
    request<{ token: string; account: RemoteAccount }>("/api/auth/register", { method: "POST", body: { name, email, password } }),

  login: (email: string, password: string) =>
    request<{ token: string; account: RemoteAccount }>("/api/auth/login", { method: "POST", body: { email, password } }),

  me: (token: string) => request<{ account: RemoteAccount }>("/api/auth/me", { token }),

  listExpenses: (token: string) => request<{ expenses: RemoteExpense[] }>("/api/expenses", { token }),

  createExpense: (token: string, expense: Omit<RemoteExpense, "id">) =>
    request<{ expense: RemoteExpense }>("/api/expenses", { method: "POST", token, body: expense }),

  updateExpense: (token: string, id: string, expense: Omit<RemoteExpense, "id">) =>
    request<{ expense: RemoteExpense }>(`/api/expenses/${id}`, { method: "PUT", token, body: expense }),

  deleteExpense: (token: string, id: string) => request<{}>(`/api/expenses/${id}`, { method: "DELETE", token }),

  updateBudget: (token: string, budget: number) => request<{ budget: number }>("/api/budget", { method: "PUT", token, body: { budget } }),
};
