import { CheckCircle } from "lucide-react"

export function LandingOutcomes({ outcomes }: { outcomes: string[] }) {
  return (
    <section className="py-16 px-4 bg-muted/50">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-center">
          Lo que vas a aprender
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {outcomes.map((outcome, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
              <span>{outcome}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
