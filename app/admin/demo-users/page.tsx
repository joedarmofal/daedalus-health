import { getAdminAccess } from "@/lib/admin-access";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  ensureTestDemoOrganizations,
  repairDemoMembershipsFromMetadata,
} from "./actions";
import { DemoUserForm } from "./demo-user-form";

export const metadata: Metadata = {
  title: "Admin · Demo access",
};

export default async function AdminDemoUsersPage() {
  const access = await getAdminAccess();
  if (access.status !== "ok") {
    redirect("/admin");
  }

  try {
    const admin = createAdminClient();
    await ensureTestDemoOrganizations(admin, access.user.id);
    await repairDemoMembershipsFromMetadata(admin);
  } catch {
    // Demo sandbox seed is best-effort; the form still works.
  }

  const supabase = await createClient();
  const { data: orgs } = await supabase
    .from("organizations")
    .select("id, name, slug")
    .order("name", { ascending: true });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C4A574]">
        Mission Control
      </span>
      <h1 className="mt-2 font-serif text-3xl font-medium text-[#F9F8F3]">
        Demo access
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#F9F8F3]/70">
        Issue a username and password for a walkthrough, or attach an existing
        demo login to another test organization. They can use the partner
        portal or Emergency Services with those credentials.
      </p>

      <div className="mt-8">
        <DemoUserForm organizations={orgs ?? []} />
      </div>
    </div>
  );
}
