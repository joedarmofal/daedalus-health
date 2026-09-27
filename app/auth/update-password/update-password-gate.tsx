"use client";

import { CompassStar } from "@/components/compass-star";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UpdatePasswordForm } from "./update-password-form";

export function UpdatePasswordGate() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get("code");
      if (code) {
        router.replace(
          `/auth/callback?code=${encodeURIComponent(code)}&next=/auth/update-password`,
        );
        return;
      }

      const supabase = createClient();
      const rawHash = window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : window.location.hash;
      const hashParams = new URLSearchParams(rawHash);
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const hashError = hashParams.get("error_description");

      if (hashError) {
        if (!cancelled) {
          setError(
            decodeURIComponent(hashError.replace(/\+/g, " ")) ||
              "This reset link has expired. Request a new one.",
          );
        }
        return;
      }

      if (accessToken && refreshToken) {
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (cancelled) return;
        if (sessionError || !data.user) {
          setError(
            sessionError?.message ??
              "This reset link has expired. Request a new one.",
          );
          return;
        }
        window.history.replaceState(null, "", window.location.pathname);
        setEmail(data.user.email ?? "");
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user) {
        setError("This reset link is incomplete or already used. Request a new one.");
        return;
      }
      setEmail(user.email ?? "");
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F7F5F0] px-4 text-center">
        <span className="mb-6 flex size-12 items-center justify-center text-[#1F6A64]">
          <CompassStar className="size-11" />
        </span>
        <p className="max-w-sm text-sm leading-6 text-[#1A2B3C]/70">{error}</p>
        <Link
          href="/auth/reset-password"
          className="mt-6 text-sm font-medium text-[#1F6A64] hover:text-[#1A2B3C]"
        >
          Request a new reset link
        </Link>
      </div>
    );
  }

  if (email === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F7F5F0] px-4 text-center">
        <span className="mb-6 flex size-12 items-center justify-center text-[#1F6A64]">
          <CompassStar className="size-11" />
        </span>
        <p className="max-w-sm text-sm leading-6 text-[#1A2B3C]/70">
          Opening your password reset…
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F7F5F0] px-4 py-16">
      <span className="mb-6 flex size-12 items-center justify-center text-[#1F6A64]">
        <CompassStar className="size-11" />
      </span>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#1F6A64]">
        Reset password
      </p>
      <h1 className="mt-3 text-center font-serif text-2xl font-medium text-[#1A2B3C]">
        Choose a new password
      </h1>
      <p className="mt-3 max-w-md text-center text-sm leading-6 text-[#1A2B3C]/70">
        This replaces the password on your client portal login.
      </p>
      <UpdatePasswordForm email={email} />
    </div>
  );
}
