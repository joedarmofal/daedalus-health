export interface ComplianceFramework {
  id: string;
  name: string;
  jurisdiction: string;
  summary: string;
  watchFor: string;
  sourceUrl: string;
}

export interface ComplianceSituation {
  id: string;
  title: string;
  detail: string;
  frameworkIds: string[];
}

export const AI_COMPLIANCE_FRAMEWORKS: ComplianceFramework[] = [
  {
    id: "hipaa",
    name: "HIPAA / HITECH",
    jurisdiction: "United States",
    summary:
      "If a tool creates, receives, maintains, or transmits PHI, it is in HIPAA scope. Vendors that touch ePHI need a BAA, minimum-necessary access, audit logs, and a breach process.",
    watchFor:
      "Ambient scribes, ambient audio storage, EHR write-back, and any model trained or prompted with identifiable clinical text.",
    sourceUrl: "https://www.hhs.gov/hipaa/for-professionals/index.html",
  },
  {
    id: "fda-samd",
    name: "FDA AI/ML SaMD",
    jurisdiction: "United States",
    summary:
      "Software that diagnoses, treats, mitigates, or prevents disease can be a medical device. FDA’s AI/ML guidance and predetermined change-control plans apply to locked and adaptive models.",
    watchFor:
      "Imaging triage, diagnostic support, closed-loop dosing, and any output a clinician would reasonably treat as a medical claim.",
    sourceUrl:
      "https://www.fda.gov/medical-devices/software-medical-device-samd/artificial-intelligence-and-machine-learning-software-medical-device",
  },
  {
    id: "onc-hti1",
    name: "ONC HTI-1 & information blocking",
    jurisdiction: "United States",
    summary:
      "Certified EHR technology and decision-support interventions have transparency, source-attribute, and intervention-risk requirements. Information-blocking rules still apply to AI-mediated access.",
    watchFor:
      "EHR-embedded CDS, patient-portal AI, and any feature that could delay, filter, or fee-gate electronic health information.",
    sourceUrl: "https://www.healthit.gov/topic/laws-regulation-and-policy/health-data-technology-and-interoperability-hti-1",
  },
  {
    id: "section-1557",
    name: "Section 1557 (ACA nondiscrimination)",
    jurisdiction: "United States",
    summary:
      "HHS OCR treats patient-care algorithms as a civil-rights issue. Covered entities must not discriminate on race, color, national origin, sex, age, or disability — including via a model.",
    watchFor:
      "Triage, risk scores, language-access chatbots, and any tool that steers patients to different levels of care.",
    sourceUrl: "https://www.hhs.gov/civil-rights/for-individuals/section-1557/index.html",
  },
  {
    id: "ftc",
    name: "FTC Act & Health Breach Notification",
    jurisdiction: "United States",
    summary:
      "The FTC polices unfair or deceptive AI claims and, for many consumer health apps, breach notification when health data leaves the HIPAA bubble.",
    watchFor:
      "Marketing copy that overstates accuracy, “HIPAA compliant” badges without a BAA, and wellness or portal apps that are not covered entities.",
    sourceUrl: "https://www.ftc.gov/business-guidance/privacy-security/health-privacy",
  },
  {
    id: "nist-rmf",
    name: "NIST AI Risk Management Framework",
    jurisdiction: "United States (voluntary, widely expected)",
    summary:
      "Govern, Map, Measure, Manage. Boards and regulators increasingly treat NIST AI RMF as the baseline for documenting risk, not as optional reading.",
    watchFor:
      "Any production model without an intended-use statement, residual-risk record, or human-oversight plan.",
    sourceUrl: "https://www.nist.gov/itl/ai-risk-management-framework",
  },
  {
    id: "eu-ai-act",
    name: "EU AI Act",
    jurisdiction: "European Union",
    summary:
      "Risk-tiered rules. Most clinical and employment AI is high-risk: conformity assessment, data governance, logging, human oversight, and post-market monitoring. General-purpose models have separate duties.",
    watchFor:
      "EU patients, EU staff, or a model hosted/offered in the Union — including a U.S. system with a European referral pathway.",
    sourceUrl: "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai",
  },
  {
    id: "colorado-ai",
    name: "Colorado AI Act",
    jurisdiction: "Colorado, United States",
    summary:
      "Developers and deployers of high-risk AI used for consequential decisions (including health-care and employment) owe duty-of-care, impact assessments, and consumer notice.",
    watchFor:
      "Colorado residents facing hire/fire, coverage, or care-pathway decisions informed by a model.",
    sourceUrl: "https://leg.colorado.gov/bills/sb24-205",
  },
  {
    id: "state-consumer-health",
    name: "State consumer health-data laws",
    jurisdiction: "WA, NV, CT, and growing",
    summary:
      "Washington My Health My Data and similar acts cover consumer health information outside HIPAA — often including inferences about health from app or web behavior.",
    watchFor:
      "Patient-engagement AI, symptom checkers, and marketing pixels on clinical pages that are not operating solely as a covered entity.",
    sourceUrl: "https://www.atg.wa.gov/protecting-washingtonians-personal-health-data-and-privacy",
  },
  {
    id: "cpra-automated",
    name: "CPRA automated decision-making",
    jurisdiction: "California, United States",
    summary:
      "California’s privacy rules are tightening around automated decision-making, training-data transparency, and the right to access/opt out of certain profiling.",
    watchFor:
      "HR screening, patient-risk scores used for outreach, and any vendor that trains on California personal information.",
    sourceUrl: "https://cppa.ca.gov/",
  },
];

