export const CAMTS_EDITION_LABEL = "12th Edition-aligned PIF organizer";

export type PifStatus = "not_started" | "in_progress" | "ready" | "gap";

export const PIF_STATUSES: Array<{
  id: PifStatus;
  label: string;
  tone: string;
}> = [
  { id: "not_started", label: "Not started", tone: "text-[#1A2B3C]/55" },
  { id: "in_progress", label: "In progress", tone: "text-[#8a6d3d]" },
  { id: "ready", label: "Ready for PIF", tone: "text-[#1F6A64]" },
  { id: "gap", label: "Gap / action needed", tone: "text-red-800" },
];

export interface CamtsStandard {
  id: string;
  title: string;
  prompt: string;
  evidence: string;
}

export interface CamtsSection {
  id: string;
  number: string;
  title: string;
  summary: string;
  items: CamtsStandard[];
}

/**
 * PIF work areas aligned to how CAMTS programs typically organize a
 * self-study. Language here is original Daedalus guidance, not official
 * CAMTS standard text. Programs must use their licensed CAMTS edition
 * when writing the formal Program Information Form.
 */
export const CAMTS_SECTIONS: CamtsSection[] = [
  {
    id: "01",
    number: "01",
    title: "Mission, scope, and program identity",
    summary:
      "Who you are, who you serve, and what care you will and will not provide.",
    items: [
      {
        id: "01.01",
        title: "Mission and philosophy of care",
        prompt:
          "State the program mission, how it fits the parent organization, and how patient-centered, ethical transport is defined for crews.",
        evidence:
          "Mission statement, board or leadership approval, posting at bases.",
      },
      {
        id: "01.02",
        title: "Scope of care and transport modes",
        prompt:
          "List rotor, fixed-wing, ground, and specialty missions. Note inclusion and exclusion criteria, service area, and receiving relationships.",
        evidence:
          "Scope-of-care policy, service-area map, receiving-facility agreements.",
      },
      {
        id: "01.03",
        title: "Program description and history",
        prompt:
          "Describe year founded, ownership, bases, annual volume, and any prior accreditation or substantial program changes since the last survey.",
        evidence:
          "Org chart, volume report, prior accreditation letter if any.",
      },
      {
        id: "01.04",
        title: "Patient population and specialty capability",
        prompt:
          "Document adult, pediatric, neonatal, high-risk OB, ECMO, IABP, or other specialty capabilities and how crews are matched to those missions.",
        evidence:
          "Specialty protocols, team rosters, equipment addenda.",
      },
    ],
  },
  {
    id: "02",
    number: "02",
    title: "Medical direction and clinical care",
    summary:
      "Physician leadership, protocols, and how clinical judgment stays in command in the aircraft or ambulance.",
    items: [
      {
        id: "02.01",
        title: "Medical director qualifications and involvement",
        prompt:
          "Name the medical director, credentials, transport or EMS experience, and how they participate in protocol, education, chart review, and hiring.",
        evidence:
          "CV, contract or appointment letter, meeting attendance, review logs.",
      },
      {
        id: "02.02",
        title: "Associate and specialty medical directors",
        prompt:
          "Describe coverage when the medical director is unavailable and any pediatric, neonatal, or surgical specialty medical direction.",
        evidence:
          "On-call schedule, specialty director agreements.",
      },
      {
        id: "02.03",
        title: "Clinical protocols and standing orders",
        prompt:
          "Explain how protocols are written, approved, version-controlled, and carried on the aircraft or ambulance. Note how off-protocol care is authorized.",
        evidence:
          "Current protocol set, approval signature page, revision log.",
      },
      {
        id: "02.04",
        title: "Online medical control",
        prompt:
          "Describe how crews reach a physician in flight or on the road, expected response time, and documentation of those contacts.",
        evidence:
          "Comm policy, recorded-line procedure, sample PCR with online control.",
      },
      {
        id: "02.05",
        title: "Clinical documentation",
        prompt:
          "Show how the patient care record is completed, timed, reviewed, and stored, including late-entry and amendment rules.",
        evidence:
          "Documentation policy, sample redacted PCR, QA scoring sheet.",
      },
    ],
  },
  {
    id: "03",
    number: "03",
    title: "Clinical personnel and staffing",
    summary:
      "Who is on the team, how they are qualified, and how fatigue and staffing risk are managed.",
    items: [
      {
        id: "03.01",
        title: "Team composition by mission type",
        prompt:
          "Define the minimum crew for each mode and specialty mission (for example RN/paramedic, two RNs, or RN/RRT) and when a third clinician is added.",
        evidence:
          "Staffing matrix, scheduling policy, exception log.",
      },
      {
        id: "03.02",
        title: "Licensure, certification, and credentials",
        prompt:
          "List required licenses and certifications (RN, paramedic, FP-C, CCP-C, CFRN, C-NPT, and others) and how expiration is tracked.",
        evidence:
          "Credential tracker export, sample personnel file checklist.",
      },
      {
        id: "03.03",
        title: "Hiring, orientation, and precepting",
        prompt:
          "Describe selection, background checks, orientation length, precepted flights or transports, and sign-off to independent practice.",
        evidence:
          "Orientation syllabus, preceptor packet, competency sign-off form.",
      },
      {
        id: "03.04",
        title: "Fatigue, duty time, and wellness",
        prompt:
          "Explain duty-time limits, rest, relief, and how a fatigued clinician can decline a mission without penalty.",
        evidence:
          "Duty-time policy, fatigue reporting form, scheduling samples.",
      },
    ],
  },
  {
    id: "04",
    number: "04",
    title: "Aircraft, ambulance, and equipment",
    summary:
      "The machine, the medical configuration, and the equipment that must work on the worst night.",
    items: [
      {
        id: "04.01",
        title: "Aircraft or vehicle specifications",
        prompt:
          "Identify each aircraft or ambulance, configuration, pressurization, climate control, and how the medical interior is installed and inspected.",
        evidence:
          "Aircraft/vehicle list, floorplan or photos, completion documents.",
      },
      {
        id: "04.02",
        title: "Medical equipment and stretchers",
        prompt:
          "Inventory monitors, ventilators, pumps, isolettes, and stretchers. Note mounting, power, oxygen, and redundancy for critical devices.",
        evidence:
          "Equipment list by tail/unit number, biomedical inspection logs.",
      },
      {
        id: "04.03",
        title: "Maintenance and out-of-service control",
        prompt:
          "Describe who maintains the aircraft or ambulance, how discrepancies are grounded, and how a substitute asset is placed in service.",
        evidence:
          "Maintenance agreement, MEL/discrepancy process, spare-aircraft SOP.",
      },
      {
        id: "04.04",
        title: "Weather and operational decision-making",
        prompt:
          "Document weather minimums, go/no-go authority, and how medical urgency is kept from pressuring an unsafe launch.",
        evidence:
          "Weather policy, decision tree, sample turndown documentation.",
      },
    ],
  },
  {
    id: "05",
    number: "05",
    title: "Communications and dispatch",
    summary:
      "The comm center that accepts the request, launches the team, and stays with them until they are back.",
    items: [
      {
        id: "05.01",
        title: "Communications center and staffing",
        prompt:
          "Describe the comm center, hours, training, and how a request is received, triaged, and assigned.",
        evidence:
          "Comm center org chart, training syllabus, call-taking script.",
      },
      {
        id: "05.02",
        title: "Flight following and position awareness",
        prompt:
          "Explain position reporting intervals, satellite or radio backup, and what happens if contact is lost.",
        evidence:
          "Flight-following SOP, lost-comm procedure, tracking screenshots.",
      },
      {
        id: "05.03",
        title: "Request intake and turndown",
        prompt:
          "Show how medical appropriateness, weather, crew duty, and receiving-bed availability are checked before a launch is accepted or declined.",
        evidence:
          "Intake checklist, turndown codes, sample declined-request log.",
      },
      {
        id: "05.04",
        title: "Radio, phone, and EHR interoperability",
        prompt:
          "List primary and backup communications with crews, hospitals, and public-safety partners.",
        evidence:
          "Radio plan, backup-comm drill records.",
      },
    ],
  },
  {
    id: "06",
    number: "06",
    title: "Leadership, policies, and administration",
    summary:
      "Who is accountable, how policies stay current, and how the program is resourced.",
    items: [
      {
        id: "06.01",
        title: "Program leadership and reporting structure",
        prompt:
          "Name the program director and describe reporting to hospital, EMS, or aviation leadership. Show who can stop a mission.",
        evidence:
          "Org chart, job descriptions, authority policy.",
      },
      {
        id: "06.02",
        title: "Policy management",
        prompt:
          "Explain how policies are written, reviewed, retired, and made available to crews at 0200 on a remote base.",
        evidence:
          "Policy index, review calendar, acknowledgment tracker.",
      },
      {
        id: "06.03",
        title: "Contracts, insurance, and business associates",
        prompt:
          "Document aviation, hospital, billing, and vendor relationships that affect patient care or safety.",
        evidence:
          "Contract abstract, insurance certificates, vendor list.",
      },
      {
        id: "06.04",
        title: "Records retention and privacy",
        prompt:
          "State how clinical, aviation, and personnel records are stored, who may access them, and how HIPAA or equivalent privacy rules are applied in transport.",
        evidence:
          "Retention schedule, privacy policy, breach procedure.",
      },
    ],
  },
  {
    id: "07",
    number: "07",
    title: "Infection control, medications, and controlled substances",
    summary:
      "Clean equipment, secure drugs, and a chain of custody that survives a night shift.",
    items: [
      {
        id: "07.01",
        title: "Infection prevention",
        prompt:
          "Describe cleaning between patients, PPE, isolation transports, and how an exposure is reported and followed.",
        evidence:
          "IPC policy, cleaning log, exposure kit contents.",
      },
      {
        id: "07.02",
        title: "Medication storage and expiration",
        prompt:
          "Show how medications are stored for temperature, light, and security, and how expired stock is pulled.",
        evidence:
          "Drug list, temperature log, expiration audit.",
      },
      {
        id: "07.03",
        title: "Controlled-substance accountability",
        prompt:
          "Document procurement, daily count, waste with witness, discrepancy investigation, and DEA or state compliance.",
        evidence:
          "Count sheet, discrepancy report, policy.",
      },
      {
        id: "07.04",
        title: "Blood products and high-alert medications",
        prompt:
          "If carried, explain storage, administration checks, and waste of blood, vasoactives, and other high-alert agents.",
        evidence:
          "Blood SOP, high-alert list, administration checklist.",
      },
    ],
  },
  {
    id: "08",
    number: "08",
    title: "Education, training, and competency",
    summary:
      "Initial and ongoing proof that the team can do the work the scope of care claims.",
    items: [
      {
        id: "08.01",
        title: "Initial education and air-medical physiology",
        prompt:
          "Outline didactics, altitude physiology, survival, and any CAMTS-typical hourly requirements your program uses as its bar.",
        evidence:
          "Initial education tracker, course outlines, certificates.",
      },
      {
        id: "08.02",
        title: "Continuing education and simulation",
        prompt:
          "Describe annual hours, high-fidelity or scenario training, and how rare high-risk skills are practiced.",
        evidence:
          "CE calendar, sim attendance, skills lab log.",
      },
      {
        id: "08.03",
        title: "Competency assessment",
        prompt:
          "Show how airway, ventilation, invasive procedures, and mode-specific skills are signed off and revalidated.",
        evidence:
          "Competency checklist, failed-competency remediation policy.",
      },
      {
        id: "08.04",
        title: "Aviation and ambulance safety training for clinicians",
        prompt:
          "Document crew resource management, LZ safety, emergency egress, and driver or medical-crew vehicle training.",
        evidence:
          "CRM roster, egress drill, driver training file.",
      },
    ],
  },
  {
    id: "09",
    number: "09",
    title: "Safety management",
    summary:
      "A safety system that can stop a launch, report a near miss, and change the next shift.",
    items: [
      {
        id: "09.01",
        title: "Safety management system",
        prompt:
          "Describe the SMS or equivalent: hazard reporting, risk assessment, safety meetings, and feedback to crews.",
        evidence:
          "SMS manual, meeting minutes, risk register sample.",
      },
      {
        id: "09.02",
        title: "Just culture and non-punitive reporting",
        prompt:
          "Explain how staff report errors and near misses, and how retaliation is prohibited.",
        evidence:
          "Reporting policy, anonymous path, sample de-identified report.",
      },
      {
        id: "09.03",
        title: "Accident, incident, and emergency response",
        prompt:
          "Document post-accident family and employee support, NTSB or state notification, and scene or LZ emergency plans.",
        evidence:
          "ERP, notification tree, drill after-action.",
      },
      {
        id: "09.04",
        title: "Occupational safety and survival",
        prompt:
          "Cover helmets, uniforms, hearing protection, survival kits, and water or mountain survival as applicable to the service area.",
        evidence:
          "PPE policy, kit inventory, survival training records.",
      },
    ],
  },
  {
    id: "10",
    number: "10",
    title: "Quality management",
    summary:
      "What you measure, who reviews it, and how a bad case changes practice.",
    items: [
      {
        id: "10.01",
        title: "QM structure and indicators",
        prompt:
          "List clinical, operational, and safety indicators, the committee that owns them, and reporting cadence to leadership.",
        evidence:
          "QM plan, indicator definitions, dashboard sample.",
      },
      {
        id: "10.02",
        title: "Chart review and case conference",
        prompt:
          "Describe what percentage of records are reviewed, who reviews them, and how a variance becomes an action.",
        evidence:
          "Review tool, conference calendar, closed-loop example.",
      },
      {
        id: "10.03",
        title: "Utilization review and appropriateness",
        prompt:
          "Show how you evaluate whether rotor, fixed-wing, or ground was the right mode and whether the patient benefited.",
        evidence:
          "UR policy, mode-of-transport audit.",
      },
      {
        id: "10.04",
        title: "Patient and referring-facility feedback",
        prompt:
          "Document complaint handling, referring-hospital follow-up, and how compliments or grievances reach the medical director.",
        evidence:
          "Complaint log, survey tool, sample response letter.",
      },
    ],
  },
  {
    id: "11",
    number: "11",
    title: "Outreach, referring relationships, and public information",
    summary:
      "How referring hospitals, EMS, and the public know when and how to request you.",
    items: [
      {
        id: "11.01",
        title: "Referral education and LZ or landing-zone programs",
        prompt:
          "Describe outreach to hospitals and first responders, landing-zone classes, and how request criteria are taught.",
        evidence:
          "Outreach calendar, LZ class roster, request guide.",
      },
      {
        id: "11.02",
        title: "Public information and social media",
        prompt:
          "Explain who may speak after an incident, how patient privacy is protected in photos, and how marketing claims are reviewed.",
        evidence:
          "PIO policy, photo consent, marketing review checklist.",
      },
      {
        id: "11.03",
        title: "Community and disaster response",
        prompt:
          "Document mutual aid, MCI or disaster roles, and integration with regional trauma or EMS systems.",
        evidence:
          "MCI plan, mutual-aid agreements, drill participation.",
      },
    ],
  },
];

