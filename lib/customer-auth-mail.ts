import { tokenFromGenerateLink } from "@/lib/invite";
import {
  sendMagicLinkEmail,
  sendPasswordResetEmail,
} from "@/lib/mail";
import {
  isCustomerFacingUrl,
  publicAuthVerifyUrl,
  safeAppPath,
} from "@/lib/public-url";
import { createAdminClient } from "@/lib/supabase/admin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function unknownUserOrRateLimit(message: string): "unknown" | "wait" | "other" {
  if (/not found|unable to find|user not found|does not exist/i.test(message)) {
    return "unknown";
  }
  if (/security purposes|only request this after|rate limit|too many/i.test(message)) {
    return "wait";
  }
  return "other";
}

/**
 * Builds a production magic-link or recovery URL and emails it from
 * welcome@daedalushealth.ai. Never forwards Supabase's action_link — that
 * embeds the project's Site URL, which is often localhost.
 */
export async function sendCustomerAuthLink(input: {
  email: string;
  kind: "magiclink" | "recovery";
  next?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const email = normalizeEmail(input.email);
  if (!email || !EMAIL_RE.test(email)) {
    return { ok: false, error: "Enter the work email you use for the portal." };
  }

  const next = safeAppPath(input.next ?? (input.kind === "recovery" ? "/auth/update-password" : "/"));

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return {
      ok: false,
      error: "Sign-in email is not configured on this server. Contact Daedalus Health.",
    };
  }

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: input.kind,
    email,
  });

  if (linkError) {
    const kind = unknownUserOrRateLimit(linkError.message);
    if (kind === "unknown") {
      return { ok: true };
    }
    if (kind === "wait") {
      return {
        ok: false,
        error: "Please wait a minute before requesting another email.",
      };
    }
    return { ok: false, error: linkError.message };
  }

  const token = tokenFromGenerateLink(linkData?.properties);
  if (!token) {
    return { ok: true };
  }

  const link = publicAuthVerifyUrl({
    tokenHash: token.tokenHash,
    type: token.type || input.kind,
    next,
  });

  if (!isCustomerFacingUrl(link)) {
    return {
      ok: false,
      error: "Refused to send a non-public sign-in link.",
    };
  }

  const mailed =
    input.kind === "recovery"
      ? await sendPasswordResetEmail({ to: email, resetLink: link })
      : await sendMagicLinkEmail({ to: email, signInLink: link });

  if (!mailed.ok) {
    return mailed;
  }

  return { ok: true };
}
