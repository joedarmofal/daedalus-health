import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6">
        <p className="text-xs font-semibold tracking-[0.2em] text-emerald-300">
          LEGAL
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-50">
          Privacy Policy
        </h1>
        <p className="mt-5 text-sm leading-7 text-stone-400">
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
