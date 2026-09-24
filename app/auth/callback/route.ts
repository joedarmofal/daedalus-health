import { createClient } from "@/lib/supabase/server";
import { resolveOrgSlug } from "@/lib/org";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const orgSlug = await resolveOrgSlug(supabase, user);

  if (!orgSlug) {
    return NextResponse.redirect(`${origin}/login?error=no_organization`);
  }

  if (next?.startsWith("/") && !next.startsWith("//")) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/${orgSlug}`);
}
