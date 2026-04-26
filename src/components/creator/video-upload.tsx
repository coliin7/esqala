"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Video, Loader2, CheckCircle2, X } from "lucide-react"
import { toast } from "sonner"

interface VideoUploadProps {
  lessonId: string
  currentVideoId: string | null
  onUploaded: (videoId: string) => void
}

export function VideoUpload({ lessonId, currentVideoId, onUploaded }: VideoUploadProps) {
  const [status, setStatus] = useState<"idle" | "creating" | "uploading" | "done">(
    currentVideoId ? "done" : "idle"
  )
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("video/")) {
      toast.error("Solo se permiten archivos de video")
      return
    }

    // Max 2GB
    if (file.size > 2 * 1024 * 1024 * 1024) {
      toast.error("El archivo no puede superar 2GB")
      return
    }

    setStatus("creating")

    try {
      // 1. Create video in Bunny via our API
      const createRes = await fetch("/api/bunny/create-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: file.name }),
      })

      if (!createRes.ok) {
        const err = await createRes.json()
        toast.error(err.error || "Error al crear video")
        setStatus("idle")
        return
      }

      const { video_id, upload_url, api_key } = await createRes.json()

      // 2. Upload file directly to Bunny
      setStatus("uploading")

      const xhr = new XMLHttpRequest()
      xhr.open("PUT", upload_url)
      xhr.setRequestHeader("AccessKey", api_key)

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setProgress(Math.round((event.loaded / event.total) * 100))
        }
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setStatus("done")
          setProgress(100)
          onUploaded(video_id)
          toast.success("Video subido correctamente")
        } else {
          toast.error("Error al subir el video")
          setStatus("idle")
        }
      }

      xhr.onerror = () => {
        toast.error("Error de conexión al subir el video")
        setStatus("idle")
      }

      xhr.send(file)
    } catch {
      toast.error("Error inesperado")
      setStatus("idle")
    }
  }

  if (status === "done") {
    return (
      <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950 px-3 py-2">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <span className="text-sm text-green-700 dark:text-green-300 flex-1">
          Video cargado
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => {
            setStatus("idle")
            setProgress(0)
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    )
  }

  if (status === "uploading") {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Subiendo video... {progress}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    )
  }

  if (status === "creating") {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Preparando...</span>
      </div>
    )
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleFileSelect}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-4 w-4 mr-1" />
        {currentVideoId ? "Reemplazar video" : "Subir video"}
      </Button>
    </div>
  )
}
