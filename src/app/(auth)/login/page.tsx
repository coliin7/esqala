"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "motion/react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { GoogleAuthButton } from "@/components/shared/google-auth-button"

function LoginForm() {
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get("returnUrl")
  const oauthError =
    searchParams.get("oauth_error") ??
    searchParams.get("layout_error") ??
    searchParams.get("error")
  const [loading, setLoading] = useState(false)

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

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      const dest =
        returnUrl || (profile?.role === "creator" ? "/creador/cursos" : "/alumno/cursos")
      window.location.href = dest
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
    >
      {/* Logo / brand */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white">Bienvenido</h1>
        <p className="text-white/50 text-sm mt-1">Ingresá a tu cuenta</p>
      </div>

      {oauthError && (
        <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
          Error: {oauthError}
        </div>
      )}

      {/* Google — primary CTA */}
      <GoogleAuthButton mode="login" />

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-black/50 backdrop-blur-sm px-3 text-white/30">
            o con email
          </span>
        </div>
      </div>

      {/* Email/password form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm text-white/70" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="tu@email.com"
            required
            className="w-full rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-white/20 transition-all"
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm text-white/70" htmlFor="password">
              Contraseña
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            className="w-full rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-white/20 transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#3054ff] hover:bg-[#2040e0] disabled:opacity-60 text-white font-semibold rounded-full py-3 text-base transition-all duration-200 hover:shadow-[0_0_20px_rgba(48,84,255,0.4)]"
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-white/40">
        ¿No tenés cuenta?{" "}
        <Link href="/registro" className="text-white/70 hover:text-white underline transition-colors">
          Registrate
        </Link>
      </p>
    </motion.div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
