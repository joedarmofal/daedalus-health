import type { ExtractedMaterial } from "@/lib/pif-ai";

const MAX_MATERIAL_CHARS = 18_000;

export async function draftPolicyFromMaterials(input: {
  organizationName: string;
  programName?: string | null;
  transportModes?: string[];
  category: string;
  title: string;
  notes: string;
  existingBody: string;
  materials: ExtractedMaterial[];
}): Promise<{ title: string; purpose: string; body: string }> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "Policy drafting is not configured. Add OPENAI_API_KEY in Vercel Production environment variables.",
    );
  }

  const clipped = clipMaterials(input.materials);
  const userContent = [
    `Organization: ${input.organizationName}`,
    input.programName ? `Program: ${input.programName}` : null,
    input.transportModes?.length
      ? `Transport modes: ${input.transportModes.join(", ")}`
      : null,
    `Policy category: ${input.category}`,
    input.title ? `Working title: ${input.title}` : "No title yet.",
    input.notes ? `Program notes / prompt:\n${input.notes}` : "No extra notes.",
    input.existingBody
      ? `Existing draft to revise:\n${input.existingBody}`
      : "No existing draft.",
    clipped.length
      ? `Uploaded materials:\n${clipped
          .map((material) => `--- ${material.name} ---\n${material.text}`)
          .join("\n\n")}`
      : "No files uploaded.",
  ]
    .filter(Boolean)
    .join("\n\n");

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
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent },
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

  let parsed: { title?: unknown; purpose?: unknown; body?: unknown };
  try {
    parsed = JSON.parse(content) as {
      title?: unknown;
      purpose?: unknown;
      body?: unknown;
    };
  } catch {
    throw new Error("The drafting service returned an unreadable draft. Try again.");
  }

  const title = typeof parsed.title === "string" ? parsed.title.trim() : "";
  const purpose = typeof parsed.purpose === "string" ? parsed.purpose.trim() : "";
  const body = typeof parsed.body === "string" ? parsed.body.trim() : "";

  if (!body) {
    throw new Error("The draft had no policy text. Add more notes or a file and try again.");
  }

  return {
    title: title || input.title || "Untitled policy",
    purpose,
    body,
  };
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

const SYSTEM_PROMPT = `You help an EMS or HEMS program write a clinical or administrative policy.

Rules:
- Write a complete policy the program can adopt after review: purpose, policy statement, procedure, responsibilities, and related documents.
- Use the program's voice (we / our program / this program).
- Use only facts from the organization profile, notes, existing draft, or uploaded materials.
- If a needed fact is missing, write [TO CONFIRM: ...] instead of inventing names, intervals, doses, or legal claims.
- Do not include patient names, record numbers, or other PHI. If a source appears to contain PHI, omit it and note [REDACTED].
- This is a working draft, not legal advice and not official CAMTS standard text.
- Keep language operational and survey-ready.

Return JSON only:
{"title":"...","purpose":"...","body":"..."}`;
