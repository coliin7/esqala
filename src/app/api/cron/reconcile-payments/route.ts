import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createMPClient } from "@/lib/mercadopago"
import { Payment } from "mercadopago"

export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel sends this header)
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createAdminClient()
  const mpClient = createMPClient()
  const payment = new Payment(mpClient)

  // Find orders stuck in pending/processing for more than 10 minutes
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()

  const { data: staleOrders } = await supabase
    .from("orders")
    .select("id, mp_payment_id, mp_preference_id, student_id, course_id")
    .in("status", ["pending", "processing"])
    .lt("updated_at", tenMinutesAgo)
    .limit(50)

  if (!staleOrders || staleOrders.length === 0) {
    return NextResponse.json({ reconciled: 0 })
  }

  let reconciled = 0

  for (const order of staleOrders) {
    if (!order.mp_payment_id) continue

    try {
      const paymentData = await payment.get({ id: Number(order.mp_payment_id) })

      let newStatus: string
      switch (paymentData.status) {
        case "approved":
          newStatus = "approved"
          break
        case "rejected":
        case "cancelled":
          newStatus = "rejected"
          break
        case "refunded":
        case "charged_back":
          newStatus = "refunded"
          break
        default:
          continue // Still processing, skip
      }

      await supabase
        .from("orders")
        .update({
          status: newStatus,
          installments: paymentData.installments || null,
        })
        .eq("id", order.id)

      if (newStatus === "approved") {
        await supabase
          .from("enrollments")
          .upsert(
            {
              student_id: order.student_id,
              course_id: order.course_id,
              order_id: order.id,
            },
            { onConflict: "student_id,course_id" }
          )
      }

      reconciled++
    } catch (error) {
      console.error(`Error reconciling order ${order.id}:`, error)
    }
  }

  return NextResponse.json({ reconciled })
}
