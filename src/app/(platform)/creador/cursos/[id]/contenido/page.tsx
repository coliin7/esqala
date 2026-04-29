"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { createModule, deleteModule, createLesson, deleteLesson, updateLesson } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Plus, Trash2, GripVertical, Video, FileText, Eye, ChevronDown, ChevronUp } from "lucide-react"
import type { CourseModule, Lesson } from "@/types"
import Link from "next/link"

// ── Helpers ────────────────────────────────────────────────────────────────

function extractDriveFileId(input: string): string | null {
  const trimmed = input.trim()
  // /file/d/FILE_ID/...
  const byPath = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]{10,})/)
  if (byPath) return byPath[1]
  // ?id=FILE_ID or &id=FILE_ID
  const byParam = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{10,})/)
  if (byParam) return byParam[1]
  // Raw file ID pasted directly
  if (/^[a-zA-Z0-9_-]{25,}$/.test(trimmed)) return trimmed
  return null
}

type VideoSource = "bunny" | "drive"

// ── Expandable lesson row with inline editing ──────────────────────────────

function LessonRow({
  lesson,
  index,
  onDelete,
  onUpdate,
  onTogglePreview,
}: {
  lesson: Lesson
  index: number
  onDelete: () => void
  onUpdate: (data: Partial<Lesson>) => Promise<void>
  onTogglePreview: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [title, setTitle] = useState(lesson.title)
  const [videoSource, setVideoSource] = useState<VideoSource>(
    lesson.video_drive_id ? "drive" : "bunny"
  )
  const [bunnyId, setBunnyId] = useState(lesson.video_bunny_id || "")
  const [driveInput, setDriveInput] = useState(
    lesson.video_drive_id
      ? `https://drive.google.com/file/d/${lesson.video_drive_id}/view`
      : ""
  )
  const [driveFileId, setDriveFileId] = useState(lesson.video_drive_id || "")
  const [saving, setSaving] = useState(false)

  function handleDriveInputChange(value: string) {
    setDriveInput(value)
    setDriveFileId(extractDriveFileId(value) || "")
  }

  async function handleSave() {
    setSaving(true)
    const data: Partial<Lesson> = { title: title.trim() || lesson.title }
    if (videoSource === "bunny") {
      data.video_bunny_id = bunnyId.trim() || null
      data.video_drive_id = null
    } else {
      data.video_drive_id = driveFileId || null
      data.video_bunny_id = null
    }
    await onUpdate(data)
    setSaving(false)
    setExpanded(false)
  }

  function handleCancel() {
    setTitle(lesson.title)
    setVideoSource(lesson.video_drive_id ? "drive" : "bunny")
    setBunnyId(lesson.video_bunny_id || "")
    setDriveInput(
      lesson.video_drive_id
        ? `https://drive.google.com/file/d/${lesson.video_drive_id}/view`
        : ""
    )
    setDriveFileId(lesson.video_drive_id || "")
    setExpanded(false)
  }

  const hasVideo = lesson.video_bunny_id || lesson.video_drive_id

  return (
    <div className="border rounded-md overflow-hidden">
      {/* Row header — click to expand */}
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-sm text-muted-foreground shrink-0 w-5">{index + 1}.</span>
          <span className="text-sm truncate">{lesson.title}</span>
          {hasVideo && <Video className="h-3 w-3 text-muted-foreground shrink-0" />}
          {lesson.materials && (lesson.materials as unknown[]).length > 0 && (
            <FileText className="h-3 w-3 text-muted-foreground shrink-0" />
          )}
          {lesson.is_free_preview && (
            <Badge variant="secondary" className="text-xs shrink-0">
              Preview
            </Badge>
          )}
        </div>
        <div
          className="flex items-center gap-1 shrink-0 ml-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            title={lesson.is_free_preview ? "Quitar preview gratuito" : "Marcar como preview gratuito"}
            onClick={onTogglePreview}
          >
            <Eye className={`h-3 w-3 ${lesson.is_free_preview ? "text-primary" : "text-muted-foreground"}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onDelete}
          >
            <Trash2 className="h-3 w-3 text-destructive" />
          </Button>
          <span className="text-muted-foreground">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </span>
        </div>
      </div>

      {/* Expanded edit panel */}
      {expanded && (
        <div className="border-t bg-muted/20 px-3 py-3 space-y-3">
          {/* Title */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Título</Label>
            <Input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-8 text-sm"
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          </div>

          {/* Video source toggle */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Fuente del video</Label>
            <div className="flex gap-1 p-1 bg-muted rounded-md w-fit">
              <button
                type="button"
                onClick={() => setVideoSource("bunny")}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  videoSource === "bunny"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Bunny.net
              </button>
              <button
                type="button"
                onClick={() => setVideoSource("drive")}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  videoSource === "drive"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Google Drive
              </button>
            </div>

            {videoSource === "bunny" && (
              <div className="space-y-1">
                <Input
                  value={bunnyId}
                  onChange={(e) => setBunnyId(e.target.value)}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  className="h-8 text-sm font-mono"
                />
              </div>
            )}

            {videoSource === "drive" && (
              <div className="space-y-1">
                <Input
                  value={driveInput}
                  onChange={(e) => handleDriveInputChange(e.target.value)}
                  placeholder="https://drive.google.com/file/d/…/view"
                  className="h-8 text-sm"
                />
                {driveInput && !driveFileId && (
                  <p className="text-xs text-destructive">
                    No se pudo extraer el ID del archivo. Asegurate de pegar el enlace completo.
                  </p>
                )}
                {driveFileId && (
                  <p className="text-xs text-muted-foreground font-mono">
                    ID: {driveFileId}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  El video debe estar compartido como &ldquo;Cualquier persona con el enlace&rdquo;.
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <Button size="sm" variant="ghost" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function ContenidoPage() {
  const { id: courseId } = useParams<{ id: string }>()
  const [modules, setModules] = useState<(CourseModule & { lessons: Lesson[] })[]>([])
  const [loading, setLoading] = useState(true)
  const [newModuleTitle, setNewModuleTitle] = useState("")

  // Inline lesson-add state: which module is receiving a new lesson
  const [addingLesson, setAddingLesson] = useState<{ moduleId: string; title: string } | null>(null)

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "module" | "lesson"
    id: string
    name: string
  } | null>(null)
  const [deleting, setDeleting] = useState(false)

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

  async function handleAddLesson() {
    if (!addingLesson || !addingLesson.title.trim()) return
    const formData = new FormData()
    formData.set("title", addingLesson.title.trim())
    const result = await createLesson(addingLesson.moduleId, formData)
    if (result.error) toast.error(result.error)
    else {
      setAddingLesson(null)
      loadModules()
    }
  }

  async function executeDelete() {
    if (!deleteConfirm) return
    setDeleting(true)
    const result =
      deleteConfirm.type === "module"
        ? await deleteModule(deleteConfirm.id)
        : await deleteLesson(deleteConfirm.id)
    if (result.error) toast.error(result.error)
    else loadModules()
    setDeleting(false)
    setDeleteConfirm(null)
  }

  async function handleUpdateLesson(lessonId: string, data: Partial<Lesson>) {
    const result = await updateLesson(lessonId, data)
    if (result.error) toast.error(result.error)
    else loadModules()
  }

  async function handleTogglePreview(lesson: Lesson) {
    const result = await updateLesson(lesson.id, { is_free_preview: !lesson.is_free_preview })
    if (result.error) toast.error(result.error)
    else loadModules()
  }

  if (loading) return <div className="text-muted-foreground">Cargando...</div>

  return (
    <>
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
                      onClick={() => setAddingLesson({ moduleId: module.id, title: "" })}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Lección
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setDeleteConfirm({ type: "module", id: module.id, name: module.title })
                      }
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {module.lessons.length === 0 && addingLesson?.moduleId !== module.id ? (
                  <p className="text-sm text-muted-foreground py-2">Sin lecciones todavía</p>
                ) : (
                  <div className="space-y-2">
                    {module.lessons.map((lesson, lessonIdx) => (
                      <LessonRow
                        key={lesson.id}
                        lesson={lesson}
                        index={lessonIdx}
                        onDelete={() =>
                          setDeleteConfirm({
                            type: "lesson",
                            id: lesson.id,
                            name: lesson.title,
                          })
                        }
                        onUpdate={(data) => handleUpdateLesson(lesson.id, data)}
                        onTogglePreview={() => handleTogglePreview(lesson)}
                      />
                    ))}
                  </div>
                )}

                {/* Inline lesson add form */}
                {addingLesson?.moduleId === module.id && (
                  <div className="flex gap-2 mt-3">
                    <Input
                      autoFocus
                      placeholder="Título de la lección"
                      value={addingLesson.title}
                      onChange={(e) =>
                        setAddingLesson({ ...addingLesson, title: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddLesson()
                        if (e.key === "Escape") setAddingLesson(null)
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={handleAddLesson}
                      disabled={!addingLesson.title.trim()}
                    >
                      Agregar
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setAddingLesson(null)}>
                      Cancelar
                    </Button>
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

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={(open: boolean) => { if (!open) setDeleteConfirm(null) }}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>
              ¿Eliminar {deleteConfirm?.type === "module" ? "módulo" : "lección"}?
            </DialogTitle>
            <DialogDescription>
              <span className="font-medium">&ldquo;{deleteConfirm?.name}&rdquo;</span> será
              eliminado permanentemente.
              {deleteConfirm?.type === "module" && " Esto incluye todas sus lecciones."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button variant="destructive" onClick={executeDelete} disabled={deleting}>
              {deleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
