import type { Profile } from "@/types"

export function LandingCreator({ creator }: { creator: Profile }) {
  const initials = creator.display_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-xs font-mono text-primary mb-4">/ INSTRUCTOR</div>
        <div className="grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-3">
            {creator.avatar_url ? (
              <img
                src={creator.avatar_url}
                alt={creator.display_name}
                className="w-32 h-32 rounded-2xl object-cover border border-border"
              />
            ) : (
              <div className="w-32 h-32 rounded-2xl bg-secondary border border-border flex items-center justify-center">
                <span className="font-display text-3xl text-muted-foreground">{initials}</span>
              </div>
            )}
          </div>
          <div className="md:col-span-9">
            <h3 className="font-display text-3xl tracking-tightest mb-2">{creator.display_name}</h3>
            {creator.brand_name && (
              <p className="text-muted-foreground mb-4">{creator.brand_name}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
