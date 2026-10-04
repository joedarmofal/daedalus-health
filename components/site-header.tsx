"use client";

import { CompassStar } from "@/components/compass-star";
import { createClient } from "@/utils/supabase/client";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const navLinks = [
  { href: "/#services", label: "Advisory" },
  { href: "/#governance", label: "Governance" },
  { href: "/emergency-services", label: "Emergency Services" },
  { href: "/#about", label: "About" },
  { href: "/trust", label: "Trust" },
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
    <header className="sticky top-0 z-50 border-b border-[#C4A574]/40 bg-[#F9F8F3]/97 text-[#1A2B3C] backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-serif text-[15px] font-semibold tracking-[0.2em] text-[#1A2B3C]"
        >
          <span className="flex size-9 items-center justify-center text-[#C4A574]">
            <CompassStar className="size-8" />
          </span>
          DAEDALUS HEALTH
        </Link>

        <nav className="hidden items-center gap-8 text-[13px] font-medium tracking-[0.16em] text-[#1A2B3C]/72 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="uppercase transition-colors hover:text-[#C4A574]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isSuperAdmin ? (
            <Link
              href="/admin"
              className="rounded-full border border-[#C4A574]/50 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.12em] text-[#C4A574] transition hover:border-[#C4A574] hover:bg-[#C4A574]/10"
            >
              Admin
            </Link>
          ) : null}
          <Link
            href="/login"
            className="inline-flex items-center rounded-sm border border-[#C4A574] px-4 py-2 text-sm font-medium tracking-wide text-[#C4A574] transition duration-200 ease-out hover:bg-[#C4A574] hover:text-[#1A2B3C]"
          >
            Partner Access
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-sm border border-[#C4A574]/45 text-[#1A2B3C] md:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-[#C4A574]/30 px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1 text-[13px] font-medium tracking-[0.16em] text-[#1A2B3C]/80">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-sm px-2 py-2 uppercase hover:bg-[#C4A574]/10 hover:text-[#C4A574]"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {isSuperAdmin ? (
              <Link
                href="/admin"
                className="rounded-sm px-2 py-2 uppercase text-[#C4A574] hover:bg-[#C4A574]/10"
                onClick={() => setOpen(false)}
              >
                Admin
              </Link>
            ) : null}
            <Link
              href="/login"
              className="mt-2 inline-flex items-center justify-center rounded-sm border border-[#C4A574] px-4 py-2.5 font-medium tracking-wide text-[#C4A574] transition duration-200 ease-out hover:bg-[#C4A574] hover:text-[#1A2B3C]"
              onClick={() => setOpen(false)}
            >
              Partner Access
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
