"use client";

import { createClient } from "@/utils/supabase/client";
import { resolveOrgSlug } from "@/lib/org";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

const AUTH_ERRORS: Record<string, string> = {
  auth: "We could not complete sign in. Request a new magic link.",
  "auth-failed": "We could not complete sign in. Request a new magic link.",
  missing_code: "This sign-in link is incomplete. Request a new magic link.",
  no_organization:
    "Your account is not assigned to a client organization. Contact your Daedalus administrator.",
};

export function LoginForm({ initialError }: { initialError?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(
    initialError ? (AUTH_ERRORS[initialError] ?? initialError) : null,
  );

  async function handlePasswordSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError(null);
    setMessage(null);

    if (!password) {
      setStatus("idle");
      setError("Enter your password, or use a magic link instead.");
      return;
    }

    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setStatus("idle");
      setError(signInError.message);
      return;
    }

    const orgSlug = await resolveOrgSlug(supabase, data.user);
    setStatus("idle");

    if (!orgSlug) {
      setError(
        "Signed in, but this account is not assigned to a client organization. Contact your Daedalus administrator.",
      );
      return;
    }

    router.replace(`/${orgSlug}`);
    router.refresh();
  }

  async function handleMagicLink() {
    setStatus("loading");
    setError(null);
    setMessage(null);

    if (!email) {
      setStatus("idle");
      setError("Enter your work email to receive a magic link.");
      return;
    }

    const supabase = createClient();
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setStatus("idle");

    if (otpError) {
      setError(otpError.message);
      return;
    }

    setMessage("Check your inbox for a secure magic link to the client portal.");
  }

  return (
    <form onSubmit={handlePasswordSignIn} className="space-y-5">
      <div>
        <label
          htmlFor="email"
          className="text-sm font-medium text-[#F9F8F3]/80"
        >
          Work email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 w-full rounded-sm border border-[#C4A574]/30 bg-[#12202e] px-3.5 py-2.5 text-sm text-[#F9F8F3] outline-none placeholder:text-[#F9F8F3]/35 focus:border-[#C4A574] focus:ring-2 focus:ring-[#C4A574]/25"
          placeholder="you@healthsystem.org"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="text-sm font-medium text-[#F9F8F3]/80"
        >
          Password
        </label>
        <p className="mt-1 text-xs text-[#F9F8F3]/40">
          Use the password you created after your invite.
        </p>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full rounded-sm border border-[#C4A574]/30 bg-[#12202e] px-3.5 py-2.5 text-sm text-[#F9F8F3] outline-none placeholder:text-[#F9F8F3]/35 focus:border-[#C4A574] focus:ring-2 focus:ring-[#C4A574]/25"
          placeholder="••••••••"
        />
      </div>

      {error ? (
        <p className="rounded-sm border border-red-300/30 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-sm border border-[#C4A574]/30 bg-[#C4A574]/10 px-3 py-2 text-sm text-[#C4A574]">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-sm bg-[#C4A574] px-4 py-2.5 text-sm font-medium tracking-wide text-[#1A2B3C] transition hover:bg-[#d4b888] disabled:opacity-60"
      >
        {status === "loading" ? "Authenticating…" : "Enter portal"}
      </button>

      <button
        type="button"
        disabled={status === "loading"}
        onClick={handleMagicLink}
        className="w-full rounded-sm border border-[#C4A574]/40 px-4 py-2.5 text-sm font-medium tracking-wide text-[#F9F8F3] transition hover:border-[#C4A574] hover:text-[#C4A574] disabled:opacity-60"
      >
        Send Magic Link
      </button>
    </form>
  );
}
