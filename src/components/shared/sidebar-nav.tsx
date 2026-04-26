"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpen,
  DollarSign,
  GraduationCap,
  LogOut,
  User,
} from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { UserRole } from "@/types"

const creatorLinks = [
  { href: "/creador/cursos", label: "Mis cursos", icon: BookOpen },
  { href: "/creador/ventas", label: "Ventas", icon: DollarSign },
  { href: "/perfil", label: "Mi perfil", icon: User },
]

const studentLinks = [
  { href: "/alumno/cursos", label: "Mis cursos", icon: GraduationCap },
  { href: "/perfil", label: "Mi perfil", icon: User },
]

export function SidebarNav({ role }: { role: UserRole }) {
  const pathname = usePathname()
  const router = useRouter()
  const links = role === "creator" ? creatorLinks : studentLinks

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <nav className="flex flex-col h-full">
      <div className="p-4 border-b">
        <Link href="/" className="text-lg font-bold">
          Cursos App
        </Link>
      </div>
      <div className="flex-1 p-3 space-y-1">
        {links.map((link) => {
          const isActive = pathname.startsWith(link.href)
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          )
        })}
      </div>
      <div className="p-3 border-t space-y-1">
        <div className="flex items-center justify-between px-3 py-1">
          <span className="text-xs text-muted-foreground">Tema</span>
          <ThemeToggle />
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </nav>
  )
}
