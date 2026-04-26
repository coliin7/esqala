export function LandingAudience({ audience }: { audience: string[] }) {
  return (
    <section className="py-20 px-6 bg-card/40 border-y border-border/60">
      <div className="max-w-6xl mx-auto">
        <div className="text-xs font-mono text-primary mb-4">/ PARA QUIÉN ES</div>
        <h2 className="font-display text-4xl md:text-5xl leading-[0.9] tracking-tightest mb-12">
          Este curso es para vos si...
        </h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {audience.map((item, idx) => (
            <div key={idx} className="flex gap-4 items-start border-t border-border pt-6">
              <span className="font-display text-3xl text-secondary tabular-nums">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <p className="text-foreground text-lg leading-relaxed pt-1">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
