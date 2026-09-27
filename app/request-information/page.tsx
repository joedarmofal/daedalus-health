import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { Metadata } from "next";
import { RequestInformationForm } from "./request-form";

export const metadata: Metadata = {
  title: "Request Information",
  description:
    "Request information about Daedalus Health AI governance and advisory services.",
};

export default function RequestInformationPage() {
  return (
    <div className="flex min-h-full flex-col bg-[#F7F5F0]">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#1F6A64]">
            Request Information
          </span>
          <h1 className="mt-2 font-serif text-3xl font-medium text-[#1A2B3C] sm:text-4xl">
            Tell us about your organization
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#1A2B3C]/70">
            A few details help us follow up with the right conversation. Joe
            receives this directly at joe@daedalushealth.org.
          </p>
          <div className="mt-8">
            <RequestInformationForm />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
