export type Category =
  | "Food"
  | "Transport"
  | "School"
  | "Shopping"
  | "Bills"
  | "Fun"
  | "Health"
  | "Other";

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

export type CategoryMeta = Record<Category, CategoryStyle>;

export type NewExpenseData = Omit<Expense, "id">;
