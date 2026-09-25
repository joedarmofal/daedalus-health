"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { submitIntake } from "./actions";

export interface IntakeFormData {
  health_system_type: string | null;
  org_size: string | null;
  ehr_vendor: string | null;
  primary_use_cases: string[] | null;
  governance_maturity: string | null;
  primary_contact_name: string | null;
  primary_contact_title: string | null;
  primary_contact_email: string | null;
  primary_contact_phone: string | null;
  additional_stakeholders: string | null;
  notes: string | null;
}

const inputClass =
  "mt-1.5 w-full rounded-sm border border-[#1A2B3C]/20 bg-[#F7F5F0] px-3.5 py-2.5 text-sm text-[#1A2B3C] outline-none placeholder:text-[#1A2B3C]/40 focus:border-[#1F6A64] focus:ring-2 focus:ring-[#1F6A64]/20";

const USE_CASES = [
  "Clinical decision support",
  "Ambient documentation / scribing",
  "Prior auth & revenue cycle",
  "Imaging & diagnostics",
  "Patient-facing chat / triage",
  "Administrative / back-office",
  "Other",
];

export function IntakeForm({
  orgSlug,
  initialData,
}: {
  orgSlug: string;
  initialData: IntakeFormData | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [selectedUseCases, setSelectedUseCases] = useState<string[]>(
    initialData?.primary_use_cases ?? [],
  );

  function toggleUseCase(useCase: string) {
    setSelectedUseCases((current) =>
      current.includes(useCase)
        ? current.filter((item) => item !== useCase)
        : [...current, useCase],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError(null);

    const formData = new FormData(event.currentTarget);
    const response = await submitIntake(orgSlug, formData);

    if (!response.ok) {
      setStatus("idle");
      setError(response.error ?? "Something went wrong. Please try again.");
      return;
    }

    setStatus("done");
    router.refresh();
  }

  if (status === "done") {
    return (
      <div className="rounded-sm border border-[#1F6A64]/30 bg-[#1F6A64]/10 p-6 text-center">
        <p className="font-serif text-lg font-medium text-[#1A2B3C]">
          Thanks — you&rsquo;re all set.
        </p>
        <p className="mt-2 text-sm leading-6 text-[#1A2B3C]/70">
          We&rsquo;ve saved your organization&rsquo;s setup details. Your
          Daedalus Health team will follow up shortly.
        </p>
        <a
          href={`/${orgSlug}`}
          className="mt-5 inline-flex items-center justify-center rounded-sm bg-[#1F6A64] px-6 py-2.5 text-sm font-medium tracking-wide text-[#F9F8F3] transition hover:bg-[#1A2B3C]"
        >
          Go to your portal
        </a>
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
          <label className="text-sm font-medium text-[#1A2B3C]">
            Organization type
          </label>
          <select
            name="healthSystemType"
            defaultValue={initialData?.health_system_type ?? ""}
            className={inputClass}
          >
            <option value="">Select one…</option>
            <option>Hospital system</option>
            <option>Academic medical center</option>
            <option>Health plan / payer</option>
            <option>Physician group</option>
            <option>Digital health vendor</option>
            <option>Other</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-[#1A2B3C]">
            Organization size
          </label>
          <select
            name="orgSize"
            defaultValue={initialData?.org_size ?? ""}
            className={inputClass}
          >
            <option value="">Select one…</option>
            <option>Under 500 employees</option>
            <option>500–2,500 employees</option>
            <option>2,500–10,000 employees</option>
            <option>10,000+ employees</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-[#1A2B3C]">
            Primary EHR
          </label>
          <select
            name="ehrVendor"
            defaultValue={initialData?.ehr_vendor ?? ""}
            className={inputClass}
          >
            <option value="">Select one…</option>
            <option>Epic</option>
            <option>Oracle Health (Cerner)</option>
            <option>MEDITECH</option>
            <option>athenahealth</option>
            <option>Other</option>
            <option>None</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-[#1A2B3C]">
            AI governance maturity today
          </label>
          <select
            name="governanceMaturity"
            defaultValue={initialData?.governance_maturity ?? ""}
            className={inputClass}
          >
            <option value="">Select one…</option>
            <option>No formal oversight yet</option>
            <option>Informal / ad hoc oversight</option>
            <option>Formal committee exists</option>
            <option>Mature program with dedicated staff</option>
          </select>
        </div>
      </div>

      <div className="mt-6">
        <label className="text-sm font-medium text-[#1A2B3C]">
          Primary AI use cases you&rsquo;re evaluating or deploying
        </label>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {USE_CASES.map((useCase) => (
            <label
              key={useCase}
              className="flex items-center gap-2.5 rounded-sm border border-[#1A2B3C]/15 bg-[#F7F5F0] px-3.5 py-2.5 text-sm text-[#1A2B3C]"
            >
              <input
                type="checkbox"
                name="primaryUseCases"
                value={useCase}
                checked={selectedUseCases.includes(useCase)}
                onChange={() => toggleUseCase(useCase)}
                className="size-4 accent-[#1F6A64]"
              />
              {useCase}
            </label>
          ))}
        </div>
      </div>

      <div className="mt-8 border-t border-[#1A2B3C]/10 pt-6">
        <h3 className="font-serif text-base font-medium text-[#1A2B3C]">
          Primary contact
        </h3>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-[#1A2B3C]">Name</label>
            <input
              name="contactName"
              defaultValue={initialData?.primary_contact_name ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#1A2B3C]">Title</label>
            <input
              name="contactTitle"
              defaultValue={initialData?.primary_contact_title ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#1A2B3C]">Email</label>
            <input
              type="email"
              name="contactEmail"
              defaultValue={initialData?.primary_contact_email ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#1A2B3C]">Phone</label>
            <input
              type="tel"
              name="contactPhone"
              defaultValue={initialData?.primary_contact_phone ?? ""}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <label className="text-sm font-medium text-[#1A2B3C]">
          Other key stakeholders (optional)
        </label>
        <textarea
          name="additionalStakeholders"
          rows={2}
          defaultValue={initialData?.additional_stakeholders ?? ""}
          placeholder="Names or roles of anyone else who should have portal access"
          className={inputClass}
        />
      </div>

      <div className="mt-6">
        <label className="text-sm font-medium text-[#1A2B3C]">
          Anything else we should know? (optional)
        </label>
        <textarea
          name="notes"
          rows={3}
          defaultValue={initialData?.notes ?? ""}
          className={inputClass}
        />
      </div>

      {error ? (
        <p className="mt-5 rounded-sm border border-red-800/30 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-6 inline-flex items-center justify-center rounded-sm bg-[#1F6A64] px-6 py-2.5 text-sm font-medium tracking-wide text-[#F9F8F3] transition hover:bg-[#1A2B3C] hover:shadow-[inset_0_0_0_1px_#C4A574] disabled:opacity-60"
      >
        {status === "loading" ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
