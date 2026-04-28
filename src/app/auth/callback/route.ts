import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const origin = request.nextUrl.origin
  const code = searchParams.get("code")

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?oauth_error=no_code_received", origin)
    )
  }

  // Use a collector response to capture cookies set by Supabase
  const collector = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            collector.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?oauth_error=${encodeURIComponent(error.message)}`, origin)
    )
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(
      new URL("/login?oauth_error=no_user_after_exchange", origin)
    )
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const dest =
    profile?.role === "creator" ? "/creador/cursos" : "/alumno/cursos"

  // Create the final redirect and copy all Set-Cookie headers from the collector
  const redirectResponse = NextResponse.redirect(new URL(dest, origin))
  collector.headers.getSetCookie().forEach((cookie) => {
    redirectResponse.headers.append("Set-Cookie", cookie)
  })
  return redirectResponse
}
