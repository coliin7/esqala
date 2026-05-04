import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkout } from "./checkout"

interface PricingProps {
  priceArs: number
  priceCompareArs: number | null
  priceUsd: number | null
  installmentsMax: number
  ctaText: string
  courseId: string
  courseName: string
  slug: string
}

export function LandingPricing({
  priceArs,
  priceCompareArs,
  priceUsd,
  installmentsMax,
  ctaText,
  courseId,
  courseName,
  slug,
}: PricingProps) {
  const installmentPrice = Math.ceil(priceArs / installmentsMax)

  return (
    <section id="comprar" className="py-20 px-6">
      <div className="max-w-md mx-auto">
        <Card className="border-2 border-primary rounded-3xl lime-glow overflow-hidden">
          <CardContent className="pt-8 pb-8 text-center">
            <Badge className="mb-6 font-mono text-xs">ACCESO DE POR VIDA</Badge>

            {priceCompareArs && (
              <p className="text-muted-foreground line-through text-lg mb-1">
                ${priceCompareArs.toLocaleString("es-AR")}
              </p>
            )}
            <div className="mb-2">
              <span className="font-display text-5xl tabular-nums">
                ${priceArs.toLocaleString("es-AR")}
              </span>
              <span className="text-muted-foreground ml-2 text-sm">ARS</span>
            </div>

            <p className="text-muted-foreground text-sm mb-2">
              o <span className="text-primary font-semibold">{installmentsMax} cuotas sin interés</span> de
            </p>
            <p className="font-display text-2xl mb-2">
              ${installmentPrice.toLocaleString("es-AR")}
            </p>

            {/* Installment bars */}
            <div className="grid grid-cols-6 gap-1.5 my-6 px-4">
              {Array.from({ length: installmentsMax }).map((_, i) => (
                <div key={i} className={`h-2 rounded-full ${i < 3 ? "bg-primary" : "bg-primary/40"}`} />
              ))}
            </div>

            {priceUsd && (
              <p className="text-xs text-muted-foreground mb-6">
                (USD ${priceUsd.toLocaleString("en-US")})
              </p>
            )}

            <div className="mt-4">
              <Checkout
                courseId={courseId}
                courseName={courseName}
                priceArs={priceArs}
                installmentsMax={installmentsMax}
                ctaText={ctaText}
                slug={slug}
              />
            </div>

            <p className="text-xs font-mono text-muted-foreground mt-4">PAGO SEGURO · MERCADO PAGO</p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
