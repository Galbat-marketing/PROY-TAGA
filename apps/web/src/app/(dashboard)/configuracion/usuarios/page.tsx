"use client"

import { useState } from "react"
import { ArrowLeft, Users, BadgeCheck, XCircle, Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/shared/data-table"
import { useUsuarios, useCrearUsuario, useRoles } from "@/lib/queries"
import { type ColumnDef } from "@tanstack/react-table"
import Link from "next/link"

interface UsuarioRow {
  id: string
  email: string
  nombre: string
  apellido: string
  telefono: string | null
  activo: boolean
  ultimo_acceso: string | null
  created_at: string
}

const columns: ColumnDef<UsuarioRow>[] = [
  {
    accessorKey: "nombre",
    header: "Usuario",
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.nombre} {row.original.apellido}</p>
        <p className="text-xs text-muted-foreground">{row.original.email}</p>
      </div>
    ),
  },
  { accessorKey: "telefono", header: "Teléfono", cell: ({ row }) => row.original.telefono ?? "—" },
  {
    accessorKey: "activo",
    header: "Estado",
    cell: ({ row }) =>
      row.original.activo
        ? <BadgeCheck className="h-5 w-5 text-success" />
        : <XCircle className="h-5 w-5 text-destructive" />,
  },
  {
    accessorKey: "ultimo_acceso",
    header: "Último acceso",
    cell: ({ row }) =>
      row.original.ultimo_acceso
        ? new Date(row.original.ultimo_acceso).toLocaleDateString()
        : "Nunca",
  },
  {
    accessorKey: "created_at",
    header: "Creado",
    cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
  },
]

export default function UsuariosPage() {
  const { data: usuarios, isLoading } = useUsuarios()
  const { data: roles } = useRoles()
  const { mutate: crear, isPending } = useCrearUsuario()
  const [showForm, setShowForm] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [nombre, setNombre] = useState("")
  const [apellido, setApellido] = useState("")
  const [rolId, setRolId] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    crear(
      { email, password, nombre, apellido, rol_id: rolId || undefined },
      {
        onSuccess: () => {
          setShowForm(false)
          setEmail("")
          setPassword("")
          setNombre("")
          setApellido("")
          setRolId("")
        },
        onError: (err) => setError(err.message),
      }
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/configuracion">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Usuarios y Roles</h1>
            <p className="text-sm text-muted-foreground">Gestión de usuarios del sistema</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" /> Nuevo usuario
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Crear nuevo usuario</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Nombre</p>
                  <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre" required />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Apellido</p>
                  <Input value={apellido} onChange={(e) => setApellido(e.target.value)} placeholder="Apellido" required />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Email</p>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" required />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Rol</p>
                <select
                  value={rolId}
                  onChange={(e) => setRolId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Sin rol</option>
                  {roles?.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nombre} — {r.descripcion}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Contraseña</p>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                <Button type="submit" disabled={isPending} className="gap-2">
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Crear usuario
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={usuarios ?? []}
          searchKey="email"
          searchPlaceholder="Buscar usuarios..."
          emptyIcon={Users}
          emptyTitle="No hay usuarios"
          emptyDescription="No se encontraron usuarios registrados."
        />
      )}
    </div>
  )
}
