"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { inviteTeammate } from "./actions";

const inputClass =
  "mt-1.5 w-full rounded-sm border border-[#1A2B3C]/20 bg-[#F7F5F0] px-3.5 py-2.5 text-sm text-[#1A2B3C] outline-none placeholder:text-[#1A2B3C]/40 focus:border-[#C4A574] focus:ring-2 focus:ring-[#C4A574]/20";

export function TeamInviteForm({ orgSlug }: { orgSlug: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError(null);
    setSuccess(null);

    const form = event.currentTarget;
    const response = await inviteTeammate(orgSlug, new FormData(form));
    setStatus("idle");

    if (!response.ok) {
      setError(response.error ?? "Could not add that teammate.");
      return;
    }

    form.reset();
    setSuccess(
      response.emailSent
        ? `Invite sent to ${response.emailedTo}. They can open the workspace from that email.`
        : `${response.emailedTo} was added to this organization. ${response.error ?? "The invite email could not be sent — ask them to sign in at daedalushealth.ai/login if they already have a password."}`,
    );
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-sm border border-[#1A2B3C]/15 bg-[#F9F8F3] p-6 shadow-[0_24px_60px_-36px_rgba(26,43,60,0.4)]"
    >
      <h2 className="font-serif text-lg font-medium text-[#1A2B3C]">
        Add a teammate
      </h2>
      <p className="mt-1.5 text-sm leading-6 text-[#1A2B3C]/65">
        They receive an invite email and are granted access to this organization
        only. Someone who already belongs to another organization can be added
        here without losing that access.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="fullName" className="text-sm font-medium text-[#1A2B3C]">
            Full name
          </label>
          <input
            id="fullName"
            name="fullName"
            required
            autoComplete="name"
            placeholder="Jordan Hale"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="email" className="text-sm font-medium text-[#1A2B3C]">
            Work email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="jordan@healthsystem.org"
            className={inputClass}
          />
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded-sm border border-red-800/30 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="mt-4 rounded-sm border border-[#C4A574]/30 bg-[#C4A574]/10 px-3 py-2 text-sm text-[#1A2B3C]">
          {success}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-5 inline-flex items-center justify-center rounded-sm bg-[#C4A574] px-6 py-2.5 text-sm font-medium tracking-wide text-[#1A2B3C] transition hover:bg-[#d4b888] disabled:opacity-60"
      >
        {status === "loading" ? "Adding…" : "Add teammate"}
      </button>
    </form>
  );
}
