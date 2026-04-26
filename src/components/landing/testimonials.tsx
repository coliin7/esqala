import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"
import type { Testimonial } from "@/types"

export function LandingTestimonials({
  testimonials,
}: {
  testimonials: Testimonial[]
}) {
  return (
    <section className="py-20 px-6 bg-card/40 border-y border-border/60">
      <div className="max-w-6xl mx-auto">
        <div className="text-xs font-mono text-primary mb-4">/ TESTIMONIOS</div>
        <h2 className="font-display text-4xl md:text-5xl leading-[0.9] tracking-tightest mb-12">
          Lo que dicen los alumnos.
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map((t) => (
            <Card key={t.id} className="bg-background border-border rounded-2xl">
              <CardContent className="pt-6 relative">
                {/* Decorative quote */}
                <div className="absolute top-4 right-6 text-6xl font-display text-primary/20 leading-none">&ldquo;</div>

                <div className="flex mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-primary text-primary"
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4 relative z-10">
                  &ldquo;{t.content}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-xs font-display">
                    {t.author_name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <span className="text-sm font-medium">{t.author_name}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
