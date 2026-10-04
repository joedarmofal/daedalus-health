import { getAccreditationAccess } from "@/lib/accreditation-access";
import {
  ensureAccreditationProgram,
  listPifItems,
} from "@/lib/accreditation-data";
import { pifItemMap } from "@/lib/accreditation-progress";
import { getCamtsSection } from "@/lib/camts-pif";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PifItemForm } from "../../pif-item-form";

export default async function PifSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section: sectionId } = await params;
  const section = getCamtsSection(sectionId);
  if (!section) notFound();

  const access = await getAccreditationAccess();
  if (access.status !== "ok") {
    redirect("/emergency-services/workspace");
  }

  const program = await ensureAccreditationProgram(access.org.id, access.org.name);
  const items = program ? pifItemMap(await listPifItems(program.id)) : pifItemMap([]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link
        href="/emergency-services/workspace/pif"
        className="text-sm font-medium text-[#C4A574] hover:text-[#F9F8F3]"
      >
        ← All PIF sections
      </Link>
      <p className="mt-6 text-xs font-semibold tracking-[0.22em] text-[#C4A574]">
        SECTION {section.number}
      </p>
      <h1 className="mt-2 font-serif text-3xl font-medium text-[#F9F8F3]">
        {section.title}
      </h1>
      <p className="mt-3 text-sm leading-7 text-[#F9F8F3]/70">{section.summary}</p>
      <p className="mt-3 text-sm leading-6 text-[#F9F8F3]/60">
        Each item can draft from a short prompt or uploaded policies. Review
        every [TO CONFIRM] before you treat language as survey-ready. Do not
        upload patient records.
      </p>

      <div className="mt-8 space-y-5">
        {section.items.map((item) => (
          <PifItemForm key={item.id} item={item} saved={items.get(item.id)} />
        ))}
      </div>
    </div>
  );
}
