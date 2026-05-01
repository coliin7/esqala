"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Mail } from "lucide-react"

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center"
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/5 border border-white/10">
          <Mail className="h-8 w-8 text-white/60" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Revisá tu email</h1>
        <p className="text-white/50 text-sm leading-relaxed mb-8">
          Te enviamos un link para restablecer tu contraseña. Revisá tu bandeja de entrada y spam.
        </p>
        <Link
          href="/login"
          className="block w-full text-center bg-white/10 hover:bg-white/15 text-white border border-white/10 rounded-full py-3 text-sm font-medium transition-colors"
        >
          Volver al login
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
    >
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white">Recuperar contraseña</h1>
        <p className="text-white/50 text-sm mt-1">
          Ingresá tu email y te enviamos un link
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="email"
          type="email"
          placeholder="tu@email.com"
          required
          className="w-full rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-white/20 transition-all"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#3054ff] hover:bg-[#2040e0] disabled:opacity-60 text-white font-semibold rounded-full py-3 text-base transition-all duration-200 hover:shadow-[0_0_20px_rgba(48,84,255,0.4)]"
        >
          {loading ? "Enviando..." : "Enviar link de recuperación"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-white/40">
        <Link href="/login" className="text-white/70 hover:text-white underline transition-colors">
          Volver al login
        </Link>
      </p>
    </motion.div>
  )
}
