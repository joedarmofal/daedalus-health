"use client";

import { isCustomerFacingUrl } from "@/lib/public-url";
import Link from "next/link";
import { useState } from "react";
import { resendInviteLink } from "./actions";
import { InviteLinkResult } from "./invite-link-result";

export interface OrganizationRowData {
  id: string;
  name: string;
  slug: string;
  primaryContactEmail: string | null;
  memberCount: number;
  intakeCompleted: boolean;
}

export function OrganizationRow({ org }: { org: OrganizationRowData }) {
  const [expanded, setExpanded] = useState(false);
  const [email, setEmail] = useState(org.primaryContactEmail ?? "");
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  async function handleGenerate() {
    setStatus("loading");
    setError(null);
    setInviteLink(null);

    const response = await resendInviteLink(org.id, email, "");
    setStatus("idle");

    if (!response.ok) {
      setError(response.error ?? "Something went wrong.");
      return;
    }

    if (!response.inviteLink || !isCustomerFacingUrl(response.inviteLink)) {
      setError(
        "The invite was created, but the generated link was not a public daedalushealth.ai URL. Do not send it — try generating again.",
      );
      return;
    }

    setInviteLink(response.inviteLink);
  }

  return (
    <div className="rounded-sm border border-[#1A2B3C]/15 bg-[#F9F8F3] p-6 shadow-[0_24px_60px_-36px_rgba(26,43,60,0.35)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-lg font-medium text-[#1A2B3C]">
              {org.name}
            </h3>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide ${
                org.intakeCompleted
                  ? "border-[#1F6A64]/40 bg-[#1F6A64]/10 text-[#1F6A64]"
                  : "border-[#C4A574]/50 bg-[#C4A574]/15 text-[#8a6d3d]"
              }`}
            >
              {org.intakeCompleted ? "Setup complete" : "Setup pending"}
            </span>
          </div>
          <p className="mt-1 text-xs font-mono text-[#1A2B3C]/45">
            /{org.slug} · {org.memberCount}{" "}
            {org.memberCount === 1 ? "member" : "members"}
            {org.primaryContactEmail ? ` · ${org.primaryContactEmail}` : ""}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/${org.slug}`}
            className="text-sm font-medium text-[#1F6A64] hover:text-[#1A2B3C]"
          >
            View portal →
          </Link>
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="text-sm font-medium text-[#1A2B3C]/60 hover:text-[#1A2B3C]"
          >
            {expanded ? "Close" : "Send invite link"}
          </button>
        </div>
      </div>

      {expanded ? (
        <div className="mt-5 border-t border-[#1A2B3C]/10 pt-5">
          <label className="text-sm font-medium text-[#1A2B3C]">
            Contact email
          </label>
          <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="jordan@meridian-health.org"
              className="flex-1 rounded-sm border border-[#1A2B3C]/20 bg-[#F7F5F0] px-3.5 py-2.5 text-sm text-[#1A2B3C] outline-none placeholder:text-[#1A2B3C]/40 focus:border-[#1F6A64] focus:ring-2 focus:ring-[#1F6A64]/20"
            />
            <button
              type="button"
              onClick={handleGenerate}
              disabled={status === "loading" || !email}
              className="inline-flex shrink-0 items-center justify-center rounded-sm bg-[#1F6A64] px-5 py-2.5 text-sm font-medium tracking-wide text-[#F9F8F3] transition hover:bg-[#1A2B3C] disabled:opacity-60"
            >
              {status === "loading" ? "Generating…" : "Generate link"}
            </button>
          </div>

          {error ? (
            <p className="mt-3 rounded-sm border border-red-800/30 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </p>
          ) : null}

          {inviteLink ? (
            <InviteLinkResult
              inviteLink={inviteLink}
              description={`Send this daedalushealth.ai link. It signs them into /${org.slug}, asks them to create a login and password, then finish setup if they have not already.`}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
