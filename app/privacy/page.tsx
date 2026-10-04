import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-full flex-col bg-[#1A2B3C]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6">
        <p className="text-xs font-semibold tracking-[0.28em] text-[#C4A574]">
          LEGAL
        </p>
        <h1 className="mt-3 font-serif text-3xl font-medium tracking-tight text-[#F9F8F3]">
          Privacy Policy
        </h1>
        <p className="mt-5 text-sm leading-7 text-[#F9F8F3]/70">
          Daedalus Health collects only the information required to operate the
          partner portal, schedule briefings, and deliver advisory services. We
          do not sell personal data. This product does not create, receive,
          maintain, or transmit PHI — do not upload patient information to the
          site. Portal authentication is handled by Supabase. For privacy
          inquiries, contact privacy@daedalus.health. Security and IT review
          materials are on the{" "}
          <Link href="/trust" className="text-[#C4A574] hover:text-[#F9F8F3]">
            Trust Center
          </Link>
          .
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
