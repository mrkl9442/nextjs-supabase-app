"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { createEventSchema, type CreateEventInput } from "@/lib/schemas";
import { updateEventAction } from "@/app/events/[id]/edit/actions";
import { createClient } from "@/lib/supabase/client";
import { uploadCoverImage, deleteCoverImage } from "@/lib/events/cover-image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Event } from "@/types";

function toDatetimeLocal(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

interface EditEventFormProps {
  event: Event;
}

export function EditEventForm({ event }: EditEventFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    event.cover_image_url
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateEventInput>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: event.title,
      event_date: toDatetimeLocal(event.event_date),
      location: event.location ?? undefined,
      description: event.description ?? undefined,
      capacity: event.capacity ?? undefined,
      fee: event.fee ?? undefined,
      cover_image_url: event.cover_image_url ?? undefined,
    },
  });

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setCoverImageFile(file);

    if (!file) {
      setCoverImagePreview(event.cover_image_url);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setCoverImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: CreateEventInput) => {
    setServerError(null);
    try {
      let cover_image_url = event.cover_image_url ?? undefined;
      if (coverImageFile) {
        const supabase = createClient();
        const { data: claims } = await supabase.auth.getClaims();
        if (!claims?.claims) throw new Error("로그인이 필요합니다");
        cover_image_url = await uploadCoverImage(
          supabase,
          claims.claims.sub,
          coverImageFile
        );
        if (event.cover_image_url) {
          try {
            await deleteCoverImage(supabase, event.cover_image_url);
          } catch {
            // 이전 파일 삭제 실패는 무시 (orphan 방지가 목적이지 필수 요구사항은 아님)
          }
        }
      }
      await updateEventAction(event.id, { ...data, cover_image_url });
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
            <Label htmlFor="cover_image">대표 이미지</Label>
            {coverImagePreview && (
              // eslint-disable-next-line @next/next/no-img-element -- 로컬 파일 미리보기용 data URL 또는 기존 이미지 URL이라 next/image 최적화 대상이 아님
              <img
                src={coverImagePreview}
                alt="대표 이미지 미리보기"
                className="mb-2 h-40 w-full rounded-md object-cover"
              />
            )}
            <Input
              id="cover_image"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleCoverImageChange}
            />
          </div>

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
            {isSubmitting ? "수정 중..." : "수정하기"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
