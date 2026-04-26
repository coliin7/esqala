"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { updateLanding, createTestimonial, deleteTestimonial } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Plus, Trash2, ExternalLink, Star } from "lucide-react"
import type { Course, Testimonial } from "@/types"

export default function LandingEditorPage() {
  const { id: courseId } = useParams<{ id: string }>()
  const [course, setCourse] = useState<Course | null>(null)
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Landing fields
  const [headline, setHeadline] = useState("")
  const [subheadline, setSubheadline] = useState("")
  const [heroVideoUrl, setHeroVideoUrl] = useState("")
  const [descriptionLong, setDescriptionLong] = useState("")
  const [learningOutcomes, setLearningOutcomes] = useState<string[]>([])
  const [targetAudience, setTargetAudience] = useState<string[]>([])
  const [ctaText, setCtaText] = useState("Comprar ahora")
  const [installmentsMax, setInstallmentsMax] = useState(6)

  const loadData = useCallback(async () => {
    const supabase = createClient()

    const [courseRes, testimonialsRes] = await Promise.all([
      supabase.from("courses").select("*").eq("id", courseId).single(),
      supabase
        .from("testimonials")
        .select("*")
        .eq("course_id", courseId)
        .order("position"),
    ])

    const c = courseRes.data as Course | null
    if (c) {
      setCourse(c)
      setHeadline(c.headline || c.title)
      setSubheadline(c.subheadline || "")
      setHeroVideoUrl(c.hero_video_url || "")
      setDescriptionLong(c.description_long || "")
      setLearningOutcomes(c.learning_outcomes || [])
      setTargetAudience(c.target_audience || [])
      setCtaText(c.cta_text || "Comprar ahora")
      setInstallmentsMax(c.installments_max || 6)
    }

    setTestimonials((testimonialsRes.data as Testimonial[]) || [])
    setLoading(false)
  }, [courseId])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function handleSave() {
    setSaving(true)
    const result = await updateLanding(courseId, {
      headline,
      subheadline,
      hero_video_url: heroVideoUrl,
      description_long: descriptionLong,
      learning_outcomes: learningOutcomes,
      target_audience: targetAudience,
      cta_text: ctaText,
      installments_max: installmentsMax,
    })

    if (result.error) toast.error(result.error)
    else toast.success("Landing guardada")
    setSaving(false)
  }

  async function handleAddTestimonial(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const result = await createTestimonial(courseId, formData)
    if (result.error) toast.error(result.error)
    else {
      e.currentTarget.reset()
      loadData()
    }
  }

  async function handleDeleteTestimonial(id: string) {
    const result = await deleteTestimonial(id)
    if (result.error) toast.error(result.error)
    else loadData()
  }

  function addListItem(
    list: string[],
    setter: (items: string[]) => void
  ) {
    const item = prompt("Agregar ítem:")
    if (item) setter([...list, item])
  }

  function removeListItem(
    list: string[],
    index: number,
    setter: (items: string[]) => void
  ) {
    setter(list.filter((_, i) => i !== index))
  }

  if (loading) return <div className="text-muted-foreground">Cargando...</div>
  if (!course) return <div className="text-destructive">Curso no encontrado</div>

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Editor de landing</h1>
        <div className="flex gap-2">
          {course.status === "published" && (
            <Button variant="outline" render={<Link href={`/c/${course.slug}`} target="_blank" />}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver landing
            </Button>
          )}
          <Button variant="outline" render={<Link href={`/creador/cursos/${courseId}`} />}>
            Volver
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Hero Section */}
        <Card>
          <CardHeader>
            <CardTitle>Hero</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Título principal</Label>
              <Input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="El título que ve el visitante"
              />
            </div>
            <div className="space-y-2">
              <Label>Subtítulo</Label>
              <Input
                value={subheadline}
                onChange={(e) => setSubheadline(e.target.value)}
                placeholder="Una línea que complementa el título"
              />
            </div>
            <div className="space-y-2">
              <Label>URL del video de presentación</Label>
              <Input
                value={heroVideoUrl}
                onChange={(e) => setHeroVideoUrl(e.target.value)}
                placeholder="https://youtube.com/embed/... o https://vimeo.com/..."
              />
              <p className="text-xs text-muted-foreground">
                Pegá la URL de embed de YouTube o Vimeo
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Descripción</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={descriptionLong}
              onChange={(e) => setDescriptionLong(e.target.value)}
              placeholder="Descripción detallada del curso..."
              rows={8}
            />
          </CardContent>
        </Card>

        {/* Learning Outcomes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lo que vas a aprender</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => addListItem(learningOutcomes, setLearningOutcomes)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Agregar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {learningOutcomes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin ítems</p>
            ) : (
              <ul className="space-y-2">
                {learningOutcomes.map((item, idx) => (
                  <li key={idx} className="flex items-center justify-between border rounded-md px-3 py-2">
                    <span className="text-sm">{item}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeListItem(learningOutcomes, idx, setLearningOutcomes)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Target Audience */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Para quién es</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => addListItem(targetAudience, setTargetAudience)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Agregar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {targetAudience.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin ítems</p>
            ) : (
              <ul className="space-y-2">
                {targetAudience.map((item, idx) => (
                  <li key={idx} className="flex items-center justify-between border rounded-md px-3 py-2">
                    <span className="text-sm">{item}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeListItem(targetAudience, idx, setTargetAudience)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Testimonials */}
        <Card>
          <CardHeader>
            <CardTitle>Testimonios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {testimonials.map((t) => (
              <div key={t.id} className="flex items-start justify-between border rounded-md p-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{t.author_name}</span>
                    <div className="flex">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{t.content}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleDeleteTestimonial(t.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}

            <Separator />

            <form onSubmit={handleAddTestimonial} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input name="author_name" placeholder="Nombre" required />
                <Input name="rating" type="number" min="1" max="5" defaultValue="5" placeholder="Rating (1-5)" />
              </div>
              <Textarea name="content" placeholder="Testimonio..." required rows={2} />
              <Button type="submit" variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Agregar testimonio
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card>
          <CardHeader>
            <CardTitle>Llamada a la acción</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Texto del botón</Label>
              <Input
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Cuotas máximas sin interés</Label>
              <Input
                type="number"
                min="1"
                max="12"
                value={installmentsMax}
                onChange={(e) => setInstallmentsMax(parseInt(e.target.value) || 6)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button onClick={handleSave} className="w-full" size="lg" disabled={saving}>
          {saving ? "Guardando..." : "Guardar landing"}
        </Button>
      </div>
    </div>
  )
}
