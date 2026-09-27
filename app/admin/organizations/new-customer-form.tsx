"use client";

import { isCustomerFacingUrl } from "@/lib/public-url";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createOrganizationAndInvite } from "./actions";
import { InviteLinkResult } from "./invite-link-result";

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const inputClass =
  "mt-1.5 w-full rounded-sm border border-[#1A2B3C]/20 bg-[#F7F5F0] px-3.5 py-2.5 text-sm text-[#1A2B3C] outline-none placeholder:text-[#1A2B3C]/40 focus:border-[#1F6A64] focus:ring-2 focus:ring-[#1F6A64]/20";

export function NewCustomerForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    inviteLink: string;
    orgSlug: string;
    emailSent: boolean;
    emailedTo?: string;
    emailError?: string;
  } | null>(null);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError(null);
    setResult(null);

    const formData = new FormData(event.currentTarget);
    const response = await createOrganizationAndInvite(formData);
    setStatus("idle");

    if (!response.ok) {
      setError(
        response.orgSlug
          ? `${response.error ?? "The invite could not be completed."} ${response.orgSlug} was still created — send a welcome email from the list below.`
          : (response.error ?? "Something went wrong."),
      );
      return;
    }

    if (response.inviteLink && response.orgSlug) {
      if (!isCustomerFacingUrl(response.inviteLink)) {
        setError(
          `${response.orgSlug} was created, but the invite link was not a public daedalushealth.ai URL. Do not send it — generate a new one from the list below.`,
        );
        router.refresh();
        return;
      }
      setResult({
        inviteLink: response.inviteLink,
        orgSlug: response.orgSlug,
        emailSent: response.emailSent === true,
        emailedTo: response.emailedTo,
        emailError: response.emailSent ? undefined : response.error,
      });
      setName("");
      setSlug("");
      setSlugTouched(false);
      (event.target as HTMLFormElement).reset();
      router.refresh();
    }
  }

  return (
    <div className="rounded-sm border border-[#1A2B3C]/15 bg-[#F9F8F3] p-6 shadow-[0_24px_60px_-36px_rgba(26,43,60,0.4)] sm:p-8">
      <h2 className="font-serif text-lg font-medium text-[#1A2B3C]">
        New customer
      </h2>
      <p className="mt-1.5 text-sm leading-6 text-[#1A2B3C]/65">
        Creates the organization and emails a welcome from
        joe@daedalushealth.org with a one-time sign-in link. They will create
        a login and password, then complete setup.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="text-sm font-medium text-[#1A2B3C]">
            Organization name
          </label>
          <input
            id="name"
            name="name"
            required
            value={name}
            onChange={(event) => handleNameChange(event.target.value)}
            placeholder="Meridian Health System"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="slug" className="text-sm font-medium text-[#1A2B3C]">
            Portal slug
          </label>
          <input
            id="slug"
            name="slug"
            required
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(slugify(event.target.value));
            }}
            placeholder="meridian"
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            className={`${inputClass} font-mono`}
          />
          <p className="mt-1 text-xs text-[#1A2B3C]/45">
            daedalushealth.ai/{slug || "…"}
          </p>
        </div>

        <div>
          <label htmlFor="contactName" className="text-sm font-medium text-[#1A2B3C]">
            Primary contact name
          </label>
          <input
            id="contactName"
            name="contactName"
            required
            placeholder="Jordan Ellis"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="contactEmail" className="text-sm font-medium text-[#1A2B3C]">
            Primary contact email
          </label>
          <input
            id="contactEmail"
            name="contactEmail"
            type="email"
            required
            placeholder="jordan@meridian-health.org"
            className={inputClass}
          />
        </div>

        {error ? (
          <p className="sm:col-span-2 rounded-sm border border-red-800/30 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        ) : null}

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={status === "loading"}
            className="inline-flex items-center justify-center rounded-sm bg-[#1F6A64] px-6 py-2.5 text-sm font-medium tracking-wide text-[#F9F8F3] transition hover:bg-[#1A2B3C] hover:shadow-[inset_0_0_0_1px_#C4A574] disabled:opacity-60"
          >
            {status === "loading" ? "Creating…" : "Create organization & send welcome"}
          </button>
        </div>
      </form>

      {result ? (
        <div className="mt-6 rounded-sm border border-[#1F6A64]/30 bg-[#1F6A64]/10 p-5">
          <p className="text-sm font-medium text-[#1A2B3C]">
            {result.emailSent
              ? `${result.orgSlug} is ready. A welcome email was sent to ${result.emailedTo} from joe@daedalushealth.org.`
              : `${result.orgSlug} is ready, but the welcome email did not send.`}
          </p>
          {result.emailSent ? (
            <p className="mt-2 text-xs leading-5 text-[#1A2B3C]/55">
              They will create a login and complete setup at
              daedalushealth.ai/{result.orgSlug}. Send another welcome from
              the list below if they need a new link.
            </p>
          ) : (
            <InviteLinkResult
              inviteLink={result.inviteLink}
              description={`${result.emailError ?? "The email could not be sent."} Copy this backup link only if you need to send it yourself.`}
            />
          )}
        </div>
      ) : null}
    </div>
  );
}
