import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Authenticated users should not see auth pages — redirect to dashboard
  if (user && (pathname === "/login" || pathname === "/registro")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    const dest =
      profile?.role === "creator" ? "/creador/cursos" : "/alumno/cursos"
    const authRedirect = NextResponse.redirect(new URL(dest, request.url))
    supabaseResponse.cookies.getAll().forEach(({ name, value }) =>
      authRedirect.cookies.set(name, value)
    )
    return authRedirect
  }

  // Public routes - no auth required
  if (
    pathname.startsWith("/c/") ||
    pathname.startsWith("/api/webhooks") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/registro" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname === "/confirmar-email" ||
    pathname.startsWith("/auth/")
  ) {
    return supabaseResponse
  }

  // Protected routes - redirect to login if not authenticated
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("returnUrl", pathname)
    const loginRedirect = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach(({ name, value }) =>
      loginRedirect.cookies.set(name, value)
    )
    return loginRedirect
  }

  // Get user profile to check role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  // If no profile exists yet (e.g. OAuth race condition), let them through
  if (!profile) {
    return supabaseResponse
  }

  // Role-based route protection
  if (pathname.startsWith("/creador") && profile.role !== "creator") {
    return NextResponse.redirect(new URL("/alumno/cursos", request.url))
  }

  if (pathname.startsWith("/alumno") && profile.role !== "student") {
    return NextResponse.redirect(new URL("/creador/cursos", request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
