"use client";

import { useState, type FormEvent } from "react";
import { submitInformationRequest } from "./actions";

const inputClass =
  "mt-1.5 w-full rounded-sm border border-[#1A2B3C]/20 bg-[#F7F5F0] px-3.5 py-2.5 text-sm text-[#1A2B3C] outline-none placeholder:text-[#1A2B3C]/40 focus:border-[#C4A574] focus:ring-2 focus:ring-[#C4A574]/20";

export function RequestInformationForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError(null);

    const response = await submitInformationRequest(
      new FormData(event.currentTarget),
    );

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
          Thank you — we received your request.
        </p>
        <p className="mt-2 text-sm leading-6 text-[#F9F8F3]/70">
          Joe will follow up at the email you provided.
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
          <label htmlFor="phone" className="text-sm font-medium text-[#1A2B3C]">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
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
        <div>
          <label
            htmlFor="organizationType"
            className="text-sm font-medium text-[#1A2B3C]"
          >
            Organization type
          </label>
          <select id="organizationType" name="organizationType" className={inputClass}>
            <option value="">Select one…</option>
            <option>Hospital system</option>
            <option>Academic medical center</option>
            <option>Community hospital</option>
            <option>Health plan / payer</option>
            <option>Physician group</option>
            <option>Digital health / vendor</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="organizationSize"
            className="text-sm font-medium text-[#1A2B3C]"
          >
            Organization size
          </label>
          <select id="organizationSize" name="organizationSize" className={inputClass}>
            <option value="">Select one…</option>
            <option>Under 500 employees</option>
            <option>500–2,500 employees</option>
            <option>2,500–10,000 employees</option>
            <option>10,000+ employees</option>
          </select>
        </div>
        <div>
          <label htmlFor="state" className="text-sm font-medium text-[#1A2B3C]">
            State / region
          </label>
          <input id="state" name="state" autoComplete="address-level1" className={inputClass} />
        </div>
        <div>
          <label htmlFor="interest" className="text-sm font-medium text-[#1A2B3C]">
            What are you exploring?
          </label>
          <select id="interest" name="interest" className={inputClass}>
            <option value="">Select one…</option>
            <option>AI governance program</option>
            <option>Clinical AI validation</option>
            <option>Vendor / tool evaluation</option>
            <option>Board or executive briefing</option>
            <option>General information</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="notes" className="text-sm font-medium text-[#1A2B3C]">
            Anything else we should know
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
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
