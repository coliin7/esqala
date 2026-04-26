"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { SidebarNav } from "./sidebar-nav"
import { ThemeToggle } from "./theme-toggle"
import type { UserRole } from "@/types"

export function Navbar({
  displayName,
  role,
}: {
  displayName: string
  role: UserRole
}) {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
      <div className="flex h-14 items-center gap-4 px-4">
        <Sheet>
          <SheetTrigger render={<Button variant="ghost" size="icon" className="lg:hidden" />}>
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
            <SidebarNav role={role} />
          </SheetContent>
        </Sheet>
        <div className="flex-1" />
        <ThemeToggle />
        <span className="text-sm text-muted-foreground">{displayName}</span>
      </div>
    </header>
  )
}
