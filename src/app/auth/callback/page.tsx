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

      // The hash fragment contains the tokens from implicit flow
      // Supabase client auto-detects and processes them
      // We just need to wait and check for the session

      let attempts = 0
      const maxAttempts = 10

      const check = async () => {
        const { data: { session } } = await supabase.auth.getSession()

        if (session) {
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
          return
        }

        attempts++
        if (attempts < maxAttempts) {
          setTimeout(check, 500)
        } else {
          setError("No se pudo establecer la sesión. Intentá de nuevo.")
        }
      }

      // Give the client a moment to process the hash
      setTimeout(check, 500)
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
