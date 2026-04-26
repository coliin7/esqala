"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { createModule, deleteModule, createLesson, deleteLesson, updateLesson } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Plus, Trash2, GripVertical, Video, FileText, Eye } from "lucide-react"
import type { CourseModule, Lesson } from "@/types"
import Link from "next/link"

export default function ContenidoPage() {
  const { id: courseId } = useParams<{ id: string }>()
  const [modules, setModules] = useState<(CourseModule & { lessons: Lesson[] })[]>([])
  const [loading, setLoading] = useState(true)
  const [newModuleTitle, setNewModuleTitle] = useState("")

  const loadModules = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("course_modules")
      .select("*, lessons(*)")
      .eq("course_id", courseId)
      .order("position")
      .order("position", { referencedTable: "lessons" })

    setModules((data as (CourseModule & { lessons: Lesson[] })[]) || [])
    setLoading(false)
  }, [courseId])

  useEffect(() => {
    loadModules()
  }, [loadModules])

  async function handleAddModule(e: React.FormEvent) {
    e.preventDefault()
    if (!newModuleTitle.trim()) return

    const formData = new FormData()
    formData.set("title", newModuleTitle)
    const result = await createModule(courseId, formData)

    if (result.error) {
      toast.error(result.error)
    } else {
      setNewModuleTitle("")
      loadModules()
    }
  }

  async function handleDeleteModule(moduleId: string) {
    if (!confirm("¿Eliminar este módulo y todas sus lecciones?")) return
    const result = await deleteModule(moduleId)
    if (result.error) toast.error(result.error)
    else loadModules()
  }

  async function handleAddLesson(moduleId: string) {
    const title = prompt("Título de la lección:")
    if (!title) return

    const formData = new FormData()
    formData.set("title", title)
    const result = await createLesson(moduleId, formData)

    if (result.error) toast.error(result.error)
    else loadModules()
  }

  async function handleDeleteLesson(lessonId: string) {
    if (!confirm("¿Eliminar esta lección?")) return
    const result = await deleteLesson(lessonId)
    if (result.error) toast.error(result.error)
    else loadModules()
  }

  async function handleTogglePreview(lesson: Lesson) {
    const result = await updateLesson(lesson.id, {
      is_free_preview: !lesson.is_free_preview,
    })
    if (result.error) toast.error(result.error)
    else loadModules()
  }

  if (loading) return <div className="text-muted-foreground">Cargando...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Contenido del curso</h1>
        <Button variant="outline" render={<Link href={`/creador/cursos/${courseId}`} />}>
          Volver
        </Button>
      </div>

      <div className="space-y-4">
        {modules.map((module, idx) => (
          <Card key={module.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base">
                    Módulo {idx + 1}: {module.title}
                  </CardTitle>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAddLesson(module.id)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Lección
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteModule(module.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {module.lessons.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  Sin lecciones todavía
                </p>
              ) : (
                <div className="space-y-2">
                  {module.lessons.map((lesson, lessonIdx) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between rounded-md border px-3 py-2"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground w-6">
                          {lessonIdx + 1}.
                        </span>
                        <span className="text-sm">{lesson.title}</span>
                        {lesson.video_bunny_id && (
                          <Video className="h-3 w-3 text-muted-foreground" />
                        )}
                        {lesson.materials && (lesson.materials as unknown[]).length > 0 && (
                          <FileText className="h-3 w-3 text-muted-foreground" />
                        )}
                        {lesson.is_free_preview && (
                          <Badge variant="secondary" className="text-xs">
                            Preview
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleTogglePreview(lesson)}
                          title={lesson.is_free_preview ? "Quitar preview" : "Marcar como preview"}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDeleteLesson(lesson.id)}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Add module form */}
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleAddModule} className="flex gap-2">
              <Input
                placeholder="Nombre del módulo"
                value={newModuleTitle}
                onChange={(e) => setNewModuleTitle(e.target.value)}
              />
              <Button type="submit">
                <Plus className="h-4 w-4 mr-1" />
                Módulo
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
