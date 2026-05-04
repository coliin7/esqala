"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { CheckCircle2, AlertCircle } from "lucide-react"
import { PLATFORM_FEE_RATE } from "@/lib/constants"

type Profile = {
  mp_connected: boolean
  mp_user_id: string | null
}

function ConfiguracionContent() {
  const searchParams = useSearchParams()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [disconnecting, setDisconnecting] = useState(false)

  useEffect(() => {
    const mpResult = searchParams.get("mp")
    const mpError = searchParams.get("mp_error")
    if (mpResult === "connected") toast.success("MercadoPago vinculado correctamente")
    if (mpError === "token_exchange") toast.error("Error al conectar con MercadoPago")
    if (mpError === "no_code") toast.error("Autorización cancelada")
    if (mpError === "db_error") toast.error("Error al guardar la vinculación")
    if (mpError === "not_configured") toast.error("MercadoPago no está configurado en la plataforma")
  }, [searchParams])

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from("profiles")
        .select("mp_connected, mp_user_id")
        .eq("id", user.id)
        .single()
      setProfile(data as Profile | null)
      setLoading(false)
    }
    load()
  }, [])

  async function handleDisconnect() {
    setDisconnecting(true)
    const res = await fetch("/api/mp/disconnect", { method: "POST" })
    if (res.ok) {
      setProfile((p) => (p ? { ...p, mp_connected: false, mp_user_id: null } : p))
      toast.success("MercadoPago desvinculado")
    } else {
      toast.error("Error al desvincular")
    }
    setDisconnecting(false)
  }

  if (loading) return <div className="text-muted-foreground">Cargando...</div>

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Configuración</h1>

      <Card>
        <CardHeader>
          <CardTitle>MercadoPago</CardTitle>
          <CardDescription>
            Vinculá tu cuenta de MercadoPago para recibir los pagos de tus cursos directamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {profile?.mp_connected ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Cuenta vinculada</p>
                    {profile.mp_user_id && (
                      <p className="text-xs text-muted-foreground font-mono">
                        ID: {profile.mp_user_id}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0" />
                  <p className="text-sm text-muted-foreground">Sin cuenta vinculada</p>
                </>
              )}
            </div>

            {profile?.mp_connected ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                disabled={disconnecting}
              >
                {disconnecting ? "Desvinculando..." : "Desvincular"}
              </Button>
            ) : (
              <Button size="sm" asChild>
                <a href="/api/mp/connect">Vincular cuenta</a>
              </Button>
            )}
          </div>

          {!profile?.mp_connected && (
            <p className="text-xs text-muted-foreground border-t pt-3">
              Al vincular tu cuenta, los pagos se depositan directamente en tu MercadoPago.
              La plataforma retiene una comisión del{" "}
              <span className="font-medium">
                {(PLATFORM_FEE_RATE * 100).toFixed(0)}%
              </span>{" "}
              por cada venta.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function ConfiguracionPage() {
  return (
    <Suspense fallback={<div className="text-muted-foreground">Cargando...</div>}>
      <ConfiguracionContent />
    </Suspense>
  )
}
