export const QUOTE_STORAGE_KEY = "daedalus-consulting-quote";

export const ENGAGEMENT_TYPES = [
  {
    id: "diagnostic",
    label: "Readiness diagnostic",
    summary:
      "A time-boxed assessment of the AI inventory, decision rights, and immediate risk.",
    weeks: 4,
    principalDays: 6,
    advisorDays: 8,
    analystDays: 4,
  },
  {
    id: "framework",
    label: "Governance framework install",
    summary:
      "Standing committees, policy set, escalation paths, and a durable operating cadence.",
    weeks: 12,
    principalDays: 14,
    advisorDays: 22,
    analystDays: 10,
  },
  {
    id: "validation",
    label: "Clinical validation program",
    summary:
      "Local evidence bars, bias and drift surveillance, and go-live / retire criteria.",
    weeks: 16,
    principalDays: 12,
    advisorDays: 28,
    analystDays: 14,
  },
  {
    id: "emergency",
    label: "Emergency services support",
    summary:
      "EMS / HEMS program work: policy library, PIF preparation, and survey readiness.",
    weeks: 10,
    principalDays: 10,
    advisorDays: 16,
    analystDays: 8,
  },
  {
    id: "custom",
    label: "Custom / blended",
    summary:
      "Build the engagement from selected scope modules and your own day counts.",
    weeks: 8,
    principalDays: 8,
    advisorDays: 12,
    analystDays: 6,
  },
] as const;

export type EngagementTypeId = (typeof ENGAGEMENT_TYPES)[number]["id"];

export const SCOPE_MODULES = [
  {
    id: "inventory",
    label: "Model inventory and shadow-IT capture",
    days: 4,
    role: "advisor" as const,
  },
  {
    id: "policy",
    label: "Core AI policy library",
    days: 6,
    role: "advisor" as const,
  },
  {
    id: "committees",
    label: "Committee charters and decision rights",
    days: 4,
    role: "principal" as const,
  },
  {
    id: "vendor",
    label: "Vendor diligence and contracting support",
    days: 5,
    role: "advisor" as const,
  },
  {
    id: "validation",
    label: "Clinical validation protocol",
    days: 8,
    role: "advisor" as const,
  },
  {
    id: "board",
    label: "Board or executive briefing",
    days: 2,
    role: "principal" as const,
  },
  {
    id: "education",
    label: "Staff education workshop",
    days: 3,
    role: "advisor" as const,
  },
  {
    id: "emergency",
    label: "Emergency services / PIF support",
    days: 8,
    role: "advisor" as const,
  },
  {
    id: "fractional",
    label: "Fractional CAIO transition plan",
    days: 4,
    role: "principal" as const,
  },
] as const;

export type ScopeModuleId = (typeof SCOPE_MODULES)[number]["id"];

export const COMPLEXITY_OPTIONS = [
  { id: "focused", label: "Focused (1–5 models)", multiplier: 1 },
  { id: "enterprise", label: "Enterprise (6–20 models)", multiplier: 1.25 },
  { id: "system", label: "System / multi-state (21+)", multiplier: 1.5 },
] as const;

export type ComplexityId = (typeof COMPLEXITY_OPTIONS)[number]["id"];

export const SIZE_OPTIONS = [
  { id: "community", label: "Community / single hospital", multiplier: 1 },
  { id: "regional", label: "Regional system", multiplier: 1.15 },
  { id: "academic", label: "Academic / national system", multiplier: 1.3 },
] as const;

export type SizeId = (typeof SIZE_OPTIONS)[number]["id"];

export const RETAINER_TIERS = [
  {
    id: "oversight",
    label: "Oversight retainer",
    principalDaysPerMonth: 2,
    advisorDaysPerMonth: 0,
    termMonths: 12,
    summary:
      "Monthly office hours, inventory hygiene, and one board or committee appearance a quarter.",
  },
  {
    id: "fractional",
    label: "Fractional CAIO retainer",
    principalDaysPerMonth: 4,
    advisorDaysPerMonth: 1,
    termMonths: 12,
    summary:
      "Named senior coverage for model intake, vendor reviews, and standing governance meetings.",
  },
  {
    id: "embedded",
    label: "Embedded program retainer",
    principalDaysPerMonth: 6,
    advisorDaysPerMonth: 2,
    termMonths: 12,
    summary:
      "Continuing validation, policy refresh, and multi-facility coordination after the project.",
  },
] as const;

export type RetainerTierId = (typeof RETAINER_TIERS)[number]["id"];

export interface ConsultingQuoteInputs {
  organizationName: string;
  contactName: string;
  organizationType: string;
  size: SizeId;
  complexity: ComplexityId;
  engagementType: EngagementTypeId;
  weeks: number;
  principalDayRate: number;
  advisorDayRate: number;
  analystDayRate: number;
  travelDayRate: number;
  onsiteDays: number;
  principalDaysOverride: number | null;
  advisorDaysOverride: number | null;
  analystDaysOverride: number | null;
  modules: ScopeModuleId[];
  includeContingency: boolean;
  notes: string;
}

export const DEFAULT_QUOTE_INPUTS: ConsultingQuoteInputs = {
  organizationName: "",
  contactName: "",
  organizationType: "Hospital system",
  size: "regional",
  complexity: "enterprise",
  engagementType: "framework",
  weeks: 12,
  principalDayRate: 4400,
  advisorDayRate: 2800,
  analystDayRate: 1600,
  travelDayRate: 1200,
  onsiteDays: 4,
  principalDaysOverride: null,
  advisorDaysOverride: null,
  analystDaysOverride: null,
  modules: ["inventory", "policy", "committees", "board"],
  includeContingency: true,
  notes: "",
};

