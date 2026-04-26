"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

interface StickyCTAProps {
  priceArs: number
  installmentsMax: number
  ctaText: string
}

export function StickyCTA({ priceArs, installmentsMax, ctaText }: StickyCTAProps) {
  const [visible, setVisible] = useState(false)
  const installmentPrice = Math.ceil(priceArs / installmentsMax)

  useEffect(() => {
    function handleScroll() {
      // Show after scrolling 400px
      setVisible(window.scrollY > 400)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur p-3 md:hidden">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm">
          <span className="font-bold">${priceArs.toLocaleString("es-AR")}</span>
          <span className="text-muted-foreground block text-xs">
            {installmentsMax}x ${installmentPrice.toLocaleString("es-AR")}
          </span>
        </div>
        <Button size="lg" className="px-6" render={<a href="#comprar" />}>
          {ctaText}
        </Button>
      </div>
    </div>
  )
}
