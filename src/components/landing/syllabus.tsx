import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { PlayCircle, Clock } from "lucide-react"
import type { CourseModule, Lesson } from "@/types"

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}h ${minutes}min`
  return `${minutes}min`
}

interface SyllabusProps {
  modules: (CourseModule & { lessons: Lesson[] })[]
  totalLessons: number
  totalSeconds: number
}

export function LandingSyllabus({
  modules,
  totalLessons,
  totalSeconds,
}: SyllabusProps) {
  return (
    <section className="py-16 px-4 bg-muted/50">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-2 text-center">Temario</h2>
        <p className="text-center text-muted-foreground mb-8">
          {modules.length} módulos &middot; {totalLessons} lecciones
          {totalSeconds > 0 && ` · ${formatDuration(totalSeconds)} de contenido`}
        </p>

        <Accordion multiple className="space-y-2">
          {modules.map((module, idx) => (
            <AccordionItem
              key={module.id}
              value={module.id}
              className="border rounded-lg px-4"
            >
              <AccordionTrigger className="hover:no-underline">
                <span className="text-left">
                  <span className="text-muted-foreground mr-2">{idx + 1}.</span>
                  {module.title}
                  <span className="text-xs text-muted-foreground ml-2">
                    ({module.lessons.length} lecciones)
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 pb-2">
                  {module.lessons.map((lesson) => (
                    <li
                      key={lesson.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <PlayCircle className="h-4 w-4 text-muted-foreground" />
                        <span>{lesson.title}</span>
                        {lesson.is_free_preview && (
                          <Badge variant="secondary" className="text-xs">
                            Gratis
                          </Badge>
                        )}
                      </div>
                      {lesson.video_duration_sec && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span className="text-xs">
                            {formatDuration(lesson.video_duration_sec)}
                          </span>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
