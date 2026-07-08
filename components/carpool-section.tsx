"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  registerDriverAction,
  cancelDriverAction,
  requestRideAction,
  cancelRideAction,
  confirmCarpoolAction,
} from "@/app/events/[id]/carpool/actions";

type Member = { id: string; passenger_id: string; passenger_name: string };
type Driver = {
  id: string;
  driver_id: string;
  driver_name: string;
  departure: string;
  max_passengers: number;
  is_confirmed: boolean;
  members: Member[];
};

interface Props {
  eventId: string;
  initialDrivers: Driver[];
  userId: string | null;
  isHost: boolean;
  isAttending: boolean;
}

export function CarpoolSection({
  eventId,
  initialDrivers,
  userId,
  isHost,
  isAttending,
}: Props) {
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const supabase = useRef(createClient()).current;

  // 드라이버 목록 재조회 (profiles 별도 조회)
  const refetch = async () => {
    const { data: driversRaw } = await supabase
      .from("carpool_drivers")
      .select("id, driver_id, departure, max_passengers, is_confirmed")
      .eq("event_id", eventId)
      .order("created_at", { ascending: true });

    if (!driversRaw) return;

    const driversWithMembers = await Promise.all(
      driversRaw.map(async (d) => {
        const { data: members } = await supabase
          .from("carpool_members")
          .select("id, passenger_id")
          .eq("driver_id", d.id);
        return { driver: d, members: members ?? [] };
      })
    );

    const allUserIds = [
      ...driversRaw.map((d) => d.driver_id),
      ...driversWithMembers.flatMap(({ members }) =>
        members.map((m) => m.passenger_id)
      ),
    ];
    const uniqueIds = [...new Set(allUserIds)];
    const { data: profilesData } = uniqueIds.length
      ? await supabase
          .from("profiles")
          .select("id, full_name, username")
          .in("id", uniqueIds)
      : { data: [] };
    const profileMap = new Map((profilesData ?? []).map((p) => [p.id, p]));

    const getName = (uid: string) => {
      const p = profileMap.get(uid);
      return p?.full_name ?? p?.username ?? "참여자";
    };

    setDrivers(
      driversWithMembers.map(({ driver: d, members }) => ({
        id: d.id,
        driver_id: d.driver_id,
        driver_name: getName(d.driver_id),
        departure: d.departure,
        max_passengers: d.max_passengers,
        is_confirmed: d.is_confirmed,
        members: members.map((m) => ({
          id: m.id,
          passenger_id: m.passenger_id,
          passenger_name: getName(m.passenger_id),
        })),
      }))
    );
  };

  // TASK-037: Realtime 구독
  useEffect(() => {
    const channel = supabase
      .channel(`carpool:${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "carpool_drivers",
          filter: `event_id=eq.${eventId}`,
        },
        () => refetch()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "carpool_members" },
        () => refetch()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const myDriverRecord = drivers.find((d) => d.driver_id === userId);
  const myMemberRecord = drivers
    .flatMap((d) => d.members.map((m) => ({ ...m, driverId: d.id })))
    .find((m) => m.passenger_id === userId);

  const handleRegister = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await registerDriverAction(eventId, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        formRef.current?.reset();
        await refetch(); // 등록 직후 목록 즉시 반영
      }
    });
  };

  const handleCancelDriver = (driverId: string) => {
    startTransition(async () => {
      const result = await cancelDriverAction(driverId, eventId);
      if (result?.error) setError(result.error);
      else await refetch();
    });
  };

  const handleRequestRide = (driverId: string) => {
    setError(null);
    startTransition(async () => {
      const result = await requestRideAction(driverId, eventId);
      if (result?.error) setError(result.error);
      else await refetch();
    });
  };

  const handleCancelRide = (memberId: string) => {
    startTransition(async () => {
      const result = await cancelRideAction(memberId, eventId);
      if (result?.error) setError(result.error);
      else await refetch();
    });
  };

  const handleConfirm = (driverId: string) => {
    setError(null);
    startTransition(async () => {
      const result = await confirmCarpoolAction(driverId, eventId);
      if (result?.error) setError(result.error);
      else await refetch();
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {/* 드라이버 등록 폼 */}
      {userId && isAttending && !myDriverRecord && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">드라이버 등록</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              ref={formRef}
              action={handleRegister}
              className="flex flex-col gap-3"
            >
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="departure">출발지</Label>
                <Input
                  id="departure"
                  name="departure"
                  placeholder="예: 강남역 2번 출구"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="maxPassengers">최대 탑승 인원</Label>
                <Input
                  id="maxPassengers"
                  name="maxPassengers"
                  type="number"
                  min={1}
                  max={10}
                  placeholder="예: 3"
                  required
                />
              </div>
              <Button type="submit" variant="outline" disabled={isPending}>
                {isPending ? "등록 중…" : "드라이버 등록"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 드라이버 목록 */}
      {drivers.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          등록된 드라이버가 없습니다
        </p>
      ) : (
        drivers.map((driver) => {
          const remaining = driver.max_passengers - driver.members.length;
          const isMyDriver = driver.driver_id === userId;
          const myMemberInThis = driver.members.find(
            (m) => m.passenger_id === userId
          );

          return (
            <Card
              key={driver.id}
              className={
                driver.is_confirmed
                  ? "border-green-300 dark:border-green-700"
                  : ""
              }
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">
                    {driver.driver_name}
                    {isMyDriver && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        (나)
                      </span>
                    )}
                  </CardTitle>
                  <div className="flex gap-1">
                    {driver.is_confirmed && (
                      <Badge variant="secondary" className="text-green-700">
                        확정
                      </Badge>
                    )}
                    <Badge variant={remaining > 0 ? "outline" : "destructive"}>
                      {remaining > 0 ? `잔여 ${remaining}석` : "만석"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm">
                <p className="text-muted-foreground">📍 {driver.departure}</p>

                {driver.members.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {driver.members.map((m) => (
                      <Badge key={m.id} variant="secondary">
                        {m.passenger_name}
                        {m.passenger_id === userId && " (나)"}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  {/* 호스트: 배정 확정 버튼 */}
                  {isHost && !driver.is_confirmed && (
                    <Button
                      size="sm"
                      variant="default"
                      disabled={isPending}
                      onClick={() => handleConfirm(driver.id)}
                    >
                      배정 확정
                    </Button>
                  )}

                  {/* 본인 드라이버 취소 */}
                  {isMyDriver && !driver.is_confirmed && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isPending}
                      onClick={() => handleCancelDriver(driver.id)}
                    >
                      등록 취소
                    </Button>
                  )}

                  {/* 탑승 신청 / 취소 */}
                  {userId &&
                    !isMyDriver &&
                    !driver.is_confirmed &&
                    (myMemberInThis ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isPending}
                        onClick={() => handleCancelRide(myMemberInThis.id)}
                      >
                        신청 취소
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={
                          isPending || remaining === 0 || !!myMemberRecord
                        }
                        onClick={() => handleRequestRide(driver.id)}
                      >
                        {remaining === 0 ? "만석" : "탑승 신청"}
                      </Button>
                    ))}
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
