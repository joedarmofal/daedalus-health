"use client";

import {
  ACCREDITATION_STATUSES,
  TRANSPORT_MODES,
} from "@/lib/camts-pif";
import { useState, type FormEvent } from "react";
import { saveAccreditationProgram } from "./actions";

const inputClass =
  "mt-1.5 w-full rounded-sm border border-[#1A2B3C]/20 bg-[#F7F5F0] px-3.5 py-2.5 text-sm text-[#1A2B3C] outline-none placeholder:text-[#1A2B3C]/40 focus:border-[#1F6A64] focus:ring-2 focus:ring-[#1F6A64]/20";

export function ProgramForm({
  program,
}: {
  program: {
    program_name: string;
    transport_modes: string[];
    accreditation_status: string | null;
    camts_edition: string;
    target_survey_date: string | null;
    medical_director: string | null;
    program_director: string | null;
    base_location: string | null;
    notes: string | null;
  };
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError(null);
    const result = await saveAccreditationProgram(new FormData(event.currentTarget));
    if (!result.ok) {
      setStatus("idle");
      setError(result.error);
      return;
    }
    setStatus("saved");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-sm border border-[#1A2B3C]/15 bg-[#F9F8F3] p-6 shadow-[0_24px_60px_-36px_rgba(26,43,60,0.4)]"
    >
      <h2 className="font-serif text-xl font-medium text-[#1A2B3C]">
        Program profile
      </h2>
      <p className="mt-1 text-sm text-[#1A2B3C]/65">
        This header information belongs at the front of the PIF.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="program_name" className="text-sm font-medium text-[#1A2B3C]">
            Program name
          </label>
          <input
            id="program_name"
            name="program_name"
            required
            defaultValue={program.program_name}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="program_director" className="text-sm font-medium text-[#1A2B3C]">
            Program director
          </label>
          <input
            id="program_director"
            name="program_director"
            defaultValue={program.program_director ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="medical_director" className="text-sm font-medium text-[#1A2B3C]">
            Medical director
          </label>
          <input
            id="medical_director"
            name="medical_director"
            defaultValue={program.medical_director ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="base_location" className="text-sm font-medium text-[#1A2B3C]">
            Primary base / city
          </label>
          <input
            id="base_location"
            name="base_location"
            defaultValue={program.base_location ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="target_survey_date" className="text-sm font-medium text-[#1A2B3C]">
            Target survey date
          </label>
          <input
            id="target_survey_date"
            name="target_survey_date"
            type="date"
            defaultValue={program.target_survey_date ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label
            htmlFor="accreditation_status"
            className="text-sm font-medium text-[#1A2B3C]"
          >
            Cycle status
          </label>
          <select
            id="accreditation_status"
            name="accreditation_status"
            defaultValue={program.accreditation_status ?? ""}
            className={inputClass}
          >
            <option value="">Select…</option>
            {ACCREDITATION_STATUSES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="camts_edition" className="text-sm font-medium text-[#1A2B3C]">
            CAMTS edition in use
          </label>
          <input
            id="camts_edition"
            name="camts_edition"
            defaultValue={program.camts_edition}
            className={inputClass}
          />
        </div>
        <fieldset className="sm:col-span-2">
          <legend className="text-sm font-medium text-[#1A2B3C]">
            Transport modes
          </legend>
          <div className="mt-2 flex flex-wrap gap-4">
            {TRANSPORT_MODES.map((mode) => (
              <label key={mode.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="transport_modes"
                  value={mode.id}
                  defaultChecked={program.transport_modes.includes(mode.id)}
                />
                {mode.label}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="sm:col-span-2">
          <label htmlFor="notes" className="text-sm font-medium text-[#1A2B3C]">
            Notes for the survey team
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            defaultValue={program.notes ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded-sm border border-red-800/30 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}
      {status === "saved" ? (
        <p className="mt-4 text-sm text-[#1F6A64]">Program profile saved.</p>
      ) : null}

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-5 rounded-sm bg-[#1F6A64] px-5 py-2.5 text-sm font-medium text-[#F9F8F3] transition hover:bg-[#1A2B3C] disabled:opacity-60"
      >
        {status === "loading" ? "Saving…" : "Save program profile"}
      </button>
    </form>
  );
}
