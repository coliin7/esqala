import { UserCheck } from "lucide-react"

export function LandingAudience({ audience }: { audience: string[] }) {
  return (
    <section className="py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-center">
          Este curso es para vos si...
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {audience.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <UserCheck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
