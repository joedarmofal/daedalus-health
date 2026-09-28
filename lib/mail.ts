import { publicAppUrl } from "@/lib/public-url";
import nodemailer from "nodemailer";

const CUSTOMER_FROM_NAME = "Daedalus Health";
const JOE_FROM_NAME = "Joe at Daedalus Health";
export const DEFAULT_MAIL_INBOX = "joedarmofal@daedalushealth.ai";
export const DEFAULT_CUSTOMER_MAIL_FROM = "welcome@daedalushealth.ai";

/** Joe's primary mailbox — SMTP login and inbound notifications. */
export function mailInboxAddress(): string {
  return (
    process.env.SMTP_INBOX?.trim() ||
    process.env.SMTP_USER?.trim() ||
    DEFAULT_MAIL_INBOX
  );
}

/** Alias used as the From address on automated customer emails. */
export function customerMailFromAddress(): string {
  return process.env.SMTP_FROM?.trim() || DEFAULT_CUSTOMER_MAIL_FROM;
}

/** @deprecated Use customerMailFromAddress() for customer mail, mailInboxAddress() for Joe. */
export function mailFromAddress(): string {
  return customerMailFromAddress();
}

function smtpUser(): string {
  return (
    process.env.SMTP_USER?.trim() ||
    process.env.ZOHO_SMTP_USER?.trim() ||
    DEFAULT_MAIL_INBOX
  );
}

function smtpPassword(): string {
  return (
    process.env.SMTP_PASSWORD ??
    process.env.ZOHO_SMTP_PASSWORD ??
    process.env.GOOGLE_WORKSPACE_SMTP_PASSWORD ??
    ""
  )
    .trim()
    .replace(/[\s-]/g, "");
}

function smtpHost(): string {
  return process.env.SMTP_HOST?.trim() || "smtppro.zoho.com";
}

function smtpPort(): number {
  const port = Number(process.env.SMTP_PORT);
  return Number.isFinite(port) && port > 0 ? port : 465;
}

export function isWelcomeMailConfigured(): boolean {
  return smtpPassword().length > 0;
}

export interface WelcomeEmailInput {
  to: string;
  contactName: string;
  orgName: string;
  orgSlug: string;
  inviteLink: string;
}

export async function sendWelcomeEmail(
  input: WelcomeEmailInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const fromEmail = customerMailFromAddress();
  const replyTo = mailInboxAddress();
  const fromPassword = smtpPassword();

  if (!fromPassword) {
    return {
      ok: false,
      error:
        "Welcome email is not configured on this server. Add SMTP_PASSWORD in Vercel Project Settings → Environment Variables (Production), then redeploy. Pushing .env.local does not send it to the live site.",
    };
  }

  const greetingName = input.contactName.trim() || "there";
  const portalUrl = `${publicAppUrl()}/${input.orgSlug}`;
  const loginUrl = `${publicAppUrl()}/login`;

  const text = [
    `Hi ${greetingName},`,
    "",
    `Welcome to Daedalus Health. I've set up the ${input.orgName} workspace for your team.`,
    "",
    "Use this secure one-time link to create your login and finish a short setup form:",
    input.inviteLink,
    "",
    `After you choose a password, you can return anytime at ${loginUrl}. Your portal will live at ${portalUrl}.`,
    "",
    "If anything looks off, reply to this email and I will help.",
    "",
    "Joe",
    "Daedalus Health",
    fromEmail,
  ].join("\n");

  const html = `
    <div style="margin:0;padding:32px 16px;background:#F7F5F0;font-family:Georgia,Times,serif;color:#1A2B3C;">
      <div style="max-width:560px;margin:0 auto;background:#F9F8F3;border:1px solid rgba(26,43,60,0.12);padding:36px 32px;">
        <p style="margin:0;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#1F6A64;font-family:Arial,sans-serif;">Daedalus Health</p>
        <h1 style="margin:16px 0 0;font-size:28px;font-weight:500;line-height:1.2;">Welcome to your workspace</h1>
        <p style="margin:20px 0 0;font-size:16px;line-height:1.7;font-family:Arial,sans-serif;">Hi ${escapeHtml(greetingName)},</p>
        <p style="margin:16px 0 0;font-size:16px;line-height:1.7;font-family:Arial,sans-serif;">
          Welcome to Daedalus Health. I have set up the
          <strong>${escapeHtml(input.orgName)}</strong> workspace for your team.
        </p>
        <p style="margin:16px 0 0;font-size:16px;line-height:1.7;font-family:Arial,sans-serif;">
          Use this secure one-time link to create your login and finish a short setup form.
        </p>
        <p style="margin:28px 0;text-align:center;">
          <a href="${escapeHtml(input.inviteLink)}" style="display:inline-block;background:#1F6A64;color:#F9F8F3;text-decoration:none;padding:12px 22px;font-family:Arial,sans-serif;font-size:14px;letter-spacing:0.04em;">
            Open your workspace
          </a>
        </p>
        <p style="margin:0;font-size:14px;line-height:1.6;color:rgba(26,43,60,0.7);font-family:Arial,sans-serif;">
          After you choose a password, return anytime at
          <a href="${escapeHtml(loginUrl)}" style="color:#1F6A64;">${escapeHtml(loginUrl.replace(/^https?:\/\//, ""))}</a>.
        </p>
        <p style="margin:24px 0 0;font-size:16px;line-height:1.7;font-family:Arial,sans-serif;">
          If anything looks off, reply to this email and I will help.
        </p>
        <p style="margin:28px 0 0;font-size:16px;line-height:1.6;">
          Joe<br />
          <span style="font-family:Arial,sans-serif;font-size:13px;color:rgba(26,43,60,0.65);">Daedalus Health · ${escapeHtml(fromEmail)}</span>
        </p>
      </div>
    </div>
  `;

  return sendTransactionalEmail({
    to: input.to,
    from: fromEmail,
    replyTo,
    subject: `Welcome to Daedalus Health — your ${input.orgName} workspace`,
    text,
    html,
  });
}

