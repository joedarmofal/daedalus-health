import { CAMTS_SECTIONS } from "@/lib/camts-pif";
import Link from "next/link";

export default function StandardsMapPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="text-xs font-semibold tracking-[0.22em] text-[#1F6A64]">
        STANDARDS MAP
      </p>
      <h1 className="mt-2 font-serif text-3xl font-medium text-[#1A2B3C]">
        How this workspace is organized
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-[#1A2B3C]/70">
        These work areas follow the way CAMTS programs typically assemble a
        PIF: mission and scope, medical direction, people, machines,
        communications, administration, infection control, education, safety,
        quality, and outreach. Official numbering and wording live in your
        licensed CAMTS edition.
      </p>

      <div className="mt-8 space-y-8">
        {CAMTS_SECTIONS.map((section) => (
          <section
            key={section.id}
            className="rounded-sm border border-[#1A2B3C]/15 bg-[#F9F8F3] p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-[0.16em] text-[#1F6A64]">
                  SECTION {section.number}
                </p>
                <h2 className="mt-1 font-serif text-xl text-[#1A2B3C]">
                  {section.title}
                </h2>
              </div>
              <Link
                href={`/accreditation/workspace/pif/${section.id}`}
                className="text-sm font-medium text-[#1F6A64]"
              >
                Open in PIF builder →
              </Link>
            </div>
            <p className="mt-2 text-sm text-[#1A2B3C]/65">{section.summary}</p>
            <ol className="mt-4 space-y-3">
              {section.items.map((item) => (
                <li key={item.id} className="text-sm leading-6">
                  <span className="font-medium text-[#1A2B3C]">
                    {item.id} {item.title}.
                  </span>{" "}
                  <span className="text-[#1A2B3C]/65">{item.prompt}</span>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
