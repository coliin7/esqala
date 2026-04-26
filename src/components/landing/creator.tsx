import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Profile } from "@/types"

export function LandingCreator({ creator }: { creator: Profile }) {
  const initials = creator.display_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <section className="py-16 px-4 bg-muted/50">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-6">Sobre el instructor</h2>
        <Avatar className="h-20 w-20 mx-auto mb-4">
          <AvatarImage src={creator.avatar_url || undefined} />
          <AvatarFallback className="text-xl">{initials}</AvatarFallback>
        </Avatar>
        <h3 className="text-xl font-semibold">{creator.display_name}</h3>
        {creator.brand_name && (
          <p className="text-muted-foreground mt-1">{creator.brand_name}</p>
        )}
      </div>
    </section>
  )
}
