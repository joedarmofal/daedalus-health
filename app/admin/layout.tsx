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
        isAdmin ? "bg-[#1A2B3C]" : "bg-[#1A2B3C] text-[#F9F8F3]"
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
      <header className="sticky top-0 z-50 border-b border-[#C4A574]/40 bg-[#F9F8F3] text-[#1A2B3C]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link
            href="/admin"
            className="flex items-center gap-2.5 font-serif text-[15px] font-semibold tracking-[0.22em] text-[#1A2B3C]"
          >
            <span className="flex size-9 items-center justify-center text-[#C4A574]">
              <CompassStar className="size-8" />
            </span>
            <span>DAEDALUS HEALTH</span>
            <span className="text-[#C4A574]/50">/</span>
            <span className="text-[#C4A574]">ADMIN</span>
          </Link>

          {isAdmin ? (
            <div className="flex items-center gap-5">
              <nav className="hidden items-center gap-5 text-[13px] font-medium tracking-[0.12em] text-[#1A2B3C]/72 sm:flex">
                <Link href="/admin" className="transition hover:text-[#C4A574]">
                  Mission Control
                </Link>
                <Link
                  href="/admin/quote"
                  className="transition hover:text-[#C4A574]"
                >
                  Quotes
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
                  href="/admin/demo-users"
                  className="transition hover:text-[#C4A574]"
                >
                  Demo Access
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
                className="rounded-sm border border-[#C4A574] px-3 py-1.5 text-xs font-medium uppercase tracking-[0.12em] text-[#C4A574] transition hover:bg-[#C4A574] hover:text-[#1A2B3C]"
              >
                Public site
              </Link>
              <span className="text-sm text-[#1A2B3C]/70">
                {access.user.email}
              </span>
              <SignOutButton
                redirectTo="/admin"
                className="text-sm font-medium text-[#1A2B3C]/65 transition hover:text-[#C4A574] disabled:opacity-60"
              />
            </div>
          ) : (
            <Link
              href="/"
              className="rounded-sm border border-[#C4A574] px-3 py-1.5 text-xs font-medium uppercase tracking-[0.12em] text-[#C4A574] transition hover:bg-[#C4A574] hover:text-[#1A2B3C]"
            >
              Public site
            </Link>
          )}
        </div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col">{children}</main>

      <footer
        className={`relative z-10 border-t px-4 py-4 text-center text-xs tracking-wide ${
          isAdmin
            ? "border-[#C4A574]/15 text-[#F9F8F3]/45"
            : "border-[#C4A574]/15 text-[#F9F8F3]/40"
        }`}
      >
        <Link
          href="/"
          className={
            "transition hover:text-[#C4A574]"
          }
        >
          Daedalus Health
        </Link>
        {" · Mission Control"}
      </footer>
    </div>
  );
}
