import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, ExternalLink } from "lucide-react"

export default async function CreadorCursosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: courses } = await supabase
    .from("courses")
    .select(`
      *,
      enrollments:enrollments(count)
    `)
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Mis cursos</h1>
        <Button render={<Link href="/creador/cursos/nuevo" />}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo curso
        </Button>
      </div>

      {!courses || courses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              Todavía no creaste ningún curso
            </p>
            <Button render={<Link href="/creador/cursos/nuevo" />}>
              Crear mi primer curso
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link key={course.id} href={`/creador/cursos/${course.id}`}>
              <Card className="hover:shadow-md transition-shadow h-full">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg line-clamp-2">
                      {course.title}
                    </CardTitle>
                    <Badge
                      variant={
                        course.status === "published" ? "default" : "secondary"
                      }
                    >
                      {course.status === "published" ? "Publicado" : "Borrador"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      {(course.enrollments as unknown as { count: number }[])?.[0]?.count ?? 0} alumnos
                    </span>
                    <span className="font-medium text-foreground">
                      ${course.price_ars.toLocaleString("es-AR")} ARS
                    </span>
                  </div>
                  {course.status === "published" && (
                    <div className="mt-3">
                      <span className="inline-flex items-center gap-1 text-xs text-primary">
                        <ExternalLink className="h-3 w-3" />
                        /c/{course.slug}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
