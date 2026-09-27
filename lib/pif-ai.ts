import type { AccreditationProgram } from "@/lib/accreditation-data";
import type { CamtsSection, CamtsStandard } from "@/lib/camts-pif";

const MAX_FILES = 4;
const MAX_FILE_BYTES = 800_000;
const MAX_MATERIAL_CHARS = 18_000;

export function isPifAiConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export interface ExtractedMaterial {
  name: string;
  text: string;
}

export async function extractPifMaterials(
  files: File[],
): Promise<
  | { ok: true; materials: ExtractedMaterial[] }
  | { ok: false; error: string }
> {
  if (files.length > MAX_FILES) {
    return { ok: false, error: `Upload at most ${MAX_FILES} files at a time.` };
  }

  const materials: ExtractedMaterial[] = [];

  for (const file of files) {
    if (file.size > MAX_FILE_BYTES) {
      return {
        ok: false,
        error: `${file.name} is too large. Keep each file under 800 KB, or paste the relevant pages.`,
      };
    }

    const extracted = await extractFileText(file);
    if (!extracted.ok) return extracted;
    if (extracted.text.trim().length === 0) {
      return {
        ok: false,
        error: `${file.name} had no readable text. Export it as .txt, .md, or .docx, or paste the relevant language.`,
      };
    }
    materials.push({ name: file.name, text: extracted.text });
  }

  return { ok: true, materials };
}

async function extractFileText(
  file: File,
): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  const name = file.name.toLowerCase();

  if (
    file.type.startsWith("text/") ||
    name.endsWith(".txt") ||
    name.endsWith(".md") ||
    name.endsWith(".csv")
  ) {
    return { ok: true, text: await file.text() };
  }

  if (name.endsWith(".docx")) {
    try {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({
        buffer: Buffer.from(await file.arrayBuffer()),
      });
      return { ok: true, text: result.value };
    } catch {
      return {
        ok: false,
        error: `Could not read ${file.name}. Save it as .docx or paste the text.`,
      };
    }
  }

  if (name.endsWith(".pdf")) {
    try {
      const { extractText } = await import("unpdf");
      const { text } = await extractText(
        new Uint8Array(await file.arrayBuffer()),
        { mergePages: true },
      );
      return { ok: true, text };
    } catch {
      return {
        ok: false,
        error: `Could not read text from ${file.name}. Paste the relevant pages or export as .docx / .txt.`,
      };
    }
  }

  return {
    ok: false,
    error: `${file.name} is not a supported type. Use .txt, .md, .docx, or .pdf.`,
  };
}

export async function draftPifFromMaterials(input: {
  program: AccreditationProgram;
  section: CamtsSection;
  item: CamtsStandard;
  notes: string;
  existingNarrative: string;
  materials: ExtractedMaterial[];
}): Promise<{ narrative: string; evidenceNotes: string }> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "PIF drafting is not configured. Add OPENAI_API_KEY in Vercel Production environment variables.",
    );
  }

  const clipped = clipMaterials(input.materials);
  const userContent = [
    `Program name: ${input.program.program_name}`,
    `Transport modes: ${input.program.transport_modes.join(", ") || "not listed"}`,
    `Medical director: ${input.program.medical_director || "not listed"}`,
    `Program director: ${input.program.program_director || "not listed"}`,
    `Base: ${input.program.base_location || "not listed"}`,
    `CAMTS edition in use: ${input.program.camts_edition}`,
    `PIF section: ${input.section.number} ${input.section.title}`,
    `Item: ${input.item.id} ${input.item.title}`,
    `What this item should cover: ${input.item.prompt}`,
    `Typical evidence: ${input.item.evidence}`,
    input.existingNarrative
      ? `Existing draft to revise:\n${input.existingNarrative}`
      : "No existing draft.",
    input.notes ? `Program notes / prompt:\n${input.notes}` : "No extra notes.",
    clipped.length
      ? `Uploaded materials:\n${clipped
          .map((material) => `--- ${material.name} ---\n${material.text}`)
          .join("\n\n")}`
      : "No files uploaded.",
  ].join("\n\n");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: userContent,
        },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    if (response.status === 401 || response.status === 403) {
      throw new Error(
        "OpenAI rejected the API key. Check OPENAI_API_KEY in Vercel Production.",
      );
    }
    throw new Error(
      detail.slice(0, 240) || "The drafting service could not complete this request.",
    );
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("The drafting service returned an empty draft.");
  }

  let parsed: { narrative?: unknown; evidence_notes?: unknown };
  try {
    parsed = JSON.parse(content) as {
      narrative?: unknown;
      evidence_notes?: unknown;
    };
  } catch {
    throw new Error("The drafting service returned an unreadable draft. Try again.");
  }

  const narrative =
    typeof parsed.narrative === "string" ? parsed.narrative.trim() : "";
  const evidenceNotes =
    typeof parsed.evidence_notes === "string"
      ? parsed.evidence_notes.trim()
      : "";

  if (!narrative) {
    throw new Error("The draft had no narrative. Add more notes or a file and try again.");
  }

  return { narrative, evidenceNotes };
}

function clipMaterials(materials: ExtractedMaterial[]): ExtractedMaterial[] {
  const clipped: ExtractedMaterial[] = [];
  let used = 0;
  for (const material of materials) {
    const remaining = MAX_MATERIAL_CHARS - used;
    if (remaining <= 0) break;
    const text =
      material.text.length > remaining
        ? `${material.text.slice(0, remaining)}\n[truncated]`
        : material.text;
    used += text.length;
    clipped.push({ name: material.name, text });
  }
  return clipped;
}

const SYSTEM_PROMPT = `You help an EMS or air medical program draft language for a CAMTS Program Information Form (PIF).

Rules:
- Write in the program's voice (we / our program).
- Use only facts present in the program profile, notes, existing draft, or uploaded materials.
- If a needed fact is missing, write [TO CONFIRM: ...] instead of inventing names, volumes, hours, dates, or compliance claims.
- Do not quote or reproduce official CAMTS standard text. This is a working draft, not the official form.
- Do not include patient names, record numbers, or other PHI. If the source appears to contain PHI, omit it and note [REDACTED].
- Keep the narrative concrete and survey-ready: who, how often, who owns it, where the proof lives.
- evidence_notes should list documents or logs the program already mentioned, plus obvious missing evidence as bullets.

Return JSON only:
{"narrative":"...","evidence_notes":"..."}`;
