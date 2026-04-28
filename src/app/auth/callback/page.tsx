"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

export default function AuthCallbackPage() {
  useEffect(() => {
    async function handleCallback() {
      const supabase = createClient()

      // Extract code from URL query params (PKCE flow)
      const params = new URLSearchParams(window.location.search)
      const code = params.get("code")

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          window.location.href = `/login?oauth_error=${encodeURIComponent(error.message)}`
          return
        }
      } else {
        // No code means something went wrong
        window.location.href = "/login?oauth_error=no_code_received"
        return
      }

      // Session is now stored in cookies by the browser client.
      // Get the user and redirect to the right dashboard.
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = "/login?oauth_error=no_user_after_exchange"
        return
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      const dest =
        profile?.role === "creator" ? "/creador/cursos" : "/alumno/cursos"

      // Hard redirect so the browser sends the fresh cookies to the server
      window.location.href = dest
    }

    handleCallback()
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
        <p className="text-muted-foreground">Autenticando con Google...</p>
      </div>
    </div>
  )
}
