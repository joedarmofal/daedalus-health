import { getAccreditationAccess } from "@/lib/accreditation-access";
import {
  ensureAccreditationProgram,
  listPifItems,
} from "@/lib/accreditation-data";
import { itemStatus, pifItemMap } from "@/lib/accreditation-progress";
import { CAMTS_SECTIONS, pifStatusLabel } from "@/lib/camts-pif";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function GapsPage() {
  const access = await getAccreditationAccess();
  if (access.status !== "ok") {
    redirect("/accreditation/workspace");
  }

  const program = await ensureAccreditationProgram(access.org.id, access.org.name);
  const items = program ? pifItemMap(await listPifItems(program.id)) : pifItemMap([]);

  const rows = CAMTS_SECTIONS.flatMap((section) =>
    section.items
      .map((item) => ({
        section,
        item,
        status: itemStatus(items, item.id),
        saved: items.get(item.id),
      }))
      .filter((row) => row.status === "gap" || row.status === "not_started"),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="text-xs font-semibold tracking-[0.22em] text-[#1F6A64]">
        GAP TRACKER
      </p>
      <h1 className="mt-2 font-serif text-3xl font-medium text-[#1A2B3C]">
        What still blocks a complete PIF
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-[#1A2B3C]/70">
        Items marked as a gap, plus work that has not been started. Assign an
        owner and close these before you lock the self-study.
      </p>

      {rows.length === 0 ? (
        <p className="mt-8 rounded-sm border border-[#1F6A64]/30 bg-[#1F6A64]/10 px-4 py-4 text-sm text-[#1A2B3C]">
          No open gaps. Every item is in progress or marked ready.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-sm border border-[#1A2B3C]/12 bg-[#F9F8F3]">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-[#1A2B3C]/10 text-xs uppercase tracking-[0.14em] text-[#1A2B3C]/50">
              <tr>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Section</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Owner</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.item.id} className="border-t border-[#1A2B3C]/8">
                  <td className="px-4 py-3">
                    <Link
                      href={`/accreditation/workspace/pif/${row.section.id}`}
                      className="font-medium text-[#1F6A64] hover:text-[#1A2B3C]"
                    >
                      {row.item.id} {row.item.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[#1A2B3C]/65">
                    {row.section.number} {row.section.title}
                  </td>
                  <td className="px-4 py-3">{pifStatusLabel(row.status)}</td>
                  <td className="px-4 py-3 text-[#1A2B3C]/65">
                    {row.saved?.owner_name || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
