import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const clientId = process.env.MP_CLIENT_ID
  if (!clientId) {
    return NextResponse.redirect(
      new URL("/creador/configuracion?mp_error=not_configured", request.url)
    )
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const redirectUri = `${appUrl}/api/mp/callback`

  const mpAuthUrl = new URL("https://auth.mercadopago.com.ar/authorization")
  mpAuthUrl.searchParams.set("client_id", clientId)
  mpAuthUrl.searchParams.set("response_type", "code")
  mpAuthUrl.searchParams.set("platform_id", "mp")
  mpAuthUrl.searchParams.set("redirect_uri", redirectUri)

  return NextResponse.redirect(mpAuthUrl.toString())
}
