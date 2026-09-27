import { publicAppUrl } from "@/lib/public-url";
import nodemailer from "nodemailer";

const FROM_EMAIL =
  process.env.GOOGLE_WORKSPACE_SMTP_USER?.trim() || "joe@daedalushealth.org";
const FROM_PASSWORD = process.env.GOOGLE_WORKSPACE_SMTP_PASSWORD?.trim();
const FROM_NAME = "Joe at Daedalus Health";

export function isWelcomeMailConfigured(): boolean {
  return Boolean(FROM_EMAIL && FROM_PASSWORD);
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
  if (!FROM_PASSWORD) {
    return {
      ok: false,
      error:
        "Welcome email is not configured. Add GOOGLE_WORKSPACE_SMTP_PASSWORD (a Google Workspace app password for joe@daedalushealth.org) to the server environment.",
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
    FROM_EMAIL,
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
          <span style="font-family:Arial,sans-serif;font-size:13px;color:rgba(26,43,60,0.65);">Daedalus Health · ${escapeHtml(FROM_EMAIL)}</span>
        </p>
      </div>
    </div>
  `;

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: FROM_EMAIL,
        pass: FROM_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: input.to,
      replyTo: FROM_EMAIL,
      subject: `Welcome to Daedalus Health — your ${input.orgName} workspace`,
      text,
      html,
    });

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : "The welcome email could not be sent.",
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
