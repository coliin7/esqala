"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import {
  PlayCircle,
  FileText,
  Download,
  ChevronLeft,
  ChevronRight,
  Menu,
  CheckCircle2,
} from "lucide-react"
import type { Course, CourseModule, Lesson } from "@/types"

type ModuleWithLessons = CourseModule & { lessons: Lesson[] }

export default function CursoPlayerPage() {
  const { id: courseId } = useParams<{ id: string }>()
  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<ModuleWithLessons[]>([])
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [showingWelcome, setShowingWelcome] = useState(false)
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set())

  const loadCourse = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    // Verify enrollment
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("student_id", user.id)
      .eq("course_id", courseId)
      .single()

    if (!enrollment) {
      setLoading(false)
      return
    }

    setHasAccess(true)

    const [courseRes, modulesRes, progressRes] = await Promise.all([
      supabase.from("courses").select("*").eq("id", courseId).single(),
      supabase
        .from("course_modules")
        .select("*, lessons(*)")
        .eq("course_id", courseId)
        .order("position")
        .order("position", { referencedTable: "lessons" }),
      supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("student_id", user.id),
    ])

    const c = courseRes.data as Course | null
    const m = (modulesRes.data as ModuleWithLessons[]) || []

    setCourse(c)
    setModules(m)

    // Load progress
    if (progressRes.data) {
      setCompletedLessons(new Set(progressRes.data.map((p) => p.lesson_id)))
    }

    // Set first incomplete lesson or first lesson; show welcome if no progress yet
    const allLessons = m.flatMap((mod) => mod.lessons)
    const hasProgress = progressRes.data && progressRes.data.length > 0

    if (c?.welcome_video_bunny_id && !hasProgress) {
      setShowingWelcome(true)
    } else {
      const firstIncomplete = allLessons.find(
        (l) => !progressRes.data?.some((p) => p.lesson_id === l.id)
      )
      setCurrentLesson(firstIncomplete || allLessons[0] || null)
    }

    setLoading(false)
  }, [courseId])

  useEffect(() => {
    loadCourse()
  }, [loadCourse])

  async function markComplete(lessonId: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from("lesson_progress")
      .upsert(
        { student_id: user.id, lesson_id: lessonId },
        { onConflict: "student_id,lesson_id" }
      )

    setCompletedLessons((prev) => new Set([...prev, lessonId]))
  }

  if (loading) return <div className="text-muted-foreground p-6">Cargando...</div>
  if (!hasAccess) return <div className="text-destructive p-6">No tenés acceso a este curso</div>
  if (!course) return <div className="text-destructive p-6">Curso no encontrado</div>

  const allLessons = modules.flatMap((m) => m.lessons)
  const currentIndex = currentLesson
    ? allLessons.findIndex((l) => l.id === currentLesson.id)
    : -1
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null

  const progress = allLessons.length > 0
    ? Math.round((completedLessons.size / allLessons.length) * 100)
    : 0

  const bunnyLibrary = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID || ""

  const videoUrl = showingWelcome && course?.welcome_video_bunny_id
    ? `https://player.mediadelivery.net/embed/${bunnyLibrary}/${course.welcome_video_bunny_id}`
    : currentLesson?.video_bunny_id
    ? `https://player.mediadelivery.net/embed/${bunnyLibrary}/${currentLesson.video_bunny_id}`
    : currentLesson?.video_drive_id
    ? `https://drive.google.com/file/d/${currentLesson.video_drive_id}/preview`
    : null

  // Navigation helpers accounting for welcome video
  const effectivePrev = showingWelcome
    ? null
    : currentIndex === 0 && course?.welcome_video_bunny_id
    ? "welcome" as const
    : prevLesson

  const effectiveNext = showingWelcome ? allLessons[0] || null : nextLesson

  function LessonList() {
    return (
      <>
        <div className="p-4 border-b">
          <h2 className="font-semibold text-sm line-clamp-2">{course!.title}</h2>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{progress}%</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {course?.welcome_video_bunny_id && (
            <button
              onClick={() => { setShowingWelcome(true); setCurrentLesson(null) }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-accent ${
                showingWelcome ? "bg-accent text-accent-foreground" : ""
              }`}
            >
              <PlayCircle className={`h-4 w-4 shrink-0 ${showingWelcome ? "text-primary" : ""}`} />
              <span className="flex-1">Bienvenida</span>
            </button>
          )}
          {modules.map((module, idx) => (
            <div key={module.id}>
              <div className="px-4 py-2 bg-muted/50 text-xs font-medium text-muted-foreground sticky top-0">
                Módulo {idx + 1}: {module.title}
              </div>
              {module.lessons.map((lesson) => {
                const isActive = !showingWelcome && currentLesson?.id === lesson.id
                const isCompleted = completedLessons.has(lesson.id)
                return (
                  <button
                    key={lesson.id}
                    onClick={() => { setShowingWelcome(false); setCurrentLesson(lesson) }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-accent ${
                      isActive ? "bg-accent text-accent-foreground" : ""
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                    ) : (
                      <PlayCircle className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : ""}`} />
                    )}
                    <span className="line-clamp-2 flex-1">{lesson.title}</span>
                    {lesson.video_duration_sec && (
                      <span className="text-xs text-muted-foreground shrink-0">
                        {Math.ceil(lesson.video_duration_sec / 60)}min
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </>
    )
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] lg:h-screen -m-6">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-80 flex-col border-r overflow-hidden bg-muted/30">
        <LessonList />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Mobile header */}
        <div className="md:hidden sticky top-0 z-10 flex items-center gap-3 border-b bg-background p-3">
          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon" />}>
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <SheetTitle className="sr-only">Contenido del curso</SheetTitle>
              <div className="flex flex-col h-full">
                <LessonList />
              </div>
            </SheetContent>
          </Sheet>
          <span className="text-sm font-medium truncate flex-1">
            {showingWelcome ? "Bienvenida" : currentLesson?.title}
          </span>
        </div>

        {showingWelcome || currentLesson ? (
          <>
            {/* Video */}
            <div className="aspect-video bg-black shrink-0">
              {videoUrl ? (
                <iframe
                  src={videoUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={showingWelcome ? "Bienvenida" : currentLesson!.title}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/50">
                  Video no disponible
                </div>
              )}
            </div>

            {/* Content info */}
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-xl font-bold">
                  {showingWelcome ? "Bienvenida" : currentLesson!.title}
                </h1>
                {!showingWelcome && currentLesson && !completedLessons.has(currentLesson.id) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markComplete(currentLesson.id)}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Completar
                  </Button>
                )}
                {!showingWelcome && currentLesson && completedLessons.has(currentLesson.id) && (
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Completada
                  </Badge>
                )}
              </div>

              {/* Materials */}
              {!showingWelcome && currentLesson?.materials &&
                (currentLesson.materials as unknown[]).length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Materiales</h3>
                  <div className="space-y-2">
                    {(currentLesson.materials as { name: string; url: string; type: string }[]).map(
                      (material, idx) => (
                        <a
                          key={idx}
                          href={material.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <FileText className="h-4 w-4" />
                          {material.name}
                          <Download className="h-3 w-3" />
                        </a>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  disabled={effectivePrev === null}
                  onClick={() => {
                    if (effectivePrev === "welcome") {
                      setShowingWelcome(true)
                      setCurrentLesson(null)
                    } else if (effectivePrev) {
                      setShowingWelcome(false)
                      setCurrentLesson(effectivePrev)
                    }
                  }}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                <Button
                  disabled={!effectiveNext}
                  onClick={() => {
                    if (!showingWelcome && currentLesson && !completedLessons.has(currentLesson.id)) {
                      markComplete(currentLesson.id)
                    }
                    if (effectiveNext) {
                      setShowingWelcome(false)
                      setCurrentLesson(effectiveNext)
                    }
                  }}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Seleccioná una lección para empezar
          </div>
        )}
      </div>
    </div>
  )
}
