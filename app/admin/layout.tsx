import { CompassStar } from "@/components/compass-star";
import { SignOutButton } from "@/components/sign-out-button";
import { SiteFooter } from "@/components/site-footer";
import { getAdminAccess } from "@/lib/admin-access";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const access = await getAdminAccess();

  if (access.status === "unauthenticated") {
    redirect("/login");
  }

  if (access.status === "forbidden") {
    redirect("/");
  }

  return (
    <div className="flex min-h-full flex-col bg-[#F7F5F0]">
      <header className="sticky top-0 z-50 border-b border-[#C4A574]/25 bg-[#1A2B3C] text-[#F9F8F3]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link
            href="/admin/organizations"
            className="flex items-center gap-2.5 font-serif text-[15px] font-semibold tracking-[0.22em]"
          >
            <span className="flex size-9 items-center justify-center text-[#C4A574]">
              <CompassStar className="size-8" />
            </span>
            <span className="hidden sm:inline">DAEDALUS HEALTH</span>
            <span className="text-[#F9F8F3]/30">/</span>
            <span className="text-[#C4A574]">ADMIN</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-sm text-[#F9F8F3]/70">{access.user.email}</span>
            <SignOutButton className="text-sm font-medium text-[#F9F8F3]/60 transition hover:text-[#C4A574] disabled:opacity-60" />
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
