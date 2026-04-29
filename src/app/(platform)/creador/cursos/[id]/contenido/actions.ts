"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

// ============ MODULES ============

export async function createModule(courseId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const title = formData.get("title") as string

  // Get next position
  const { data: modules } = await supabase
    .from("course_modules")
    .select("position")
    .eq("course_id", courseId)
    .order("position", { ascending: false })
    .limit(1)

  const nextPosition = modules && modules.length > 0 ? modules[0].position + 1 : 0

  const { error } = await supabase
    .from("course_modules")
    .insert({
      course_id: courseId,
      title,
      position: nextPosition,
    })

  if (error) return { error: error.message }
  return { success: true }
}

export async function updateModule(moduleId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const title = formData.get("title") as string

  const { error } = await supabase
    .from("course_modules")
    .update({ title })
    .eq("id", moduleId)

  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteModule(moduleId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { error } = await supabase
    .from("course_modules")
    .delete()
    .eq("id", moduleId)

  if (error) return { error: error.message }
  return { success: true }
}

// ============ LESSONS ============

export async function createLesson(moduleId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const title = formData.get("title") as string

  // Get next position
  const { data: lessons } = await supabase
    .from("lessons")
    .select("position")
    .eq("module_id", moduleId)
    .order("position", { ascending: false })
    .limit(1)

  const nextPosition = lessons && lessons.length > 0 ? lessons[0].position + 1 : 0

  const { error } = await supabase
    .from("lessons")
    .insert({
      module_id: moduleId,
      title,
      position: nextPosition,
    })

  if (error) return { error: error.message }
  return { success: true }
}

export async function updateLesson(
  lessonId: string,
  data: {
    title?: string
    video_bunny_id?: string | null
    video_drive_id?: string | null
    video_duration_sec?: number | null
    is_free_preview?: boolean
    materials?: { name: string; url: string; type: string }[]
  }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { error } = await supabase
    .from("lessons")
    .update(data)
    .eq("id", lessonId)

  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteLesson(lessonId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { error } = await supabase
    .from("lessons")
    .delete()
    .eq("id", lessonId)

  if (error) return { error: error.message }
  return { success: true }
}
