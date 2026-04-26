"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { updateCourse, publishCourse, unpublishCourse, deleteCourse, updateSlug } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { ExternalLink, Trash2 } from "lucide-react"
import type { Course } from "@/types"

export default function EditCoursePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [slugValue, setSlugValue] = useState("")
  const [savingSlug, setSavingSlug] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .single()
      const c = data as Course | null
      setCourse(c)
      if (c) setSlugValue(c.slug)
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return <div className="text-muted-foreground">Cargando...</div>
  if (!course) return <div className="text-destructive">Curso no encontrado</div>

  async function handleSave(formData: FormData) {
    setSaving(true)
    const result = await updateCourse(id, formData)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Curso guardado")
    }
    setSaving(false)
  }

  async function handlePublish() {
    const result = course!.status === "published"
      ? await unpublishCourse(id)
      : await publishCourse(id)

    if (result?.error) {
      toast.error(result.error)
    } else {
      setCourse({ ...course!, status: course!.status === "published" ? "draft" : "published" })
      toast.success(course!.status === "published" ? "Curso despublicado" : "Curso publicado")
    }
  }

  async function handleDelete() {
    if (!confirm("¿Estás seguro de eliminar este curso? Esta acción no se puede deshacer.")) return
    await deleteCourse(id)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{course.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={course.status === "published" ? "default" : "secondary"}>
              {course.status === "published" ? "Publicado" : "Borrador"}
            </Badge>
            {course.status === "published" && (
              <Link
                href={`/c/${course.slug}`}
                target="_blank"
                className="text-xs text-primary inline-flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                Ver landing
              </Link>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePublish}>
            {course.status === "published" ? "Despublicar" : "Publicar"}
          </Button>
          <Button variant="destructive" size="icon" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="contenido" render={<Link href={`/creador/cursos/${id}/contenido`} />}>
            Contenido
          </TabsTrigger>
          <TabsTrigger value="landing" render={<Link href={`/creador/cursos/${id}/landing`} />}>
            Landing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del curso</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={course.title}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL de la landing</Label>
                  <div className="flex gap-2">
                    <div className="flex items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">
                      /c/
                    </div>
                    <Input
                      id="slug"
                      value={slugValue}
                      onChange={(e) => setSlugValue(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={savingSlug || slugValue === course.slug}
                      onClick={async () => {
                        setSavingSlug(true)
                        const result = await updateSlug(id, slugValue)
                        if (result.error) toast.error(result.error)
                        else {
                          toast.success("URL actualizada")
                          setCourse({ ...course, slug: slugValue })
                        }
                        setSavingSlug(false)
                      }}
                    >
                      {savingSlug ? "..." : "Guardar"}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={course.description_long || ""}
                    rows={6}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price_ars">Precio ARS</Label>
                    <Input
                      id="price_ars"
                      name="price_ars"
                      type="number"
                      min="0"
                      step="0.01"
                      defaultValue={course.price_ars}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price_usd">Precio USD</Label>
                    <Input
                      id="price_usd"
                      name="price_usd"
                      type="number"
                      min="0"
                      step="0.01"
                      defaultValue={course.price_usd || ""}
                    />
                  </div>
                </div>
                <Button type="submit" disabled={saving}>
                  {saving ? "Guardando..." : "Guardar cambios"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