export interface QuoteLine {
  label: string;
  days: number;
  rate: number;
  amount: number;
}

export interface RetainerOption {
  id: RetainerTierId;
  label: string;
  summary: string;
  termMonths: number;
  monthly: number;
  annual: number;
}

export interface ConsultingQuoteResult {
  engagementLabel: string;
  engagementSummary: string;
  weeks: number;
  principalDays: number;
  advisorDays: number;
  analystDays: number;
  lines: QuoteLine[];
  labor: number;
  travel: number;
  contingency: number;
  total: number;
  rangeLow: number;
  rangeHigh: number;
  retainers: RetainerOption[];
  assumptions: string[];
}

export function formatQuoteCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

export function getEngagement(id: EngagementTypeId) {
  return ENGAGEMENT_TYPES.find((item) => item.id === id) ?? ENGAGEMENT_TYPES[1];
}

export function calculateConsultingQuote(
  inputs: ConsultingQuoteInputs,
): ConsultingQuoteResult {
  const engagement = getEngagement(inputs.engagementType);
  const complexity =
    COMPLEXITY_OPTIONS.find((item) => item.id === inputs.complexity)
      ?.multiplier ?? 1;
  const size =
    SIZE_OPTIONS.find((item) => item.id === inputs.size)?.multiplier ?? 1;
  const mix = complexity * size;

  const moduleDays = { principal: 0, advisor: 0, analyst: 0 };
  for (const moduleId of inputs.modules) {
    const module = SCOPE_MODULES.find((item) => item.id === moduleId);
    if (!module) continue;
    moduleDays[module.role] += module.days;
  }

  const useModules = inputs.engagementType === "custom" || inputs.modules.length > 0;
  const basePrincipal = useModules
    ? Math.max(engagement.principalDays, moduleDays.principal)
    : engagement.principalDays;
  const baseAdvisor = useModules
    ? engagement.advisorDays + moduleDays.advisor
    : engagement.advisorDays;
  const baseAnalyst = useModules
    ? engagement.analystDays + moduleDays.analyst
    : engagement.analystDays;

  const principalDays =
    inputs.principalDaysOverride ?? roundDays(basePrincipal * mix);
  const advisorDays =
    inputs.advisorDaysOverride ?? roundDays(baseAdvisor * mix);
  const analystDays =
    inputs.analystDaysOverride ?? roundDays(baseAnalyst * mix);
  const weeks = Math.max(1, Math.round(inputs.weeks || engagement.weeks));
  const onsiteDays = Math.max(0, inputs.onsiteDays);

  const lines: QuoteLine[] = [
    line("Principal / lead advisor", principalDays, inputs.principalDayRate),
    line("Senior advisor", advisorDays, inputs.advisorDayRate),
    line("Analyst / drafting support", analystDays, inputs.analystDayRate),
  ].filter((item) => item.days > 0);

  const labor = lines.reduce((sum, item) => sum + item.amount, 0);
  const travel = onsiteDays * Math.max(0, inputs.travelDayRate);
  const contingency = inputs.includeContingency ? labor * 0.1 : 0;
  const total = labor + travel + contingency;

  const retainers: RetainerOption[] = RETAINER_TIERS.map((tier) => {
    const monthly =
      tier.principalDaysPerMonth * inputs.principalDayRate +
      tier.advisorDaysPerMonth * inputs.advisorDayRate;
    return {
      id: tier.id,
      label: tier.label,
      summary: tier.summary,
      termMonths: tier.termMonths,
      monthly,
      annual: monthly * tier.termMonths,
    };
  });

  const selectedModules = SCOPE_MODULES.filter((module) =>
    inputs.modules.includes(module.id),
  ).map((module) => module.label);

  return {
    engagementLabel: engagement.label,
    engagementSummary: engagement.summary,
    weeks,
    principalDays,
    advisorDays,
    analystDays,
    lines,
    labor,
    travel,
    contingency,
    total,
    rangeLow: total * 0.92,
    rangeHigh: total * 1.12,
    retainers,
    assumptions: [
      "Day rates are boutique healthcare-advisory planning defaults (principal ≈ $550/hour, advisor ≈ $350/hour, analyst ≈ $200/hour) and can be overridden before a quote is sent.",
      "A professional day is eight hours. Unused days are not refunded; material scope change is a change order.",
      selectedModules.length
        ? `Selected scope modules: ${selectedModules.join("; ")}.`
        : "No extra scope modules selected — estimate follows the engagement archetype only.",
      `Complexity and organization-size multipliers applied: ${mix.toFixed(2)}×.`,
      onsiteDays
        ? `On-site time is estimated at ${onsiteDays} days. Airfare, hotel, and ground are billed at cost unless a travel cap is agreed.`
        : "Delivery is assumed remote unless on-site days are added.",
      inputs.includeContingency
        ? "A 10% contingency is included for discovery findings that stay inside the original intent."
        : "No contingency is included. Out-of-scope work will be quoted separately.",
      "This is a planning quote, not a binding offer and not legal advice. Confirm names, dates, and deliverables before sending.",
    ],
  };
}

function line(label: string, days: number, rate: number): QuoteLine {
  return {
    label,
    days,
    rate,
    amount: days * Math.max(0, rate),
  };
}

function roundDays(value: number): number {
  return Math.max(0, Math.round(value * 2) / 2);
}
