import { CompassStar } from "@/components/compass-star";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
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
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="relative flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.12),_transparent_55%)]" />
        <section className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl shadow-emerald-950/30">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10 text-emerald-300">
              <CompassStar className="size-5" />
            </span>
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-emerald-300">
                CLIENT PORTAL
              </p>
              <h1 className="text-xl font-semibold text-[#f4efe4]">
                Executive sign in
              </h1>
            </div>
          </div>
          <p className="mb-6 text-sm leading-6 text-[#d9cfc0]">
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
