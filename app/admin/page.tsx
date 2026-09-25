import { SignInPanel } from "@/components/sign-in-panel";
import { getAdminAccess } from "@/lib/admin-access";
import type { Metadata } from "next";
import Link from "next/link";
import { AdminLoginForm } from "./admin-login-form";

export const metadata: Metadata = {
  title: "Admin",
  description: "Daedalus Health operator console.",
};

export default async function AdminHomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const access = await getAdminAccess();
  const { error } = await searchParams;

  if (access.status !== "ok") {
    return (
      <SignInPanel
        eyebrow="ADMIN"
        title="Operator sign in"
        description="Administrator credentials only. For Daedalus Health operators."
      >
        <AdminLoginForm
          initialError={error}
          signedInEmail={
            access.status === "forbidden" ? access.user.email : undefined
          }
        />
        <p className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm font-medium text-[#C4A574] transition hover:text-[#F9F8F3]"
          >
            View the landing page →
          </Link>
        </p>
      </SignInPanel>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#1F6A64]">
        Operator console
      </span>
      <h1 className="mt-2 font-serif text-3xl font-medium text-[#1A2B3C]">
        Home
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#1A2B3C]/70">
        Signed in as {access.user.email}. Choose a destination below.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/organizations"
          className="rounded-sm border border-[#1A2B3C]/15 bg-[#F9F8F3] p-6 shadow-[0_24px_60px_-36px_rgba(26,43,60,0.4)] transition hover:border-[#C4A574]/60 hover:shadow-[0_24px_60px_-28px_rgba(26,43,60,0.45)]"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C4A574]">
            Customers
          </p>
          <h2 className="mt-2 font-serif text-xl font-medium text-[#1A2B3C]">
            Organizations
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#1A2B3C]/65">
            Create customer organizations and generate their portal invite
            links.
          </p>
        </Link>
        <Link
          href="/"
          className="rounded-sm border border-[#1A2B3C]/15 bg-[#F9F8F3] p-6 shadow-[0_24px_60px_-36px_rgba(26,43,60,0.4)] transition hover:border-[#C4A574]/60 hover:shadow-[0_24px_60px_-28px_rgba(26,43,60,0.45)]"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C4A574]">
            Public site
          </p>
          <h2 className="mt-2 font-serif text-xl font-medium text-[#1A2B3C]">
            Landing page
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#1A2B3C]/65">
            Open the Daedalus Health website.
          </p>
        </Link>
      </div>
    </div>
  );
}
