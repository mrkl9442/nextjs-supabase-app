import { z } from "zod";

export const expenseSchema = z.object({
  label: z.string().min(1, "항목명을 입력하세요"),
  amount: z.number().int().min(0, "0원 이상 입력하세요"),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;
