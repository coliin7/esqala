"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl font-bold mb-4">Algo salió mal</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        Ocurrió un error inesperado. Intentá de nuevo o volvé al inicio.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset}>Intentar de nuevo</Button>
        <Button variant="outline" onClick={() => window.location.href = "/"}>
          Ir al inicio
        </Button>
      </div>
    </div>
  )
}
