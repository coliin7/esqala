"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Loader2, ShieldCheck, X } from "lucide-react"
import { toast } from "sonner"

interface CheckoutProps {
  courseId: string
  courseName: string
  priceArs: number
  installmentsMax: number
  ctaText: string
  slug: string
}

export function Checkout({
  courseId,
  courseName,
  priceArs,
  installmentsMax,
  ctaText,
  slug,
}: CheckoutProps) {
  const router = useRouter()
  const [step, setStep] = useState<"idle" | "loading" | "checkout" | "polling">("idle")
  const [orderId, setOrderId] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
    }
    checkAuth()
  }, [])

  const handleBuy = useCallback(async () => {
    if (!isLoggedIn) {
      router.push(`/login?returnUrl=/c/${slug}`)
      return
    }

    setStep("loading")

    try {
      const res = await fetch("/api/payments/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course_id: courseId }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.error === "Ya estás inscripto") {
          toast.info("Ya tenés acceso a este curso")
          router.push(`/alumno/cursos/${courseId}`)
          return
        }
        toast.error(data.error || "Error al procesar el pago")
        setStep("idle")
        return
      }

      setOrderId(data.order_id)
      setStep("checkout")
      setDialogOpen(true)

      // Load MP Bricks
      const mpPublicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY
      if (!mpPublicKey) {
        toast.error("Mercado Pago no está configurado")
        setStep("idle")
        setDialogOpen(false)
        return
      }

      // Dynamically load MP SDK
      const win = window as unknown as Record<string, unknown>
      if (!win.MercadoPago) {
        const script = document.createElement("script")
        script.src = "https://sdk.mercadopago.com/js/v2"
        script.async = true
        await new Promise<void>((resolve, reject) => {
          script.onload = () => resolve()
          script.onerror = reject
          document.head.appendChild(script)
        })
      }

      // Wait for container to be in DOM
      await new Promise((r) => setTimeout(r, 300))

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const MercadoPago = (window as any).MercadoPago
      const mp = new MercadoPago(mpPublicKey)
      const bricksBuilder = mp.bricks()

      await bricksBuilder.create("wallet", "mp-brick-container", {
        initialization: {
          preferenceId: data.preference_id,
          redirectMode: "self",
        },
        callbacks: {
          onReady: () => {},
          onError: (error: unknown) => {
            console.error("Brick error:", error)
          },
        },
      })
    } catch {
      toast.error("Error al conectar con Mercado Pago")
      setStep("idle")
      setDialogOpen(false)
    }
  }, [courseId, isLoggedIn, router, slug])

  // Poll order status
  useEffect(() => {
    if (step !== "polling" || !orderId) return

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}/status`)
        const data = await res.json()

        if (data.status === "approved") {
          clearInterval(interval)
          toast.success("Pago confirmado. Bienvenido al curso.")
          router.push(`/alumno/cursos/${courseId}`)
        } else if (data.status === "rejected") {
          clearInterval(interval)
          toast.error("El pago fue rechazado. Intentá de nuevo.")
          setStep("idle")
        }
      } catch {
        // Keep polling
      }
    }, 3000)

    const timeout = setTimeout(() => {
      clearInterval(interval)
      setStep("idle")
    }, 60000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [step, orderId, courseId, router])

  const installmentPrice = Math.ceil(priceArs / installmentsMax)

  return (
    <div id="checkout">
      <Button
        size="lg"
        className="w-full text-lg py-6"
        disabled={step === "loading"}
        onClick={handleBuy}
      >
        {step === "loading" ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Preparando pago...
          </>
        ) : (
          ctaText
        )}
      </Button>

      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open)
        if (!open) setStep("idle")
      }}>
        <DialogContent className="max-w-lg">
          <div className="flex items-center justify-between mb-4">
            <DialogTitle className="text-lg font-semibold">
              Completar compra
            </DialogTitle>
          </div>
          <p className="text-sm text-muted-foreground mb-1">{courseName}</p>
          <p className="text-sm mb-4">
            <span className="font-bold text-lg">
              ${priceArs.toLocaleString("es-AR")} ARS
            </span>
            <span className="text-muted-foreground ml-2">
              o {installmentsMax}x ${installmentPrice.toLocaleString("es-AR")} sin interés
            </span>
          </p>

          <div id="mp-brick-container" className="min-h-[200px]" />

          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4" />
            Pago seguro con Mercado Pago
          </div>
        </DialogContent>
      </Dialog>

      {step === "polling" && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Confirmando tu pago...
        </div>
      )}
    </div>
  )
}
