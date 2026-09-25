export type Account = {
  id: string;
  name: string;
  email: string;
  budget: number;
};

export type RemoteAccount = Account;

export type AuthContextValue = {
  account: Account | null;
  token: string | null;
  loading: boolean;
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  login: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshAccount: (account: RemoteAccount) => void;
};
