"use client";

import { MIN_PASSWORD_LENGTH } from "@/lib/password-setup";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createDemoUser, type DemoUserResult } from "./actions";

const inputClass =
  "mt-1.5 w-full rounded-sm border border-[#1A2B3C]/20 bg-[#F7F5F0] px-3.5 py-2.5 text-sm text-[#1A2B3C] outline-none placeholder:text-[#1A2B3C]/40 focus:border-[#C4A574] focus:ring-2 focus:ring-[#C4A574]/20";

export function DemoUserForm({
  organizations,
}: {
  organizations: Array<{ id: string; name: string; slug: string }>;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DemoUserResult | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError(null);
    setResult(null);

    const response = await createDemoUser(new FormData(event.currentTarget));
    setStatus("idle");

    if (!response.ok) {
      setError(response.error ?? "Could not create the demo user.");
      return;
    }

    setResult(response);
    (event.target as HTMLFormElement).reset();
    router.refresh();
  }

  return (
    <div className="rounded-sm border border-[#1A2B3C]/15 bg-[#F9F8F3] p-6 shadow-[0_24px_60px_-36px_rgba(26,43,60,0.4)] sm:p-8">
      <h2 className="font-serif text-lg font-medium text-[#1A2B3C]">
        Issue demo login
      </h2>
      <p className="mt-1.5 text-sm leading-6 text-[#1A2B3C]/65">
        Creates a ready-to-use account. They sign in with the username and
        password you set — no invite email, no password setup. Share the
        credentials yourself.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        <div>
          <label htmlFor="username" className="text-sm font-medium text-[#1A2B3C]">
            Username
          </label>
          <input
            id="username"
            name="username"
            required
            autoComplete="off"
            placeholder="demo-guest"
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="displayName"
            className="text-sm font-medium text-[#1A2B3C]"
          >
            Display name
          </label>
          <input
            id="displayName"
            name="displayName"
            placeholder="Demo guest"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="password" className="text-sm font-medium text-[#1A2B3C]">
            Password
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

        <div>
          <label
            htmlFor="confirmPassword"
            className="text-sm font-medium text-[#1A2B3C]"
          >
            Confirm password
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
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="organizationId"
            className="text-sm font-medium text-[#1A2B3C]"
          >
            Organization
          </label>
          <select
            id="organizationId"
            name="organizationId"
            className={inputClass}
            defaultValue=""
          >
            <option value="">New / existing Demo Program</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name} ({org.slug})
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-[#1A2B3C]/45">
            Leave on Demo Program unless you want this login attached to a
            specific customer organization.
          </p>
        </div>

        <label className="sm:col-span-2 flex items-start gap-2.5 text-sm text-[#1A2B3C]/75">
          <input
            type="checkbox"
            name="resetExisting"
            className="mt-0.5 size-4 rounded-sm border-[#1A2B3C]/30 text-[#C4A574]"
          />
          Reset the password if this username already exists as a demo account
        </label>

        {error ? (
          <p className="sm:col-span-2 rounded-sm border border-red-800/30 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        ) : null}

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={status === "loading"}
            className="inline-flex items-center justify-center rounded-sm bg-[#C4A574] px-6 py-2.5 text-sm font-medium tracking-wide text-[#1A2B3C] transition hover:bg-[#d4b888] disabled:opacity-60"
          >
            {status === "loading" ? "Creating…" : "Create demo login"}
          </button>
        </div>
      </form>

      {result?.ok ? <DemoCredentials result={result} /> : null}
    </div>
  );
}

function DemoCredentials({ result }: { result: DemoUserResult }) {
  const lines = [
    `Username: ${result.username}`,
    `Password: ${result.password}`,
    `Partner portal: ${result.loginUrl}`,
    `Emergency services: ${result.emergencyUrl}`,
  ].join("\n");

  return (
    <div className="mt-6 rounded-sm border border-[#C4A574]/30 bg-[#C4A574]/10 p-5">
      <p className="text-sm font-medium text-[#1A2B3C]">
        {result.resetExisting
          ? `Password reset for ${result.username}. They can sign in now.`
          : `${result.username} is ready. Hand them these credentials.`}
      </p>
      <p className="mt-1 text-sm text-[#1A2B3C]/70">
        Attached to {result.orgName} · daedalushealth.ai/{result.orgSlug}
      </p>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <Credential label="Username" value={result.username ?? ""} />
        <Credential label="Password" value={result.password ?? ""} />
        <Credential label="Partner sign-in" value={result.loginUrl ?? ""} />
        <Credential
          label="Emergency services"
          value={result.emergencyUrl ?? ""}
        />
      </dl>
      <CopyBlock text={lines} />
    </div>
  );
}

function Credential({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1A2B3C]/45">
        {label}
      </dt>
      <dd className="mt-1 break-all font-mono text-[#1A2B3C]">{value}</dd>
    </div>
  );
}

function CopyBlock({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="mt-5 inline-flex items-center justify-center rounded-sm border border-[#1A2B3C]/25 px-4 py-2 text-sm font-medium text-[#1A2B3C] transition hover:border-[#C4A574] hover:text-[#C4A574]"
    >
      {copied ? "Copied" : "Copy credentials"}
    </button>
  );
}
