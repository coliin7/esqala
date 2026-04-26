import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
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
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-12 gap-8 mb-12">
          <div className="md:col-span-6">
            <div className="text-xs font-mono text-primary mb-4">/ TEMARIO</div>
            <h2 className="font-display text-4xl md:text-5xl leading-[0.9] tracking-tightest">
              Lo que incluye el curso.
            </h2>
          </div>
          <div className="md:col-span-5 md:col-start-8 self-end">
            <p className="text-muted-foreground">
              {modules.length} módulos · {totalLessons} lecciones
              {totalSeconds > 0 && ` · ${formatDuration(totalSeconds)} de contenido`}
            </p>
          </div>
        </div>

        <Accordion multiple className="space-y-3">
          {modules.map((module, idx) => (
            <AccordionItem
              key={module.id}
              value={module.id}
              className="border border-border rounded-2xl px-6 hover:border-primary/50 transition-colors"
            >
              <AccordionTrigger className="hover:no-underline py-5">
                <div className="flex items-center gap-4 text-left w-full">
                  <span className="font-display text-3xl text-primary tabular-nums">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1">
                    <span className="font-display text-lg">{module.title}</span>
                    <span className="text-xs font-mono text-muted-foreground ml-3">
                      {module.lessons.length} lecciones
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 pb-4 pl-14">
                  {module.lessons.map((lesson) => (
                    <li
                      key={lesson.id}
                      className="flex items-center justify-between text-sm py-2"
                    >
                      <span className="text-muted-foreground">{lesson.title}</span>
                      <div className="flex items-center gap-2">
                        {lesson.is_free_preview && (
                          <Badge className="text-[10px] font-mono">GRATIS</Badge>
                        )}
                        {lesson.video_duration_sec && (
                          <span className="text-xs font-mono text-muted-foreground">
                            {formatDuration(lesson.video_duration_sec)}
                          </span>
                        )}
                      </div>
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
