import { CompassStar } from "@/components/compass-star";
import { parseInviteType } from "@/lib/invite";
import { parseOrgSlug } from "@/lib/org";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { acceptInvite } from "./actions";
import { InviteAcceptButton } from "./invite-accept-button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Accept invite",
};

export default async function InvitePage({
  searchParams,
}: {
  searchParams: Promise<{
    token_hash?: string;
    token?: string;
    type?: string;
    org?: string;
  }>;
}) {
  const params = await searchParams;
  const tokenHash = (params.token_hash ?? params.token ?? "").trim();
  const type = parseInviteType(params.type) ?? "invite";
  const org = parseOrgSlug(params.org);

  if (!tokenHash) {
    return (
      <InviteShell>
        <p className="max-w-sm text-sm leading-6 text-[#1A2B3C]/70">
          This invite link is incomplete. Ask your administrator to send a new
          one.
        </p>
        <Link
          href="/login"
          className="mt-6 text-sm font-medium text-[#1F6A64] hover:text-[#1A2B3C]"
        >
          Return to sign in
        </Link>
      </InviteShell>
    );
  }

  return (
    <InviteShell>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#1F6A64]">
        Client invite
      </p>
      <h1 className="mt-3 font-serif text-2xl font-medium text-[#1A2B3C]">
        {org ? `Welcome to ${org}` : "Welcome to Daedalus Health"}
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-6 text-[#1A2B3C]/70">
        {org
          ? `You have been invited to the ${org} workspace. Continue to create your login, then a short setup form.`
          : "You have been invited to a Daedalus Health workspace. Continue to create your login."}
      </p>
      <form action={acceptInvite}>
        <input type="hidden" name="token_hash" value={tokenHash} />
        <input type="hidden" name="type" value={type} />
        {org ? <input type="hidden" name="org" value={org} /> : null}
        <InviteAcceptButton hasOrg={Boolean(org)} />
      </form>
    </InviteShell>
  );
}

function InviteShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F7F5F0] px-4 text-center">
      <span className="mb-6 flex size-12 items-center justify-center text-[#1F6A64]">
        <CompassStar className="size-11" />
      </span>
      {children}
    </div>
  );
}
