export interface Expense {
  id: string;
  event_id: string;
  label: string;
  amount: number;
  created_at: string;
}

export type ExpenseInsert = Omit<Expense, "id" | "created_at">;

export type ExpenseUpdate = Partial<Pick<Expense, "label" | "amount">>;
