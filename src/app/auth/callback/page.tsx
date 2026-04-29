"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

export default function AuthCallbackPage() {
  const [status, setStatus] = useState("Autenticando...")

  useEffect(() => {
    async function handleCallback() {
      const supabase = createClient()

      // Implicit flow: tokens come as hash fragment #access_token=...
      const hash = window.location.hash
      const params = new URLSearchParams(hash.substring(1))
      const accessToken = params.get("access_token")
      const refreshToken = params.get("refresh_token")

      if (!accessToken || !refreshToken) {
        window.location.href = `/login?oauth_error=${encodeURIComponent(
          `no_tokens_in_hash | hash: ${hash.substring(0, 80)}`
        )}`
        return
      }

      setStatus("Estableciendo sesión...")

      // createBrowserClient stores session in cookies — server can read them
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })

      if (error) {
        window.location.href = `/login?oauth_error=${encodeURIComponent(
          `set_session_failed: ${error.message}`
        )}`
        return
      }

      setStatus("Obteniendo perfil...")

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = "/login?oauth_error=no_user_after_set_session"
        return
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      const dest =
        profile?.role === "creator" ? "/creador/cursos" : "/alumno/cursos"

      setStatus(`Redirigiendo...`)

      // Hard redirect so browser sends fresh cookies to the server
      window.location.href = dest
    }

    handleCallback()
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
        <p className="text-muted-foreground">{status}</p>
      </div>
    </div>
  )
}
