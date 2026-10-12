import { tokenFromGenerateLink } from "@/lib/invite";
import { sendTeammateInviteEmail, sendWelcomeEmail } from "@/lib/mail";
import {
  ensureOrgMembership,
  type OrgMemberRole,
} from "@/lib/org-membership";
import { isCustomerFacingUrl, publicAppUrl, publicInviteUrl } from "@/lib/public-url";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface InviteMemberResult {
  ok: boolean;
  error?: string;
  inviteLink?: string;
  emailSent?: boolean;
  emailedTo?: string;
}

export async function inviteUserToOrganization(
  admin: SupabaseClient,
  org: { id: string; slug: string; name: string },
  email: string,
  fullName: string,
  role: OrgMemberRole = "member",
  emailKind: "welcome" | "teammate" = "welcome",
): Promise<InviteMemberResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const resolvedName = fullName.trim();
  if (!normalizedEmail) {
    return { ok: false, error: "An email address is required." };
  }

  const redirectTo = `${publicAppUrl()}/auth/invite`;
  const userData = {
    ...(resolvedName ? { full_name: resolvedName } : {}),
    org_slug: org.slug,
    must_set_password: true,
  };

  let linkType: "invite" | "magiclink" = "invite";
  let { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "invite",
    email: normalizedEmail,
    options: {
      data: userData,
      redirectTo,
    },
  });

  if (linkError && /already been registered|already exists|already registered/i.test(linkError.message)) {
    linkType = "magiclink";
    ({ data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: normalizedEmail,
      options: { redirectTo },
    }));
  }

  const token = tokenFromGenerateLink(linkData?.properties);
  if (linkError || !token || !linkData?.user) {
    return {
      ok: false,
      error: linkError?.message ?? "Could not generate an invite link.",
    };
  }

  const membership = await ensureOrgMembership(
    admin,
    org.id,
    linkData.user.id,
    resolvedName,
    role,
  );
  if (!membership.ok) {
    return {
      ok: false,
      error: `Invite link was created, but adding the membership failed: ${membership.error}`,
    };
  }

  const inviteLink = publicInviteUrl({
    tokenHash: token.tokenHash,
    type: token.type || linkType,
    orgSlug: org.slug,
  });

  if (!isCustomerFacingUrl(inviteLink)) {
    return {
      ok: false,
      error:
        "Refused to issue a non-public invite link. The customer would not be able to open it.",
    };
  }

  const emailResult =
    emailKind === "teammate"
      ? await sendTeammateInviteEmail({
          to: normalizedEmail,
          contactName: resolvedName,
          orgName: org.name,
          orgSlug: org.slug,
          inviteLink,
        })
      : await sendWelcomeEmail({
          to: normalizedEmail,
          contactName: resolvedName,
          orgName: org.name,
          orgSlug: org.slug,
          inviteLink,
        });

  return {
    ok: true,
    inviteLink,
    emailSent: emailResult.ok,
    emailedTo: normalizedEmail,
    error: emailResult.ok
      ? undefined
      : emailResult.error ?? "The invite email could not be sent.",
  };
}
