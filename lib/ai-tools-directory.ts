export interface AiTool {
  id?: string;
  name: string;
  url: string;
  summary: string;
}

export interface AiToolCategory {
  id: string;
  label: string;
  description: string;
  tools: AiTool[];
}

export const AI_TOOL_CATEGORIES: AiToolCategory[] = [
  {
    id: "ambient-scribes",
    label: "Ambient listening & scribes",
    description:
      "In-room and virtual documentation that captures the clinician–patient conversation and drafts the note.",
    tools: [
      {
        name: "Abridge",
        url: "https://www.abridge.com",
        summary:
          "Ambient clinical conversation platform used by health systems to draft notes, after-visit summaries, and coding support from the visit audio.",
      },
      {
        name: "Microsoft Dragon Copilot",
        url: "https://www.microsoft.com/en-us/health-solutions/dragon-copilot",
        summary:
          "Microsoft’s successor to Nuance DAX — ambient documentation and voice workflow inside the EHR for large health systems.",
      },
      {
        name: "Ambience Healthcare",
        url: "https://www.ambiencehealthcare.com",
        summary:
          "Enterprise ambient AI that produces notes, coding, and visit artifacts across ambulatory and hospital settings.",
      },
      {
        name: "Suki",
        url: "https://www.suki.ai",
        summary:
          "Voice assistant for clinicians: ambient notes, dictation, and EHR commands without a traditional scribe model.",
      },
      {
        name: "Nabla",
        url: "https://www.nabla.com",
        summary:
          "Ambient assistant that drafts clinical notes across many specialties and EHRs, including Epic and web-based workflows.",
      },
      {
        name: "DeepScribe",
        url: "https://www.deepscribe.ai",
        summary:
          "Ambient medical scribe with specialty-tuned note generation and EHR write-back for ambulatory groups.",
      },
      {
        name: "Heidi Health",
        url: "https://www.heidihealth.com",
        summary:
          "Clinician-facing AI scribe and medical documentation workspace used across outpatient and hospital teams.",
      },
      {
        name: "Augmedix",
        url: "https://www.augmedix.com",
        summary:
          "Ambient medical documentation and point-of-care notifications delivered through a mix of AI and trained medical documentation specialists.",
      },
    ],
  },
  {
    id: "imaging-diagnostics",
    label: "Imaging, pathology & diagnostics",
    description:
      "FDA-cleared or clinically deployed tools that read images, flag acute findings, and support specialty diagnosis.",
    tools: [
      {
        name: "Aidoc",
        url: "https://www.aidoc.com",
        summary:
          "Always-on radiology AI that triages acute findings (PE, ICH, and others) and orchestrates care-team notification.",
      },
      {
        name: "Viz.ai",
        url: "https://www.viz.ai",
        summary:
          "Care-coordination AI best known for stroke, plus modules that detect time-sensitive disease and mobilize the right specialists.",
      },
      {
        name: "PathAI",
        url: "https://www.pathai.com",
        summary:
          "Pathology AI for research and clinical labs — algorithm development, trial pathology, and quantitative tissue analysis.",
      },
      {
        name: "Paige",
        url: "https://www.paige.ai",
        summary:
          "Digital pathology platform and AI applications for cancer detection and biomarker support on whole-slide images.",
      },
      {
        name: "HeartFlow",
        url: "https://www.heartflow.com",
        summary:
          "Noninvasive coronary analysis that turns a standard CT into a physiology map used in chest-pain pathways.",
      },
      {
        name: "Qure.ai",
        url: "https://www.qure.ai",
        summary:
          "Imaging AI for chest X-ray, CT, and TB/lung screening programs, used in hospitals and public-health deployments.",
      },
      {
        name: "Annalise.ai",
        url: "https://www.annalise.ai",
        summary:
          "Comprehensive chest X-ray and CT brain AI that surfaces a wide finding set to support radiologist reads.",
      },
      {
        name: "Subtle Medical",
        url: "https://subtlemedical.com",
        summary:
          "AI that accelerates MRI and PET acquisition so scanners can run faster without a hardware replacement.",
      },
    ],
  },
  {
    id: "clinical-evidence",
    label: "Clinical decision support & evidence",
    description:
      "Point-of-care knowledge, differential support, and evidence search that sit next to the clinician — not in the note.",
    tools: [
      {
        name: "OpenEvidence",
        url: "https://www.openevidence.com",
        summary:
          "Medical evidence search used by clinicians to query guidelines and literature in natural language, with cited answers.",
      },
      {
        name: "UpToDate (Wolters Kluwer)",
        url: "https://www.wolterskluwer.com/en/solutions/uptodate",
        summary:
          "The reference standard for point-of-care clinical decision support; expanding AI-assisted search on top of its editorial content.",
      },
      {
        name: "VisualDx",
        url: "https://www.visualdx.com",
        summary:
          "Diagnostic decision support with a large medical image library, widely used for dermatology and visually presenting disease.",
      },
      {
        name: "Isabel",
        url: "https://www.isabelhealthcare.com",
        summary:
          "Differential-diagnosis checklist used as a safety net for uncommon or easily missed presentations.",
      },
      {
        name: "Glass Health",
        url: "https://glass.health",
        summary:
          "Clinical reasoning workspace that drafts assessments, plans, and differentials from a clinician’s case description.",
      },
      {
        name: "Regard",
        url: "https://www.regard.com",
        summary:
          "In-EHR clinical insights that review the chart, suggest diagnoses, and support documentation integrity for hospitalists.",
      },
    ],
  },
  {
    id: "revenue-cycle",
    label: "Revenue cycle, coding & CDI",
    description:
      "Autonomous coding, clinical documentation integrity, prior auth, and denial work that protect margin without adding FTEs.",
    tools: [
      {
        name: "AKASA",
        url: "https://www.akasa.com",
        summary:
          "Revenue-cycle AI for health systems — prior authorization, coding assistance, and follow-up work on the back of the EHR.",
      },
      {
        name: "Fathom",
        url: "https://www.fathomhealth.com",
        summary:
          "Autonomous medical coding that takes charts to billable codes for professional and facility encounters.",
      },
      {
        name: "Nym Health",
        url: "https://www.nym.health",
        summary:
          "Autonomous medical coding engine that reads clinical language and produces audit-ready codes.",
      },
      {
        name: "CodaMetrix",
        url: "https://www.codametrix.com",
        summary:
          "AI medical coding from academic medical centers, focused on specialty and hospital professional billing.",
      },
      {
        name: "Iodine Software",
        url: "https://iodinesoftware.com",
        summary:
          "Clinical documentation integrity (CDI) that flags undocumented conditions and query opportunities in the inpatient chart.",
      },
      {
        name: "SmarterDx",
        url: "https://www.smarterdx.com",
        summary:
          "Post-discharge clinical AI that finds missed diagnoses and revenue after the stay, with a physician-review model.",
      },
      {
        name: "Infinitus",
        url: "https://www.infinitus.ai",
        summary:
          "Voice AI that calls payers for benefit verification and prior authorization status so staff do not sit on hold.",
      },
      {
        name: "Cohere Health",
        url: "https://coherehealth.com",
        summary:
          "Utilization-management and prior-authorization platform used by plans and providers to reduce friction on high-volume authorizations.",
      },
    ],
  },
  {
    id: "operations",
    label: "Operations, capacity & care coordination",
    description:
      "OR, infusion, bed, and ED flow tools that turn operational data into a daily command of capacity.",
    tools: [
      {
        name: "LeanTaaS",
        url: "https://www.leantaas.com",
        summary:
          "Capacity-management AI for OR, infusion, and inpatient beds used by large health systems to raise throughput.",
      },
      {
        name: "Qventus",
        url: "https://www.qventus.com",
        summary:
          "Inpatient and perioperative operations AI that predicts discharges, OR delays, and ED boarding so charge nurses can act earlier.",
      },
      {
        name: "Notable",
        url: "https://www.notablehealth.com",
        summary:
          "Workflow automation across registration, referrals, and back-office tasks — a digital workforce layered on the EHR.",
      },
      {
        name: "Innovaccer",
        url: "https://www.innovaccer.com",
        summary:
          "Data platform and point-of-care application suite for population health, care management, and value-based performance.",
      },
      {
        name: "Health Catalyst",
        url: "https://www.healthcatalyst.com",
        summary:
          "Analytics and data-operating-system vendor that many systems use as the foundation for AI and quality reporting.",
      },
      {
        name: "Palantir",
        url: "https://www.palantir.com/offerings/health/",
        summary:
          "Foundry/AIP deployments that stitch operational, clinical, and supply data for command-center and research use cases.",
      },
    ],
  },
  {
    id: "patient-engagement",
    label: "Patient engagement & virtual care",
    description:
      "Outreach, scheduling, navigation, and conversational agents that sit in front of the call center and the portal.",
    tools: [
      {
        name: "Luma Health",
        url: "https://www.lumahealth.io",
        summary:
          "Patient-success platform for outreach, scheduling, recalls, and two-way messaging across the ambulatory footprint.",
      },
      {
        name: "Hyro",
        url: "https://www.hyro.ai",
        summary:
          "Conversational AI for health-system websites, phones, and SMS that answers access questions and books visits.",
      },
      {
        name: "Memora Health",
        url: "https://www.memorahealth.com",
        summary:
          "Care-journey automation — text-based pathways for peri-op, oncology, and chronic care that escalate only when a human is needed.",
      },
      {
        name: "Twistle (Health Catalyst)",
        url: "https://www.healthcatalyst.com/product/twistle-patient-engagement",
        summary:
          "Pathway-based patient engagement for surgical and medical episodes, now part of the Health Catalyst suite.",
      },
      {
        name: "Teladoc Health",
        url: "https://www.teladochealth.com",
        summary:
          "Virtual care and hospital-at-home infrastructure, including specialty consults and chronic-care programs for health systems.",
      },
      {
        name: "Amwell",
        url: "https://business.amwell.com",
        summary:
          "Enterprise telehealth platform (Converge) that health systems use to run virtual visits on their own brand.",
      },
    ],
  },
  {
    id: "research",
    label: "Research, RWE & precision medicine",
    description:
      "Datasets, trial matching, and multimodal models for research institutes, life-science partners, and precision-oncology programs.",
    tools: [
      {
        name: "Tempus",
        url: "https://www.tempus.com",
        summary:
          "Genomic sequencing plus a large multimodal dataset used for oncology decision support, trial matching, and research.",
      },
      {
        name: "Flatiron Health",
        url: "https://flatiron.com",
        summary:
          "Oncology EHR and real-world evidence platform used by practices and life-science sponsors for outcomes research.",
      },
      {
        name: "Truveta",
        url: "https://www.truveta.com",
        summary:
          "Health-system-owned data platform that de-identifies EHR data from member systems for research and public health.",
      },
      {
        name: "Komodo Health",
        url: "https://www.komodohealth.com",
        summary:
          "Healthcare map built from claims and encounters, used for epidemiology, market access, and outcomes research.",
      },
      {
        name: "Verily",
        url: "https://verily.com",
        summary:
          "Alphabet’s life-sciences unit — research platforms, sensor programs, and data infrastructure for longitudinal studies.",
      },
      {
        name: "nference",
        url: "https://nference.com",
        summary:
          "Federated clinical AI and nSights platform used with academic medical centers to mine notes and structured data for research.",
      },
      {
        name: "Aetion",
        url: "https://aetion.com",
        summary:
          "Real-world evidence software used to design and execute observational studies that stand up to regulator scrutiny.",
      },
    ],
  },
  {
    id: "workforce-hr",
    label: "Workforce & HR",
    description:
      "Hiring, credentialing-adjacent talent, and workforce platforms that health systems use to fill clinical and corporate roles.",
    tools: [
      {
        name: "Incredible Health",
        url: "https://www.incrediblehealth.com",
        summary:
          "Nurse-hiring marketplace that matches health systems with licensed RNs and cuts time-to-fill on hard-to-staff units.",
      },
      {
        name: "ShiftMed",
        url: "https://www.shiftmed.com",
        summary:
          "On-demand clinical staffing marketplace for nurses and allied health, used to cover open shifts without agencies.",
      },
      {
        name: "CareRev",
        url: "https://www.carerev.com",
        summary:
          "Per-diem marketplace that lets hospitals post open shifts and local clinicians pick them up in the app.",
      },
      {
        name: "Eightfold",
        url: "https://eightfold.ai",
        summary:
          "Enterprise talent-intelligence platform used by large employers, including health systems, for hiring and internal mobility.",
      },
      {
        name: "Phenom",
        url: "https://www.phenom.com",
        summary:
          "AI talent-experience platform for career sites, CRM, and internal mobility — common in large health-system HR stacks.",
      },
      {
        name: "Workday",
        url: "https://www.workday.com",
        summary:
          "HR and finance system of record; its AI features support recruiting, scheduling insights, and workforce planning.",
      },
    ],
  },
  {
    id: "legal-compliance",
    label: "Legal, privacy & compliance",
    description:
      "Counsel, contracting, privacy-program, and security-assurance tools that legal and compliance teams actually run.",
    tools: [
      {
        name: "Harvey",
        url: "https://www.harvey.ai",
        summary:
          "Domain-specific legal AI used by law firms and in-house teams for research, drafting, and due diligence — including healthcare counsel.",
      },
      {
        name: "CoCounsel (Thomson Reuters)",
        url: "https://legal.thomsonreuters.com/en/cocounsel",
        summary:
          "Legal assistant built on Westlaw and Practical Law — contract review, deposition prep, and research for health-system legal departments.",
      },
      {
        name: "Ironclad",
        url: "https://ironcladapp.com",
        summary:
          "Contract lifecycle platform with AI review, used by health-system legal ops to move vendor and payer agreements faster.",
      },
      {
        name: "OneTrust",
        url: "https://www.onetrust.com",
        summary:
          "Privacy, preference, and third-party risk platform widely used for HIPAA/GDPR inventories and vendor assessments.",
      },
      {
        name: "Vanta",
        url: "https://www.vanta.com",
        summary:
          "Continuous security-compliance automation (SOC 2, HITRUST-adjacent workflows) used by digital-health vendors and some system IT shops.",
      },
      {
        name: "Relativity",
        url: "https://www.relativity.com",
        summary:
          "eDiscovery and investigations platform; health systems use it for litigation, HR investigations, and large document reviews.",
      },
    ],
  },
  {
    id: "platforms",
    label: "Cloud, EHR & AI platforms",
    description:
      "The substrate most other tools sit on — EHR-native AI, cloud healthcare APIs, and GPU/model infrastructure.",
    tools: [
      {
        name: "Epic",
        url: "https://www.epic.com",
        summary:
          "Dominant U.S. EHR; Cosmos, ambient partnerships, and native AI features are now the default integration path for many tools on this list.",
      },
      {
        name: "Oracle Health",
        url: "https://www.oracle.com/health/",
        summary:
          "Cerner-based EHR plus Oracle Cloud AI services aimed at clinical, revenue-cycle, and back-office automation.",
      },
      {
        name: "Google Cloud Healthcare",
        url: "https://cloud.google.com/healthcare-api",
        summary:
          "Healthcare API, Vertex AI, and MedLM-class models for systems that want to build or host clinical AI on Google Cloud.",
      },
      {
        name: "AWS for Health",
        url: "https://aws.amazon.com/health/",
        summary:
          "HealthScribe, HealthLake, and a large marketplace of healthcare AI services; common landing zone for system IT.",
      },
      {
        name: "NVIDIA Healthcare",
        url: "https://www.nvidia.com/en-us/industries/healthcare-life-sciences/",
        summary:
          "GPU stack, NIM microservices, and BioNeMo/Clara tooling that research hospitals and vendors use to train and serve models.",
      },
      {
        name: "Microsoft Cloud for Healthcare",
        url: "https://www.microsoft.com/en-us/industry/health/microsoft-cloud-for-healthcare",
        summary:
          "Azure + Fabric + Dragon Copilot bundle that many Epic shops already have under enterprise agreement.",
      },
    ],
  },
];

export function countAiTools(): number {
  return AI_TOOL_CATEGORIES.reduce(
    (sum, category) => sum + category.tools.length,
    0,
  );
}
