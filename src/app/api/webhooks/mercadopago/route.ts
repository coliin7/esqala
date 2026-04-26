import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createMPClient } from "@/lib/mercadopago"
import { Payment } from "mercadopago"
import { sendEnrollmentEmail, sendSaleNotificationEmail } from "@/lib/emails"

export async function POST(request: NextRequest) {
  const body = await request.json()

  // Only process payment notifications
  if (body.type !== "payment" && body.action !== "payment.created" && body.action !== "payment.updated") {
    return NextResponse.json({ received: true })
  }

  const paymentId = body.data?.id
  if (!paymentId) {
    return NextResponse.json({ received: true })
  }

  try {
    // Get payment details from MP
    const mpClient = createMPClient()
    const payment = new Payment(mpClient)
    const paymentData = await payment.get({ id: paymentId })

    if (!paymentData || !paymentData.external_reference) {
      return NextResponse.json({ received: true })
    }

    const orderId = paymentData.external_reference
    const supabase = createAdminClient()

    // Check idempotency - skip if already processed with this payment_id
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("id, status, mp_payment_id")
      .eq("id", orderId)
      .single()

    if (!existingOrder) {
      return NextResponse.json({ received: true })
    }

    // Already processed this payment
    if (existingOrder.mp_payment_id === String(paymentId) && existingOrder.status === "approved") {
      return NextResponse.json({ received: true })
    }

    // Map MP status to our status
    let orderStatus: string
    switch (paymentData.status) {
      case "approved":
        orderStatus = "approved"
        break
      case "rejected":
      case "cancelled":
        orderStatus = "rejected"
        break
      case "in_process":
      case "pending":
        orderStatus = "processing"
        break
      case "refunded":
      case "charged_back":
        orderStatus = "refunded"
        break
      default:
        orderStatus = "processing"
    }

    // Update order
    await supabase
      .from("orders")
      .update({
        status: orderStatus,
        mp_payment_id: String(paymentId),
        installments: paymentData.installments || null,
      })
      .eq("id", orderId)

    // If approved, create enrollment
    if (orderStatus === "approved") {
      const { data: order } = await supabase
        .from("orders")
        .select("student_id, course_id")
        .eq("id", orderId)
        .single()

      if (order) {
        // Upsert enrollment (idempotent)
        await supabase
          .from("enrollments")
          .upsert(
            {
              student_id: order.student_id,
              course_id: order.course_id,
              order_id: orderId,
            },
            { onConflict: "student_id,course_id" }
          )

        // Send emails (fire and forget)
        const [studentRes, courseRes, creatorRes] = await Promise.all([
          supabase.from("profiles").select("email, display_name").eq("id", order.student_id).single(),
          supabase.from("courses").select("title, creator_id, price_ars").eq("id", order.course_id).single(),
          null,
        ])

        const student = studentRes.data
        const courseData = courseRes.data

        if (student && courseData) {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

          sendEnrollmentEmail({
            to: student.email,
            studentName: student.display_name,
            courseName: courseData.title,
            courseUrl: `${appUrl}/alumno/cursos/${order.course_id}`,
          })

          // Notify creator
          const { data: creator } = await supabase
            .from("profiles")
            .select("email, display_name")
            .eq("id", courseData.creator_id)
            .single()

          if (creator) {
            sendSaleNotificationEmail({
              to: creator.email,
              creatorName: creator.display_name,
              courseName: courseData.title,
              amount: Number(courseData.price_ars),
              studentEmail: student.email,
            })
          }
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    // Return 200 anyway to prevent MP from retrying unnecessarily
    return NextResponse.json({ received: true })
  }
}
