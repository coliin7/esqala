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

  let { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile) {
    // Profile missing — create it (trigger may have failed on OAuth signup)
    const displayName =
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      user.email?.split("@")[0] ??
      "Usuario"

    const { data: created } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        role: "student",
        display_name: displayName,
        email: user.email ?? "",
      })
      .select("role, display_name")
      .maybeSingle()

    profile = created
  }

  if (!profile) {
    redirect("/login?e=no_profile")
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
