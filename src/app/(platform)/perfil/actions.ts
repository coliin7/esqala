"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const displayName = formData.get("display_name") as string
  const brandName = formData.get("brand_name") as string | null
  const avatarUrl = formData.get("avatar_url") as string | null

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName,
      brand_name: brandName || null,
      avatar_url: avatarUrl || null,
    })
    .eq("id", user.id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirm_password") as string

  if (password !== confirmPassword) {
    return { error: "Las contraseñas no coinciden" }
  }

  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres" }
  }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: error.message }
  return { success: true }
}
