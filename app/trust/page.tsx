import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { customerMailFromAddress } from "@/lib/mail";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Trust Center",
  description:
    "How Daedalus Health handles security, privacy, and healthcare IT review. This product does not create, receive, maintain, or transmit PHI.",
};

const SECTIONS = [
  {
    title: "This product does not process PHI",
    body: [
      "Daedalus Health is an advisory and program-operations workspace. It is not an EHR, not a clinical data repository, and not a patient-care system of record.",
      "The site and client portal do not connect to electronic health records, do not ingest claims, ADT, imaging, or lab feeds, and are not designed to create, receive, maintain, or transmit protected health information (PHI).",
      "Do not upload patient names, medical record numbers, PCRs, encounter notes, or other PHI. If something looks like PHI, do not paste it here — use your organization’s clinical systems instead.",
    ],
  },
  {
    title: "What the service is for",
    body: [
      "Health system leaders use Daedalus Health for AI governance work, vendor evaluation, and related advisory materials. Emergency medical and air-medical programs can use a separate workspace to prepare CAMTS Program Information Form content and policy drafts.",
      "Accounts are issued to named professionals at customer organizations. Access is limited to that organization’s workspace.",
    ],
  },
  {
    title: "What we store",
    body: [
      "Work contact details for accounts and inquiries (name, email, title, organization).",
      "Organization profile information you provide (for example program name, contacts, and high-level operational metadata).",
      "Workspace content you choose to enter: governance notes, policy drafts, PIF narratives, and uploaded program documents.",
      "Authentication sessions, needed so you can sign back in.",
      "We do not sell personal data. See the Privacy Policy for how to reach us about privacy questions.",
    ],
  },
  {
    title: "Access and authentication",
    body: [
      "Customer logins are invite-based. Users sign in with a password or a one-time magic link sent to their work email.",
      "Passwords are stored as hashes by Supabase Auth. We generate sign-in and password-reset links ourselves so they always point at daedalushealth.ai — never a local or preview host.",
      "Each user is scoped to their organization through membership records. The operator console is limited to Daedalus Health administrators.",
    ],
  },
  {
    title: "Infrastructure",
    body: [
      "The application is hosted on Vercel and served over HTTPS.",
      "Authentication and application data live in Supabase (Postgres with row-level security for organization data).",
      "Transactional email is sent through Zoho Mail for daedalushealth.ai.",
      "Data in transit is encrypted with TLS. Data at rest is encrypted by those infrastructure providers.",
    ],
  },
  {
    title: "Optional AI drafting",
    body: [
      "Some workspace tools can draft policy or PIF language from notes and documents you provide, using the OpenAI API.",
      "Those features are writing aids, not clinical decision support. They are instructed not to use PHI. You must not upload PHI into them.",
      "If your review requires OpenAI’s current API data-use terms, request a security packet and we will include them.",
    ],
  },
  {
    title: "Subprocessors",
    body: [
      "Vercel — application hosting and content delivery.",
      "Supabase — authentication and database.",
      "Zoho — transactional email.",
      "OpenAI — optional drafting when a user runs an AI draft in the workspace.",
    ],
  },
  {
    title: "BAAs and questionnaires",
    body: [
      "Because this product does not handle PHI, a Business Associate Agreement is not required for ordinary use of the website or portal.",
      "Many health-system counsel still want a BAA on file for any vendor relationship. We will execute one on request.",
      "We will also complete reasonable security questionnaires and share a security packet (architecture summary, subprocessors, and related materials).",
    ],
  },
];

export default function TrustPage() {
  const welcome = customerMailFromAddress();

  return (
    <div className="flex min-h-full flex-col bg-[#F7F5F0]">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#1F6A64]">
            Trust Center
          </span>
          <h1 className="mt-2 font-serif text-3xl font-medium text-[#1A2B3C] sm:text-4xl">
            Security and IT review
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#1A2B3C]/70">
            Written for information-security, privacy, and IT teams evaluating
            Daedalus Health. This page describes how the live product actually
            works. We do not claim certifications we do not hold.
          </p>

          <div className="mt-8 rounded-sm border border-[#1F6A64]/35 bg-[#1F6A64]/10 px-5 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1F6A64]">
              PHI
            </p>
            <p className="mt-2 font-serif text-xl text-[#1A2B3C]">
              Daedalus Health does not touch or process PHI.
            </p>
            <p className="mt-2 text-sm leading-6 text-[#1A2B3C]/70">
              No EHR connection. No patient records. Do not upload protected
              health information to this site.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/trust/request?need=baa"
              className="inline-flex items-center justify-center rounded-sm bg-[#1F6A64] px-5 py-2.5 text-sm font-medium tracking-wide text-[#F9F8F3] transition hover:bg-[#1A2B3C]"
            >
              Request a BAA
            </Link>
            <Link
              href="/trust/request?need=security-packet"
              className="inline-flex items-center justify-center rounded-sm border border-[#1A2B3C]/25 px-5 py-2.5 text-sm font-medium tracking-wide text-[#1A2B3C] transition hover:border-[#1F6A64] hover:text-[#1F6A64]"
            >
              Request a security packet
            </Link>
          </div>

          <div className="mt-12 space-y-10">
            {SECTIONS.map((section) => (
              <section key={section.title}>
                <h2 className="font-serif text-xl font-medium text-[#1A2B3C]">
                  {section.title}
                </h2>
                {section.title === "Subprocessors" ||
                section.title === "What we store" ? (
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[#1A2B3C]/70">
                    {section.body.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-3 space-y-3">
                    {section.body.map((item) => (
                      <p
                        key={item}
                        className="text-sm leading-7 text-[#1A2B3C]/70"
                      >
                        {item}
                      </p>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>

          <section className="mt-12 border-t border-[#1A2B3C]/10 pt-8">
            <h2 className="font-serif text-xl font-medium text-[#1A2B3C]">
              Contact
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#1A2B3C]/70">
              BAA and security-packet requests go to{" "}
              <a
                href={`mailto:${welcome}`}
                className="text-[#1F6A64] hover:text-[#1A2B3C]"
              >
                {welcome}
              </a>
              . You can also use the short form. For suspected security issues
              involving this site, email the same address. Do not include PHI in
              that message.
            </p>
            <p className="mt-3 text-sm leading-7 text-[#1A2B3C]/70">
              Privacy inquiries: see the{" "}
              <Link href="/privacy" className="text-[#1F6A64] hover:text-[#1A2B3C]">
                Privacy Policy
              </Link>
              .
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
