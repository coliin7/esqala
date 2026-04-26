"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { updateProfile, updatePassword } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import type { Profile } from "@/types"

export default function PerfilPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const loadProfile = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    setProfile(data as Profile | null)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  async function handleSaveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData(e.currentTarget)
    const result = await updateProfile(formData)
    if (result.error) toast.error(result.error)
    else toast.success("Perfil actualizado")
    setSaving(false)
  }

  async function handleChangePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSavingPassword(true)
    const formData = new FormData(e.currentTarget)
    const result = await updatePassword(formData)
    if (result.error) toast.error(result.error)
    else {
      toast.success("Contraseña actualizada")
      e.currentTarget.reset()
    }
    setSavingPassword(false)
  }

  if (loading) return <div className="text-muted-foreground">Cargando...</div>
  if (!profile) return <div className="text-destructive">Error cargando perfil</div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Mi perfil</h1>

      {/* Profile info */}
      <Card>
        <CardHeader>
          <CardTitle>Información personal</CardTitle>
          <CardDescription>
            {profile.role === "creator"
              ? "Esta información se muestra en tus cursos"
              : "Tu información de cuenta"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display_name">Nombre</Label>
              <Input
                id="display_name"
                name="display_name"
                defaultValue={profile.display_name}
                required
              />
            </div>

            {profile.role === "creator" && (
              <div className="space-y-2">
                <Label htmlFor="brand_name">Nombre de tu marca/escuela</Label>
                <Input
                  id="brand_name"
                  name="brand_name"
                  defaultValue={profile.brand_name || ""}
                  placeholder="Ej: Academia de Marketing Digital"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="avatar_url">URL de avatar</Label>
              <Input
                id="avatar_url"
                name="avatar_url"
                defaultValue={profile.avatar_url || ""}
                placeholder="https://..."
              />
              <p className="text-xs text-muted-foreground">
                Pegá la URL de una imagen (podés usar Gravatar o cualquier host de imágenes)
              </p>
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={profile.email} disabled />
              <p className="text-xs text-muted-foreground">
                El email no se puede cambiar
              </p>
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change password */}
      <Card>
        <CardHeader>
          <CardTitle>Cambiar contraseña</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nueva contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirmar contraseña</Label>
              <Input
                id="confirm_password"
                name="confirm_password"
                type="password"
                placeholder="Repetí la contraseña"
                minLength={6}
                required
              />
            </div>
            <Button type="submit" variant="outline" disabled={savingPassword}>
              {savingPassword ? "Actualizando..." : "Cambiar contraseña"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
