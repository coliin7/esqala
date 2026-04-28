"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { GoogleAuthButton } from "@/components/shared/google-auth-button"

function LoginForm() {
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get("returnUrl")
  const [loading, setLoading] = useState(false)
  const [checkingOAuth, setCheckingOAuth] = useState(true)

  useEffect(() => {
    async function checkOAuthReturn() {
      const hash = window.location.hash
      if (!hash || !hash.includes("access_token")) {
        setCheckingOAuth(false)
        return
      }

      const params = new URLSearchParams(hash.substring(1))
      const accessToken = params.get("access_token")
      const refreshToken = params.get("refresh_token")

      if (!accessToken || !refreshToken) {
        setCheckingOAuth(false)
        window.history.replaceState(null, "", window.location.pathname)
        return
      }

      const supabase = createClient()
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })

      if (error) {
        toast.error("Error al autenticar: " + error.message)
        setCheckingOAuth(false)
        window.history.replaceState(null, "", window.location.pathname)
        return
      }

      // Clean hash first
      window.history.replaceState(null, "", window.location.pathname)

      // Hard redirect — this forces a full page reload so the proxy
      // picks up the new cookies
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()

        const dest = returnUrl
          || (profile?.role === "creator" ? "/creador/cursos" : "/alumno/cursos")

        window.location.href = dest
        return
      }

      setCheckingOAuth(false)
    }

    checkOAuthReturn()
  }, [returnUrl])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      const dest = returnUrl
        || (profile?.role === "creator" ? "/creador/cursos" : "/alumno/cursos")

      window.location.href = dest
    }
  }

  if (checkingOAuth) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Autenticando con Google...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Iniciar sesión</CardTitle>
        <CardDescription>
          Ingresá tu email y contraseña para acceder
        </CardDescription>
      </CardHeader>
      <CardContent>
        <GoogleAuthButton mode="login" />
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">o con email</span>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="tu@email.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" name="password" type="password" placeholder="••••••••" required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </Button>
          <div className="text-right">
            <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-primary">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          ¿No tenés cuenta?{" "}
          <Link href="/registro" className="text-primary underline">
            Registrate
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  )
}
