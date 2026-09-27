import { parseInviteType } from "@/lib/invite";
import { resolveOrgSlug } from "@/lib/org";
import { needsPasswordSetup } from "@/lib/password-setup";
import { publicAppUrl, safeAppPath } from "@/lib/public-url";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type PendingCookie = {
  name: string;
  value: string;
  options: Parameters<Awaited<ReturnType<typeof cookies>>["set"]>[2];
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = (
    searchParams.get("token_hash") ??
    searchParams.get("token") ??
    ""
  ).trim();
  const otpType = parseInviteType(searchParams.get("type"));
  const next = searchParams.get("next") ?? "/";
  const origin = publicAppUrl();

  if (tokenHash && otpType) {
    const { supabase, pendingCookies } = await callbackClient();
    const { error } = await supabase.auth.verifyOtp({
      type: otpType,
      token_hash: tokenHash,
    });

    if (!error) {
      return redirectWithSession(
        await destinationForNext(supabase, next, origin),
        pendingCookies,
      );
    }

    return NextResponse.redirect(`${origin}${failedPath(next)}`);
  }

  if (code) {
    const { supabase, pendingCookies } = await callbackClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return redirectWithSession(
        await destinationForNext(supabase, next, origin),
        pendingCookies,
      );
    }
  }

  return NextResponse.redirect(`${origin}${failedPath(next)}`);
}

async function callbackClient() {
  const cookieStore = await cookies();
  const pendingCookies: PendingCookie[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet, _headers) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
            pendingCookies.push({ name, value, options });
          });
        },
      },
    },
  );

  return { supabase, pendingCookies };
}

function redirectWithSession(destination: string, pendingCookies: PendingCookie[]) {
  const response = NextResponse.redirect(destination);
  for (const cookie of pendingCookies) {
    response.cookies.set(cookie.name, cookie.value, cookie.options);
  }
  return response;
}

async function destinationForNext(
  supabase: SupabaseClient,
  next: string,
  origin: string,
): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const safeNext = safeAppPath(next);

  if (
    needsPasswordSetup(user) &&
    !safeNext.startsWith("/auth/set-password") &&
    !safeNext.startsWith("/auth/update-password")
  ) {
    const orgSlug = await resolveOrgSlug(supabase, user);
    return orgSlug
      ? `${origin}/auth/set-password?org=${encodeURIComponent(orgSlug)}`
      : `${origin}/auth/set-password`;
  }

  if (safeNext !== "/") {
    return `${origin}${safeNext}`;
  }

  const orgSlug = await resolveOrgSlug(supabase, user);
  return orgSlug ? `${origin}/${orgSlug}` : `${origin}/`;
}

function failedPath(next: string): string {
  const safeNext = safeAppPath(next);
  if (safeNext.startsWith("/admin")) {
    return "/admin?error=auth-failed";
  }
  if (safeNext.startsWith("/auth/update-password")) {
    return "/auth/reset-password";
  }
  if (safeNext.startsWith("/emergency-services")) {
    return "/emergency-services?error=auth-failed";
  }
  return "/login?error=auth-failed";
}
