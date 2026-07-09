import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/server";
import { suspendUserAction } from "./actions";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function AdminUsersPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select("id, full_name, username, role, is_suspended, created_at")
    .order("created_at", { ascending: false });

  if (q?.trim()) {
    const keyword = q.trim();
    query = query.or(
      `full_name.ilike.%${keyword}%,username.ilike.%${keyword}%`
    );
  }

  const { data: users } = await query;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">사용자 관리</h1>

      <form className="flex gap-2">
        <Input
          name="q"
          placeholder="이름 또는 사용자명 검색"
          defaultValue={q ?? ""}
        />
        <Button type="submit" variant="outline">
          검색
        </Button>
      </form>

      {!users || users.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          검색 결과가 없습니다
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {users.map((user) => (
            <Card key={user.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {(user.full_name ?? user.username ?? "?").at(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {user.full_name ?? "이름 없음"}
                      </p>
                      {user.role === "admin" && (
                        <Badge variant="secondary">관리자</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      @{user.username ?? "미설정"} · 가입일{" "}
                      {new Date(user.created_at).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={user.is_suspended ? "destructive" : "outline"}
                  >
                    {user.is_suspended ? "정지됨" : "정상"}
                  </Badge>
                  {user.role !== "admin" && (
                    <form
                      action={suspendUserAction.bind(
                        null,
                        user.id,
                        !user.is_suspended
                      )}
                    >
                      <Button variant="outline" size="sm" type="submit">
                        {user.is_suspended ? "정지 해제" : "정지"}
                      </Button>
                    </form>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
