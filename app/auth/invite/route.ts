import { parseOrgSlug, resolveOrgSlug } from "@/lib/org";
import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType, SupabaseClient, User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const INVITE_TYPES = new Set<EmailOtpType>(["invite", "magiclink"]);

type PendingCookie = {
  name: string;
  value: string;
  options?: Parameters<NextResponse["cookies"]["set"]>[2];
};

function inviteErrorUrl(origin: string, code: string) {
  return `${origin}/auth/invite-callback?error=${encodeURIComponent(code)}`;
}

function noStoreRedirect(url: string, pendingCookies: PendingCookie[]) {
  const response = NextResponse.redirect(url);
  response.headers.set("Cache-Control", "no-store");
  for (const cookie of pendingCookies) {
    response.cookies.set(cookie.name, cookie.value, cookie.options);
  }
  return response;
}

async function destinationAfterInvite(
  supabase: SupabaseClient,
  user: User | null,
  preferredOrg: string | null,
  origin: string,
): Promise<string> {
  const candidates: string[] = [];
  if (preferredOrg) candidates.push(preferredOrg);

  const resolved = await resolveOrgSlug(supabase, user);
  if (resolved && !candidates.includes(resolved)) {
    candidates.push(resolved);
  }

  for (const slug of candidates) {
    const { data: org } = await supabase
      .from("organizations")
      .select("id, slug, organization_members!inner(user_id)")
      .eq("slug", slug)
      .eq("organization_members.user_id", user?.id ?? "")
      .maybeSingle();

    if (!org?.slug) continue;

    const { data: intake } = await supabase
      .from("organization_intake")
      .select("organization_id")
      .eq("organization_id", org.id)
      .maybeSingle();

    return intake ? `${origin}/${org.slug}` : `${origin}/${org.slug}/intake`;
  }

  return inviteErrorUrl(origin, "no_organization");
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash") ?? searchParams.get("token");
  const requestedType = searchParams.get("type");
  const preferredOrg = parseOrgSlug(searchParams.get("org"));

  if (!tokenHash) {
    return noStoreRedirect(inviteErrorUrl(origin, "missing"), []);
  }

  const typesToTry: EmailOtpType[] = [];
  if (INVITE_TYPES.has(requestedType as EmailOtpType)) {
    typesToTry.push(requestedType as EmailOtpType);
  }
  for (const type of ["invite", "magiclink"] as const) {
    if (!typesToTry.includes(type)) typesToTry.push(type);
  }

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
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              cookieStore.set(name, value, options);
            } catch {
              // Route Handler will attach cookies on the redirect response.
            }
            pendingCookies.push({ name, value, options });
          });
        },
      },
    },
  );

  let verified = false;
  for (const type of typesToTry) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) {
      verified = true;
      break;
    }
  }

  if (!verified) {
    return noStoreRedirect(inviteErrorUrl(origin, "expired"), pendingCookies);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const destination = await destinationAfterInvite(
    supabase,
    user,
    preferredOrg,
    origin,
  );

  return noStoreRedirect(destination, pendingCookies);
}
