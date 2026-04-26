import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Logo } from "@/components/brand/logo"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { Calculator } from "@/components/home/calculator"

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

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
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6">
          <Logo />
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Cómo funciona</a>
            <a href="#vs" className="hover:text-foreground transition-colors">Comparativa</a>
            <a href="#calc" className="hover:text-foreground transition-colors">Calculadora</a>
            <a href="#precio" className="hover:text-foreground transition-colors">Precio</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden md:inline-flex px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              Ingresar
            </Link>
            <Button className="rounded-full" render={<Link href="/registro" />}>
              Crear cuenta
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden grid-bg">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/20 blur-[140px] pointer-events-none" />
        <div className="absolute top-40 -left-40 w-[500px] h-[500px] rounded-full bg-green-600/30 blur-[140px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-32">
          {/* meta line */}
          <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground mb-10">
            <span className="inline-flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              v1.0 — LIVE EN ARGENTINA
            </span>
            <span className="text-muted-foreground/50">/</span>
            <span>MERCADO PAGO · CUOTAS SIN INTERÉS</span>
          </div>

          {/* BIG headline */}
          <h1 className="font-display text-[12vw] md:text-[8.5rem] leading-[0.85] tracking-tightest font-semibold">
            <span className="block">Vendé tus cursos</span>
            <span className="block">
              y <span className="italic font-normal text-primary">escalá</span> sin
            </span>
            <span className="block">complicarte<span className="text-primary">.</span></span>
          </h1>

          <div className="mt-12 grid md:grid-cols-12 gap-8 items-end">
            <p className="md:col-span-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
              La plataforma para creadores en LATAM que quieren cobrar en pesos, en cuotas, sin pagar fees mensuales ni perder un porcentaje absurdo en cada venta.
            </p>
            <div className="md:col-span-6 flex flex-col sm:flex-row sm:items-center gap-4 md:justify-end">
              <Button size="lg" className="rounded-full text-base px-7 py-6 lime-glow" render={<Link href="/registro" />}>
                Empezar gratis
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full text-base px-7 py-6 border-border hover:border-primary hover:text-primary" render={<a href="#calc" />}>
                Ver cuánto ganarías
              </Button>
            </div>
          </div>
        </div>

        {/* bottom number band */}
        <div className="border-y border-border/60 bg-card/40">
          <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-y-6">
            <div>
              <div className="font-display text-4xl md:text-5xl tabular-nums">12<span className="text-primary">%</span></div>
              <div className="text-xs font-mono text-muted-foreground mt-2">COMISIÓN POR VENTA · SIN FEE FIJO</div>
            </div>
            <div>
              <div className="font-display text-4xl md:text-5xl tabular-nums">6<span className="text-primary">x</span></div>
              <div className="text-xs font-mono text-muted-foreground mt-2">CUOTAS SIN INTERÉS · MERCADO PAGO</div>
            </div>
            <div>
              <div className="font-display text-4xl md:text-5xl">∞</div>
              <div className="text-xs font-mono text-muted-foreground mt-2">CURSOS · ALUMNOS · ANCHO DE BANDA</div>
            </div>
            <div>
              <div className="font-display text-4xl md:text-5xl tabular-nums">48<span className="text-primary">h</span></div>
              <div className="text-xs font-mono text-muted-foreground mt-2">HASTA TENER TU PRIMERA LANDING ARMADA</div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="py-10 border-b border-border/60 overflow-hidden">
        <div className="text-xs font-mono text-muted-foreground text-center mb-6">CREADORES QUE YA ESCALAN CON ESQALA</div>
        <div className="relative">
          <div className="flex animate-marquee gap-16 whitespace-nowrap will-change-transform">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex gap-16 items-center" aria-hidden={i === 1}>
                <span className="font-display text-2xl text-muted-foreground">CoachLab</span>
                <span className="font-display text-2xl text-muted-foreground italic">finanzasclaras</span>
                <span className="font-display text-2xl text-muted-foreground">MAMBO·studio</span>
                <span className="font-display text-2xl text-muted-foreground lowercase">la academia</span>
                <span className="font-display text-2xl text-muted-foreground">Roma Mentoring</span>
                <span className="font-display text-2xl text-muted-foreground">PIXEL/PRO</span>
                <span className="font-display text-2xl text-muted-foreground italic">Café & Ventas</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-12 gap-8 mb-20">
            <div className="md:col-span-4">
              <div className="text-xs font-mono text-primary mb-4">/ 01 — CÓMO FUNCIONA</div>
              <h2 className="font-display text-5xl md:text-6xl leading-[0.9] tracking-tightest">
                De idea a primera venta en una tarde.
              </h2>
            </div>
            <div className="md:col-span-7 md:col-start-6 self-end">
              <p className="text-lg text-muted-foreground leading-relaxed">
                No estás armando un sitio web. Estás armando un negocio. Por eso esquivamos el laburo de developer y te damos lo justo: subir, vender, cobrar.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-border/60 border border-border/60">
            {[
              { num: "01", label: "SUBÍ", title: "Tus videos, tus módulos", desc: "Drag & drop, organización por módulos y lecciones, hosting y reproducción incluidos. Cero infraestructura propia." },
              { num: "02", label: "ARMÁ", title: "Una landing que vende", desc: "Hero, temario, testimonios, pricing y checkout. Mobile-first, optimizada para conversión y SEO. Tu URL pública en minutos." },
              { num: "03", label: "COBRÁ", title: "En pesos, en cuotas", desc: "Mercado Pago integrado nativamente. Tus alumnos pagan hasta en 6 cuotas sin interés. Vos cobrás en tu cuenta, sin intermediarios." },
            ].map((card) => (
              <div key={card.num} className="bg-background p-8 md:p-10 border border-transparent group hover:-translate-y-1 hover:border-primary transition-all duration-400">
                <div className="flex items-start justify-between mb-12">
                  <div className="font-display text-7xl text-secondary group-hover:text-primary transition-colors">{card.num}</div>
                  <div className="text-xs font-mono text-muted-foreground">{card.label}</div>
                </div>
                <h3 className="font-display text-2xl mb-3">{card.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POR QUÉ ESQALA */}
      <section className="py-32 px-6 bg-card/40 border-y border-border/60 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto">
          <div className="mb-20 max-w-3xl">
            <div className="text-xs font-mono text-primary mb-4">/ 02 — POR QUÉ ESQALA</div>
            <h2 className="font-display text-5xl md:text-6xl leading-[0.9] tracking-tightest">
              Pensado para vender en <span className="italic font-normal text-primary">Argentina</span>, no traducido del inglés.
            </h2>
          </div>

          <div className="grid md:grid-cols-12 gap-6">
            {/* big benefit */}
            <div className="md:col-span-7 md:row-span-2 bg-background border border-border rounded-3xl p-10 relative overflow-hidden">
              <div className="text-xs font-mono text-muted-foreground mb-6">FEATURE PRINCIPAL</div>
              <h3 className="font-display text-3xl md:text-4xl leading-tight mb-4 tracking-tightest">Mercado Pago en cuotas, ya configurado.</h3>
              <p className="text-muted-foreground leading-relaxed mb-8 max-w-lg">El 80% de las ventas en Argentina se hacen en cuotas. Pagás 12% solo cuando vendés. Sin Stripe, sin USD, sin formularios infinitos.</p>

              {/* mock checkout */}
              <div className="mt-8 bg-card/80 border border-border rounded-2xl p-5 max-w-md">
                <div className="text-xs font-mono text-muted-foreground mb-3">CHECKOUT · MOCKUP</div>
                <div className="flex items-baseline justify-between mb-4">
                  <span className="font-display text-3xl">$48.000</span>
                  <span className="text-xs text-muted-foreground">ARS</span>
                </div>
                <div className="text-sm text-muted-foreground">o <span className="text-primary font-semibold">6 cuotas sin interés</span> de</div>
                <div className="font-display text-2xl mt-1">$8.000</div>
                <div className="mt-5 grid grid-cols-6 gap-1.5">
                  <div className="h-2 rounded-full bg-primary" />
                  <div className="h-2 rounded-full bg-primary" />
                  <div className="h-2 rounded-full bg-primary" />
                  <div className="h-2 rounded-full bg-primary/40" />
                  <div className="h-2 rounded-full bg-primary/40" />
                  <div className="h-2 rounded-full bg-primary/40" />
                </div>
              </div>
            </div>

            <div className="md:col-span-5 bg-background border border-border rounded-3xl p-8">
              <div className="font-display text-5xl text-primary mb-3 tabular-nums">0%</div>
              <h3 className="font-display text-xl mb-2">Fee fijo mensual</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">No cobramos suscripción. Si no vendés, no pagás. Ideal para creadores que recién arrancan.</p>
            </div>

            <div className="md:col-span-5 bg-background border border-border rounded-3xl p-8">
              <div className="font-display text-5xl text-primary mb-3">∞</div>
              <h3 className="font-display text-xl mb-2">Cursos y alumnos</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Subí los cursos que quieras. Sumá los alumnos que quieras. Sin tiers, sin upsells.</p>
            </div>

            <div className="md:col-span-4 bg-background border border-border rounded-3xl p-8">
              <div className="text-xs font-mono text-muted-foreground mb-3">EMAILS</div>
              <h3 className="font-display text-xl mb-2">Automáticos e incluidos</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Confirmación de compra, acceso al curso, recordatorios. Listo de fábrica.</p>
            </div>

            <div className="md:col-span-4 bg-background border border-border rounded-3xl p-8">
              <div className="text-xs font-mono text-muted-foreground mb-3">PANEL</div>
              <h3 className="font-display text-xl mb-2">Ventas en tiempo real</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Comisiones, ganancias, alumnos activos. Métricas que importan, sin dashboards inútiles.</p>
            </div>

            <div className="md:col-span-4 bg-background border border-border rounded-3xl p-8">
              <div className="text-xs font-mono text-muted-foreground mb-3">PERFORMANCE</div>
              <h3 className="font-display text-xl mb-2">Landing rápida y SEO</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Mobile-first, &lt;1s de carga, schema.org. Indexable y compartible.</p>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARATIVA */}
      <section id="vs" className="py-32 px-6 bg-card/40 border-y border-border/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-mono text-primary mb-4">/ 04 — COMPARATIVA HONESTA</div>
            <h2 className="font-display text-5xl md:text-6xl leading-[0.9] tracking-tightest">
              Esqala vs. lo que ya conocés.
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="text-left">
                  <th className="p-5 text-xs font-mono text-muted-foreground font-normal w-1/3" />
                  <th className="p-5 bg-primary text-primary-foreground rounded-t-2xl">
                    <div className="font-display text-2xl">esqala</div>
                    <div className="text-xs font-mono opacity-70 mt-1">PARA LATAM</div>
                  </th>
                  <th className="p-5 text-muted-foreground border-t border-x border-border">
                    <div className="font-display text-2xl">Plataforma A</div>
                    <div className="text-xs font-mono text-muted-foreground mt-1">INFOPRODUCTOS GLOBAL</div>
                  </th>
                  <th className="p-5 text-muted-foreground border-t border-x border-border">
                    <div className="font-display text-2xl">Tienda online</div>
                    <div className="text-xs font-mono text-muted-foreground mt-1">E-COMMERCE</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["COMISIÓN POR VENTA", "12%", "~20% + IVA + retenciones", "Fee + transacción"],
                  ["FEE FIJO MENSUAL", "$0", "Variable", "Desde USD 39/mes"],
                  ["CUOTAS SIN INTERÉS", "✓ Hasta 6x nativo", "Limitado", "Configuración manual"],
                  ["LANDING DE VENTA", "✓ Incluida + SEO", "Limitada", "Armarte tu propia"],
                  ["HOSTING DE VIDEOS", "✓ Incluido (Bunny)", "Incluido", "Externo"],
                  ["COBRO EN PESOS ARG", "✓ Nativo", "Con restricciones", "✓"],
                  ["SETUP", "Una tarde", "1–2 semanas", "2–4 semanas"],
                ].map(([label, esqala, a, b], i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="p-5 text-muted-foreground font-mono text-xs">{label}</td>
                    <td className="p-5 bg-primary/10 font-display text-lg">{esqala}</td>
                    <td className="p-5 text-muted-foreground">{a}</td>
                    <td className="p-5 text-muted-foreground">{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CALCULADORA */}
      <section id="calc" className="py-32 px-6 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-xs font-mono opacity-70 mb-4">/ 05 — CALCULADORA</div>
            <h2 className="font-display text-5xl md:text-6xl leading-[0.9] tracking-tightest">
              Cuánto ganarías con esqala.
            </h2>
          </div>
          <Calculator />
        </div>
      </section>

      {/* PRICING */}
      <section id="precio" className="py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-mono text-primary mb-4">/ 06 — PRECIO</div>
            <h2 className="font-display text-5xl md:text-6xl leading-[0.9] tracking-tightest">
              Un solo plan. Sin letra chica.
            </h2>
          </div>

          <div className="border-2 border-primary rounded-3xl p-10 md:p-14 lime-glow">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <div className="font-display text-8xl md:text-9xl tabular-nums">12<span className="text-primary">%</span></div>
                <p className="text-muted-foreground mt-2">por venta realizada. Nada más.</p>
              </div>
              <div className="space-y-3">
                {[
                  "Cursos ilimitados",
                  "Alumnos ilimitados",
                  "Landing de venta con SEO",
                  "Mercado Pago con cuotas",
                  "Panel de ventas en tiempo real",
                  "Hosting de videos incluido",
                  "Emails automáticos",
                  "Sin fee mensual",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm">
                    <span className="text-primary font-mono text-xs">[+]</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-10 text-center">
              <Button size="lg" className="rounded-full text-lg px-10 py-6" render={<Link href="/registro" />}>
                Crear mi cuenta gratis
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-32 px-6 border-t border-border/60">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="font-display text-5xl md:text-7xl leading-[0.9] tracking-tightest">
            Tu primera venta está a una <span className="italic font-normal text-primary">tarde</span> de distancia.
          </h2>
          <div className="mt-10">
            <Button size="lg" className="rounded-full text-lg px-10 py-6 lime-glow" render={<Link href="/registro" />}>
              Empezar gratis
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 border-t border-border/60">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo />
          <p className="text-xs font-mono text-muted-foreground">
            &copy; {new Date().getFullYear()} ESQALA · BUENOS AIRES, ARGENTINA
          </p>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <Link href="/login" className="hover:text-foreground transition-colors">Ingresar</Link>
            <Link href="/registro" className="hover:text-foreground transition-colors">Crear cuenta</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
