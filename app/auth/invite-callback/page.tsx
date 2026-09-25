"use client";

import { CompassStar } from "@/components/compass-star";
import { resolveOrgSlug } from "@/lib/org";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function InviteCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"working" | "error">("working");
  const [message, setMessage] = useState("Verifying your invite…");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const rawHash = window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : window.location.hash;
      const hashParams = new URLSearchParams(rawHash);
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const hashError = hashParams.get("error_description");

      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get("code");

      // Some Supabase configurations issue a PKCE-style ?code= instead of the
      // implicit-flow hash tokens above. If we got one, hand it to the
      // existing server-side exchange route rather than duplicating that logic.
      if (code) {
        router.replace(`/auth/callback?code=${encodeURIComponent(code)}`);
        return;
      }

      if (hashError) {
        setStatus("error");
        setMessage(
          decodeURIComponent(hashError.replace(/\+/g, " ")) ||
            "This invite link has expired or was already used.",
        );
        return;
      }

      if (!accessToken || !refreshToken) {
        setStatus("error");
        setMessage(
          "This invite link is missing or has already been used. Ask your administrator to send a new one.",
        );
        return;
      }

      const supabase = createClient();
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (cancelled) return;

      if (error || !data.user) {
        setStatus("error");
        setMessage(
          error?.message ??
            "This invite link has expired. Ask your administrator to send a new one.",
        );
        return;
      }

      const orgSlug = await resolveOrgSlug(supabase, data.user);

      if (cancelled) return;

      if (!orgSlug) {
        setStatus("error");
        setMessage(
          "You're signed in, but no organization is linked to your account yet. Contact your administrator.",
        );
        return;
      }

      router.replace(`/${orgSlug}`);
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F7F5F0] px-4 text-center">
      <span className="mb-6 flex size-12 items-center justify-center text-[#1F6A64]">
        <CompassStar className="size-11" />
      </span>
      <p className="max-w-sm text-sm leading-6 text-[#1A2B3C]/70">{message}</p>
      {status === "error" ? (
        <Link
          href="/login"
          className="mt-6 text-sm font-medium text-[#1F6A64] hover:text-[#1A2B3C]"
        >
          Return to sign in
        </Link>
      ) : null}
    </div>
  );
}
