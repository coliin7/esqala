import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from "lucide-react"

export default function ConfirmarEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Revisá tu email</CardTitle>
          <CardDescription className="text-base">
            Te enviamos un link de confirmación. Hacé click en el link para
            activar tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Si no lo ves, revisá la carpeta de spam o promociones.
          </p>
          <Button variant="outline" className="w-full" render={<Link href="/login" />}>
            Volver al login
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
