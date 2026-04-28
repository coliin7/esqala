"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        router.push("/")
        router.refresh()
      }
    })

    // Also handle the code exchange if using PKCE flow
    const params = new URLSearchParams(window.location.search)
    const code = params.get("code")

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          router.push("/login?error=auth")
        } else {
          router.push("/")
          router.refresh()
        }
      })
    }

    // If hash has access_token (implicit flow), supabase client handles it automatically
    // via onAuthStateChange above
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
        <p className="text-muted-foreground">Autenticando...</p>
      </div>
    </div>
  )
}
