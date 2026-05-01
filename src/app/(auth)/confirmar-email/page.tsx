"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ConfirmarEmailPage() {
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
      <p className="text-white/50 text-sm leading-relaxed mb-2">
        Te enviamos un link de confirmación. Hacé clic en él para activar tu cuenta.
      </p>
      <p className="text-white/30 text-xs mb-8">
        Si no lo ves, revisá la carpeta de spam o promociones.
      </p>
      <Button
        className="w-full rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/10"
        render={<Link href="/login" />}
      >
        Volver al login
      </Button>
    </motion.div>
  )
}
