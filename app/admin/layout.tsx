import { CompassStar } from "@/components/compass-star";
import { SignOutButton } from "@/components/sign-out-button";
import { TopographicPattern } from "@/components/topographic-pattern";
import { getAdminAccess } from "@/lib/admin-access";
import Link from "next/link";
import type { ReactNode } from "react";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const access = await getAdminAccess();
  const isAdmin = access.status === "ok";

  return (
    <div
      className={`relative flex min-h-screen flex-col ${
        isAdmin ? "bg-[#F7F5F0]" : "bg-[#1A2B3C] text-[#F9F8F3]"
      }`}
    >
      {isAdmin ? (
        <TopographicPattern
          tone="gold"
          className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-[0.14]"
        />
      ) : (
        <style>{`html, body { background: #1A2B3C; }`}</style>
      )}
      <header
        className={`sticky top-0 z-50 border-b ${
          isAdmin
            ? "border-[#C4A574]/25 bg-[#1A2B3C] text-[#F9F8F3]"
            : "border-[#C4A574]/20 bg-[#1A2B3C]"
        }`}
      >
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link
            href="/admin"
            className="flex items-center gap-2.5 font-serif text-[15px] font-semibold tracking-[0.22em]"
          >
            <span className="flex size-9 items-center justify-center text-[#C4A574]">
              <CompassStar className="size-8" />
            </span>
            <span>DAEDALUS HEALTH</span>
            <span className="text-[#F9F8F3]/30">/</span>
            <span className="text-[#C4A574]">ADMIN</span>
          </Link>

          {isAdmin ? (
            <div className="flex items-center gap-5">
              <nav className="hidden items-center gap-5 text-sm text-[#F9F8F3]/70 sm:flex">
                <Link href="/admin" className="transition hover:text-[#C4A574]">
                  Mission Control
                </Link>
                <Link
                  href="/admin/proforma"
                  className="transition hover:text-[#C4A574]"
                >
                  Proforma
                </Link>
                <Link
                  href="/admin/organizations"
                  className="transition hover:text-[#C4A574]"
                >
                  Organizations
                </Link>
                <Link
                  href="/admin/vendors"
                  className="transition hover:text-[#C4A574]"
                >
                  Vendors
                </Link>
              </nav>
              <Link
                href="/"
                className="rounded-sm border border-[#C4A574]/50 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.12em] text-[#C4A574] transition hover:border-[#C4A574] hover:bg-[#C4A574]/10"
              >
                Landing page
              </Link>
              <span className="text-sm text-[#F9F8F3]/70">
                {access.user.email}
              </span>
              <SignOutButton
                redirectTo="/admin"
                className="text-sm font-medium text-[#F9F8F3]/60 transition hover:text-[#C4A574] disabled:opacity-60"
              />
            </div>
          ) : (
            <Link
              href="/"
              className="rounded-sm border border-[#C4A574]/50 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.12em] text-[#C4A574] transition hover:border-[#C4A574] hover:bg-[#C4A574]/10"
            >
              Landing page
            </Link>
          )}
        </div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col">{children}</main>

      <footer
        className={`relative z-10 border-t px-4 py-4 text-center text-xs tracking-wide ${
          isAdmin
            ? "border-[#1A2B3C]/10 text-[#1A2B3C]/45"
            : "border-[#C4A574]/15 text-[#F9F8F3]/40"
        }`}
      >
        <Link
          href="/"
          className={
            isAdmin ? "transition hover:text-[#1A2B3C]" : "transition hover:text-[#C4A574]"
          }
        >
          Daedalus Health
        </Link>
        {" · Mission Control"}
      </footer>
    </div>
  );
}
