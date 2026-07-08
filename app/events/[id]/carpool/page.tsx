import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CarpoolSection } from "@/components/carpool-section";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CarpoolPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) redirect("/auth/login");

  const userId = claims.claims.sub;

  const { data: event } = await supabase
    .from("events")
    .select("id, title, host_id")
    .eq("id", id)
    .single();

  if (!event) redirect(`/events/${id}`);

  const isHost = event.host_id === userId;

  const { data: attendance } = await supabase
    .from("attendances")
    .select("id")
    .eq("event_id", id)
    .eq("user_id", userId)
    .eq("status", "attending")
    .maybeSingle();

  const isAttending = isHost || !!attendance;

  const { data: driversRaw } = await supabase
    .from("carpool_drivers")
    .select("id, driver_id, departure, max_passengers, is_confirmed")
    .eq("event_id", id)
    .order("created_at", { ascending: true });

  // 드라이버별 탑승자 조회 + 전체 user_id 수집
  const driversWithMembers = await Promise.all(
    (driversRaw ?? []).map(async (d) => {
      const { data: members } = await supabase
        .from("carpool_members")
        .select("id, passenger_id")
        .eq("driver_id", d.id);
      return { driver: d, members: members ?? [] };
    })
  );

  // 관련 user_id 일괄 수집 후 profiles 한 번에 조회
  const allUserIds = [
    ...(driversRaw ?? []).map((d) => d.driver_id),
    ...driversWithMembers.flatMap(({ members }) =>
      members.map((m) => m.passenger_id)
    ),
  ];
  const uniqueUserIds = [...new Set(allUserIds)];
  const { data: profilesData } = uniqueUserIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name, username")
        .in("id", uniqueUserIds)
    : { data: [] };
  const profileMap = new Map((profilesData ?? []).map((p) => [p.id, p]));

  const getName = (userId: string) => {
    const p = profileMap.get(userId);
    return p?.full_name ?? p?.username ?? "참여자";
  };

  const drivers = driversWithMembers.map(({ driver: d, members }) => ({
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
  }));

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-1 text-xl font-bold">카풀</h1>
      <p className="mb-6 text-sm text-muted-foreground">{event.title}</p>

      <CarpoolSection
        eventId={id}
        initialDrivers={drivers}
        userId={userId}
        isHost={isHost}
        isAttending={isAttending}
      />
    </div>
  );
}
