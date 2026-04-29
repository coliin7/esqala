import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SidebarNav } from "@/components/shared/sidebar-nav"
import { Navbar } from "@/components/shared/navbar"
import type { UserRole } from "@/types"

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?e=no_user")
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, display_name")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile) {
    const em = profileError?.message ?? "null_no_error"
    const uid = user.id.substring(0, 8)
    redirect(`/login?e=no_profile&em=${encodeURIComponent(em)}&uid=${uid}`)
  }

  const role = profile.role as UserRole

  return (
    <div className="flex h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r bg-background">
        <SidebarNav role={role} />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar displayName={profile.display_name} role={role} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
