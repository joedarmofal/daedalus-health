import { CompassStar } from "@/components/compass-star";
import { SignInPanel } from "@/components/sign-in-panel";
import type { Metadata } from "next";
import Link from "next/link";
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
    <div className="flex min-h-screen flex-col bg-[#1A2B3C] text-[#F9F8F3]">
      <style>{`html, body { background: #1A2B3C; }`}</style>
      <header className="sticky top-0 z-50 border-b border-[#C4A574]/20 bg-[#1A2B3C]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-serif text-[15px] font-semibold tracking-[0.22em]"
          >
            <span className="flex size-9 items-center justify-center text-[#C4A574]">
              <CompassStar className="size-8" />
            </span>
            <span>DAEDALUS HEALTH</span>
            <span className="text-[#F9F8F3]/30">/</span>
            <span className="text-[#C4A574]">CLIENT PORTAL</span>
          </Link>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C4A574]/80">
            Executive access
          </span>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <SignInPanel
          eyebrow="CLIENT PORTAL"
          title="Executive sign in"
          description="Access is reserved for Daedalus Health client organizations."
        >
          <LoginForm initialError={error} />
        </SignInPanel>
      </main>

      <footer className="border-t border-[#C4A574]/15 px-4 py-4 text-center text-xs tracking-wide text-[#F9F8F3]/40">
        Daedalus Health · Client portal
      </footer>
    </div>
  );
}