export interface InformationRequestEmailInput {
  fullName: string;
  email: string;
  phone: string | null;
  title: string | null;
  organizationName: string;
  organizationType: string | null;
  organizationSize: string | null;
  state: string | null;
  interest: string | null;
  notes: string | null;
}

export async function sendInformationRequestEmail(
  input: InformationRequestEmailInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const inbox = mailInboxAddress();
  const rows: Array<[string, string]> = [
    ["Name", input.fullName],
    ["Email", input.email],
    ["Phone", input.phone ?? ""],
    ["Title", input.title ?? ""],
    ["Organization", input.organizationName],
    ["Organization type", input.organizationType ?? ""],
    ["Organization size", input.organizationSize ?? ""],
    ["State / region", input.state ?? ""],
    ["Interest", input.interest ?? ""],
    ["Notes", input.notes ?? ""],
  ];

  const text = [
    "A potential customer submitted a Request Information form on daedalushealth.ai.",
    "",
    ...rows.map(([label, value]) => `${label}: ${value || "—"}`),
  ].join("\n");

  const htmlRows = rows
    .map(
      ([label, value]) =>
        `<tr>
          <td style="padding:8px 12px 8px 0;font-family:Arial,sans-serif;font-size:13px;color:rgba(26,43,60,0.6);vertical-align:top;">${escapeHtml(label)}</td>
          <td style="padding:8px 0;font-family:Arial,sans-serif;font-size:14px;color:#1A2B3C;">${escapeHtml(value || "—")}</td>
        </tr>`,
    )
    .join("");

  const html = `
    <div style="margin:0;padding:32px 16px;background:#F7F5F0;font-family:Georgia,Times,serif;color:#1A2B3C;">
      <div style="max-width:560px;margin:0 auto;background:#F9F8F3;border:1px solid rgba(26,43,60,0.12);padding:36px 32px;">
        <p style="margin:0;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#1F6A64;font-family:Arial,sans-serif;">Daedalus Health</p>
        <h1 style="margin:16px 0 0;font-size:26px;font-weight:500;line-height:1.2;">New information request</h1>
        <p style="margin:16px 0 20px;font-size:15px;line-height:1.7;font-family:Arial,sans-serif;">
          ${escapeHtml(input.fullName)} submitted a request on daedalushealth.ai.
        </p>
        <table style="width:100%;border-collapse:collapse;">${htmlRows}</table>
      </div>
    </div>
  `;

  return sendTransactionalEmail({
    to: inbox,
    from: mailInboxAddress(),
    fromName: JOE_FROM_NAME,
    replyTo: input.email,
    subject: `Information request — ${input.organizationName}`,
    text,
    html,
  });
}

