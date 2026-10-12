"use client";

import { isCustomerFacingUrl } from "@/lib/public-url";
import Link from "next/link";
import { useState } from "react";
import { addOrganizationMember, resendInviteLink } from "./actions";
import { InviteLinkResult } from "./invite-link-result";

export interface OrganizationMemberOption {
  name: string;
  email: string | null;
  role: string | null;
}

export interface OrganizationRowData {
  id: string;
  name: string;
  slug: string;
  primaryContactEmail: string | null;
  members: OrganizationMemberOption[];
  memberNames: string[];
  memberCount: number;
  intakeCompleted: boolean;
}

export function OrganizationRow({
  org,
  fromEmail,
}: {
  org: OrganizationRowData;
  fromEmail: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [email, setEmail] = useState(org.primaryContactEmail ?? "");
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [emailedTo, setEmailedTo] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState("");
  const [addingTeammate, setAddingTeammate] = useState(false);
  const [teammateName, setTeammateName] = useState("");
  const [teammateEmail, setTeammateEmail] = useState("");
  const [teammateStatus, setTeammateStatus] = useState<"idle" | "loading">("idle");
  const [teammateError, setTeammateError] = useState<string | null>(null);
  const [teammateSuccess, setTeammateSuccess] = useState<string | null>(null);

  async function handleGenerate() {
    setStatus("loading");
    setError(null);
    setInviteLink(null);
    setEmailSent(false);
    setEmailedTo(null);

    const selected = org.members[Number(selectedMember)];
    const selectedName =
      selected && selected.name !== "Name not recorded" ? selected.name : "";

    const response = await resendInviteLink(
      org.id,
      email,
      selectedName || org.memberNames[0] || "",
    );
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
    setEmailSent(response.emailSent === true);
    setEmailedTo(response.emailedTo ?? email);
    if (!response.emailSent) {
      setError(response.error ?? "The welcome email could not be sent.");
    }
  }

  async function handleAddTeammate() {
    setTeammateStatus("loading");
    setTeammateError(null);
    setTeammateSuccess(null);

    const response = await addOrganizationMember(
      org.id,
      teammateEmail,
      teammateName,
    );
    setTeammateStatus("idle");

    if (!response.ok) {
      setTeammateError(response.error ?? "Could not add that teammate.");
      return;
    }

    setTeammateName("");
    setTeammateEmail("");
    setTeammateSuccess(
      response.emailSent
        ? `Invite sent to ${response.emailedTo}. They now have access to ${org.name}.`
        : `${response.emailedTo} was added. ${response.error ?? "The invite email could not be sent."}`,
    );
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
                  ? "border-[#C4A574]/40 bg-[#C4A574]/10 text-[#C4A574]"
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
          <label className="mt-3 block max-w-xs">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C4A574]">
              Members
            </span>
            <select
              value={selectedMember}
              onChange={(event) => {
                const next = event.target.value;
                setSelectedMember(next);
                const member = org.members[Number(next)];
                if (member?.email) setEmail(member.email);
              }}
              className="mt-1.5 w-full rounded-sm border border-[#1A2B3C]/20 bg-[#F7F5F0] px-3 py-2 text-sm text-[#1A2B3C] outline-none focus:border-[#C4A574] focus:ring-2 focus:ring-[#C4A574]/20"
            >
              <option value="">
                {org.members.length === 0
                  ? "No members yet"
                  : `View ${org.members.length} ${org.members.length === 1 ? "member" : "members"}`}
              </option>
              {org.members.map((member, index) => (
                <option key={`${member.name}-${index}`} value={String(index)}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/${org.slug}`}
            className="text-sm font-medium text-[#C4A574] hover:text-[#1A2B3C]"
          >
            View portal →
          </Link>
          <button
            type="button"
            onClick={() => setAddingTeammate((value) => !value)}
            className="text-sm font-medium text-[#1A2B3C]/60 hover:text-[#1A2B3C]"
          >
            {addingTeammate ? "Close" : "Add teammate"}
          </button>
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="text-sm font-medium text-[#1A2B3C]/60 hover:text-[#1A2B3C]"
          >
            {expanded ? "Close" : "Send welcome email"}
          </button>
        </div>
      </div>

      {addingTeammate ? (
        <div className="mt-5 border-t border-[#1A2B3C]/10 pt-5">
          <p className="text-sm font-medium text-[#1A2B3C]">Add a teammate</p>
          <p className="mt-1 text-xs leading-5 text-[#1A2B3C]/55">
            Grants access to this organization. Existing Daedalus users keep
            access to any other organizations they already belong to.
          </p>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <input
              type="text"
              value={teammateName}
              onChange={(event) => setTeammateName(event.target.value)}
              placeholder="Full name"
              className="rounded-sm border border-[#1A2B3C]/20 bg-[#F7F5F0] px-3.5 py-2.5 text-sm text-[#1A2B3C] outline-none placeholder:text-[#1A2B3C]/40 focus:border-[#C4A574] focus:ring-2 focus:ring-[#C4A574]/20"
            />
            <input
              type="email"
              value={teammateEmail}
              onChange={(event) => setTeammateEmail(event.target.value)}
              placeholder="work@healthsystem.org"
              className="rounded-sm border border-[#1A2B3C]/20 bg-[#F7F5F0] px-3.5 py-2.5 text-sm text-[#1A2B3C] outline-none placeholder:text-[#1A2B3C]/40 focus:border-[#C4A574] focus:ring-2 focus:ring-[#C4A574]/20"
            />
            <button
              type="button"
              onClick={handleAddTeammate}
              disabled={
                teammateStatus === "loading" || !teammateName || !teammateEmail
              }
              className="inline-flex shrink-0 items-center justify-center rounded-sm bg-[#C4A574] px-5 py-2.5 text-sm font-medium tracking-wide text-[#1A2B3C] transition hover:bg-[#d4b888] disabled:opacity-60"
            >
              {teammateStatus === "loading" ? "Adding…" : "Add teammate"}
            </button>
          </div>
          {teammateError ? (
            <p className="mt-3 rounded-sm border border-red-800/30 bg-red-50 px-3 py-2 text-sm text-red-800">
              {teammateError}
            </p>
          ) : null}
          {teammateSuccess ? (
            <p className="mt-3 text-xs leading-5 text-[#1A2B3C]/55">
              {teammateSuccess}
            </p>
          ) : null}
        </div>
      ) : null}

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
              className="flex-1 rounded-sm border border-[#1A2B3C]/20 bg-[#F7F5F0] px-3.5 py-2.5 text-sm text-[#1A2B3C] outline-none placeholder:text-[#1A2B3C]/40 focus:border-[#C4A574] focus:ring-2 focus:ring-[#C4A574]/20"
            />
            <button
              type="button"
              onClick={handleGenerate}
              disabled={status === "loading" || !email}
              className="inline-flex shrink-0 items-center justify-center rounded-sm bg-[#C4A574] px-5 py-2.5 text-sm font-medium tracking-wide text-[#1A2B3C] transition hover:bg-[#d4b888] disabled:opacity-60"
            >
              {status === "loading" ? "Sending…" : "Send welcome email"}
            </button>
          </div>

          {error ? (
            <p className="mt-3 rounded-sm border border-red-800/30 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </p>
          ) : null}

          {emailSent ? (
            <p className="mt-3 text-xs leading-5 text-[#1A2B3C]/55">
              Welcome email sent to {emailedTo} from {fromEmail}.
            </p>
          ) : null}
          {inviteLink && !emailSent ? (
            <InviteLinkResult
              inviteLink={inviteLink}
              description={`The email did not send. Copy this backup link only if you need to send it yourself.`}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
