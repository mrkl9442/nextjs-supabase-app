import { createClient } from "@/lib/supabase/server";
import { EventTabs } from "@/components/event-tabs";

interface Props {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function EventLayout({ children, params }: Props) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: event } = await supabase
    .from("events")
    .select("title")
    .eq("id", id)
    .maybeSingle();

  const tabs = [
    { href: `/events/${id}`, label: "상세" },
    { href: `/events/${id}/manage`, label: "관리" },
    { href: `/events/${id}/settlement`, label: "정산" },
    { href: `/events/${id}/carpool`, label: "카풀" },
  ];

  return (
    <div>
      <div className="border-b bg-muted/40">
        <div className="mx-auto max-w-screen-md px-4 pt-4">
          {event && (
            <p className="mb-3 truncate text-sm font-semibold text-muted-foreground">
              {event.title}
            </p>
          )}
          <EventTabs tabs={tabs} />
        </div>
      </div>
      {children}
    </div>
  );
}
