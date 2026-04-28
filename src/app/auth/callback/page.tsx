"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

export default function AuthCallbackPage() {
  const [status, setStatus] = useState("Procesando...")

  useEffect(() => {
    async function handleCallback() {
      const supabase = createClient()

      const params = new URLSearchParams(window.location.search)
      const code = params.get("code")
      const hash = window.location.hash

      // Step 1: check what Supabase actually sent us
      if (!code) {
        const hasHashTokens = hash.includes("access_token")
        window.location.href = `/login?oauth_error=${encodeURIComponent(
          `no_code_in_url | hash_tokens:${hasHashTokens} | search:${window.location.search} | hash:${hash.substring(0, 60)}`
        )}`
        return
      }

      // Step 2: exchange the code
      setStatus("Intercambiando código con Supabase...")
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        window.location.href = `/login?oauth_error=${encodeURIComponent(
          `exchange_failed: ${exchangeError.message}`
        )}`
        return
      }

      // Step 3: verify user
      setStatus("Verificando sesión...")
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = `/login?oauth_error=${encodeURIComponent(
          `no_user_after_exchange: ${userError?.message ?? "unknown"}`
        )}`
        return
      }

      // Step 4: get profile and redirect
      setStatus("Obteniendo perfil...")
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      const dest =
        profile?.role === "creator" ? "/creador/cursos" : "/alumno/cursos"

      setStatus(`Redirigiendo a ${dest}...`)
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
