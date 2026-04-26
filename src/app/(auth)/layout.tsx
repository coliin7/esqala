import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Acceder",
  description: "Ingresá o creá tu cuenta en la plataforma de cursos online",
  robots: { index: false, follow: false },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
