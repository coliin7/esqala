import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface HeroProps {
  headline: string
  subheadline: string
  heroVideoUrl: string | null
  ctaText: string
  priceArs: number
  priceCompareArs: number | null
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
  priceCompareArs,
  installmentsMax,
}: HeroProps) {
  const installmentPrice = Math.ceil(priceArs / installmentsMax)

  return (
    <section className="relative px-6 pt-16 pb-24 overflow-hidden grid-bg">
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/15 blur-[140px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto grid md:grid-cols-12 gap-10 items-center">
        <div className="md:col-span-6 space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            CURSO ONLINE
          </div>

          <h1 className="font-display text-5xl md:text-7xl leading-[0.9] tracking-tightest">
            {headline}
          </h1>

          {subheadline && (
            <p className="text-lg text-muted-foreground leading-relaxed">
              {subheadline}
            </p>
          )}

          <div className="pt-2 flex flex-col sm:flex-row gap-4 sm:items-center">
            <Button size="lg" className="rounded-full text-base px-7 py-6 lime-glow" render={<a href="#comprar" />}>
              {ctaText}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <div className="text-sm text-muted-foreground">
              {priceCompareArs && (
                <span className="block line-through text-muted-foreground/60">
                  ${priceCompareArs.toLocaleString("es-AR")}
                </span>
              )}
              <span className="font-display text-foreground text-2xl">
                ${priceArs.toLocaleString("es-AR")}
              </span>
              <span className="block mt-0.5">o {installmentsMax} cuotas de ${installmentPrice.toLocaleString("es-AR")}</span>
            </div>
          </div>
        </div>

        {/* Video */}
        <div className="md:col-span-6">
          {heroVideoUrl ? (
            <div className="aspect-video rounded-3xl overflow-hidden border border-border bg-card">
              <iframe
                src={heroVideoUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
                title="Video de presentación"
              />
            </div>
          ) : (
            <div className="aspect-video rounded-3xl overflow-hidden border border-border bg-card placeholder-stripes relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-2xl">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-primary-foreground">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trust band */}
      <div className="relative max-w-6xl mx-auto mt-16 border-t border-border/60 pt-6">
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-primary font-mono">[✓]</span> Acceso de por vida
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-primary font-mono">[✓]</span> {installmentsMax} cuotas sin interés
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-primary font-mono">[✓]</span> Garantía 7 días
          </div>
        </div>
      </div>
    </section>
  )
}
