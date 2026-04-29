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
    redirect("/login?layout_error=no_user")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name")
    .eq("id", user.id)
    .single()

  if (!profile) {
    redirect(`/login?layout_error=no_profile_for_${user.id.substring(0, 8)}`)
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
