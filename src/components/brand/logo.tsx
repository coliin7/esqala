import Link from "next/link"
import { cn } from "@/lib/utils"

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-1.5 group", className)}>
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
        <rect x="2" y="14" width="3.5" height="6" rx="1" fill="currentColor"
              className="text-primary transition-transform group-hover:-translate-y-0.5" />
        <rect x="7.5" y="9" width="3.5" height="11" rx="1" fill="currentColor"
              className="text-primary transition-transform delay-75 group-hover:-translate-y-0.5" />
        <rect x="13" y="4" width="3.5" height="16" rx="1" fill="currentColor"
              className="text-primary transition-transform delay-150 group-hover:-translate-y-0.5" />
        <circle cx="18.5" cy="3.5" r="2" fill="currentColor" className="text-primary" />
      </svg>
      <span className="font-display text-[1.35rem] tracking-tightest font-semibold lowercase">
        esqala
      </span>
    </Link>
  )
}
