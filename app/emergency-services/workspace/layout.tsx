import type { Metadata } from "next";
import { CompassStar } from "@/components/compass-star";
import { SignOutButton } from "@/components/sign-out-button";
import { SiteFooter } from "@/components/site-footer";
import { getAccreditationAccess } from "@/lib/accreditation-access";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AccreditationNav } from "./accreditation-nav";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Emergency Services workspace",
};

export default async function AccreditationWorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  const access = await getAccreditationAccess();

  if (access.status === "unauthenticated") {
    redirect("/emergency-services");
  }

  if (access.status === "need_password") {
    redirect("/auth/set-password");
  }

  const orgName =
    access.status === "ok" ? access.org.name : "Emergency services workspace";
  const email = access.user.email;
  const role = access.status === "ok" ? access.role : "member";

  return (
    <div className="flex min-h-full flex-col bg-[#1A2B3C]">
      <header className="sticky top-0 z-50 border-b border-[#C4A574]/20 bg-[#1A2B3C]/95 text-[#F9F8F3] backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link
            href="/emergency-services/workspace"
            className="flex items-center gap-2.5 font-serif text-[15px] font-semibold tracking-[0.22em] text-[#F9F8F3]"
          >
            <span className="flex size-9 items-center justify-center text-[#C4A574]">
              <CompassStar className="size-8" />
            </span>
            <span className="hidden sm:inline">DAEDALUS HEALTH</span>
            <span className="text-[#F9F8F3]/30">/</span>
            <span className="text-[#C4A574]">EMERGENCY SERVICES</span>
          </Link>

          <div className="flex items-center gap-4">
            {access.status === "ok" ? (
              <Link
                href={`/${access.org.slug}`}
                className="hidden text-xs font-medium uppercase tracking-[0.12em] text-[#F9F8F3]/55 hover:text-[#C4A574] sm:inline"
              >
                Partner portal
              </Link>
            ) : null}
            <div className="text-right text-xs leading-tight">
              <div className="font-medium text-[#F9F8F3]">{email}</div>
              <div className="font-semibold uppercase tracking-[0.14em] text-[#C4A574]">
                {orgName} · {role}
              </div>
            </div>
            <SignOutButton
              redirectTo="/emergency-services"
              className="text-sm font-medium text-[#F9F8F3]/60 transition hover:text-[#C4A574] disabled:opacity-60"
            />
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-3 sm:px-6">
          <AccreditationNav />
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
