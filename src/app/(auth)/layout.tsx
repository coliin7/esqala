import type { Metadata } from "next"
import { Instrument_Sans, Instrument_Serif } from "next/font/google"
import { VideoBackground } from "@/components/auth/video-background"

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
})

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
})

export const metadata: Metadata = {
  title: "Acceder",
  description: "Ingresá o creá tu cuenta en la plataforma de cursos online",
  robots: { index: false, follow: false },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`relative min-h-screen bg-black ${instrumentSans.variable} ${instrumentSerif.variable}`}
    >
      <VideoBackground />
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        {children}
      </div>
    </div>
  )
}
