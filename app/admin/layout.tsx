import { redirect } from "next/navigation";
import { AdminNav } from "@/components/layout/admin-nav";
import { createClient } from "@/lib/supabase/server";
import { getUserRole, isAdmin } from "@/lib/admin/is-admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/auth/login");

  const role = await getUserRole(supabase, data.claims.sub);
  if (!isAdmin(role)) redirect("/dashboard");

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 md:flex-row">
      <AdminNav />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
