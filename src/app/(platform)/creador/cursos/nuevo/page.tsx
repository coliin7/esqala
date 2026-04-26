"use client"

import { useActionState } from "react"
import { createCourse } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function NuevoCursoPage() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const result = await createCourse(formData)
      return result
    },
    null
  )

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Crear nuevo curso</CardTitle>
          <CardDescription>
            Completá la información básica. Después podés agregar módulos,
            lecciones y personalizar la landing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título del curso</Label>
              <Input
                id="title"
                name="title"
                placeholder="Ej: Dominá Excel en 30 días"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="¿De qué se trata tu curso?"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price_ars">Precio en ARS</Label>
                <Input
                  id="price_ars"
                  name="price_ars"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="49999.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price_usd">Precio en USD (opcional)</Label>
                <Input
                  id="price_usd"
                  name="price_usd"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="49.00"
                />
              </div>
            </div>

            {state?.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Creando..." : "Crear curso"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