export const TRANSPORT_MODES = [
  { id: "rotor_wing", label: "Rotor wing" },
  { id: "fixed_wing", label: "Fixed wing" },
  { id: "ground", label: "Critical care ground" },
  { id: "specialty", label: "Specialty / neonatal / ECMO" },
] as const;

export const ACCREDITATION_STATUSES = [
  { id: "preparing", label: "Preparing first PIF" },
  { id: "application", label: "Application submitted" },
  { id: "site_survey", label: "Site survey scheduled" },
  { id: "accredited", label: "Accredited — maintaining" },
  { id: "reaccreditation", label: "Reaccreditation cycle" },
] as const;

export function allCamtsItems(): CamtsStandard[] {
  return CAMTS_SECTIONS.flatMap((section) => section.items);
}

export function getCamtsSection(sectionId: string): CamtsSection | null {
  return CAMTS_SECTIONS.find((section) => section.id === sectionId) ?? null;
}

export function getCamtsItem(standardId: string): {
  section: CamtsSection;
  item: CamtsStandard;
} | null {
  for (const section of CAMTS_SECTIONS) {
    const item = section.items.find((entry) => entry.id === standardId);
    if (item) return { section, item };
  }
  return null;
}

export function pifStatusLabel(status: string): string {
  return PIF_STATUSES.find((item) => item.id === status)?.label ?? status;
}
