import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkout } from "./checkout"

interface PricingProps {
  priceArs: number
  priceUsd: number | null
  installmentsMax: number
  ctaText: string
  courseId: string
  courseName: string
  slug: string
}

export function LandingPricing({
  priceArs,
  priceUsd,
  installmentsMax,
  ctaText,
  courseId,
  courseName,
  slug,
}: PricingProps) {
  const installmentPrice = Math.ceil(priceArs / installmentsMax)

  return (
    <section id="comprar" className="py-16 px-4">
      <div className="max-w-md mx-auto">
        <Card className="border-2 border-primary">
          <CardContent className="pt-8 pb-8 text-center">
            <Badge className="mb-4">Acceso de por vida</Badge>

            <div className="mb-2">
              <span className="text-4xl font-bold">
                ${priceArs.toLocaleString("es-AR")}
              </span>
              <span className="text-muted-foreground ml-1">ARS</span>
            </div>

            <p className="text-muted-foreground mb-1">
              o {installmentsMax} cuotas sin interés de{" "}
              <span className="font-semibold text-foreground">
                ${installmentPrice.toLocaleString("es-AR")}
              </span>
            </p>

            {priceUsd && (
              <p className="text-sm text-muted-foreground mb-6">
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
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
