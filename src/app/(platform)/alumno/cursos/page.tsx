import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlayCircle } from "lucide-react"

export default async function AlumnoCursosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(`
      *,
      course:courses(
        id, title, slug, creator_id,
        creator:profiles!courses_creator_id_fkey(display_name),
        modules:course_modules(
          lessons(id)
        )
      )
    `)
    .eq("student_id", user.id)
    .order("enrolled_at", { ascending: false })

  // Get progress for all lessons
  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("student_id", user.id)

  const completedIds = new Set(progress?.map((p) => p.lesson_id) || [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mis cursos</h1>

      {!enrollments || enrollments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Todavía no compraste ningún curso
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enrollment) => {
            const course = enrollment.course as unknown as {
              id: string
              title: string
              slug: string
              creator: { display_name: string }
              modules: { lessons: { id: string }[] }[]
            }

            const totalLessons = course.modules?.reduce(
              (sum, m) => sum + (m.lessons?.length || 0),
              0
            ) || 0
            const completedLessons = course.modules?.reduce(
              (sum, m) =>
                sum + (m.lessons?.filter((l) => completedIds.has(l.id)).length || 0),
              0
            ) || 0
            const progressPct = totalLessons > 0
              ? Math.round((completedLessons / totalLessons) * 100)
              : 0

            return (
              <Link
                key={enrollment.id}
                href={`/alumno/cursos/${course.id}`}
              >
                <Card className="hover:shadow-md transition-shadow h-full">
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2">
                      {course.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Por {course.creator?.display_name}
                    </p>

                    {/* Progress bar */}
                    <div className="space-y-1 mb-3">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{completedLessons}/{totalLessons} lecciones</span>
                        <span>{progressPct}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <PlayCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm text-primary font-medium">
                        {progressPct === 100 ? "Repasar" : progressPct > 0 ? "Continuar" : "Empezar"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
