"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Users, BadgeCheck, XCircle, Plus, Loader2, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { DataTable } from "@/components/shared/data-table"
import { useUsuarios, useCrearUsuario, useRoles, useRolesUsuario, useActualizarUsuario, useEliminarUsuario } from "@/lib/queries"
import { type ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { toast } from "sonner"

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

function UsuarioModal({ usuario, onClose }: { usuario: UsuarioRow; onClose: () => void }) {
  const { data: roles } = useRoles()
  const { data: rolesUsuario } = useRolesUsuario(usuario.id)
  const { mutate: actualizar, isPending } = useActualizarUsuario()

  const [nombre, setNombre] = useState(usuario.nombre)
  const [apellido, setApellido] = useState(usuario.apellido)
  const [telefono, setTelefono] = useState(usuario.telefono ?? "")
  const [rolId, setRolId] = useState("")
  const [password, setPassword] = useState("")
  const [activo, setActivo] = useState(usuario.activo)
  const [error, setError] = useState("")
  const [synced, setSynced] = useState(false)

  useEffect(() => {
    if (rolesUsuario && !synced) {
      setRolId(rolesUsuario[0] ?? "")
      setSynced(true)
    }
  }, [rolesUsuario, synced])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    actualizar(
      {
        id: usuario.id,
        data: {
          nombre,
          apellido,
          telefono: telefono.trim() || null,
          activo,
          rol_id: rolId || null,
          password: password || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("Usuario actualizado")
          onClose()
        },
        onError: (err) => setError(err.message),
      }
    )
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar usuario</DialogTitle>
          <DialogDescription>{usuario.email}</DialogDescription>
        </DialogHeader>
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
            <p className="text-sm font-medium">Teléfono</p>
            <Input value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="+58 412 000 0000" />
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
            <p className="text-sm font-medium">Nueva contraseña</p>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Dejar en blanco para no cambiar"
              minLength={6}
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={activo}
              onChange={(e) => setActivo(e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            Usuario activo
          </label>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Guardar cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function UsuariosPage() {
  const { data: usuarios, isLoading } = useUsuarios()
  const { data: roles } = useRoles()
  const { mutate: crear, isPending } = useCrearUsuario()
  const { mutate: eliminar } = useEliminarUsuario()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<UsuarioRow | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
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

  const handleEliminar = (usuario: UsuarioRow) => {
    if (!confirm(`¿Eliminar al usuario "${usuario.nombre} ${usuario.apellido}"?`)) return
    setDeleting(usuario.id)
    eliminar(usuario.id, {
      onSuccess: () => { toast.success("Usuario eliminado"); setDeleting(null) },
      onError: (err) => { toast.error(err.message); setDeleting(null) },
    })
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
          columns={[
            ...columns,
            {
              id: "acciones",
              header: "",
              cell: ({ row }) => (
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setEditing(row.original)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEliminar(row.original)}
                    disabled={deleting === row.original.id}
                  >
                    {deleting === row.original.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                  </Button>
                </div>
              ),
            },
          ]}
          data={usuarios ?? []}
          searchKey="email"
          searchPlaceholder="Buscar usuarios..."
          emptyIcon={Users}
          emptyTitle="No hay usuarios"
          emptyDescription="No se encontraron usuarios registrados."
        />
      )}

      {editing && <UsuarioModal usuario={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}
