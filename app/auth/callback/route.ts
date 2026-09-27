import { resolveOrgSlug } from "@/lib/org";
import { publicAppUrl } from "@/lib/public-url";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const origin = publicAppUrl();

  if (code) {
    const cookieStore = await cookies();
    const pendingCookies: Array<{
      name: string;
      value: string;
      options: Parameters<typeof cookieStore.set>[2];
    }> = [];

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

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const safeNext =
        next.startsWith("/") && !next.startsWith("//") ? next : "/";

      let destination = `${origin}${safeNext}`;
      if (safeNext === "/") {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const orgSlug = await resolveOrgSlug(supabase, user);
        destination = orgSlug ? `${origin}/${orgSlug}` : `${origin}${safeNext}`;
      }

      const response = NextResponse.redirect(destination);
      for (const cookie of pendingCookies) {
        response.cookies.set(cookie.name, cookie.value, cookie.options);
      }
      return response;
    }
  }

  const failedNext = searchParams.get("next") ?? "";
  const failedDest =
    failedNext.startsWith("/admin") && !failedNext.startsWith("//")
      ? "/admin?error=auth-failed"
      : failedNext.startsWith("/auth/update-password")
        ? "/auth/reset-password"
        : "/login?error=auth-failed";

  return NextResponse.redirect(`${origin}${failedDest}`);
}
