export const TRUST_REQUEST_KINDS = [
  { value: "baa", label: "Business Associate Agreement (BAA)" },
  { value: "security-packet", label: "Security packet / questionnaire" },
  { value: "both", label: "BAA and security packet" },
] as const;

export type TrustRequestKind = (typeof TRUST_REQUEST_KINDS)[number]["value"];

export function trustRequestKindLabel(kind: TrustRequestKind): string {
  return TRUST_REQUEST_KINDS.find((item) => item.value === kind)?.label ?? kind;
}
