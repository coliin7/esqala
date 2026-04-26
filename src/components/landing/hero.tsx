import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface HeroProps {
  headline: string
  subheadline: string
  heroVideoUrl: string | null
  ctaText: string
  priceArs: number
  installmentsMax: number
  courseId: string
  slug: string
}

export function LandingHero({
  headline,
  subheadline,
  heroVideoUrl,
  ctaText,
  priceArs,
  installmentsMax,
}: HeroProps) {
  const installmentPrice = Math.ceil(priceArs / installmentsMax)

  return (
    <section className="relative py-16 md:py-24 px-4 overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

      <div className="relative max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <Badge variant="secondary" className="text-xs">
              Curso online
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-[1.1]">
              {headline}
            </h1>
            {subheadline && (
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                {subheadline}
              </p>
            )}
            <div className="pt-2 space-y-3">
              <Button size="lg" className="w-full md:w-auto text-lg px-8 py-6 shadow-lg shadow-primary/20" render={<a href="#comprar" />}>
                {ctaText}
              </Button>
              <p className="text-sm text-muted-foreground">
                {installmentsMax} cuotas sin interés de{" "}
                <span className="font-semibold text-foreground">
                  ${installmentPrice.toLocaleString("es-AR")}
                </span>
              </p>
            </div>
          </div>

          {heroVideoUrl && (
            <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl ring-1 ring-border/50">
              <iframe
                src={heroVideoUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
                title="Video de presentación"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
