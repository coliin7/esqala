import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const code = request.nextUrl.searchParams.get("code")
  if (!code) {
    return NextResponse.redirect(
      new URL("/creador/configuracion?mp_error=no_code", request.url)
    )
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const redirectUri = `${appUrl}/api/mp/callback`

  // Exchange authorization code for access/refresh tokens
  const tokenRes = await fetch("https://api.mercadopago.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.MP_CLIENT_ID!,
      client_secret: process.env.MP_CLIENT_SECRET!,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  })

  if (!tokenRes.ok) {
    const errBody = await tokenRes.text()
    console.error("MP token exchange failed:", errBody)
    return NextResponse.redirect(
      new URL("/creador/configuracion?mp_error=token_exchange", request.url)
    )
  }

  const tokenData = await tokenRes.json()

  const { error } = await supabase
    .from("profiles")
    .update({
      mp_access_token: tokenData.access_token,
      mp_refresh_token: tokenData.refresh_token ?? null,
      mp_user_id: String(tokenData.user_id),
      mp_connected: true,
    })
    .eq("id", user.id)

  if (error) {
    console.error("Failed to store MP tokens:", error)
    return NextResponse.redirect(
      new URL("/creador/configuracion?mp_error=db_error", request.url)
    )
  }

  return NextResponse.redirect(new URL("/creador/configuracion?mp=connected", request.url))
}
