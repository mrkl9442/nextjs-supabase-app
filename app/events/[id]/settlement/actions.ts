"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const addExpenseSchema = z.object({
  eventId: z.string().uuid(),
  label: z.string().min(1, "항목명을 입력하세요"),
  amount: z.coerce.number().int().positive("금액은 0보다 커야 합니다"),
});

export async function addExpenseAction(formData: FormData) {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) redirect("/auth/login");

  const parsed = addExpenseSchema.safeParse({
    eventId: formData.get("eventId"),
    label: formData.get("label"),
    amount: formData.get("amount"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인하세요" };
  }

  const { eventId, label, amount } = parsed.data;

  // 주최자 검증
  const { data: event } = await supabase
    .from("events")
    .select("host_id")
    .eq("id", eventId)
    .single();

  if (!event || event.host_id !== claims.claims.sub) {
    return { error: "권한이 없습니다" };
  }

  const { error } = await supabase
    .from("expenses")
    .insert({ event_id: eventId, label, amount });

  if (error) return { error: "저장 중 오류가 발생했습니다" };

  revalidatePath(`/events/${eventId}/settlement`);
  return { error: null };
}

export async function deleteExpenseAction(expenseId: string, eventId: string) {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) redirect("/auth/login");

  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", expenseId);

  if (error) return { error: "삭제 중 오류가 발생했습니다" };

  revalidatePath(`/events/${eventId}/settlement`);
  return { error: null };
}
