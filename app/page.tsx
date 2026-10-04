import { CompassStar } from "@/components/compass-star";
import { CoreValuesShield } from "@/components/core-values-shield";
import { MapLegend } from "@/components/map-legend";
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

const pillars = [
  {
    title: "Governance & Safety",
    description:
      "Board-ready policy, risk registers, and decision rights that keep clinical AI accountable from procurement to production. Human control at every decision point. Incorporating our value of humanity into all we do.",
    icon: ShieldCheck,
  },
  {
    title: "Augmented Intelligence",
    description:
      "We engineer the interface and agentic AI tools so health professionals remain the pilot. Models serve as copilots, never silent substitutes for professional judgment.",
    icon: Brain,
  },
  {
    title: "Clinical Validation",
    description:
      "Evidence standards, local performance testing, and continuous bias and drift surveillance. Every deployment earns its place at the bedside.",
    icon: HeartPulse,
  },
  {
    title: "Transparency & Trust",
    description:
      "Clear documentation, patient-facing disclosure, and independent, unbiased counsel your vendors cannot provide for themselves.",
    icon: Scale,
  },
];

const frameworkSteps = [
  {
    numeral: "01",
    name: "Map",
    description:
      "Perform a front line Inventory on every model touching patients or operations, and name the accountable person for each. We know many team members are using unauthorized tools to maximize personal and departmental effeciencies. It's imperative to capture these in a non-punitive way to mitigate organizational risk and assure compliance.",
  },
  {
    numeral: "02",
    name: "Assign",
    description:
      "Establish clinical, legal, and technical owners before go-live, empowering explicit human authority to override AI systems.",
  },
  {
    numeral: "03",
    name: "Sustain",
    description:
      "Validate locally, monitor continuously, and retire any model the moment the interface fails.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-[#1A2B3C]">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-[#1A2B3C]">
          <TopographicPattern className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.16]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(249,248,243,0.08),_transparent_58%)]" />

          <MapLegend className="absolute top-6 right-4 z-10 hidden w-48 sm:right-8 lg:block" />

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
            <p className="mt-8 text-xs font-semibold tracking-[0.28em] text-[#C4A574]">
              OUR MISSION
            </p>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[#F9F8F3]/78 sm:text-lg">
              To safely guide healthcare leaders through the transformative
              power of artificial intelligence, realizing its true operational
              and clinical efficiencies while establishing compliant, ethical,
              and human-centered governance to ensure organizational
              sustainability, with humans always remaining at the heart of
              health.
            </p>
            <div className="mt-10 flex w-full flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-sm bg-[#C4A574] px-7 py-3 text-sm font-medium tracking-wide text-[#1A2B3C] transition hover:bg-[#d4b888] hover:shadow-[inset_0_0_0_1px_#C4A574]"
              >
                Partner Access
              </Link>
              <Link
                href="/request-information"
                className="inline-flex items-center justify-center rounded-sm border border-[#C4A574]/70 px-7 py-3 text-sm font-medium tracking-wide text-[#F9F8F3] transition hover:border-[#C4A574] hover:bg-[#C4A574]/10"
              >
                Request Information
              </Link>
            </div>

            <div className="mt-16 flex flex-col items-center border-t border-[#C4A574]/20 pt-14">
              <p className="text-xs font-semibold tracking-[0.28em] text-[#C4A574]">
                CORE VALUES
              </p>
              <div className="mt-7">
                <CoreValuesShield />
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-[#C4A574]/35 bg-[#F9F8F3]">
          <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-24">
            <div className="rounded-sm border border-[#C4A574]/35 bg-[#F3EEE0]/50 px-6 py-12 text-center sm:px-12">
              <p className="text-xs font-semibold tracking-[0.28em] text-[#C4A574]">
                TWO TRUTHS
              </p>
              <p className="mx-auto mt-5 max-w-4xl font-serif text-2xl leading-relaxed text-[#1A2B3C] sm:text-3xl">
                Artificial intelligence holds the power to unlock
                medicine’s greatest breakthroughs—and the potential to cause
                unfathomable harm. Both truths coexist, and neither cancels
                the other out.
              </p>
              <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-[#1A2B3C]/70 sm:text-lg">
                The variable that determines which truth your organization
                experiences isn’t the algorithm—it’s the human-machine
                interface. Like Daedalus’s creations, technology reflects
                the wisdom of its operator: who retains meaningful control,
                how transparent the system remains, and where human
                judgment draws the line.
              </p>
            </div>
          </div>
        </section>

        <section
          id="services"
          className="relative scroll-mt-24 overflow-hidden border-t border-[#C4A574]/25 bg-[#F9F8F3]"
        >
          <TopographicPattern
            tone="gold"
            className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.14]"
          />
          <div className="relative mx-auto max-w-6xl px-4 py-32 sm:px-6">
            <p className="text-[11px] font-normal uppercase tracking-[0.25em] text-[#C4A574]">
              THE FOUR PILLARS
            </p>
            <h2 className="mt-4 max-w-[18ch] font-serif text-4xl font-normal leading-tight tracking-tight text-[#1A2B3C] sm:text-5xl">
              Principles that keep AI in service of care.
            </h2>
            <p className="mt-6 max-w-[62ch] text-base font-normal leading-[1.7] text-[#1A2B3C]/70">
              Every pillar answers one question: at the human-machine
              interface, who is in command? These are the wings we help you
              build, and the discipline to fly them.
            </p>
            <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {pillars.map((pillar) => (
                <article
                  key={pillar.title}
                  className="rounded-sm border border-[#C4A574]/35 bg-[#F3EEE0]/60 p-10 transition-[border-color,transform] duration-200 ease-out motion-safe:hover:-translate-y-[2px] hover:border-[#C4A574] sm:p-12"
                >
                  <pillar.icon
                    className="size-6 text-[#C4A574]"
                    strokeWidth={1.25}
                  />
                  <h3 className="mt-5 font-serif text-2xl font-normal text-[#1A2B3C]">
                    {pillar.title}
                  </h3>
                  <p className="mt-3 max-w-[62ch] text-base font-normal leading-[1.7] text-[#1A2B3C]/70">
                    {pillar.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="governance"
          className="relative scroll-mt-24 overflow-hidden border-t border-[#C9A24B]/20 bg-[#1A2B3C]"
        >
          <TopographicPattern
            tone="gold"
            className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]"
          />
          <div className="relative mx-auto grid max-w-6xl gap-14 px-4 py-32 sm:px-6 lg:grid-cols-2 lg:items-start">
            <div>
              <p className="text-[11px] font-normal uppercase tracking-[0.25em] text-[#C9A24B]">
                THE DAEDALUS FRAMEWORK
              </p>
              <h2 className="mt-4 max-w-[18ch] font-serif text-4xl font-normal leading-tight tracking-tight text-[#F3EEE0] sm:text-5xl">
                A durable operating system for clinical AI.
              </h2>
              <p className="mt-6 max-w-[62ch] text-base font-normal leading-[1.7] text-[#F3EEE0]/75">
                Every AI system must be a human-machine interface: the
                instrument panel where clinical judgment meets machine
                inference. We calibrate it as Daedalus calibrated his wings,
                with guardrails that provide enough lift to reach real
                altitude and enough restraint that a human hand never leaves
                the controls accidentally flying too close to the sun.
              </p>
              <p className="mt-5 max-w-[62ch] text-base font-normal leading-[1.7] text-[#F3EEE0]/75">
                We install the committee structure, evidence standards, and
                escalation paths for sustainability that outlast vendor
                turnover and model generations. Your framework becomes an
                evolving, institutional asset, not a slide deck.
              </p>
            </div>
            <ol className="divide-y divide-[#C9A24B]/35">
              {frameworkSteps.map((step) => (
                <li key={step.numeral} className="py-8 first:pt-0 last:pb-0">
                  <p className="font-serif text-4xl font-normal leading-none text-[#C9A24B] sm:text-5xl">
                    {step.numeral}
                  </p>
                  <h3 className="mt-3 font-serif text-2xl font-normal text-[#F3EEE0]">
                    {step.name}
                  </h3>
                  <p className="mt-2 max-w-[62ch] text-base font-normal leading-[1.7] text-[#F3EEE0]/75">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          id="about"
          className="scroll-mt-24 border-t border-[#C4A574]/25 bg-[#F9F8F3]"
        >
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <p className="text-xs font-semibold tracking-[0.28em] text-[#C4A574]">
              ABOUT
            </p>
            <h2 className="mt-3 max-w-3xl font-serif text-3xl font-medium tracking-tight text-[#1A2B3C] sm:text-4xl">
              Named for the craftsman who built the labyrinth, the wings, and
              the discipline to fly them.
            </h2>

            <div className="mt-8 max-w-3xl rounded-sm border border-[#C4A574]/30 bg-[#F3EEE0]/60 px-6 py-8 sm:px-8">
              <p className="text-base leading-8 text-[#1A2B3C]/75">
                Daedalus was Crete&apos;s master engineer, commissioned to build
                the Labyrinth—a structure so intricate that even its architect
                could barely find his way through it. It is an old story with a
                modern echo: the algorithms reshaping care today are our new
                labyrinths, engineered by brilliant minds, yet increasingly
                opaque even to the people who built them.
              </p>
              <p className="mt-4 text-base leading-8 text-[#1A2B3C]/75">
                When the king who depended on his genius imprisoned him on the
                island instead of freeing him, Daedalus didn&apos;t escape by
                force. He engineered wings—feathers set in wax—and gave a
                matching pair to his son, Icarus, with one instruction: fly the
                middle course. Not so low that the sea dampens your feathers.
                Not so high that the sun melts your wax.
              </p>
              <p className="mt-4 text-base leading-8 text-[#1A2B3C]/75">
                Icarus, dazzled by the altitude ambition made possible, ignored
                the boundary and fell. Daedalus, flying the very same
                invention with the same discipline, landed safely. Same wings.
                Same human-machine interface. The only difference was who kept
                a hand on the controls.
              </p>
              <p className="mt-4 text-base leading-8 text-[#1A2B3C]/75">
                This is the paradox at the center of medical AI, and it is why
                we say two truths, not one. The same model that catches a
                missed diagnosis can just as easily encode bias into a
                treatment plan, or fail at the exact moment a patient can
                least afford it. The wings were never the danger. The absence
                of a human hand on the controls was.
              </p>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              <div className="rounded-sm border border-[#C4A574]/40 bg-[#F3EEE0] p-6">
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
              <div className="rounded-sm border border-[#C4A574]/40 bg-[#1A2B3C] p-6">
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
