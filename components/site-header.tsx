"use client";

import { CompassStar } from "@/components/compass-star";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { href: "/#services", label: "Services" },
  { href: "/#governance", label: "AI Governance Framework" },
  { href: "/#about", label: "About" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-[13px] font-semibold tracking-[0.22em] text-[#f4efe4]"
        >
          <span className="flex size-9 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10 text-emerald-300">
            <CompassStar className="size-4" />
          </span>
          DAEDALUS HEALTH
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-stone-300 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-emerald-300"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link
            href="/login"
            className="inline-flex items-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-[0_0_24px_rgba(16,185,129,0.25)] transition hover:brightness-110"
          >
            Client Login
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-lg border border-slate-800 text-stone-200 md:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-slate-800 px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3 text-sm text-stone-300">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-2 py-2 hover:bg-slate-900 hover:text-emerald-300"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="mt-2 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 px-4 py-2.5 font-semibold text-slate-950"
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
