import { getAdminAccess } from "@/lib/admin-access";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { QuoteBuilder } from "./quote-builder";

export const metadata: Metadata = {
  title: "Admin · Quote tool",
};

export default async function AdminQuotePage() {
  const access = await getAdminAccess();
  if (access.status !== "ok") {
    redirect("/admin");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C4A574]">
        Proposals
      </span>
      <h1 className="mt-2 font-serif text-3xl font-medium text-[#F9F8F3]">
        Quote tool
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#F9F8F3]/70">
        Scope a Daedalus Health engagement, price it from boutique healthcare
        advisory day rates, and attach retainer options. Values stay in this
        browser. Optional AI language is a draft only — review every [TO CONFIRM]
        before sending.
      </p>
      <div className="mt-8">
        <QuoteBuilder />
      </div>
    </div>
  );
}
