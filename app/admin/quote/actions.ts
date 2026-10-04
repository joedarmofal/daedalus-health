"use server";

import { getAdminAccess } from "@/lib/admin-access";
import { SCOPE_MODULES, type ScopeModuleId } from "@/lib/consulting-quote";
import { draftConsultingProposal, isQuoteAiConfigured } from "@/lib/quote-ai";

export async function draftQuoteProposal(input: {
  organizationName: string;
  contactName: string;
  organizationType: string;
  engagementLabel: string;
  weeks: number;
  modules: ScopeModuleId[];
  notes: string;
  feeLow: string;
  feeHigh: string;
  feeTotal: string;
  retainers: string[];
}): Promise<
  | {
      ok: true;
      title: string;
      executiveSummary: string;
      situation: string;
      scope: string;
      approach: string;
      nextSteps: string;
    }
  | { ok: false; error: string }
> {
  const access = await getAdminAccess();
  if (access.status !== "ok") {
    return { ok: false, error: "Administrator sign-in is required." };
  }

  if (!isQuoteAiConfigured()) {
    return {
      ok: false,
      error:
        "Proposal drafting is not configured. Add OPENAI_API_KEY in Vercel Production, then redeploy.",
    };
  }

  try {
    const draft = await draftConsultingProposal({
      ...input,
      modules: SCOPE_MODULES.filter((module) =>
        input.modules.includes(module.id),
      ).map((module) => module.label),
    });
    if (!draft.executiveSummary && !draft.scope) {
      return { ok: false, error: "The draft was empty. Add notes and try again." };
    }
    return { ok: true, ...draft };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : "The drafting service could not complete this request.",
    };
  }
}
