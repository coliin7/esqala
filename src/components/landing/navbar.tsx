import { Logo } from "@/components/brand/logo"
import { Button } from "@/components/ui/button"

export function LandingNavbar({ ctaText }: { ctaText: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-4">
          <Logo />
          <span className="text-xs font-mono text-muted-foreground hidden md:inline">/ landing del curso</span>
        </div>
        <Button className="rounded-full" render={<a href="#comprar" />}>
          {ctaText}
        </Button>
      </div>
    </header>
  )
}
