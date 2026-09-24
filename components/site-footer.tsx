import { CompassStar } from "@/components/compass-star";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#1A2B3C]/15 bg-[#F9F8F3]">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <div className="flex items-center gap-2 font-serif text-sm font-semibold tracking-[0.28em] text-[#1A2B3C]">
            <CompassStar className="size-5 text-[#1F6A64]" />
            DAEDALUS HEALTH
          </div>
          <p className="mt-3 text-sm leading-6 text-[#1A2B3C]/70">
            Independent AI leadership for health systems. Governance, safety,
            and clinical integration that keeps human judgment at the
            controls—without vendor capture.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-[#1A2B3C]/70">
          <Link href="/#services" className="hover:text-[#1F6A64]">
            Services
          </Link>
          <Link href="/#governance" className="hover:text-[#1F6A64]">
            AI Governance Framework
          </Link>
          <Link href="/#about" className="hover:text-[#1F6A64]">
            About
          </Link>
          <Link href="/privacy" className="hover:text-[#1F6A64]">
            Privacy Policy
          </Link>
          <Link href="/login" className="hover:text-[#1F6A64]">
            Client Portal
          </Link>
        </div>
      </div>
      <div className="border-t border-[#1A2B3C]/10">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs tracking-wide text-[#1A2B3C]/50 sm:px-6">
          © {new Date().getFullYear()} Daedalus Health. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
