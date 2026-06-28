import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/profile-form";
import type { Profile } from "@/types/database";

export default async function ProfilePage() {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims) {
    redirect("/auth/login");
  }

  const userId = claimsData.claims.sub as string;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (profileError && profileError.code !== "PGRST116") {
    console.error("프로필 조회 오류:", profileError);
  }

  return (
    <div className="flex w-full flex-1 flex-col gap-12">
      <div className="flex flex-col items-start gap-2">
        <h2 className="mb-4 text-2xl font-bold">내 프로필</h2>
        <p className="text-sm text-muted-foreground">
          프로필 정보를 확인하고 수정할 수 있습니다.
        </p>
      </div>
      <ProfileForm initialProfile={profile as Profile | null} userId={userId} />
    </div>
  );
}
