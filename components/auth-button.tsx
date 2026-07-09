import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";
import { getUserRole, isAdmin } from "@/lib/admin/is-admin";

export async function AuthButton() {
  const supabase = await createClient();

  // You can also use getUser() which will be slower.
  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;

  if (!user) {
    return (
      <div className="flex gap-2">
        <Button asChild size="sm" variant={"outline"}>
          <Link href="/auth/login">로그인</Link>
        </Button>
        <Button asChild size="sm" variant={"default"}>
          <Link href="/auth/sign-up">회원가입</Link>
        </Button>
      </div>
    );
  }

  const role = await getUserRole(supabase, user.sub);

  return (
    <div className="flex items-center gap-4">
      Hey, {user.email}!
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/protected/profile">프로필</Link>
      </Button>
      {isAdmin(role) && (
        <Button asChild size="sm" variant={"outline"}>
          <Link href="/admin">관리자</Link>
        </Button>
      )}
      <LogoutButton />
    </div>
  );
}
