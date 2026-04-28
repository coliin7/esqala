"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function handleCallback() {
      // Use raw supabase-js to parse the hash tokens (implicit flow)
      const rawClient = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            flowType: "implicit",
            persistSession: true,
            autoRefreshToken: true,
          },
        }
      )

      // The raw client auto-detects hash fragments and sets the session
      const { data: { session }, error: sessionError } = await rawClient.auth.getSession()

      if (sessionError) {
        setError(sessionError.message)
        return
      }

      if (!session) {
        // Try parsing hash manually as fallback
        const hash = window.location.hash
        if (hash) {
          const params = new URLSearchParams(hash.substring(1))
          const accessToken = params.get("access_token")
          const refreshToken = params.get("refresh_token")

          if (accessToken && refreshToken) {
            const { error: setErr } = await rawClient.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            })
            if (setErr) {
              setError(setErr.message)
              return
            }
          } else {
            setError("No se encontraron tokens de autenticación.")
            return
          }
        } else {
          setError("No se recibió respuesta de Google.")
          return
        }
      }

      // Session is set in localStorage by raw client.
      // Now use the SSR client to also set it in cookies for server-side access.
      const ssrClient = createClient()
      const { data: { session: currentSession } } = await rawClient.auth.getSession()

      if (currentSession) {
        await ssrClient.auth.setSession({
          access_token: currentSession.access_token,
          refresh_token: currentSession.refresh_token,
        })

        // Get role
        const { data: profile } = await ssrClient
          .from("profiles")
          .select("role")
          .eq("id", currentSession.user.id)
          .single()

        if (profile?.role === "creator") {
          router.push("/creador/cursos")
        } else {
          router.push("/alumno/cursos")
        }
        router.refresh()
      } else {
        setError("Sesión no encontrada después de autenticar.")
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
        <p className="text-muted-foreground">Autenticando...</p>
        {error && (
          <div className="mt-4 max-w-md">
            <p className="text-destructive text-sm">{error}</p>
            <a href="/login" className="text-primary underline text-sm mt-2 block">
              Volver al login
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
