import { CompassStar } from "@/components/compass-star";
import { SignInPanel } from "@/components/sign-in-panel";
import { getAccreditationAccess } from "@/lib/accreditation-access";
import { LoginForm } from "@/app/login/login-form";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Emergency Services",
  description:
    "Sign in for EMS and HEMS program tools, including CAMTS PIF preparation and related emergency services work.",
};

export default async function AccreditationLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const access = await getAccreditationAccess();
  if (access.status === "ok" || access.status === "no_organization") {
    redirect("/emergency-services/workspace");
  }
  if (access.status === "need_password") {
    redirect("/auth/set-password");
  }

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
            <span className="text-[#C4A574]">EMERGENCY SERVICES</span>
          </Link>
          <span className="hidden text-xs font-semibold uppercase tracking-[0.18em] text-[#C4A574]/80 sm:inline">
            EMS · HEMS · CAMTS
          </span>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <SignInPanel
          eyebrow="EMERGENCY SERVICES"
          title="Program sign in"
          description="For EMS and HEMS programs — CAMTS PIF work, survey preparation, and other emergency services needs."
        >
          <LoginForm
            initialError={error}
            afterSignIn="/emergency-services/workspace"
            magicLinkNext="/emergency-services/workspace"
            submitLabel="Enter emergency services workspace"
            magicLinkLabel="Send Magic Link"
            successMessage="Check your inbox for a secure magic link to the emergency services workspace."
          />
          <p className="mt-6 text-center text-sm leading-6 text-[#F9F8F3]/50">
            Same login as the partner portal.{" "}
            <Link href="/login" className="text-[#C4A574] hover:text-[#F9F8F3]">
              AI governance portal
            </Link>
          </p>
        </SignInPanel>
      </main>

      <footer className="border-t border-[#C4A574]/15 px-4 py-4 text-center text-xs tracking-wide text-[#F9F8F3]/40">
        Daedalus Health · Emergency services workspace
      </footer>
    </div>
  );
}
