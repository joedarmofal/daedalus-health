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
      "Board-ready policies, risk registers, and decision rights that keep clinical AI accountable from procurement through production, with meaningful human control preserved at every decision point.",
    icon: ShieldCheck,
  },
  {
    title: "Augmented Intelligence Integration",
    description:
      "Engineer the human-machine interface so clinicians remain the pilot—models as copilots offering augmented intelligence, never silent substitutes for professional judgment.",
    icon: Brain,
  },
  {
    title: "Clinical Excellence & Validation",
    description:
      "Evidence standards, local performance testing, and bias and drift surveillance so every deployment earns its place at the bedside instead of quietly eroding trust in it.",
    icon: HeartPulse,
  },
  {
    title: "Transparency, Trust & Integrity",
    description:
      "Clear documentation, patient-facing disclosure, and independent counsel that vendors cannot provide for themselves—so the humans accountable for care can see what the system actually did.",
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
              with uncompromising safety, transparency, and trust—and human
              judgment always at the controls.
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

        <section className="border-t border-[#1A2B3C]/10 bg-[#1A2B3C]">
          <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 sm:py-20">
            <p className="text-xs font-semibold tracking-[0.28em] text-[#C4A574]">
              TWO TRUTHS
            </p>
            <p className="mx-auto mt-5 max-w-4xl font-serif text-2xl leading-relaxed text-[#F9F8F3] sm:text-3xl">
              AI can help solve medicine&apos;s greatest challenges. It can
              also introduce bias into a treatment plan, obscure who is
              accountable for a decision, or fail catastrophically at the one
              moment a patient can least afford it.
            </p>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-[#F9F8F3]/75 sm:text-lg">
              Both are true at once, and neither cancels the other out. The
              variable that decides which truth an organization lives with is
              not the model—it is the human-machine interface: who holds
              meaningful control, what they can see into the system, and how
              much authority is ceded before a clinician&apos;s judgment is
              allowed to intervene.
            </p>
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
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#1A2B3C]/70">
              Every one of these pillars answers the same question: at the
              human-machine interface, who is actually in command? These are
              the wings we help you engineer—and the discipline to fly them.
            </p>
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
                Every AI system is a human-machine interface before it is
                anything else—the instrument panel where a clinician&apos;s
                judgment meets a model&apos;s inference. We calibrate that
                interface the way Daedalus calibrated his wings: enough lift
                to reach real altitude, enough restraint that a human hand
                never leaves the controls.
              </p>
              <p className="mt-4 text-base leading-7 text-[#1A2B3C]/70">
                We install the committees, evidence bars, and escalation paths
                that survive vendor turnover and model generations. Your
                framework becomes an institutional asset—not a slide deck.
              </p>
            </div>
            <ol className="space-y-4 text-sm text-[#1A2B3C]/80">
              {[
                "Inventory and classify every model touching patients or operations, and name the human accountable for each one.",
                "Assign clinical, legal, and technical owners before go-live, with explicit authority to override the machine.",
                "Validate locally, monitor for bias and drift continuously, and retire without delay the moment the interface fails.",
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
            <h2 className="mt-3 max-w-3xl font-serif text-3xl font-medium tracking-tight text-[#1A2B3C] sm:text-4xl">
              Named for the craftsman who built the labyrinth, the wings, and
              the discipline to fly them.
            </h2>

            <p className="mt-6 max-w-3xl text-base leading-8 text-[#1A2B3C]/70">
              Daedalus was Crete&apos;s master engineer, commissioned to build
              the Labyrinth—a structure so intricate that even its architect
              could barely find his way through it. It is an old story with a
              modern echo: the algorithms reshaping care today are our new
              labyrinths, engineered by brilliant minds, yet increasingly
              opaque even to the people who built them.
            </p>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[#1A2B3C]/70">
              When the king who depended on his genius imprisoned him on the
              island instead of freeing him, Daedalus didn&apos;t escape by
              force. He engineered wings—feathers set in wax—and gave a
              matching pair to his son, Icarus, with one instruction: fly the
              middle course. Not so low that the sea dampens your feathers.
              Not so high that the sun melts your wax.
            </p>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[#1A2B3C]/70">
              Icarus, dazzled by the altitude ambition made possible, ignored
              the boundary and fell. Daedalus, flying the very same
              invention with the same discipline, landed safely. Same wings.
              Same human-machine interface. The only difference was who kept
              a hand on the controls.
            </p>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[#1A2B3C]/70">
              This is the paradox at the center of medical AI, and it is why
              we say two truths, not one. The same model that catches a
              missed diagnosis can just as easily encode bias into a
              treatment plan, or fail at the exact moment a patient can
              least afford it. The wings were never the danger. The absence
              of a human hand on the controls was.
            </p>

            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              <div className="rounded-sm border border-[#C4A574]/40 bg-[#F9F8F3] p-6">
                <p className="text-xs font-semibold tracking-[0.28em] text-[#C4A574]">
                  THE ICARUS PATH
                </p>
                <p className="mt-3 text-sm leading-7 text-[#1A2B3C]/70">
                  AI adopted for the thrill of altitude: unproven models,
                  an unmonitored interface, no clinician holding the
                  controls. It flies beautifully, right up until the moment
                  it doesn&apos;t.
                </p>
              </div>
              <div className="rounded-sm border border-[#1F6A64]/40 bg-[#1A2B3C] p-6">
                <p className="text-xs font-semibold tracking-[0.28em] text-[#C4A574]">
                  THE DAEDALUS PATH
                </p>
                <p className="mt-3 text-sm leading-7 text-[#F9F8F3]/80">
                  AI engineered with a ceiling and a floor, and a human
                  pilot who never leaves the interface: capability and
                  control climb together.
                </p>
              </div>
            </div>

            <p className="mt-8 max-w-3xl text-base leading-8 text-[#1A2B3C]/70">
              Daedalus Health exists to build that discipline into your
              organization—the wings, the boundaries, and the human judgment
              to fly the middle course—so your health system gains every bit
              of altitude AI promises without ever losing sight of the
              ground, or the patient.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
