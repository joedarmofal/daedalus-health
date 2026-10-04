import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { customerMailFromAddress } from "@/lib/mail";
import type { TrustRequestKind } from "@/lib/trust-request";
import type { Metadata } from "next";
import Link from "next/link";
import { TrustRequestForm } from "./request-form";

export const metadata: Metadata = {
  title: "Request a BAA or security packet",
  description:
    "Request a Business Associate Agreement or security packet from Daedalus Health. Do not include PHI.",
};

function parseKind(value: string | undefined): TrustRequestKind | undefined {
  if (value === "baa" || value === "security-packet" || value === "both") {
    return value;
  }
  if (value === "packet") return "security-packet";
  return undefined;
}

export default async function TrustRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ need?: string }>;
}) {
  const { need } = await searchParams;
  const initialKind = parseKind(need);

  return (
    <div className="flex min-h-full flex-col bg-[#1A2B3C]">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C4A574]">
            Trust Center
          </p>
          <h1 className="mt-2 font-serif text-3xl font-medium text-[#F9F8F3] sm:text-4xl">
            Request a BAA or security packet
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#F9F8F3]/70">
            Short form for IT, privacy, and counsel. It is emailed to{" "}
            {customerMailFromAddress()}. This product does not process PHI —
            please do not include any in this form.
          </p>
          <p className="mt-2 text-sm text-[#F9F8F3]/55">
            <Link href="/trust" className="text-[#C4A574] hover:text-[#F9F8F3]">
              ← Back to the Trust Center
            </Link>
          </p>
          <div className="mt-8">
            <TrustRequestForm initialKind={initialKind} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
