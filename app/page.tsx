import { CompassStar } from "@/components/compass-star";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  Brain,
  HeartPulse,
  Scale,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

const pillars = [
  {
    title: "Ethical AI Governance & Safety",
    description:
      "Board-ready policies, risk registers, and decision rights that keep clinical AI accountable from procurement through production.",
    icon: ShieldCheck,
  },
  {
    title: "Augmented Intelligence Integration",
    description:
      "Design workflows where clinicians remain in command—models as copilots, never silent substitutes for professional judgment.",
    icon: Brain,
  },
  {
    title: "Clinical Excellence & Validation",
    description:
      "Evidence standards, local performance testing, and drift monitoring so every deployment earns its place at the bedside.",
    icon: HeartPulse,
  },
  {
    title: "Transparency, Trust & Integrity",
    description:
      "Clear documentation, patient-facing disclosure, and independent counsel that vendors cannot provide for themselves.",
    icon: Scale,
  },
];

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.16),_transparent_55%)]" />
          <div className="pointer-events-none absolute -right-24 top-24 size-80 rounded-full bg-teal-400/10 blur-3xl" />
          <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:py-28">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.18)]">
                <Sparkles className="size-3.5" />
                YOUR NORTH STAR FOR ETHICAL AI
              </p>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-[#f4efe4] sm:text-5xl lg:text-6xl">
                AI Leadership for Life
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-[#d9cfc0]">
                Guiding health system executives and clinical leaders through AI
                governance, augmented intelligence, and safe clinical integration
                with uncompromising safety, transparency, and trust.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_28px_rgba(16,185,129,0.28)] transition hover:brightness-110"
                >
                  Client Portal Access
                </Link>
                <a
                  href="mailto:briefings@daedalus.health?subject=Executive%20Briefing%20Request"
                  className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900/40 px-6 py-3 text-sm font-semibold text-stone-100 transition hover:border-emerald-400/50 hover:text-emerald-200"
                >
                  Schedule Executive Briefing
                </a>
              </div>
            </div>

            <aside className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl shadow-emerald-950/20">
              <div className="flex items-center gap-3 text-emerald-300">
                <CompassStar className="size-5" />
                <p className="text-xs font-semibold tracking-[0.2em]">
                  EXECUTIVE NORTH STAR
                </p>
              </div>
              <p className="mt-4 text-sm leading-7 text-stone-300">
                Daedalus sits with the C-suite, not the vendor. We translate
                model risk into clinical, legal, and fiduciary language so
                boards can say yes—or no—with confidence.
              </p>
              <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-800 pt-6 text-sm">
                <div>
                  <dt className="text-stone-500">Mandate</dt>
                  <dd className="mt-1 font-medium text-stone-100">
                    Safety first
                  </dd>
                </div>
                <div>
                  <dt className="text-stone-500">Clientele</dt>
                  <dd className="mt-1 font-medium text-stone-100">
                    Health systems
                  </dd>
                </div>
                <div>
                  <dt className="text-stone-500">Stance</dt>
                  <dd className="mt-1 font-medium text-stone-100">
                    Independent
                  </dd>
                </div>
                <div>
                  <dt className="text-stone-500">Horizon</dt>
                  <dd className="mt-1 font-medium text-stone-100">
                    Bedside to board
                  </dd>
                </div>
              </dl>
            </aside>
          </div>
        </section>

        <section
          id="services"
          className="scroll-mt-24 border-t border-slate-800 bg-slate-950"
        >
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <p className="text-xs font-semibold tracking-[0.2em] text-emerald-300">
              STRATEGIC PILLARS
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-[#f4efe4]">
              Principles that keep AI in service of care.
            </h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {pillars.map((pillar) => (
                <article
                  key={pillar.title}
                  className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition hover:border-emerald-500/30"
                >
                  <pillar.icon className="size-6 text-emerald-400" />
                  <h3 className="mt-4 text-lg font-semibold text-stone-50">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-stone-400">
                    {pillar.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="governance"
          className="scroll-mt-24 border-t border-slate-800"
        >
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-emerald-300">
                AI GOVERNANCE FRAMEWORK
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-50">
                A durable operating system for clinical AI.
              </h2>
              <p className="mt-4 text-base leading-7 text-stone-400">
                We install the committees, evidence bars, and escalation paths
                that survive vendor turnover and model generations. Your
                framework becomes an institutional asset—not a slide deck.
              </p>
            </div>
            <ol className="space-y-4 text-sm text-stone-300">
              {[
                "Inventory and classify every model touching patients or operations.",
                "Assign clinical, legal, and technical owners before go-live.",
                "Validate locally, monitor continuously, retire without delay.",
              ].map((item, index) => (
                <li
                  key={item}
                  className="flex gap-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4"
                >
                  <span className="font-mono text-emerald-400">
                    0{index + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="about" className="scroll-mt-24 border-t border-slate-800">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <p className="text-xs font-semibold tracking-[0.2em] text-emerald-300">
              ABOUT
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-stone-50">
              Named for the architect who built the labyrinth—and the way out.
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-8 text-stone-400">
              Health systems are asked to adopt AI faster than they can govern
              it. Daedalus Health is the independent counsel at that
              intersection: executives who need a north star, clinicians who
              need a partner, and boards who need the truth.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
