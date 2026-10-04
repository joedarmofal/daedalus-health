import { getAccreditationAccess } from "@/lib/accreditation-access";
import {
  ensureAccreditationProgram,
  listPifItems,
} from "@/lib/accreditation-data";
import { pifItemMap } from "@/lib/accreditation-progress";
import { CAMTS_SECTIONS, pifStatusLabel } from "@/lib/camts-pif";
import { redirect } from "next/navigation";

export default async function PifExportPage() {
  const access = await getAccreditationAccess();
  if (access.status !== "ok") {
    redirect("/emergency-services/workspace");
  }

  const program = await ensureAccreditationProgram(access.org.id, access.org.name);
  const items = program ? pifItemMap(await listPifItems(program.id)) : pifItemMap([]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 print:max-w-none print:px-0">
      <p className="text-xs font-semibold tracking-[0.22em] text-[#C4A574] print:hidden">
        PIF OUTLINE
      </p>
      <h1 className="mt-2 font-serif text-3xl font-medium text-[#F9F8F3]">
        {program?.program_name ?? access.org.name} — PIF working outline
      </h1>
      <p className="mt-3 text-sm leading-7 text-[#F9F8F3]/70 print:hidden">
        Print or save as PDF from the browser. This is the program’s working
        draft, not the official CAMTS form.
      </p>
      {program ? (
        <dl className="mt-6 grid grid-cols-1 gap-2 text-sm text-[#F9F8F3] sm:grid-cols-2">
          <div>
            <dt className="text-[#F9F8F3]/45">Medical director</dt>
            <dd>{program.medical_director || "—"}</dd>
          </div>
          <div>
            <dt className="text-[#F9F8F3]/45">Program director</dt>
            <dd>{program.program_director || "—"}</dd>
          </div>
          <div>
            <dt className="text-[#F9F8F3]/45">Base</dt>
            <dd>{program.base_location || "—"}</dd>
          </div>
          <div>
            <dt className="text-[#F9F8F3]/45">Edition</dt>
            <dd>{program.camts_edition}</dd>
          </div>
        </dl>
      ) : null}

      <div className="mt-10 space-y-10">
        {CAMTS_SECTIONS.map((section) => (
          <section key={section.id}>
            <h2 className="font-serif text-2xl text-[#F9F8F3]">
              {section.number}. {section.title}
            </h2>
            {section.items.map((item) => {
              const saved = items.get(item.id);
              return (
                <article key={item.id} className="mt-5 border-t border-[#C4A574]/15 pt-4">
                  <h3 className="text-sm font-semibold text-[#F9F8F3]">
                    {item.id} {item.title}
                  </h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[#F9F8F3]/45">
                    {pifStatusLabel(saved?.status ?? "not_started")}
                    {saved?.owner_name ? ` · ${saved.owner_name}` : ""}
                  </p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#F9F8F3]/80">
                    {saved?.narrative?.trim() || "No narrative yet."}
                  </p>
                  {saved?.evidence_notes?.trim() ? (
                    <p className="mt-2 text-sm leading-6 text-[#F9F8F3]/55">
                      Evidence: {saved.evidence_notes}
                    </p>
                  ) : null}
                </article>
              );
            })}
          </section>
        ))}
      </div>
    </div>
  );
}
