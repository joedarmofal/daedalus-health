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
  title: "CAMTS Accreditation workspace",
};

export default async function AccreditationWorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  const access = await getAccreditationAccess();

  if (access.status === "unauthenticated") {
    redirect("/accreditation");
  }

  if (access.status === "need_password") {
    redirect("/auth/set-password");
  }

  const orgName =
    access.status === "ok" ? access.org.name : "Accreditation workspace";
  const email = access.user.email;
  const role = access.status === "ok" ? access.role : "member";

  return (
    <div className="flex min-h-full flex-col bg-[#F7F5F0]">
      <header className="sticky top-0 z-50 border-b border-[#1A2B3C]/10 bg-[#F9F8F3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link
            href="/accreditation/workspace"
            className="flex items-center gap-2.5 font-serif text-[15px] font-semibold tracking-[0.22em] text-[#1A2B3C]"
          >
            <span className="flex size-9 items-center justify-center text-[#1F6A64]">
              <CompassStar className="size-8" />
            </span>
            <span className="hidden sm:inline">DAEDALUS HEALTH</span>
            <span className="text-[#1A2B3C]/30">/</span>
            <span className="text-[#1F6A64]">ACCREDITATION</span>
          </Link>

          <div className="flex items-center gap-4">
            {access.status === "ok" ? (
              <Link
                href={`/${access.org.slug}`}
                className="hidden text-xs font-medium uppercase tracking-[0.12em] text-[#1A2B3C]/55 hover:text-[#1F6A64] sm:inline"
              >
                Client portal
              </Link>
            ) : null}
            <div className="text-right text-xs leading-tight">
              <div className="font-medium text-[#1A2B3C]">{email}</div>
              <div className="font-semibold uppercase tracking-[0.14em] text-[#1F6A64]">
                {orgName} · {role}
              </div>
            </div>
            <SignOutButton redirectTo="/accreditation" />
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
