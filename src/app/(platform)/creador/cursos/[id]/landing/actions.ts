"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function updateLanding(courseId: string, data: {
  headline?: string
  subheadline?: string
  hero_video_url?: string
  hero_video_vertical?: boolean
  description_long?: string
  learning_outcomes?: string[]
  target_audience?: string[]
  cta_text?: string
  installments_max?: number
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { error } = await supabase
    .from("courses")
    .update(data)
    .eq("id", courseId)
    .eq("creator_id", user.id)

  if (error) return { error: error.message }

  // Revalidate the public landing page
  const { data: course } = await supabase
    .from("courses")
    .select("slug")
    .eq("id", courseId)
    .single()

  if (course) {
    revalidatePath(`/c/${course.slug}`)
  }

  return { success: true }
}

export async function createTestimonial(courseId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const authorName = formData.get("author_name") as string
  const content = formData.get("content") as string
  const rating = parseInt(formData.get("rating") as string) || 5

  const { data: existing } = await supabase
    .from("testimonials")
    .select("position")
    .eq("course_id", courseId)
    .order("position", { ascending: false })
    .limit(1)

  const nextPos = existing && existing.length > 0 ? existing[0].position + 1 : 0

  const { error } = await supabase
    .from("testimonials")
    .insert({
      course_id: courseId,
      author_name: authorName,
      content,
      rating,
      position: nextPos,
    })

  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteTestimonial(testimonialId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { error } = await supabase
    .from("testimonials")
    .delete()
    .eq("id", testimonialId)

  if (error) return { error: error.message }
  return { success: true }
}
