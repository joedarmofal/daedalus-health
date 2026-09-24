import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-full flex-col bg-[#F7F5F0]">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6">
        <p className="text-xs font-semibold tracking-[0.28em] text-[#1F6A64]">
          LEGAL
        </p>
        <h1 className="mt-3 font-serif text-3xl font-medium tracking-tight text-[#1A2B3C]">
          Privacy Policy
        </h1>
        <p className="mt-5 text-sm leading-7 text-[#1A2B3C]/70">
          Daedalus Health collects only the information required to operate the
          client portal, schedule briefings, and deliver advisory services. We
          do not sell personal data. Portal authentication is handled by
          Supabase. For privacy inquiries, contact privacy@daedalus.health.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
