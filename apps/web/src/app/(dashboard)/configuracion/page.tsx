"use client"

import { Settings, Shield, Bell, Building, Users, Palette, ClipboardList, Tags, BadgeCheck, KeyRound } from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import Link from "next/link"

const secciones = [
  {
    icon: Building,
    titulo: "Empresa",
    desc: "Información de la empresa, logo, moneda por defecto",
    href: "/configuracion/empresa",
  },
  {
    icon: Users,
    titulo: "Usuarios y Roles",
    desc: "Gestión de usuarios, roles y permisos",
    href: "/configuracion/usuarios",
  },
  {
    icon: BadgeCheck,
    titulo: "Roles",
    desc: "Creación y edición de roles del sistema",
    href: "/configuracion/roles",
  },
  {
    icon: KeyRound,
    titulo: "Permisos",
    desc: "Catálogo de permisos disponibles para asignar",
    href: "/configuracion/permisos",
  },
  {
    icon: Shield,
    titulo: "Seguridad",
    desc: "Políticas de contraseñas, autenticación, sesiones",
    href: "/configuracion/seguridad",
  },
  {
    icon: Bell,
    titulo: "Notificaciones",
    desc: "Configuración de alertas y notificaciones",
    href: "/configuracion/notificaciones",
  },
  {
    icon: Palette,
    titulo: "Apariencia",
    desc: "Tema, colores, personalización visual",
    href: "/configuracion/apariencia",
  },
  {
    icon: ClipboardList,
    titulo: "Auditoría",
    desc: "Registro de cambios y actividad de usuarios",
    href: "/configuracion/auditoria",
  },
  {
    icon: Tags,
    titulo: "Codificadores",
    desc: "Monedas, unidades de medida, países, categorías",
    href: "/configuracion/codificadores",
  },
]

export default function ConfiguracionPage() {
  return (
    <div>
      <PageHeader title="Configuración" description="Ajustes del sistema" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {secciones.map((s) => (
          <Link key={s.titulo} href={s.href}>
            <Card className="cursor-pointer transition-all hover:shadow-md">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 mb-2">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">{s.titulo}</CardTitle>
                <CardDescription>{s.desc}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
