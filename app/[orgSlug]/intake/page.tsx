import { getOrgAccess } from "@/lib/org-access";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { IntakeForm, type IntakeFormData } from "./intake-form";

export const metadata: Metadata = {
  title: "Organization Setup",
};

interface PageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function IntakePage({ params }: PageProps) {
  const { orgSlug } = await params;
  const access = await getOrgAccess(orgSlug);

  if (access.status !== "ok") {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("organization_intake")
    .select(
      "health_system_type, org_size, ehr_vendor, primary_use_cases, governance_maturity, primary_contact_name, primary_contact_title, primary_contact_email, primary_contact_phone, additional_stakeholders, notes",
    )
    .eq("organization_id", access.org.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#1F6A64]">
        Organization Setup
      </span>
      <h1 className="mt-2 font-serif text-3xl font-medium text-[#1A2B3C]">
        Tell us about {access.org.name}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#1A2B3C]/70">
        A few details to set up your governance program correctly — takes
        about three minutes. You can come back and update this later.
      </p>

      <div className="mt-8">
        <IntakeForm
          orgSlug={access.org.slug}
          initialData={(existing as IntakeFormData | null) ?? null}
        />
      </div>
    </div>
  );
}
