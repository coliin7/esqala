import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CourseNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-bold mb-4">Curso no encontrado</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        Este curso no existe o no está disponible en este momento.
      </p>
      <Button render={<Link href="/" />}>
        Volver al inicio
      </Button>
    </div>
  )
}
