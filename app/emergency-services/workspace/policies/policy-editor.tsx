"use client";

import {
  POLICY_CATEGORIES,
  POLICY_STATUSES,
  type EmergencyPolicy,
  type PolicyCategory,
  type PolicyStatus,
} from "@/lib/emergency-policies";
import { useState, type FormEvent } from "react";
import {
  deleteEmergencyPolicy,
  draftEmergencyPolicy,
  saveEmergencyPolicy,
} from "./actions";

const inputClass =
  "mt-1.5 w-full rounded-sm border border-[#1A2B3C]/20 bg-[#F7F5F0] px-3.5 py-2.5 text-sm text-[#1A2B3C] outline-none focus:border-[#1F6A64] focus:ring-2 focus:ring-[#1F6A64]/20";

const STARTERS = [
  {
    category: "clinical",
    title: "Controlled substance accountability",
    prompt:
      "Write a policy for procurement, daily count, waste with witness, discrepancy investigation, and storage of controlled substances on the aircraft or ambulance.",
  },
  {
    category: "clinical",
    title: "Infection prevention for transport",
    prompt:
      "Write a policy for cleaning between patients, PPE, isolation transports, and exposure follow-up.",
  },
  {
    category: "clinical",
    title: "Blood product administration",
    prompt:
      "Write a policy for carrying, storing, checking, administering, and wasting blood products in transport.",
  },
  {
    category: "administrative",
    title: "Duty time and fatigue",
    prompt:
      "Write a policy for duty-time limits, rest, relief, and how a fatigued clinician or pilot can decline a mission without penalty.",
  },
  {
    category: "administrative",
    title: "Just culture and event reporting",
    prompt:
      "Write a policy for non-punitive reporting of errors and near misses, investigation, and feedback to crews.",
  },
  {
    category: "operational",
    title: "Landing zone and scene safety",
    prompt:
      "Write a policy for LZ selection, communication with first responders, and abort authority at the scene.",
  },
];

