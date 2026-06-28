"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import type { Profile, ProfileUpdate } from "@/types/database";

interface ProfileFormProps {
  initialProfile: Profile | null;
  userId: string;
  className?: string;
}

export function ProfileForm({
  initialProfile,
  userId,
  className,
}: ProfileFormProps) {
  const [username, setUsername] = useState(initialProfile?.username ?? "");
  const [fullName, setFullName] = useState(initialProfile?.full_name ?? "");
  const [website, setWebsite] = useState(initialProfile?.website ?? "");
  const [bio, setBio] = useState(initialProfile?.bio ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const updates: ProfileUpdate = {
      username: username || null,
      full_name: fullName || null,
      website: website || null,
      bio: bio || null,
      avatar_url: initialProfile?.avatar_url ?? null,
    };

    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: userId, ...updates });

      if (error) throw error;
      setSuccess(true);
    } catch (err: unknown) {
      if (
        err instanceof Object &&
        "message" in err &&
        typeof (err as { message: unknown }).message === "string"
      ) {
        const message = (err as { message: string }).message;
        if (message.includes("profiles_username_key")) {
          setError("이미 사용 중인 사용자명입니다.");
        } else {
          setError(message);
        }
      } else {
        setError("프로필 저장 중 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">프로필 수정</CardTitle>
          <CardDescription>공개 프로필 정보를 업데이트하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="username">사용자명</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="your_username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="full_name">이름</Label>
                <Input
                  id="full_name"
                  type="text"
                  placeholder="홍길동"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="website">웹사이트</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://example.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bio">소개</Label>
                <Input
                  id="bio"
                  type="text"
                  placeholder="간단한 자기소개를 입력하세요"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
              {success && (
                <p className="text-sm text-green-600">
                  프로필이 성공적으로 저장되었습니다.
                </p>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "저장 중..." : "저장"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
