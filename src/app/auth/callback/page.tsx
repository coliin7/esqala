"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function handleCallback() {
      const supabase = createClient()

      // Check URL for code (PKCE) or hash tokens (implicit)
      const params = new URLSearchParams(window.location.search)
      const code = params.get("code")

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          setError(`Code exchange error: ${error.message}`)
          return
        }
      }

      // Wait a moment for the client to process hash tokens
      await new Promise((r) => setTimeout(r, 1000))

      // Check if we have a session now
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        // Get role to redirect properly
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single()

        if (profile?.role === "creator") {
          router.push("/creador/cursos")
        } else {
          router.push("/alumno/cursos")
        }
        router.refresh()
      } else {
        setError("No se pudo establecer la sesión. Intentá de nuevo.")
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