export function PolicyEditor({ policy }: { policy?: EmergencyPolicy }) {
  const [title, setTitle] = useState(policy?.title ?? "");
  const [category, setCategory] = useState(policy?.category ?? "clinical");
  const [status, setStatus] = useState(policy?.status ?? "draft");
  const [purpose, setPurpose] = useState(policy?.purpose ?? "");
  const [body, setBody] = useState(policy?.body ?? "");
  const [ownerName, setOwnerName] = useState(policy?.owner_name ?? "");
  const [reviewDate, setReviewDate] = useState(policy?.review_date ?? "");
  const [sourceNotes, setSourceNotes] = useState(policy?.source_notes ?? "");
  const [aiNotes, setAiNotes] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "loading" | "saved">("idle");
  const [aiState, setAiState] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  async function handleDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAiState("loading");
    setAiError(null);
    setAiNotice(null);

    const formData = new FormData(event.currentTarget);
    formData.set("title", title);
    formData.set("category", category);
    formData.set("existing_body", body);

    const result = await draftEmergencyPolicy(formData);
    setAiState("idle");
    if (!result.ok) {
      setAiError(result.error);
      return;
    }

    setTitle(result.title);
    setPurpose(result.purpose);
    setBody(result.body);
    if (status === "archived") setStatus("draft");
    setAiNotice("Draft inserted below. Review every [TO CONFIRM] before you save.");
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveState("loading");
    setError(null);
    const result = await saveEmergencyPolicy(new FormData(event.currentTarget));
    if (result && !result.ok) {
      setSaveState("idle");
      setError(result.error);
      return;
    }
    setSaveState("saved");
  }

  async function handleDelete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!confirm("Delete this policy from the library?")) return;
    const result = await deleteEmergencyPolicy(new FormData(event.currentTarget));
    if (result && !result.ok) {
      setError(result.error);
    }
  }

  return (
    <div className="space-y-6">
      {!policy ? (
        <div className="rounded-sm border border-[#1A2B3C]/12 bg-[#F9F8F3] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1A2B3C]/45">
            Start from a common need
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {STARTERS.map((starter) => (
              <button
                key={starter.title}
                type="button"
                onClick={() => {
                  setTitle(starter.title);
                  setCategory(starter.category as PolicyCategory);
                  setAiNotes(starter.prompt);
                }}
                className="rounded-sm border border-[#1A2B3C]/15 px-3 py-1.5 text-xs text-[#1A2B3C]/75 hover:border-[#C4A574] hover:text-[#1A2B3C]"
              >
                {starter.title}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <form
        onSubmit={handleDraft}
        className="rounded-sm border border-[#C4A574]/35 bg-[#C4A574]/8 p-5"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a6d3d]">
          Draft with AI
        </p>
        <p className="mt-1.5 text-sm leading-6 text-[#1A2B3C]/65">
          Describe the policy you need, or upload an existing SOP, protocol, or
          draft. Do not upload patient records or other PHI.
        </p>
        <label className="mt-4 block text-sm font-medium text-[#1A2B3C]">
          Notes or prompt
          <textarea
            name="ai_notes"
            rows={4}
            value={aiNotes}
            onChange={(event) => setAiNotes(event.target.value)}
            className={inputClass}
            placeholder="Example: We need a fatigue policy for a dual-pilot IFR rotor program with 24-hour shifts at two bases…"
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
        {aiError ? <p className="mt-3 text-sm text-red-800">{aiError}</p> : null}
        {aiNotice ? <p className="mt-3 text-sm text-[#1F6A64]">{aiNotice}</p> : null}
        <button
          type="submit"
          disabled={aiState === "loading"}
          className="mt-4 rounded-sm border border-[#C4A574] bg-[#F9F8F3] px-4 py-2 text-sm font-medium text-[#1A2B3C] hover:bg-[#C4A574]/15 disabled:opacity-60"
        >
          {aiState === "loading" ? "Drafting…" : "Draft this policy"}
        </button>
      </form>

      <form
        onSubmit={handleSave}
        className="rounded-sm border border-[#1A2B3C]/12 bg-[#F9F8F3] p-5"
      >
        {policy ? <input type="hidden" name="policy_id" value={policy.id} /> : null}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2 text-sm font-medium text-[#1A2B3C]">
            Title
            <input
              name="title"
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="text-sm font-medium text-[#1A2B3C]">
            Category
            <select
              name="category"
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as PolicyCategory)
              }
              className={inputClass}
            >
              {POLICY_CATEGORIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-[#1A2B3C]">
            Status
            <select
              name="status"
              value={status}
              onChange={(event) => setStatus(event.target.value as PolicyStatus)}
              className={inputClass}
            >
              {POLICY_STATUSES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-[#1A2B3C]">
            Owner
            <input
              name="owner_name"
              value={ownerName}
              onChange={(event) => setOwnerName(event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="text-sm font-medium text-[#1A2B3C]">
            Next review
            <input
              name="review_date"
              type="date"
              value={reviewDate}
              onChange={(event) => setReviewDate(event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="sm:col-span-2 text-sm font-medium text-[#1A2B3C]">
            Purpose
            <textarea
              name="purpose"
              rows={3}
              value={purpose}
              onChange={(event) => setPurpose(event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="sm:col-span-2 text-sm font-medium text-[#1A2B3C]">
            Policy
            <textarea
              name="body"
              rows={16}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              className={inputClass}
              placeholder="Policy statement, procedure, responsibilities, and related documents."
            />
          </label>
          <label className="sm:col-span-2 text-sm font-medium text-[#1A2B3C]">
            Source notes
            <textarea
              name="source_notes"
              rows={3}
              value={sourceNotes}
              onChange={(event) => setSourceNotes(event.target.value)}
              className={inputClass}
            />
          </label>
        </div>

        {error ? <p className="mt-4 text-sm text-red-800">{error}</p> : null}
        {saveState === "saved" ? (
          <p className="mt-4 text-sm text-[#1F6A64]">Saved to this organization’s library.</p>
        ) : null}

        <button
          type="submit"
          disabled={saveState === "loading"}
          className="mt-5 rounded-sm bg-[#1F6A64] px-4 py-2.5 text-sm font-medium text-[#F9F8F3] disabled:opacity-60"
        >
          {saveState === "loading"
            ? "Saving…"
            : policy
              ? "Save policy"
              : "Save to library"}
        </button>
      </form>

      {policy ? (
        <form onSubmit={handleDelete}>
          <input type="hidden" name="policy_id" value={policy.id} />
          <button
            type="submit"
            className="text-sm text-red-800/80 hover:text-red-800"
          >
            Delete from library
          </button>
        </form>
      ) : null}
    </div>
  );
}
