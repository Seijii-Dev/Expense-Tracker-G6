export type ApiResult<T> = ({ ok: true } & T) | { ok: false; message: string };

export type RemoteAccount = {
  id: string;
  name: string;
  email: string;
  budget: number;
};

export type RemoteExpense = {
  id: string;
  amount: number;
  category: string;
  payment: string;
  description: string;
  date: string;
};
