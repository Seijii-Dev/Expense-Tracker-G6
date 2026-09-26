import type { Account } from "./auth";

export type ApiResult<T> = ({ ok: true } & T) | { ok: false; message: string };

export type RemoteAccount = Account;

export type RemoteExpense = {
  id: string;
  amount: number;
  category: string;
  payment: string;
  description: string;
  date: string;
};
