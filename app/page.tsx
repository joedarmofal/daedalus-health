import { CompassStar } from "@/components/compass-star";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TopographicPattern } from "@/components/topographic-pattern";
import {
  Brain,
  HeartPulse,
  Scale,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const contourBadges = [
  { label: "Clinical Excellence", className: "left-[6%] top-[18%]" },
  { label: "Governance", className: "right-[8%] top-[14%]" },
  { label: "Transparency", className: "left-[4%] top-[58%]" },
  { label: "Integrity", className: "right-[6%] top-[48%]" },
  { label: "Safety", className: "left-[18%] bottom-[12%]" },
  { label: "Augmented Intelligence", className: "right-[12%] bottom-[16%]" },
];

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
    <div className="flex min-h-full flex-col bg-[#F7F5F0]">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-[#1A2B3C]">
          <TopographicPattern className="pointer-events-none absolute inset-0 h-full w-full opacity-35" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(249,248,243,0.08),_transparent_58%)]" />

          {contourBadges.map((badge) => (
            <span
              key={badge.label}
              className={`pointer-events-none absolute hidden rounded-full border border-[#C4A574]/50 bg-[#1A2B3C]/40 px-3 py-1 text-[10px] font-medium tracking-[0.16em] text-[#F9F8F3]/85 uppercase backdrop-blur-[2px] lg:inline-flex ${badge.className}`}
            >
              {badge.label}
            </span>
          ))}

          <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:py-32">
            <Image
              src="/images/winged-figure.png"
              alt="Classical winged figure, the emblem of Daedalus Health"
              width={864}
              height={1152}
              priority
              unoptimized
              className="h-auto w-[160px] sm:w-[190px]"
            />
            <CompassStar className="mt-6 mb-8 size-16 text-[#C4A574]" />
            <p className="font-serif text-3xl font-semibold tracking-[0.2em] text-[#C4A574] sm:text-4xl lg:text-5xl">
              DAEDALUS HEALTH
            </p>
            <p className="mt-4 text-[11px] font-medium tracking-[0.28em] text-[#F9F8F3]/70">
              YOUR NORTH STAR FOR ETHICAL AI
            </p>
            <h1 className="mt-5 font-serif text-5xl font-medium leading-[1.05] tracking-tight text-[#F9F8F3] sm:text-6xl lg:text-7xl">
              AI Leadership for Life
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-[#F9F8F3]/78 sm:text-lg">
              Guiding health system executives and clinical leaders through AI
              governance, augmented intelligence, and safe clinical integration
              with uncompromising safety, transparency, and trust.
            </p>
            <div className="mt-10 flex w-full flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-sm bg-[#1F6A64] px-7 py-3 text-sm font-medium tracking-wide text-[#F9F8F3] transition hover:bg-[#164f4b] hover:shadow-[inset_0_0_0_1px_#C4A574]"
              >
                Client Portal Access
              </Link>
              <a
                href="mailto:briefings@daedalus.health?subject=Executive%20Briefing%20Request"
                className="inline-flex items-center justify-center rounded-sm border border-[#C4A574]/70 px-7 py-3 text-sm font-medium tracking-wide text-[#F9F8F3] transition hover:border-[#C4A574] hover:bg-[#C4A574]/10"
              >
                Schedule Executive Briefing
              </a>
            </div>
          </div>
        </section>

        <section
          id="services"
          className="relative scroll-mt-24 overflow-hidden border-t border-[#1A2B3C]/10"
        >
          <TopographicPattern
            tone="slate"
            className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]"
          />
          <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <p className="text-xs font-semibold tracking-[0.28em] text-[#1F6A64]">
              STRATEGIC PILLARS
            </p>
            <h2 className="mt-3 max-w-2xl font-serif text-3xl font-medium tracking-tight text-[#1A2B3C] sm:text-4xl">
              Principles that keep AI in service of care.
            </h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {pillars.map((pillar) => (
                <article
                  key={pillar.title}
                  className="relative overflow-hidden rounded-sm border border-[#1A2B3C]/15 bg-[#F9F8F3] p-7 shadow-[0_12px_40px_-28px_rgba(26,43,60,0.45)]"
                >
                  <TopographicPattern
                    tone="slate"
                    className="pointer-events-none absolute -right-10 -top-16 h-48 w-64 opacity-[0.08]"
                  />
                  <pillar.icon className="relative size-6 text-[#1F6A64]" />
                  <h3 className="relative mt-4 font-serif text-xl font-semibold text-[#1A2B3C]">
                    {pillar.title}
                  </h3>
                  <p className="relative mt-2 text-sm leading-7 text-[#1A2B3C]/70">
                    {pillar.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="governance"
          className="scroll-mt-24 border-t border-[#1A2B3C]/10 bg-[#F9F8F3]"
        >
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold tracking-[0.28em] text-[#1F6A64]">
                AI GOVERNANCE FRAMEWORK
              </p>
              <h2 className="mt-3 font-serif text-3xl font-medium tracking-tight text-[#1A2B3C] sm:text-4xl">
                A durable operating system for clinical AI.
              </h2>
              <p className="mt-4 text-base leading-7 text-[#1A2B3C]/70">
                We install the committees, evidence bars, and escalation paths
                that survive vendor turnover and model generations. Your
                framework becomes an institutional asset—not a slide deck.
              </p>
            </div>
            <ol className="space-y-4 text-sm text-[#1A2B3C]/80">
              {[
                "Inventory and classify every model touching patients or operations.",
                "Assign clinical, legal, and technical owners before go-live.",
                "Validate locally, monitor continuously, retire without delay.",
              ].map((item, index) => (
                <li
                  key={item}
                  className="flex gap-4 rounded-sm border border-[#1A2B3C]/12 bg-[#F7F5F0] p-4"
                >
                  <span className="font-serif text-[#C4A574]">
                    0{index + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          id="about"
          className="scroll-mt-24 border-t border-[#1A2B3C]/10"
        >
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <p className="text-xs font-semibold tracking-[0.28em] text-[#1F6A64]">
              ABOUT
            </p>
            <h2 className="mt-3 max-w-2xl font-serif text-3xl font-medium tracking-tight text-[#1A2B3C] sm:text-4xl">
              Named for the architect who built the labyrinth—and the way out.
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[#1A2B3C]/70">
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
