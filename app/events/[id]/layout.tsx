import Link from "next/link";
import { DUMMY_EVENT } from "@/lib/fixtures";

interface Props {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function EventLayout({ children, params }: Props) {
  const { id } = await params;
  const event = { ...DUMMY_EVENT, id };

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
          <p className="mb-3 text-sm font-semibold text-muted-foreground">
            {event.title}
          </p>
          <nav className="flex gap-1">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className="rounded-t-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      {children}
    </div>
  );
}
