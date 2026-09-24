import { CompassStar } from "@/components/compass-star";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.22em] text-[#f4efe4]">
            <CompassStar className="size-4 text-emerald-400" />
            DAEDALUS HEALTH
          </div>
          <p className="mt-3 text-sm leading-6 text-stone-400">
            Independent AI leadership for health systems. Governance, safety, and
            clinical integration without vendor capture.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-stone-400">
          <Link href="/#services" className="hover:text-emerald-300">
            Services
          </Link>
          <Link href="/#governance" className="hover:text-emerald-300">
            AI Governance Framework
          </Link>
          <Link href="/#about" className="hover:text-emerald-300">
            About
          </Link>
          <Link href="/privacy" className="hover:text-emerald-300">
            Privacy Policy
          </Link>
          <Link href="/login" className="hover:text-emerald-300">
            Client Portal
          </Link>
        </div>
      </div>
      <div className="border-t border-slate-800">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-stone-500 sm:px-6">
          © {new Date().getFullYear()} Daedalus Health. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
