import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";
import { Compass } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function OrgPortalPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-16 sm:px-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8">
          <Compass className="size-6 text-emerald-400" />
          <p className="mt-4 text-xs font-semibold tracking-[0.18em] text-emerald-300">
            CLIENT PORTAL
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-50">
            {orgSlug}
          </h1>
          <p className="mt-3 text-sm leading-7 text-stone-400">
            You are signed in as {user.email}. This tenant workspace is ready
            for Daedalus Health program materials.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex text-sm font-medium text-emerald-300 hover:text-emerald-200"
          >
            Return to Daedalus Health
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
