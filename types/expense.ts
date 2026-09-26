export type StandardCategory =
  | "Food"
  | "Transport"
  | "School"
  | "Shopping"
  | "Bills"
  | "Fun"
  | "Health"
  | "Other";

export type Category = StandardCategory | (string & {});

export type Payment = "Cash" | "GCash" | "Card" | "Bank";

export type Expense = {
  id: string;
  amount: number;
  category: Category;
  date: string;
  description: string;
  payment: Payment;
};

export type CategoryStyle = {
  color: string;
  soft: string;
};

export type CustomCategory = {
  id: string;
  name: string;
  color: string;
  soft: string;
  icon: string;
  createdAt?: string;
};

export type CategoryMeta = Record<string, CategoryStyle>;

export type NewExpenseData = Omit<Expense, "id">;
