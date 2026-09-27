"use client";

import { useFormStatus } from "react-dom";

export function InviteAcceptButton({ hasOrg }: { hasOrg: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-8 inline-flex items-center justify-center rounded-sm bg-[#1F6A64] px-6 py-2.5 text-sm font-medium tracking-wide text-[#F9F8F3] transition hover:bg-[#1A2B3C] hover:shadow-[inset_0_0_0_1px_#C4A574] disabled:opacity-60"
    >
      {pending
        ? "Opening your workspace…"
        : hasOrg
          ? "Continue to setup"
          : "Continue"}
    </button>
  );
}
