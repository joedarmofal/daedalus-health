import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{
    orgSlug: string
  }>
}

export default async function TenantDashboardPage({ params }: PageProps) {
  // Await route parameters in Next.js 15
  const { orgSlug } = await params
  const cookieStore = await cookies()

  // Initialize Supabase Server Client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Handled in middleware/server components
          }
        },
      },
    }
  )

  // 1. Verify Authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 2. Fetch Organization & Verify Access via Membership
  const { data: org, error } = await supabase
    .from('organizations')
    .select('id, name, slug, organization_members!inner(role, user_id)')
    .eq('slug', orgSlug)
    .eq('organization_members.user_id', user.id)
    .single()

  // If organization doesn't exist or user isn't a member, block access
  if (error || !org) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl p-8 text-center space-y-4 shadow-2xl">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 text-red-400 mb-2">
            ✕
          </div>
          <h1 className="text-xl font-bold text-slate-100">Access Denied</h1>
          <p className="text-sm text-slate-400">
            You do not have permission to view <span className="font-mono text-amber-200">{orgSlug}</span> or this organization does not exist.
          </p>
        </div>
      </div>
    )
  }

  const memberRole = org.organization_members[0]?.role

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold">
              ❖
            </div>
            <span className="font-semibold text-slate-200">Daedalus Health</span>
            <span className="text-slate-600">/</span>
            <span className="font-mono text-amber-200 text-sm bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {org.slug}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-xs text-right">
              <div className="text-slate-300 font-medium">{user.email}</div>
              <div className="text-teal-400 uppercase tracking-wider text-[10px] font-bold">
                {memberRole}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* Welcome Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <span className="text-xs font-semibold tracking-wider uppercase text-teal-400">
              Ethical Governance Dashboard
            </span>
            <h1 className="text-3xl font-bold text-slate-100">{org.name}</h1>
            <p className="text-slate-400 max-w-2xl text-sm">
              Welcome to your tenant workspace. Here you can manage clinical AI models, review oversight protocols, and monitor governance telemetry.
            </p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-2">
            <div className="text-xs font-medium text-slate-400">Active AI Models</div>
            <div className="text-2xl font-bold text-slate-100">0</div>
            <div className="text-xs text-teal-400">All systems operational</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-2">
            <div className="text-xs font-medium text-slate-400">Governance Status</div>
            <div className="text-2xl font-bold text-teal-400">Compliant</div>
            <div className="text-xs text-slate-500">Ethics board active</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-2">
            <div className="text-xs font-medium text-slate-400">Assigned Role</div>
            <div className="text-2xl font-bold text-amber-200 capitalize">{memberRole}</div>
            <div className="text-xs text-slate-500">Full administrative rights</div>
          </div>
        </div>
      </main>
    </div>
  )
}