export const AI_COMPLIANCE_SITUATIONS: ComplianceSituation[] = [
  {
    id: "clinical-cds",
    title: "A model will influence diagnosis, triage, or treatment",
    detail:
      "Treat it as clinical AI until counsel and clinical safety say otherwise. FDA SaMD, local validation, Section 1557 bias review, and a named human who can override the output.",
    frameworkIds: ["fda-samd", "section-1557", "nist-rmf", "hipaa", "onc-hti1"],
  },
  {
    id: "ambient-scribe",
    title: "Ambient listening or AI scribing in the exam room",
    detail:
      "Audio is ePHI. You need a BAA, retention limits, patient notice, role-based access to recordings/transcripts, and a clear rule on whether the audio is stored at all.",
    frameworkIds: ["hipaa", "nist-rmf", "ftc", "state-consumer-health"],
  },
  {
    id: "patient-chat",
    title: "A patient-facing chatbot or symptom checker",
    detail:
      "Define whether it is education or care. Unclear medical claims invite FTC and FDA risk. Language access and disability access sit under 1557. Portal integration may trigger ONC rules.",
    frameworkIds: ["ftc", "section-1557", "hipaa", "onc-hti1", "eu-ai-act"],
  },
  {
    id: "hr-screening",
    title: "AI used in hiring, scheduling, or credentialing",
    detail:
      "Employment AI is a high-risk / consequential-decision use in Colorado and the EU. Keep a human in the loop, document the job-relatedness of features, and watch disability-bias exposure.",
    frameworkIds: ["colorado-ai", "eu-ai-act", "nist-rmf", "section-1557"],
  },
  {
    id: "revenue-cycle",
    title: "Autonomous coding, CDI, or prior authorization",
    detail:
      "Errors become False Claims and patient-access problems. Keep an audit sample, a documented appeal path, and a BAA. Do not let the model silently upcode.",
    frameworkIds: ["hipaa", "nist-rmf", "ftc"],
  },
  {
    id: "research-data",
    title: "Using clinical data to train or evaluate a model",
    detail:
      "De-identification is not a slogan. IRB or HIPAA research provisions, data-use agreements, and a ban on re-identification. EU and California add training-data duties if those people are in the set.",
    frameworkIds: ["hipaa", "eu-ai-act", "cpra-automated", "nist-rmf"],
  },
  {
    id: "vendor-baa",
    title: "Buying a third-party AI tool",
    detail:
      "BAA, subprocessors, training-on-your-data clause (default no), audit rights, FDA status if clinical, and an exit plan for the notes/models if the vendor fails.",
    frameworkIds: ["hipaa", "fda-samd", "nist-rmf", "ftc"],
  },
  {
    id: "eu-or-cross-border",
    title: "EU patients, EU staff, or a model offered into the Union",
    detail:
      "The AI Act can apply even when the health system is in the U.S. High-risk duties, logging, and human oversight are not optional because the EHR is Epic.",
    frameworkIds: ["eu-ai-act", "hipaa", "nist-rmf"],
  },
  {
    id: "marketing-claims",
    title: "Marketing or board materials that describe AI performance",
    detail:
      "Accuracy, bias, and “FDA-cleared” claims must match the actual intended use. The FTC has already gone after overstated health-AI advertising.",
    frameworkIds: ["ftc", "fda-samd", "nist-rmf"],
  },
];
