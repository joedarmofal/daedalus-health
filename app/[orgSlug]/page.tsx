import { CompassStar } from "@/components/compass-star";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TopographicPattern } from "@/components/topographic-pattern";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{
    orgSlug: string;
  }>;
}

export default async function OrgPortalPage({ params }: PageProps) {
  const { orgSlug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verify organization exists and this user is a member of it.
  const { data: org, error } = await supabase
    .from("organizations")
    .select("id, name, slug, organization_members!inner(role, user_id)")
    .eq("slug", orgSlug)
    .eq("organization_members.user_id", user.id)
    .single();

  if (error || !org) {
    return (
      <div className="flex min-h-full flex-col bg-[#F7F5F0]">
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
          <div className="w-full max-w-md rounded-sm border border-[#1A2B3C]/15 bg-[#F9F8F3] p-8 text-center shadow-[0_24px_60px_-36px_rgba(26,43,60,0.5)]">
            <div className="mx-auto mb-4 inline-flex size-12 items-center justify-center rounded-full border border-red-800/25 bg-red-50 text-red-700">
              ✕
            </div>
            <h1 className="font-serif text-xl font-medium text-[#1A2B3C]">
              Access Denied
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#1A2B3C]/70">
              You do not have permission to view{" "}
              <span className="font-mono text-[#1F6A64]">{orgSlug}</span> or
              this organization does not exist.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex text-sm font-medium text-[#1F6A64] hover:text-[#1A2B3C]"
            >
              Return to sign in
            </Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const memberRole = org.organization_members[0]?.role;

  return (
    <div className="flex min-h-full flex-col bg-[#F7F5F0]">
      <SiteHeader />
      <main className="relative flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
        <TopographicPattern
          tone="slate"
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]"
        />
        <section className="relative w-full max-w-lg rounded-sm border border-[#1A2B3C]/15 bg-[#F9F8F3] p-8 text-center shadow-[0_24px_60px_-36px_rgba(26,43,60,0.5)] sm:p-10">
          <CompassStar className="mx-auto size-12 text-[#1F6A64]" />
          <p className="mt-6 text-xs font-semibold tracking-[0.22em] text-[#1F6A64]">
            CLIENT PORTAL
          </p>
          <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight text-[#1A2B3C]">
            {org.name}
          </h1>
          <p className="mt-4 text-sm leading-7 text-[#1A2B3C]/70">
            Welcome back, {user.email}. Your executive workspace covers AI
            governance, clinical validation, and program transparency for{" "}
            {org.name}.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#C4A574]/50 bg-[#C4A574]/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-[#1A2B3C]/80">
            Role
            <span className="font-semibold text-[#1F6A64]">
              {memberRole}
            </span>
          </div>

          <div className="mt-8">
            <Link
              href={`/${org.slug}/dashboard`}
              className="inline-flex w-full items-center justify-center rounded-sm bg-[#1F6A64] px-6 py-3 text-sm font-medium tracking-wide text-[#F9F8F3] transition hover:bg-[#1A2B3C] hover:shadow-[inset_0_0_0_1px_#C4A574] sm:w-auto"
            >
              Enter Workspace
            </Link>
          </div>

          <Link
            href="/"
            className="mt-6 inline-flex text-sm font-medium text-[#1A2B3C]/60 hover:text-[#1F6A64]"
          >
            Return to Daedalus Health
          </Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
