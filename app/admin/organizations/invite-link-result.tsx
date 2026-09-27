"use client";

import { isCustomerFacingUrl } from "@/lib/public-url";
import { useState } from "react";

export function InviteLinkResult({
  inviteLink,
  description,
}: {
  inviteLink: string;
  description: string;
}) {
  const [copied, setCopied] = useState(false);

  if (!isCustomerFacingUrl(inviteLink)) {
    return (
      <p className="mt-3 rounded-sm border border-red-800/30 bg-red-50 px-3 py-2 text-sm text-red-800">
        The invite was created, but the generated link was not a public
        daedalushealth.ai URL. Do not send it — generate a new one.
      </p>
    );
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mt-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          readOnly
          value={inviteLink}
          onFocus={(event) => event.currentTarget.select()}
          className="flex-1 rounded-sm border border-[#1A2B3C]/20 bg-[#F9F8F3] px-3 py-2 text-xs text-[#1A2B3C]/80"
        />
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex shrink-0 items-center justify-center rounded-sm border border-[#1A2B3C]/25 px-4 py-2 text-sm font-medium text-[#1A2B3C] transition hover:border-[#1F6A64] hover:text-[#1F6A64]"
        >
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
      <p className="mt-3 text-xs leading-5 text-[#1A2B3C]/55">{description}</p>
    </div>
  );
}
