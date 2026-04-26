import { Logo } from "@/components/brand/logo"

export function LandingFooter() {
  return (
    <footer className="py-10 px-6 border-t border-border/60">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
          POWERED BY
          <Logo className="scale-75 origin-left" />
        </div>
        <p className="text-xs font-mono text-muted-foreground">
          &copy; {new Date().getFullYear()} ESQALA
        </p>
      </div>
    </footer>
  )
}
