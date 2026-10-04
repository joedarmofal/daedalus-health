import { CompassStar } from "@/components/compass-star";
import { destinationAfterInvite } from "@/lib/invite";
import { parseOrgSlug } from "@/lib/org";
import { needsPasswordSetup } from "@/lib/password-setup";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SetPasswordForm } from "./set-password-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create your login",
};

export default async function SetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string }>;
}) {
  const { org: rawOrg } = await searchParams;
  const org = parseOrgSlug(rawOrg);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!needsPasswordSetup(user)) {
    redirect(await destinationAfterInvite(supabase, user, org, ""));
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#1A2B3C] px-4 py-16">
      <span className="mb-6 flex size-12 items-center justify-center text-[#C4A574]">
        <CompassStar className="size-11" />
      </span>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C4A574]">
        Create your login
      </p>
      <h1 className="mt-3 text-center font-serif text-2xl font-medium text-[#F9F8F3]">
        Choose a password for the portal
      </h1>
      <p className="mt-3 max-w-md text-center text-sm leading-6 text-[#F9F8F3]/70">
        {org
          ? `This is how you will sign in to ${org} after today. Use your work email and a password only you know.`
          : "This is how you will sign in after today. Use your work email and a password only you know."}
      </p>
      <SetPasswordForm email={user.email ?? ""} orgSlug={org} />
    </div>
  );
}
