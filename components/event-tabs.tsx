"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Tab {
  href: string;
  label: string;
}

export function EventTabs({ tabs }: { tabs: Tab[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="이벤트 메뉴" className="flex gap-1">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className="rounded-t-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground aria-[current=page]:bg-background aria-[current=page]:font-semibold aria-[current=page]:text-foreground"
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
