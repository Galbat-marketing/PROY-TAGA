"use client"

import { ArrowLeft, Building, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function EmpresaPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/configuracion">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Empresa</h1>
          <p className="text-sm text-muted-foreground">Información de la compañía</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building className="h-4 w-4" /> Datos generales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium">Nombre de la empresa</p>
              <Input placeholder="Razón social" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">RFC</p>
              <Input placeholder="RFC" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Dirección</p>
            <Input placeholder="Dirección fiscal" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium">Email</p>
              <Input type="email" placeholder="correo@empresa.com" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Teléfono</p>
              <Input placeholder="+52 55 1234 5678" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Moneda por defecto</p>
            <Input defaultValue="USD" placeholder="USD, MXN, EUR" />
          </div>
          <div className="flex justify-end pt-2">
            <Button disabled className="gap-2">
              <Save className="h-4 w-4" /> Guardar cambios
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
