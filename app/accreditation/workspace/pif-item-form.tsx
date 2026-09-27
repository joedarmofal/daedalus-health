"use client";

import { PIF_STATUSES, type CamtsStandard } from "@/lib/camts-pif";
import { useState, type FormEvent } from "react";
import { savePifItem } from "./actions";

const inputClass =
  "mt-1.5 w-full rounded-sm border border-[#1A2B3C]/20 bg-[#F7F5F0] px-3.5 py-2.5 text-sm text-[#1A2B3C] outline-none focus:border-[#1F6A64] focus:ring-2 focus:ring-[#1F6A64]/20";

export function PifItemForm({
  item,
  saved,
}: {
  item: CamtsStandard;
  saved?: {
    status?: string;
    narrative?: string | null;
    evidence_notes?: string | null;
    owner_name?: string | null;
  };
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError(null);
    const result = await savePifItem(new FormData(event.currentTarget));
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
      className="rounded-sm border border-[#1A2B3C]/12 bg-[#F9F8F3] p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-[#1F6A64]">
            {item.id}
          </p>
          <h3 className="mt-1 font-serif text-lg text-[#1A2B3C]">{item.title}</h3>
        </div>
        <select
          name="status"
          defaultValue={saved?.status ?? "not_started"}
          className="rounded-sm border border-[#1A2B3C]/20 bg-[#F7F5F0] px-3 py-2 text-sm"
        >
          {PIF_STATUSES.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <p className="mt-3 text-sm leading-6 text-[#1A2B3C]/70">{item.prompt}</p>
      <p className="mt-2 text-xs leading-5 text-[#1A2B3C]/45">
        Typical evidence: {item.evidence}
      </p>

      <input type="hidden" name="standard_id" value={item.id} />

      <label className="mt-4 block text-sm font-medium text-[#1A2B3C]">
        PIF narrative
        <textarea
          name="narrative"
          rows={5}
          defaultValue={saved?.narrative ?? ""}
          className={inputClass}
          placeholder="Write the program’s answer as it should appear in the PIF."
        />
      </label>
      <label className="mt-3 block text-sm font-medium text-[#1A2B3C]">
        Evidence and attachments to collect
        <textarea
          name="evidence_notes"
          rows={3}
          defaultValue={saved?.evidence_notes ?? ""}
          className={inputClass}
        />
      </label>
      <label className="mt-3 block text-sm font-medium text-[#1A2B3C]">
        Owner
        <input
          name="owner_name"
          defaultValue={saved?.owner_name ?? ""}
          className={inputClass}
          placeholder="Name or role"
        />
      </label>

      {error ? (
        <p className="mt-3 text-sm text-red-800">{error}</p>
      ) : null}
      {status === "saved" ? (
        <p className="mt-3 text-sm text-[#1F6A64]">Saved.</p>
      ) : null}

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-4 rounded-sm bg-[#1F6A64] px-4 py-2 text-sm font-medium text-[#F9F8F3] disabled:opacity-60"
      >
        {status === "loading" ? "Saving…" : "Save item"}
      </button>
    </form>
  );
}
