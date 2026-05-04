"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import slugify from "slugify"
import { createCourseSchema, slugSchema } from "@/lib/validations"

export async function createCourse(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const raw = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    price_ars: parseFloat(formData.get("price_ars") as string),
    price_usd: formData.get("price_usd")
      ? parseFloat(formData.get("price_usd") as string)
      : null,
  }

  const parsed = createCourseSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { title, description, price_ars: priceArs, price_usd: priceUsd } = parsed.data

  // Generate unique slug
  let slug = slugify(title, { lower: true, strict: true })
  const { data: existing } = await supabase
    .from("courses")
    .select("slug")
    .like("slug", `${slug}%`)

  if (existing && existing.length > 0) {
    slug = `${slug}-${existing.length}`
  }

  const { data: course, error } = await supabase
    .from("courses")
    .insert({
      creator_id: user.id,
      title,
      headline: title,
      description_long: description,
      slug,
      price_ars: priceArs,
      price_usd: priceUsd,
    })
    .select("id")
    .single()

  if (error) {
    return { error: error.message }
  }

  redirect(`/creador/cursos/${course.id}`)
}

export async function updateCourse(courseId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const priceArs = parseFloat(formData.get("price_ars") as string)
  const priceUsd = formData.get("price_usd")
    ? parseFloat(formData.get("price_usd") as string)
    : null
  const priceCompareArs = formData.get("price_compare_ars")
    ? parseFloat(formData.get("price_compare_ars") as string)
    : null

  const { error } = await supabase
    .from("courses")
    .update({
      title,
      description_long: description,
      price_ars: priceArs,
      price_compare_ars: priceCompareArs,
      price_usd: priceUsd,
    })
    .eq("id", courseId)
    .eq("creator_id", user.id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function updateSlug(courseId: string, newSlug: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const parsed = slugSchema.safeParse(newSlug)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  // Check if slug is taken by another course
  const { data: existing } = await supabase
    .from("courses")
    .select("id")
    .eq("slug", parsed.data)
    .neq("id", courseId)
    .single()

  if (existing) {
    return { error: "Este slug ya está en uso" }
  }

  const { error } = await supabase
    .from("courses")
    .update({ slug: parsed.data })
    .eq("id", courseId)
    .eq("creator_id", user.id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function publishCourse(courseId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { error } = await supabase
    .from("courses")
    .update({ status: "published" })
    .eq("id", courseId)
    .eq("creator_id", user.id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function unpublishCourse(courseId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { error } = await supabase
    .from("courses")
    .update({ status: "draft" })
    .eq("id", courseId)
    .eq("creator_id", user.id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function deleteCourse(courseId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { error } = await supabase
    .from("courses")
    .delete()
    .eq("id", courseId)
    .eq("creator_id", user.id)

  if (error) {
    return { error: error.message }
  }

  redirect("/creador/cursos")
}
