"use client";

import { MIN_PASSWORD_LENGTH } from "@/lib/password-setup";
import { useState, type FormEvent } from "react";
import { updateCustomerPassword } from "./actions";

const inputClass =
  "mt-1.5 w-full rounded-sm border border-[#1A2B3C]/20 bg-[#F7F5F0] px-3.5 py-2.5 text-sm text-[#1A2B3C] outline-none placeholder:text-[#1A2B3C]/40 focus:border-[#1F6A64] focus:ring-2 focus:ring-[#1F6A64]/20";

export function UpdatePasswordForm({ email }: { email: string }) {
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError(null);

    const result = await updateCustomerPassword(new FormData(event.currentTarget));
    if (result && !result.ok) {
      setStatus("idle");
      setError(result.error);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 w-full max-w-md rounded-sm border border-[#1A2B3C]/15 bg-[#F9F8F3] p-6 text-left shadow-[0_24px_60px_-36px_rgba(26,43,60,0.4)] sm:p-8"
    >
      <div>
        <label htmlFor="email" className="text-sm font-medium text-[#1A2B3C]">
          Login email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          readOnly
          autoComplete="username"
          className={`${inputClass} text-[#1A2B3C]/70`}
        />
      </div>

      <div className="mt-4">
        <label htmlFor="password" className="text-sm font-medium text-[#1A2B3C]">
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          autoComplete="new-password"
          className={inputClass}
        />
      </div>

      <div className="mt-4">
        <label
          htmlFor="confirmPassword"
          className="text-sm font-medium text-[#1A2B3C]"
        >
          Confirm new password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          autoComplete="new-password"
          className={inputClass}
        />
        <p className="mt-1.5 text-xs text-[#1A2B3C]/45">
          At least {MIN_PASSWORD_LENGTH} characters.
        </p>
      </div>

      {error ? (
        <p className="mt-4 rounded-sm border border-red-800/30 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-6 w-full rounded-sm bg-[#1F6A64] px-6 py-2.5 text-sm font-medium tracking-wide text-[#F9F8F3] transition hover:bg-[#1A2B3C] hover:shadow-[inset_0_0_0_1px_#C4A574] disabled:opacity-60"
      >
        {status === "loading" ? "Saving…" : "Save new password"}
      </button>
    </form>
  );
}
