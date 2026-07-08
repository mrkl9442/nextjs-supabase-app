import Link from "next/link";
import { Suspense } from "react";
import { AuthButton } from "@/components/auth-button";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-screen-md items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          모임
        </Link>
        <Suspense
          fallback={<div className="h-8 w-24 animate-pulse rounded bg-muted" />}
        >
          <AuthButton />
        </Suspense>
      </div>
    </header>
  );
}
