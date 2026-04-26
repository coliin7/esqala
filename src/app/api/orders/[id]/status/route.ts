import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const { data: order } = await supabase
    .from("orders")
    .select("status, course_id")
    .eq("id", id)
    .eq("student_id", user.id)
    .single()

  if (!order) {
    return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 })
  }

  return NextResponse.json({
    status: order.status,
    course_id: order.course_id,
  })
}
