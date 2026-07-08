"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { createEventSchema, type CreateEventInput } from "@/lib/schemas";
import { createEventAction } from "@/app/events/new/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function CreateEventForm() {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateEventInput>({
    resolver: zodResolver(createEventSchema),
  });

  const onSubmit = async (data: CreateEventInput) => {
    setServerError(null);
    try {
      await createEventAction(data);
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "오류가 발생했습니다"
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">이벤트 정보</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">제목 *</Label>
            <Input
              id="title"
              placeholder="예: 7월 수영 모임"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="event_date">날짜 및 시간 *</Label>
            <Input
              id="event_date"
              type="datetime-local"
              {...register("event_date")}
            />
            {errors.event_date && (
              <p className="text-xs text-destructive">
                {errors.event_date.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="location">장소</Label>
            <Input
              id="location"
              placeholder="예: 잠실 올림픽 수영장"
              {...register("location")}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">설명</Label>
            <Input
              id="description"
              placeholder="모임 안내 메시지를 입력하세요"
              {...register("description")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="capacity">정원</Label>
              <Input
                id="capacity"
                type="number"
                placeholder="예: 15"
                {...register("capacity", {
                  setValueAs: (v) => (v === "" ? undefined : parseInt(v, 10)),
                })}
              />
              {errors.capacity && (
                <p className="text-xs text-destructive">
                  {errors.capacity.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fee">참여비 (원)</Label>
              <Input
                id="fee"
                type="number"
                placeholder="예: 15000"
                {...register("fee", {
                  setValueAs: (v) => (v === "" ? undefined : parseInt(v, 10)),
                })}
              />
              {errors.fee && (
                <p className="text-xs text-destructive">{errors.fee.message}</p>
              )}
            </div>
          </div>

          {serverError && (
            <p className="text-sm text-destructive">{serverError}</p>
          )}

          <Button type="submit" className="mt-2 w-full" disabled={isSubmitting}>
            {isSubmitting ? "생성 중..." : "이벤트 생성"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
