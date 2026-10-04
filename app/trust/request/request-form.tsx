"use client";

import {
  TRUST_REQUEST_KINDS,
  type TrustRequestKind,
} from "@/lib/trust-request";
import { useState, type FormEvent } from "react";
import { submitTrustRequest } from "./actions";

const inputClass =
  "mt-1.5 w-full rounded-sm border border-[#1A2B3C]/20 bg-[#F7F5F0] px-3.5 py-2.5 text-sm text-[#1A2B3C] outline-none placeholder:text-[#1A2B3C]/40 focus:border-[#C4A574] focus:ring-2 focus:ring-[#C4A574]/20";

export function TrustRequestForm({
  initialKind,
}: {
  initialKind?: TrustRequestKind;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError(null);

    const response = await submitTrustRequest(new FormData(event.currentTarget));
    if (!response.ok) {
      setStatus("idle");
      setError(response.error ?? "Something went wrong. Please try again.");
      return;
    }

    setStatus("done");
  }

  if (status === "done") {
    return (
      <div className="rounded-sm border border-[#C4A574]/35 bg-[#12202e] p-6 text-center">
        <p className="font-serif text-lg font-medium text-[#F9F8F3]">
          Request received
        </p>
        <p className="mt-2 text-sm leading-6 text-[#F9F8F3]/70">
          We will follow up at the work email you provided. Do not send PHI
          while we complete the paperwork.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-sm border border-[#1A2B3C]/15 bg-[#F9F8F3] p-6 shadow-[0_24px_60px_-36px_rgba(26,43,60,0.4)] sm:p-8"
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="fullName" className="text-sm font-medium text-[#1A2B3C]">
            Full name
          </label>
          <input
            id="fullName"
            name="fullName"
            required
            autoComplete="name"
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
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="title" className="text-sm font-medium text-[#1A2B3C]">
            Title
          </label>
          <input
            id="title"
            name="title"
            autoComplete="organization-title"
            className={inputClass}
          />
        </div>
        <div>
          <label
            htmlFor="organizationName"
            className="text-sm font-medium text-[#1A2B3C]"
          >
            Organization
          </label>
          <input
            id="organizationName"
            name="organizationName"
            required
            autoComplete="organization"
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="kind" className="text-sm font-medium text-[#1A2B3C]">
            What do you need?
          </label>
          <select
            id="kind"
            name="kind"
            required
            defaultValue={initialKind ?? ""}
            className={inputClass}
          >
            <option value="" disabled>
              Select one…
            </option>
            {TRUST_REQUEST_KINDS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="notes" className="text-sm font-medium text-[#1A2B3C]">
            Notes for our team
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            placeholder="Deadline, questionnaire portal, or counsel contact. Do not include PHI."
            className={inputClass}
          />
        </div>
      </div>

      {error ? (
        <p className="mt-5 rounded-sm border border-red-800/30 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-6 inline-flex items-center justify-center rounded-sm bg-[#C4A574] px-6 py-2.5 text-sm font-medium tracking-wide text-[#1A2B3C] transition hover:bg-[#d4b888] disabled:opacity-60"
      >
        {status === "loading" ? "Sending…" : "Submit request"}
      </button>
    </form>
  );
}
