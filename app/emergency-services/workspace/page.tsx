import { getAccreditationAccess } from "@/lib/accreditation-access";
import {
  ensureAccreditationProgram,
  listPifItems,
} from "@/lib/accreditation-data";
import { overallProgress, pifItemMap, sectionProgress } from "@/lib/accreditation-progress";
import { CAMTS_EDITION_LABEL, CAMTS_SECTIONS } from "@/lib/camts-pif";
import Link from "next/link";
import { ProgramForm } from "./program-form";

export default async function AccreditationWorkspacePage() {
  const access = await getAccreditationAccess();

  if (access.status === "no_organization") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <p className="text-xs font-semibold tracking-[0.22em] text-[#1F6A64]">
          EMERGENCY SERVICES
        </p>
        <h1 className="mt-2 font-serif text-3xl font-medium text-[#1A2B3C]">
          No program is linked yet
        </h1>
        <p className="mt-3 text-sm leading-7 text-[#1A2B3C]/70">
          This login works, but the account is not assigned to an organization.
          Ask Joe to add you as a member so PIF work can be saved.
        </p>
      </div>
    );
  }

  if (access.status !== "ok") {
    return null;
  }

  let program = null;
  let tableMissing = false;
  try {
    program = await ensureAccreditationProgram(access.org.id, access.org.name);
    tableMissing = program === null;
  } catch {
    tableMissing = true;
  }

  const items = program ? pifItemMap(await listPifItems(program.id)) : pifItemMap([]);
  const overall = overallProgress(items);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="text-xs font-semibold tracking-[0.22em] text-[#1F6A64]">
        EMERGENCY SERVICES
      </p>
      <h1 className="mt-2 font-serif text-3xl font-medium text-[#1A2B3C] sm:text-4xl">
        {program?.program_name ?? `${access.org.name} Medical Transport`}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-[#1A2B3C]/70">
        Tools for EMS and HEMS programs. Start with the CAMTS Program
        Information Form: assign owners, capture evidence, and close gaps
        before survey. Use your licensed CAMTS edition for official standard
        language. This workspace is a {CAMTS_EDITION_LABEL.toLowerCase()}.
      </p>

      {tableMissing ? (
        <p className="mt-6 rounded-sm border border-[#C4A574]/50 bg-[#C4A574]/10 px-4 py-3 text-sm text-[#1A2B3C]">
          PIF saves need the accreditation tables. Run{" "}
          <code className="font-mono text-xs">007_accreditation.sql</code> in
          the Supabase SQL Editor.
        </p>
      ) : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        {[
          { label: "Ready for PIF", value: overall.ready },
          { label: "In progress", value: overall.inProgress },
          { label: "Gaps", value: overall.gaps },
          { label: "Not started", value: overall.notStarted },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-sm border border-[#1A2B3C]/12 bg-[#F9F8F3] px-4 py-4"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1A2B3C]/45">
              {stat.label}
            </p>
            <p className="mt-2 font-serif text-3xl text-[#1A2B3C]">{stat.value}</p>
            <p className="text-xs text-[#1A2B3C]/45">of {overall.total} items</p>
          </div>
        ))}
      </div>

      <Link
        href="/emergency-services/workspace/policies"
        className="mt-10 block rounded-sm border border-[#C4A574]/40 bg-[#F9F8F3] p-5 transition hover:border-[#C4A574]"
      >
        <p className="text-xs font-semibold tracking-[0.16em] text-[#1F6A64]">
          POLICY LIBRARY
        </p>
        <h2 className="mt-1 font-serif text-lg text-[#1A2B3C]">
          Clinical and administrative policies
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#1A2B3C]/65">
          Draft with the AI assistant from a prompt or uploaded SOP, then keep
          the adopted policy in this organization’s library.
        </p>
      </Link>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {CAMTS_SECTIONS.map((section) => {
          const progress = sectionProgress(section.id, items);
          const pct =
            progress.total === 0
              ? 0
              : Math.round((progress.ready / progress.total) * 100);
          return (
            <Link
              key={section.id}
              href={`/emergency-services/workspace/pif/${section.id}`}
              className="rounded-sm border border-[#1A2B3C]/15 bg-[#F9F8F3] p-5 transition hover:border-[#C4A574]/60"
            >
              <p className="text-xs font-semibold tracking-[0.16em] text-[#1F6A64]">
                SECTION {section.number}
              </p>
              <h2 className="mt-1 font-serif text-lg text-[#1A2B3C]">
                {section.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#1A2B3C]/65">
                {section.summary}
              </p>
              <p className="mt-3 text-xs text-[#1A2B3C]/50">
                {progress.ready} ready · {progress.gaps} gaps · {pct}% complete
              </p>
            </Link>
          );
        })}
      </div>

      <div className="mt-10">
        {program ? <ProgramForm program={program} /> : null}
      </div>
    </div>
  );
}
