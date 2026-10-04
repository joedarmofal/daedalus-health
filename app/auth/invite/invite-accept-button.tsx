"use client";

import { useFormStatus } from "react-dom";

export function InviteAcceptButton({ hasOrg }: { hasOrg: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-8 inline-flex items-center justify-center rounded-sm bg-[#C4A574] px-6 py-2.5 text-sm font-medium tracking-wide text-[#1A2B3C] transition hover:bg-[#d4b888] disabled:opacity-60"
    >
      {pending
        ? "Opening your workspace…"
        : hasOrg
          ? "Continue to create your login"
          : "Continue"}
    </button>
  );
}
