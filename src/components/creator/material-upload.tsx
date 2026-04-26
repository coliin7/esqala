"use client"

import { useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Upload, FileText, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface MaterialFile {
  name: string
  url: string
  type: string
}

interface MaterialUploadProps {
  lessonId: string
  materials: MaterialFile[]
  onMaterialsChange: (materials: MaterialFile[]) => void
}

export function MaterialUpload({ lessonId, materials, onMaterialsChange }: MaterialUploadProps) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
    ]

    if (!allowedTypes.includes(file.type)) {
      toast.error("Solo se permiten archivos PDF, Word, Excel o texto")
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error("El archivo no puede superar 50MB")
      return
    }

    setUploading(true)

    try {
      const supabase = createClient()
      const fileName = `${lessonId}/${Date.now()}-${file.name}`

      const { error } = await supabase.storage
        .from("materials")
        .upload(fileName, file)

      if (error) {
        toast.error("Error al subir el archivo")
        setUploading(false)
        return
      }

      const { data: urlData } = supabase.storage
        .from("materials")
        .getPublicUrl(fileName)

      const newMaterial: MaterialFile = {
        name: file.name,
        url: urlData.publicUrl,
        type: file.type,
      }

      const updated = [...materials, newMaterial]
      onMaterialsChange(updated)
      toast.success("Material subido")
    } catch {
      toast.error("Error inesperado")
    }

    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function handleRemove(index: number) {
    const updated = materials.filter((_, i) => i !== index)
    onMaterialsChange(updated)
  }

  return (
    <div className="space-y-2">
      {materials.length > 0 && (
        <div className="space-y-1">
          {materials.map((material, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-md border px-3 py-2"
            >
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="truncate max-w-[200px]">{material.name}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleRemove(idx)}
              >
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
        className="hidden"
        onChange={handleFileSelect}
      />
      <Button
        variant="outline"
        size="sm"
        disabled={uploading}
        onClick={() => fileInputRef.current?.click()}
      >
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            Subiendo...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-1" />
            Agregar material
          </>
        )}
      </Button>
    </div>
  )
}
