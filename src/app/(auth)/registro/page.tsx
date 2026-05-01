"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "motion/react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { GoogleAuthButton } from "@/components/shared/google-auth-button"

export default function RegistroPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState<"student" | "creator">("student")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const displayName = formData.get("displayName") as string
    const phone = (formData.get("phone") as string) || undefined

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          display_name: displayName,
          ...(phone ? { phone } : {}),
        },
      },
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    router.push("/confirmar-email")
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white">Crear cuenta</h1>
        <p className="text-white/50 text-sm mt-1">Empezá hoy, es gratis</p>
      </div>

      {/* Google — primary CTA */}
      <GoogleAuthButton mode="register" />
      <p className="text-xs text-white/30 text-center mt-2">
        Con Google tu rol será Alumno.{" "}
        <span className="text-white/40">
          Para vender cursos registrate con email.
        </span>
      </p>

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

      {/* Role selector */}
      <div className="flex gap-2 mb-5">
        <button
          type="button"
          onClick={() => setRole("student")}
          className={`flex-1 rounded-xl border-2 py-3 text-center text-sm font-medium transition-all ${
            role === "student"
              ? "border-[#3054ff] bg-[#3054ff]/10 text-white"
              : "border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
          }`}
        >
          <div>Aprender</div>
          <div className="text-xs font-normal opacity-60 mt-0.5">Comprar cursos</div>
        </button>
        <button
          type="button"
          onClick={() => setRole("creator")}
          className={`flex-1 rounded-xl border-2 py-3 text-center text-sm font-medium transition-all ${
            role === "creator"
              ? "border-[#3054ff] bg-[#3054ff]/10 text-white"
              : "border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
          }`}
        >
          <div>Enseñar</div>
          <div className="text-xs font-normal opacity-60 mt-0.5">Vender cursos</div>
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          name="displayName"
          type="text"
          placeholder="Tu nombre"
          required
          className="w-full rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-white/20 transition-all"
        />
        <input
          name="email"
          type="email"
          placeholder="tu@email.com"
          required
          className="w-full rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-white/20 transition-all"
        />
        <input
          name="password"
          type="password"
          placeholder="Contraseña (mínimo 6 caracteres)"
          minLength={6}
          required
          className="w-full rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-white/20 transition-all"
        />
        <div className="relative">
          <input
            name="phone"
            type="tel"
            placeholder="Celular (ej: +54 9 11 1234-5678)"
            className="w-full rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-white/20 transition-all"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/25 pointer-events-none">
            opcional
          </span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#3054ff] hover:bg-[#2040e0] disabled:opacity-60 text-white font-semibold rounded-full py-3 text-base transition-all duration-200 hover:shadow-[0_0_20px_rgba(48,84,255,0.4)] mt-2"
        >
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-white/40">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="text-white/70 hover:text-white underline transition-colors">
          Iniciá sesión
        </Link>
      </p>
    </motion.div>
  )
}
