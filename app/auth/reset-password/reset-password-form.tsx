"use client";

import { useState, type FormEvent } from "react";
import { requestPasswordReset } from "./actions";

export function ResetPasswordForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError(null);

    const result = await requestPasswordReset(new FormData(event.currentTarget));
    if (!result.ok) {
      setStatus("idle");
      setError(result.error);
      return;
    }

    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <p className="rounded-sm border border-[#C4A574]/30 bg-[#C4A574]/10 px-3 py-3 text-sm leading-6 text-[#C4A574]">
        If that email has a portal login, we sent a reset link. It expires
        shortly — use it on this site to choose a new password.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="email" className="text-sm font-medium text-[#F9F8F3]/80">
          Work email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-2 w-full rounded-sm border border-[#C4A574]/30 bg-[#12202e] px-3.5 py-2.5 text-sm text-[#F9F8F3] outline-none placeholder:text-[#F9F8F3]/35 focus:border-[#C4A574] focus:ring-2 focus:ring-[#C4A574]/25"
          placeholder="you@healthsystem.org"
        />
      </div>

      {error ? (
        <p className="rounded-sm border border-red-300/30 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-sm bg-[#C4A574] px-4 py-2.5 text-sm font-medium tracking-wide text-[#1A2B3C] transition hover:bg-[#d4b888] disabled:opacity-60"
      >
        {status === "loading" ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
