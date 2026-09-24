import { CompassStar } from "@/components/compass-star";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TopographicPattern } from "@/components/topographic-pattern";
import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Client Login",
  description: "Secure client portal access for Daedalus Health executives.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-full flex-col bg-[#F7F5F0]">
      <SiteHeader />
      <main className="relative flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
        <TopographicPattern
          tone="slate"
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]"
        />
        <section className="relative w-full max-w-md rounded-sm border border-[#1A2B3C]/15 bg-[#F9F8F3] p-8 shadow-[0_24px_60px_-36px_rgba(26,43,60,0.5)]">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex size-10 items-center justify-center text-[#1F6A64]">
              <CompassStar className="size-9" />
            </span>
            <div>
              <p className="text-xs font-semibold tracking-[0.22em] text-[#1F6A64]">
                CLIENT PORTAL
              </p>
              <h1 className="font-serif text-2xl font-medium text-[#1A2B3C]">
                Executive sign in
              </h1>
            </div>
          </div>
          <p className="mb-6 text-sm leading-6 text-[#1A2B3C]/70">
            Access is reserved for Daedalus Health client organizations.
            Authenticate with your issued credentials or a one-time magic link.
          </p>
          <LoginForm initialError={error} />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
