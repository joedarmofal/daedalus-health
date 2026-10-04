import { CompassStar } from "@/components/compass-star";
import { SignInPanel } from "@/components/sign-in-panel";
import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Request a password reset for the Daedalus Health partner portal.",
};

export default function ResetPasswordPage() {
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
            <span className="text-[#C4A574]">PARTNER PORTAL</span>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <SignInPanel
          eyebrow="PARTNER PORTAL"
          title="Reset your password"
          description="Enter the work email on your account. We will send a one-time link to choose a new password."
        >
          <ResetPasswordForm />
          <p className="mt-6 text-center text-sm text-[#F9F8F3]/55">
            <Link href="/login" className="text-[#C4A574] hover:text-[#F9F8F3]">
              Back to sign in
            </Link>
          </p>
        </SignInPanel>
      </main>
    </div>
  );
}
