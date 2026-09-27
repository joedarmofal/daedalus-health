"use client";

import { PIF_STATUSES, type CamtsStandard, type PifStatus } from "@/lib/camts-pif";
import { useState, type FormEvent } from "react";
import { draftPifItem, savePifItem } from "./actions";

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
  const [itemStatus, setItemStatus] = useState<PifStatus>(
    (saved?.status as PifStatus) ?? "not_started",
  );
  const [narrative, setNarrative] = useState(saved?.narrative ?? "");
  const [evidenceNotes, setEvidenceNotes] = useState(saved?.evidence_notes ?? "");
  const [ownerName, setOwnerName] = useState(saved?.owner_name ?? "");
  const [aiNotes, setAiNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "saved">("idle");
  const [aiStatus, setAiStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiNotice, setAiNotice] = useState<string | null>(null);

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

  async function handleDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAiStatus("loading");
    setAiError(null);
    setAiNotice(null);

    const formData = new FormData(event.currentTarget);
    formData.set("standard_id", item.id);
    formData.set("existing_narrative", narrative);

    const result = await draftPifItem(formData);
    setAiStatus("idle");

    if (!result.ok) {
      setAiError(result.error);
      return;
    }

    setNarrative(result.narrative);
    if (result.evidenceNotes) {
      setEvidenceNotes(result.evidenceNotes);
    }
    if (itemStatus === "not_started") {
      setItemStatus("in_progress");
    }
    setAiNotice("Draft inserted below. Review every [TO CONFIRM] before you save.");
  }

  return (
    <div className="rounded-sm border border-[#1A2B3C]/12 bg-[#F9F8F3] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-[#1F6A64]">
            {item.id}
          </p>
          <h3 className="mt-1 font-serif text-lg text-[#1A2B3C]">{item.title}</h3>
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-[#1A2B3C]/70">{item.prompt}</p>
      <p className="mt-2 text-xs leading-5 text-[#1A2B3C]/45">
        Typical evidence: {item.evidence}
      </p>

      <form
        onSubmit={handleDraft}
        className="mt-5 rounded-sm border border-[#C4A574]/35 bg-[#C4A574]/8 p-4"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a6d3d]">
          Draft with AI
        </p>
        <p className="mt-1.5 text-xs leading-5 text-[#1A2B3C]/60">
          Upload a policy, SOP, or training outline, or type a few facts. Do
          not upload patient names, PCRs, or other PHI. The draft only uses
          what you provide.
        </p>
        <label className="mt-3 block text-sm font-medium text-[#1A2B3C]">
          Notes or prompt
          <textarea
            name="ai_notes"
            rows={3}
            value={aiNotes}
            onChange={(event) => setAiNotes(event.target.value)}
            className={inputClass}
            placeholder="Example: Our medical director is Dr. Hale, on contract 0.4 FTE, reviews 100% of specialty charts monthly…"
          />
        </label>
        <label className="mt-3 block text-sm font-medium text-[#1A2B3C]">
          Source files
          <input
            name="materials"
            type="file"
            multiple
            accept=".txt,.md,.csv,.docx,.pdf,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="mt-1.5 block w-full text-sm text-[#1A2B3C]/70 file:mr-3 file:rounded-sm file:border-0 file:bg-[#1A2B3C] file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-[#F9F8F3]"
          />
        </label>
        {aiError ? (
          <p className="mt-3 text-sm text-red-800">{aiError}</p>
        ) : null}
        {aiNotice ? (
          <p className="mt-3 text-sm text-[#1F6A64]">{aiNotice}</p>
        ) : null}
        <button
          type="submit"
          disabled={aiStatus === "loading"}
          className="mt-4 rounded-sm border border-[#C4A574] bg-[#F9F8F3] px-4 py-2 text-sm font-medium text-[#1A2B3C] hover:bg-[#C4A574]/15 disabled:opacity-60"
        >
          {aiStatus === "loading" ? "Drafting…" : "Draft this item"}
        </button>
      </form>

      <form onSubmit={handleSubmit} className="mt-5">
        <input type="hidden" name="standard_id" value={item.id} />
        <label className="block text-sm font-medium text-[#1A2B3C]">
          Status
          <select
            name="status"
            value={itemStatus}
            onChange={(event) => setItemStatus(event.target.value as PifStatus)}
            className={`${inputClass} sm:w-auto`}
          >
            {PIF_STATUSES.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="mt-4 block text-sm font-medium text-[#1A2B3C]">
          PIF narrative
          <textarea
            name="narrative"
            rows={6}
            value={narrative}
            onChange={(event) => setNarrative(event.target.value)}
            className={inputClass}
            placeholder="Write the program’s answer as it should appear in the PIF."
          />
        </label>
        <label className="mt-3 block text-sm font-medium text-[#1A2B3C]">
          Evidence and attachments to collect
          <textarea
            name="evidence_notes"
            rows={3}
            value={evidenceNotes}
            onChange={(event) => setEvidenceNotes(event.target.value)}
            className={inputClass}
          />
        </label>
        <label className="mt-3 block text-sm font-medium text-[#1A2B3C]">
          Owner
          <input
            name="owner_name"
            value={ownerName}
            onChange={(event) => setOwnerName(event.target.value)}
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
    </div>
  );
}
