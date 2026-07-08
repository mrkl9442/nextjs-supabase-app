"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// TASK-034: 드라이버 등록
export async function registerDriverAction(
  eventId: string,
  formData: FormData
) {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) redirect("/auth/login");

  const userId = claims.claims.sub;
  const departure = (formData.get("departure") as string)?.trim();
  const maxPassengers = parseInt(formData.get("maxPassengers") as string, 10);

  if (!departure) return { error: "출발지를 입력하세요" };
  if (!maxPassengers || maxPassengers < 1)
    return { error: "탑승 인원은 1명 이상이어야 합니다" };

  // 참여 확정자인지 검증
  const { data: attendance } = await supabase
    .from("attendances")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .eq("status", "attending")
    .maybeSingle();

  if (!attendance)
    return { error: "참여 확정 상태여야 드라이버 등록이 가능합니다" };

  const { error } = await supabase.from("carpool_drivers").insert({
    event_id: eventId,
    driver_id: userId,
    departure,
    max_passengers: maxPassengers,
  });

  if (error?.code === "23505")
    return { error: "이미 드라이버로 등록되어 있습니다" };
  if (error) return { error: "등록 중 오류가 발생했습니다" };

  revalidatePath(`/events/${eventId}/carpool`);
  return { error: null };
}

// 드라이버 취소
export async function cancelDriverAction(driverId: string, eventId: string) {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) redirect("/auth/login");

  const { error } = await supabase
    .from("carpool_drivers")
    .delete()
    .eq("id", driverId)
    .eq("driver_id", claims.claims.sub)
    .eq("is_confirmed", false);

  if (error) return { error: "취소 중 오류가 발생했습니다" };

  revalidatePath(`/events/${eventId}/carpool`);
  return { error: null };
}

// TASK-035: 탑승 신청
export async function requestRideAction(driverId: string, eventId: string) {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) redirect("/auth/login");

  const userId = claims.claims.sub;

  // 드라이버 정보 + 현재 탑승 인원 조회
  const { data: driver } = await supabase
    .from("carpool_drivers")
    .select("id, max_passengers, is_confirmed, driver_id")
    .eq("id", driverId)
    .single();

  if (!driver) return { error: "존재하지 않는 드라이버입니다" };
  if (driver.is_confirmed) return { error: "이미 배정이 확정된 카풀입니다" };
  if (driver.driver_id === userId)
    return { error: "본인 차에는 신청할 수 없습니다" };

  const { count } = await supabase
    .from("carpool_members")
    .select("id", { count: "exact", head: true })
    .eq("driver_id", driverId);

  if ((count ?? 0) >= driver.max_passengers)
    return { error: "자리가 없습니다" };

  const { error } = await supabase.from("carpool_members").insert({
    driver_id: driverId,
    passenger_id: userId,
  });

  if (error?.code === "23505") return { error: "이미 신청한 카풀입니다" };
  if (error) return { error: "신청 중 오류가 발생했습니다" };

  revalidatePath(`/events/${eventId}/carpool`);
  return { error: null };
}

// 탑승 신청 취소
export async function cancelRideAction(memberId: string, eventId: string) {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) redirect("/auth/login");

  const { error } = await supabase
    .from("carpool_members")
    .delete()
    .eq("id", memberId)
    .eq("passenger_id", claims.claims.sub);

  if (error) return { error: "취소 중 오류가 발생했습니다" };

  revalidatePath(`/events/${eventId}/carpool`);
  return { error: null };
}

// TASK-036: 카풀 배정 확정 (security definer RPC 호출)
export async function confirmCarpoolAction(driverId: string, eventId: string) {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) redirect("/auth/login");

  const { error } = await supabase.rpc("confirm_carpool_driver", {
    p_driver_id: driverId,
  });

  if (error) return { error: error.message ?? "확정 중 오류가 발생했습니다" };

  revalidatePath(`/events/${eventId}/carpool`);
  return { error: null };
}
