import { getAccreditationAccess } from "@/lib/accreditation-access";
import {
  ensureAccreditationProgram,
  listPifItems,
} from "@/lib/accreditation-data";
import { pifItemMap, sectionProgress } from "@/lib/accreditation-progress";
import { CAMTS_SECTIONS } from "@/lib/camts-pif";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function PifIndexPage() {
  const access = await getAccreditationAccess();
  if (access.status !== "ok") {
    redirect("/emergency-services/workspace");
  }

  const program = await ensureAccreditationProgram(access.org.id, access.org.name);
  const items = program ? pifItemMap(await listPifItems(program.id)) : pifItemMap([]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="text-xs font-semibold tracking-[0.22em] text-[#1F6A64]">
        PIF BUILDER
      </p>
      <h1 className="mt-2 font-serif text-3xl font-medium text-[#1A2B3C]">
        Build the Program Information Form
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-[#1A2B3C]/70">
        Work section by section. Each item holds the narrative you will paste
        into the official PIF, plus evidence still to collect. You can draft
        from a short prompt or uploaded policies — then review and save.
      </p>

      <div className="mt-8 space-y-3">
        {CAMTS_SECTIONS.map((section) => {
          const progress = sectionProgress(section.id, items);
          return (
            <Link
              key={section.id}
              href={`/emergency-services/workspace/pif/${section.id}`}
              className="flex flex-col justify-between gap-3 rounded-sm border border-[#1A2B3C]/15 bg-[#F9F8F3] p-5 sm:flex-row sm:items-center"
            >
              <div>
                <p className="text-xs font-semibold tracking-[0.16em] text-[#1F6A64]">
                  SECTION {section.number}
                </p>
                <h2 className="mt-1 font-serif text-lg text-[#1A2B3C]">
                  {section.title}
                </h2>
                <p className="mt-1 text-sm text-[#1A2B3C]/65">{section.summary}</p>
              </div>
              <p className="shrink-0 text-sm text-[#1A2B3C]/55">
                {progress.ready}/{progress.total} ready
                {progress.gaps ? ` · ${progress.gaps} gaps` : ""}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
