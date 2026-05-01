"use client"

import { useEffect, useRef } from "react"
import Hls from "hls.js"

const VIDEO_SRC =
  "https://stream.mux.com/T6oQJQ02cQ6N01TR6iHwZkKFkbepS34dkkIc9iukgy400g.m3u8"

const POSTER =
  "https://images.unsplash.com/photo-1647356191320-d7a1f80ca777?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGRhcmslMjB0ZWNobm9sb2d5JTIwbmV1cmFsJTIwbmV0d29ya3xlbnwxfHx8fDE3Njg5NzIyNTV8MA&ixlib=rb-4.1.0&q=80&w=1080"

export function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (Hls.isSupported()) {
      const hls = new Hls()
      hls.loadSource(VIDEO_SRC)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {})
      })
      return () => hls.destroy()
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari native HLS
      video.src = VIDEO_SRC
      video.addEventListener("loadedmetadata", () => {
        video.play().catch(() => {})
      })
    }
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Video */}
      <video
        ref={videoRef}
        poster={POSTER}
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

      {/* Top-left glow */}
      <div
        className="absolute rounded-full bg-blue-900/20 mix-blend-screen pointer-events-none"
        style={{
          top: "-20%",
          left: "20%",
          width: 600,
          height: 600,
          filter: "blur(120px)",
        }}
      />

      {/* Bottom-right glow */}
      <div
        className="absolute rounded-full bg-indigo-900/20 mix-blend-screen pointer-events-none"
        style={{
          bottom: "-10%",
          right: "20%",
          width: 500,
          height: 500,
          filter: "blur(120px)",
        }}
      />
    </div>
  )
}
