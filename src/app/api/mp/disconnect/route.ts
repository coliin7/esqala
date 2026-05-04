import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      mp_access_token: null,
      mp_refresh_token: null,
      mp_user_id: null,
      mp_connected: false,
    })
    .eq("id", user.id)

  if (error) {
    return NextResponse.json({ error: "Error al desvincular" }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