export async function sendMagicLinkEmail(input: {
  to: string;
  signInLink: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const fromEmail = customerMailFromAddress();
  const replyTo = mailInboxAddress();
  const loginUrl = `${publicAppUrl()}/login`;

  const text = [
    "Use this one-time link to sign in to Daedalus Health:",
    input.signInLink,
    "",
    "This link expires shortly. If you did not request it, you can ignore this email.",
    "",
    `You can also sign in with your password at ${loginUrl}.`,
    "",
    "Joe",
    "Daedalus Health",
    fromEmail,
  ].join("\n");

  const html = brandedAuthEmail({
    title: "Your sign-in link",
    intro: "Use this one-time link to sign in to Daedalus Health. It expires shortly.",
    buttonLabel: "Sign in",
    buttonHref: input.signInLink,
    footer: `You can also sign in with your password at ${loginUrl.replace(/^https?:\/\//, "")}. If you did not request this, ignore the email.`,
  });

  return sendTransactionalEmail({
    to: input.to,
    from: fromEmail,
    replyTo,
    subject: "Your Daedalus Health sign-in link",
    text,
    html,
  });
}

export async function sendPasswordResetEmail(input: {
  to: string;
  resetLink: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const fromEmail = customerMailFromAddress();
  const replyTo = mailInboxAddress();
  const loginUrl = `${publicAppUrl()}/login`;

  const text = [
    "Use this one-time link to choose a new password for your Daedalus Health account:",
    input.resetLink,
    "",
    "This link expires shortly. If you did not request a reset, you can ignore this email.",
    "",
    `Return to sign in at ${loginUrl}.`,
    "",
    "Joe",
    "Daedalus Health",
    fromEmail,
  ].join("\n");

  const html = brandedAuthEmail({
    title: "Reset your password",
    intro: "Use this one-time link to choose a new password. It expires shortly.",
    buttonLabel: "Choose a new password",
    buttonHref: input.resetLink,
    footer: `If you did not request this, ignore the email. Sign in anytime at ${loginUrl.replace(/^https?:\/\//, "")}.`,
  });

  return sendTransactionalEmail({
    to: input.to,
    from: fromEmail,
    replyTo,
    subject: "Reset your Daedalus Health password",
    text,
    html,
  });
}

function brandedAuthEmail(input: {
  title: string;
  intro: string;
  buttonLabel: string;
  buttonHref: string;
  footer: string;
}): string {
  const fromEmail = customerMailFromAddress();
  return `
    <div style="margin:0;padding:32px 16px;background:#F7F5F0;font-family:Georgia,Times,serif;color:#1A2B3C;">
      <div style="max-width:560px;margin:0 auto;background:#F9F8F3;border:1px solid rgba(26,43,60,0.12);padding:36px 32px;">
        <p style="margin:0;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#1F6A64;font-family:Arial,sans-serif;">Daedalus Health</p>
        <h1 style="margin:16px 0 0;font-size:28px;font-weight:500;line-height:1.2;">${escapeHtml(input.title)}</h1>
        <p style="margin:20px 0 0;font-size:16px;line-height:1.7;font-family:Arial,sans-serif;">${escapeHtml(input.intro)}</p>
        <p style="margin:28px 0;text-align:center;">
          <a href="${escapeHtml(input.buttonHref)}" style="display:inline-block;background:#1F6A64;color:#F9F8F3;text-decoration:none;padding:12px 22px;font-family:Arial,sans-serif;font-size:14px;letter-spacing:0.04em;">
            ${escapeHtml(input.buttonLabel)}
          </a>
        </p>
        <p style="margin:0;font-size:14px;line-height:1.6;color:rgba(26,43,60,0.7);font-family:Arial,sans-serif;">${escapeHtml(input.footer)}</p>
        <p style="margin:28px 0 0;font-size:16px;line-height:1.6;">
          Joe<br />
          <span style="font-family:Arial,sans-serif;font-size:13px;color:rgba(26,43,60,0.65);">Daedalus Health · ${escapeHtml(fromEmail)}</span>
        </p>
      </div>
    </div>
  `;
}

async function sendTransactionalEmail(input: {
  to: string;
  from?: string;
  fromName?: string;
  replyTo: string;
  subject: string;
  text: string;
  html: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const authUser = smtpUser();
  const fromEmail = input.from ?? customerMailFromAddress();
  const fromName = input.fromName ?? CUSTOMER_FROM_NAME;
  const fromPassword = smtpPassword();

  if (!fromPassword) {
    return {
      ok: false,
      error:
        "Email is not configured on this server. Add SMTP_PASSWORD in Vercel Production environment variables.",
    };
  }

  const host = smtpHost();
  const port = smtpPort();

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user: authUser,
        pass: fromPassword,
      },
    });

    await transporter.sendMail({
      from: `${fromName} <${fromEmail}>`,
      to: input.to,
      replyTo: input.replyTo,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    const rejected =
      /535|534|553|BadCredentials|Username and Password not accepted|authentication failed/i.test(
        message,
      );
    return {
      ok: false,
      error: rejected
        ? "Zoho rejected the mailbox login. Check SMTP_USER and SMTP_PASSWORD (use a Zoho app password if two-factor is on)."
        : err instanceof Error
          ? err.message
          : "The email could not be sent.",
    };
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
