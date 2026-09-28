import { getAdminAccess } from "@/lib/admin-access";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DemoUserForm } from "./demo-user-form";

export const metadata: Metadata = {
  title: "Admin · Demo access",
};

export default async function AdminDemoUsersPage() {
  const access = await getAdminAccess();
  if (access.status !== "ok") {
    redirect("/admin");
  }

  const supabase = await createClient();
  const { data: orgs } = await supabase
    .from("organizations")
    .select("id, name, slug")
    .order("name", { ascending: true });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#1F6A64]">
        Mission Control
      </span>
      <h1 className="mt-2 font-serif text-3xl font-medium text-[#1A2B3C]">
        Demo access
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#1A2B3C]/70">
        Manually add a user with a username and password so someone can walk
        the live site. They can use the client portal or Emergency Services
        login with those credentials.
      </p>

      <div className="mt-8">
        <DemoUserForm organizations={orgs ?? []} />
      </div>
    </div>
  );
}
