"use client";

import { CompassStar } from "@/components/compass-star";
import { createClient } from "@/utils/supabase/client";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const navLinks = [
  { href: "/#services", label: "Services" },
  { href: "/#governance", label: "AI Governance Framework" },
  { href: "/#about", label: "About" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      if (!cancelled) {
        setIsSuperAdmin(data.user?.app_metadata?.is_super_admin === true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-[#1A2B3C]/10 bg-[#F9F8F3]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-serif text-[15px] font-semibold tracking-[0.28em] text-[#1A2B3C]"
        >
          <span className="flex size-9 items-center justify-center text-[#1F6A64]">
            <CompassStar className="size-8" />
          </span>
          DAEDALUS HEALTH
        </Link>

        <nav className="hidden items-center gap-8 text-sm tracking-wide text-[#1A2B3C]/75 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-[#1F6A64]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isSuperAdmin ? (
            <Link
              href="/admin/organizations"
              className="rounded-full border border-[#C4A574]/50 bg-[#C4A574]/10 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.12em] text-[#8a6d3d] transition hover:border-[#C4A574] hover:bg-[#C4A574]/20"
            >
              Admin
            </Link>
          ) : null}
          <Link
            href="/login"
            className="inline-flex items-center rounded-sm bg-[#1F6A64] px-4 py-2 text-sm font-medium tracking-wide text-[#F9F8F3] transition hover:bg-[#1A2B3C] hover:shadow-[inset_0_0_0_1px_#C4A574]"
          >
            Client Login
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-sm border border-[#1A2B3C]/20 text-[#1A2B3C] md:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-[#1A2B3C]/10 px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3 text-sm text-[#1A2B3C]/80">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-sm px-2 py-2 hover:bg-[#1A2B3C]/5 hover:text-[#1F6A64]"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {isSuperAdmin ? (
              <Link
                href="/admin/organizations"
                className="rounded-sm px-2 py-2 text-[#8a6d3d] hover:bg-[#C4A574]/10"
                onClick={() => setOpen(false)}
              >
                Admin
              </Link>
            ) : null}
            <Link
              href="/login"
              className="mt-2 inline-flex items-center justify-center rounded-sm bg-[#1F6A64] px-4 py-2.5 font-medium text-[#F9F8F3] hover:bg-[#1A2B3C] hover:shadow-[inset_0_0_0_1px_#C4A574]"
              onClick={() => setOpen(false)}
            >
              Client Login
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
