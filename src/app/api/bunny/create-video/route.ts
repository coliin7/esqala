import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const { title } = await request.json()

  const libraryId = process.env.BUNNY_LIBRARY_ID
  const apiKey = process.env.BUNNY_API_KEY

  if (!libraryId || !apiKey) {
    return NextResponse.json(
      { error: "Bunny Stream no configurado" },
      { status: 500 }
    )
  }

  // Create video in Bunny
  const response = await fetch(
    `https://video.bunnycdn.com/library/${libraryId}/videos`,
    {
      method: "POST",
      headers: {
        AccessKey: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title }),
    }
  )

  if (!response.ok) {
    return NextResponse.json(
      { error: "Error al crear video en Bunny" },
      { status: 500 }
    )
  }

  const video = await response.json()

  return NextResponse.json({
    video_id: video.guid,
    upload_url: `https://video.bunnycdn.com/library/${libraryId}/videos/${video.guid}`,
    library_id: libraryId,
    api_key: apiKey, // Needed for direct upload from client
  })
}
