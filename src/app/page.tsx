import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { GraduationCap, Zap, CreditCard, BarChart3, ArrowRight } from "lucide-react"

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If logged in, redirect to dashboard
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role === "creator") redirect("/creador/cursos")
    redirect("/alumno/cursos")
  }

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-14 px-4">
          <Link href="/" className="text-lg font-bold">
            Cursos App
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" render={<Link href="/login" />}>
              Ingresar
            </Button>
            <Button render={<Link href="/registro" />}>
              Crear cuenta
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 md:py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
            Vendé tus cursos online con pagos locales resueltos
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Creá tu curso, armá tu landing de venta, y cobrá con Mercado Pago
            en cuotas sin interés. Sin complicaciones, sin fees ocultos.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="text-lg px-8 py-6" render={<Link href="/registro" />}>
              Empezar gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6" render={<Link href="#como-funciona" />}>
              ¿Cómo funciona?
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Solo 12% de comisión por venta. Sin fee fijo mensual.
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="como-funciona" className="py-20 px-4 bg-muted/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Todo lo que necesitás para vender cursos en Argentina
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<GraduationCap className="h-8 w-8" />}
              title="Subí tu curso"
              description="Videos, materiales, módulos organizados. Todo en un solo lugar."
            />
            <FeatureCard
              icon={<Zap className="h-8 w-8" />}
              title="Landing que vende"
              description="Landing optimizada para conversión. Mobile-first, carga rápida, SEO."
            />
            <FeatureCard
              icon={<CreditCard className="h-8 w-8" />}
              title="Cobro con cuotas"
              description="Mercado Pago integrado. Tus alumnos pagan en hasta 6 cuotas sin interés."
            />
            <FeatureCard
              icon={<BarChart3 className="h-8 w-8" />}
              title="Panel de ventas"
              description="Seguí tus ventas, comisiones y ganancias en tiempo real."
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Precio simple</h2>
          <p className="text-muted-foreground mb-8">
            Sin planes, sin fees mensuales. Solo pagás cuando vendés.
          </p>
          <div className="border-2 border-primary rounded-2xl p-8">
            <div className="text-5xl font-bold">12%</div>
            <p className="text-muted-foreground mt-2">por venta realizada</p>
            <ul className="mt-6 text-left space-y-2 max-w-sm mx-auto">
              {[
                "Cursos ilimitados",
                "Alumnos ilimitados",
                "Landing de venta incluida",
                "Mercado Pago con cuotas",
                "Panel de ventas",
                "Hosting de videos incluido",
                "Emails automáticos",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm">
                  <span className="text-green-500">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Button size="lg" className="mt-8 w-full text-lg py-6" render={<Link href="/registro" />}>
              Crear mi cuenta gratis
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Cursos App. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
        {icon}
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
