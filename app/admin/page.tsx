import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const now = new Date().toISOString();
  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000
  ).toISOString();

  const [
    { count: totalUsers },
    { count: activeEvents },
    { count: newSignups },
    { data: recentEvents },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .gte("event_date", now),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo),
    supabase
      .from("events")
      .select("id, title, host_id, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const hostIds = [...new Set((recentEvents ?? []).map((e) => e.host_id))];
  const { data: hostProfiles } = hostIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name, username")
        .in("id", hostIds)
    : { data: [] };
  const hostMap = new Map((hostProfiles ?? []).map((p) => [p.id, p]));

  const stats = [
    { label: "총 가입자 수", value: totalUsers ?? 0 },
    { label: "활성 이벤트 수", value: activeEvents ?? 0 },
    { label: "이번 주 신규 가입", value: newSignups ?? 0 },
  ];

  const recentActivity = (recentEvents ?? []).map((event) => {
    const host = hostMap.get(event.host_id);
    return {
      label: "새 이벤트 생성",
      detail: `${event.title} (${host?.full_name ?? host?.username ?? "알 수 없음"})`,
      time: timeAgo(event.created_at),
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">관리자 대시보드</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">최근 활동</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          {recentActivity.length === 0 ? (
            <p className="text-muted-foreground">최근 활동이 없습니다</p>
          ) : (
            recentActivity.map((activity, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{activity.label}</p>
                  <p className="text-muted-foreground">{activity.detail}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {activity.time}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
