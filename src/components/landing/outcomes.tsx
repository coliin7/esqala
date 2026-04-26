export function LandingOutcomes({ outcomes }: { outcomes: string[] }) {
  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-xs font-mono text-primary mb-4">/ LO QUE VAS A APRENDER</div>
        <h2 className="font-display text-4xl md:text-5xl leading-[0.9] tracking-tightest mb-12">
          Al terminar este curso vas a poder:
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {outcomes.map((outcome, idx) => (
            <div key={idx} className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-colors">
              <div className="text-xs font-mono text-primary mb-3">[OUTCOME]</div>
              <p className="text-foreground">{outcome}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
