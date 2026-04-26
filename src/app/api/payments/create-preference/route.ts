import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createMPClient } from "@/lib/mercadopago"
import { Preference } from "mercadopago"
import { PLATFORM_FEE_RATE } from "@/lib/constants"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const { course_id } = await request.json()

  // Get course
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("*")
    .eq("id", course_id)
    .eq("status", "published")
    .single()

  if (courseError || !course) {
    return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 })
  }

  // Check if already enrolled
  const { data: existing } = await supabase
    .from("enrollments")
    .select("id")
    .eq("student_id", user.id)
    .eq("course_id", course_id)
    .single()

  if (existing) {
    return NextResponse.json({ error: "Ya estás inscripto" }, { status: 400 })
  }

  // Create order
  const platformFee = Number(course.price_ars) * PLATFORM_FEE_RATE
  const creatorEarning = Number(course.price_ars) - platformFee

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      course_id,
      student_id: user.id,
      amount_ars: course.price_ars,
      platform_fee_ars: platformFee,
      creator_earning_ars: creatorEarning,
      status: "pending",
    })
    .select("id")
    .single()

  if (orderError || !order) {
    return NextResponse.json(
      { error: "Error al crear la orden" },
      { status: 500 }
    )
  }

  // Create MP preference
  const mpClient = createMPClient()
  const preference = new Preference(mpClient)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  const result = await preference.create({
    body: {
      items: [
        {
          id: course_id,
          title: course.title,
          quantity: 1,
          unit_price: Number(course.price_ars),
          currency_id: "ARS",
        },
      ],
      payment_methods: {
        installments: course.installments_max || 6,
      },
      back_urls: {
        success: `${appUrl}/alumno/cursos/${course_id}?payment=success`,
        failure: `${appUrl}/c/${course.slug}?payment=failure`,
        pending: `${appUrl}/c/${course.slug}?payment=pending`,
      },
      auto_return: "approved",
      notification_url: `${appUrl}/api/webhooks/mercadopago`,
      external_reference: order.id,
      payer: {
        email: user.email || "",
      },
    },
  })

  // Update order with MP preference id
  await supabase
    .from("orders")
    .update({ mp_preference_id: result.id })
    .eq("id", order.id)

  return NextResponse.json({
    preference_id: result.id,
    order_id: order.id,
  })
}
