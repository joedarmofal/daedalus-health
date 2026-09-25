import { CompassStar } from "@/components/compass-star";
import { PortalNav } from "@/components/portal-nav";
import { SignOutButton } from "@/components/sign-out-button";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getOrgAccess } from "@/lib/org-access";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ orgSlug: string }>;
}

export default async function OrgLayout({ children, params }: LayoutProps) {
  const { orgSlug } = await params;
  const access = await getOrgAccess(orgSlug);

  if (access.status === "unauthenticated") {
    redirect("/login");
  }

  if (access.status === "denied") {
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

  const { org, role, user } = access;

  return (
    <div className="flex min-h-full flex-col bg-[#F7F5F0]">
      <header className="sticky top-0 z-50 border-b border-[#1A2B3C]/10 bg-[#F9F8F3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link
            href={`/${org.slug}`}
            className="flex items-center gap-2.5 font-serif text-[15px] font-semibold tracking-[0.22em] text-[#1A2B3C]"
          >
            <span className="flex size-9 items-center justify-center text-[#1F6A64]">
              <CompassStar className="size-8" />
            </span>
            <span className="hidden sm:inline">DAEDALUS HEALTH</span>
            <span className="text-[#1A2B3C]/30">/</span>
            <span className="text-[#1F6A64]">{org.name}</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="text-right text-xs leading-tight">
              <div className="font-medium text-[#1A2B3C]">{user.email}</div>
              <div className="font-semibold uppercase tracking-[0.14em] text-[#1F6A64]">
                {role}
              </div>
            </div>
            <SignOutButton />
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-3 sm:px-6">
          <PortalNav orgSlug={org.slug} />
        </div>
      </header>

      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
