"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignOutButton({
  className,
  redirectTo = "/login",
}: {
  className?: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace(redirectTo);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className={
        className ??
        "text-sm font-medium text-[#1A2B3C]/60 transition hover:text-[#1F6A64] disabled:opacity-60"
      }
    >
      {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}
