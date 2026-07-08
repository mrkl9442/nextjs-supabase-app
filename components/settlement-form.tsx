"use client";

import { useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  addExpenseAction,
  deleteExpenseAction,
} from "@/app/events/[id]/settlement/actions";

type Expense = { id: string; label: string; amount: number };

interface Props {
  eventId: string;
  expenses: Expense[];
  attendingCount: number;
  isHost: boolean;
}

export function SettlementForm({
  eventId,
  expenses: initialExpenses,
  attendingCount,
  isHost,
}: Props) {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const supabase = useRef(createClient()).current;

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const perPerson = attendingCount > 0 ? Math.ceil(total / attendingCount) : 0;

  const fetchExpenses = async () => {
    const { data } = await supabase
      .from("expenses")
      .select("id, label, amount")
      .eq("event_id", eventId)
      .order("created_at", { ascending: true });
    if (data) setExpenses(data);
  };

  const handleAdd = (formData: FormData) => {
    setFieldError(null);
    startTransition(async () => {
      const result = await addExpenseAction(formData);
      if (result?.error) {
        setFieldError(result.error);
      } else {
        formRef.current?.reset();
        await fetchExpenses();
      }
    });
  };

  const handleDelete = (expenseId: string) => {
    startTransition(async () => {
      await deleteExpenseAction(expenseId, eventId);
      await fetchExpenses();
    });
  };

  const handleCopy = async () => {
    const lines = [
      `📊 정산 내역`,
      ...expenses.map((e) => `• ${e.label}: ${e.amount.toLocaleString()}원`),
      ``,
      `합계: ${total.toLocaleString()}원`,
      `참여 ${attendingCount}명 기준 1인당: ${perPerson.toLocaleString()}원`,
    ];
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* 지출 목록 */}
      <div className="mb-4 flex flex-col gap-2">
        {expenses.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            지출 항목이 없습니다
          </p>
        ) : (
          <>
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between text-sm"
              >
                <span>{expense.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {expense.amount.toLocaleString()}원
                  </span>
                  {isHost && (
                    <button
                      type="button"
                      onClick={() => handleDelete(expense.id)}
                      disabled={isPending}
                      className="text-xs text-muted-foreground hover:text-destructive disabled:opacity-50"
                    >
                      삭제
                    </button>
                  )}
                </div>
              </div>
            ))}

            <Separator />

            {/* 합계 */}
            <div className="flex items-center justify-between font-semibold">
              <span>합계</span>
              <span>{total.toLocaleString()}원</span>
            </div>

            {/* 1인당 금액 */}
            <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2 dark:bg-green-950">
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                1인당 ({attendingCount}명 기준)
              </span>
              <span className="text-lg font-bold text-green-700 dark:text-green-400">
                {perPerson.toLocaleString()}원
              </span>
            </div>
          </>
        )}
      </div>

      {/* 항목 추가 폼 (호스트 전용) */}
      {isHost && (
        <form ref={formRef} action={handleAdd} className="mb-4">
          <input type="hidden" name="eventId" value={eventId} />
          <div className="flex gap-2">
            <Input
              name="label"
              placeholder="항목명 (예: 식비)"
              className="flex-1"
              required
            />
            <Input
              name="amount"
              placeholder="금액"
              type="number"
              min={1}
              className="w-28"
              required
            />
            <Button type="submit" variant="outline" disabled={isPending}>
              {isPending ? "…" : "추가"}
            </Button>
          </div>
          {fieldError && (
            <p className="mt-1 text-xs text-destructive">{fieldError}</p>
          )}
        </form>
      )}

      <Button
        className="w-full"
        onClick={handleCopy}
        disabled={expenses.length === 0}
      >
        {copied ? "복사됨! ✓" : "📋 정산 내역 복사"}
      </Button>
    </>
  );
}
