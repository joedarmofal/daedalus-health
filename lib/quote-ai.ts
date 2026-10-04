export function isQuoteAiConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export async function draftConsultingProposal(input: {
  organizationName: string;
  contactName: string;
  organizationType: string;
  engagementLabel: string;
  weeks: number;
  modules: string[];
  notes: string;
  feeLow: string;
  feeHigh: string;
  feeTotal: string;
  retainers: string[];
}): Promise<{
  title: string;
  executiveSummary: string;
  situation: string;
  scope: string;
  approach: string;
  nextSteps: string;
}> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "Proposal drafting is not configured. Add OPENAI_API_KEY in Vercel Production environment variables.",
    );
  }

  const userContent = [
    `Organization: ${input.organizationName || "[TO CONFIRM: organization]"}`,
    input.contactName ? `Primary contact: ${input.contactName}` : null,
    `Organization type: ${input.organizationType}`,
    `Engagement: ${input.engagementLabel}, ${input.weeks} weeks`,
    input.modules.length
      ? `Scope modules:\n- ${input.modules.join("\n- ")}`
      : "No extra modules listed.",
    `Planning fee midpoint: ${input.feeTotal}`,
    `Planning fee range: ${input.feeLow} – ${input.feeHigh}`,
    input.retainers.length
      ? `Retainer options:\n- ${input.retainers.join("\n- ")}`
      : "No retainer options listed.",
    input.notes ? `Operator notes:\n${input.notes}` : "No extra notes.",
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
      temperature: 0.3,
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

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(content) as Record<string, unknown>;
  } catch {
    throw new Error("The drafting service returned an unreadable draft. Try again.");
  }

  return {
    title: asText(parsed.title) || `${input.engagementLabel} proposal`,
    executiveSummary: asText(parsed.executiveSummary),
    situation: asText(parsed.situation),
    scope: asText(parsed.scope),
    approach: asText(parsed.approach),
    nextSteps: asText(parsed.nextSteps),
  };
}

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

const SYSTEM_PROMPT = `You write a short consulting proposal for Daedalus Health, an independent AI governance advisory firm for health systems and emergency-services programs.

Voice: formal, calm, specific. No hype. No vendor capture. Humans remain at the controls.

Rules:
- Use only facts supplied in the operator notes and quote fields.
- If a needed fact is missing, write [TO CONFIRM: ...] instead of inventing names, dates, certifications, savings, or legal conclusions.
- Do not mention PHI, patient records, or clinical cases. This product does not process PHI.
- Do not claim SOC 2, HITRUST, or other certifications.
- Do not invent prices. Refer to the supplied planning range; the fee table in the tool is authoritative.
- This is a working draft, not a contract and not legal advice.

Return JSON only:
{"title":"...","executiveSummary":"...","situation":"...","scope":"...","approach":"...","nextSteps":"..."}`;
