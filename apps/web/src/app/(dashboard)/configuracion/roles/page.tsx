"use client"

import { useState } from "react"
import { Shield, Plus, Pencil, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { useRoles, usePermisos, useRolesPermisos, useCrearRol, useActualizarRol, useEliminarRol } from "@/lib/queries"
import { type ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"

interface RolRow {
  id: string
  nombre: string
  descripcion: string
  jerarquia: number
}

const columns: ColumnDef<RolRow>[] = [
  { accessorKey: "nombre", header: "Rol", cell: ({ row }) => <span className="font-medium capitalize">{row.original.nombre}</span> },
  { accessorKey: "descripcion", header: "Descripción" },
  { accessorKey: "jerarquia", header: "Jerarquía" },
]

type ModalMode = "crear" | "editar" | null

function RolModal({
  mode,
  rol,
  onClose,
}: {
  mode: ModalMode
  rol?: RolRow
  onClose: () => void
}) {
  const { data: permisos } = usePermisos()
  const { data: rolesPermisos } = useRolesPermisos(rol?.id ?? null)
  const crearRol = useCrearRol()
  const actualizarRol = useActualizarRol()

  const [nombre, setNombre] = useState(rol?.nombre ?? "")
  const [descripcion, setDescripcion] = useState(rol?.descripcion ?? "")
  const [jerarquia, setJerarquia] = useState(rol?.jerarquia ?? 50)
  const [selectedPermisos, setSelectedPermisos] = useState<Set<string>>(new Set(rolesPermisos ?? []))
  const [saving, setSaving] = useState(false)

  // Sync selectedPermisos when rolesPermisos loads
  if (rolesPermisos && selectedPermisos.size === 0 && mode === "editar") {
    setSelectedPermisos(new Set(rolesPermisos))
  }

  if (!permisos || (mode === "editar" && !rolesPermisos)) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="rounded-xl bg-card p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
      </div>
    )
  }

  const grouped = permisos.reduce<Record<string, typeof permisos>>((acc, p) => {
    if (!acc[p.modulo]) acc[p.modulo] = []
    acc[p.modulo].push(p)
    return acc
  }, {})

  function togglePermiso(id: string) {
    setSelectedPermisos((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleSave() {
    if (!nombre.trim()) { toast.error("El nombre es obligatorio"); return }
    setSaving(true)
    try {
      const data = { nombre: nombre.trim(), descripcion: descripcion.trim(), jerarquia, permisos: Array.from(selectedPermisos) }
      if (mode === "crear") await crearRol.mutateAsync(data)
      else if (rol) await actualizarRol.mutateAsync({ id: rol.id, data })
      toast.success(mode === "crear" ? "Rol creado" : "Rol actualizado")
      onClose()
    } catch (e) { toast.error((e as Error).message) }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 pt-12">
      <div className="w-full max-w-xl rounded-xl bg-card p-6 shadow-xl">
        <h2 className="text-lg font-semibold mb-4">{mode === "crear" ? "Nuevo Rol" : "Editar Rol"}</h2>

        <div className="space-y-4 mb-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Nombre</label>
              <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: supervisor" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Jerarquía</label>
              <Input type="number" value={jerarquia} onChange={(e) => setJerarquia(Number(e.target.value))} />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Descripción</label>
            <Input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Ej: Supervisa equipo comercial" />
          </div>
        </div>

        <div className="space-y-1 mb-6">
          <label className="text-sm font-medium">Permisos del sistema</label>
          <p className="text-xs text-muted-foreground mb-3">Los permisos se aplican vía RLS en la base de datos.</p>
          <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-border p-3">
            {Object.entries(grouped).map(([modulo, perms]) => (
              <div key={modulo}>
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">{modulo}</p>
                <div className="ml-2 flex flex-wrap gap-2">
                  {perms.map((p) => (
                    <label
                      key={p.id}
                      className={`flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-colors ${
                        selectedPermisos.has(p.id) ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermisos.has(p.id)}
                        onChange={() => togglePermiso(p.id)}
                        className="hidden"
                      />
                      {p.nombre}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "crear" ? "Crear rol" : "Guardar cambios"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function RolesPage() {
  const { data: roles, isLoading } = useRoles()
  const eliminarRol = useEliminarRol()
  const [modal, setModal] = useState<{ mode: ModalMode; rol?: RolRow }>({ mode: null })
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleEliminar(id: string, nombre: string) {
    if (!confirm(`¿Eliminar el rol "${nombre}"?`)) return
    setDeleting(id)
    try {
      await eliminarRol.mutateAsync(id)
      toast.success("Rol eliminado")
    } catch (e) { toast.error((e as Error).message) }
    finally { setDeleting(null) }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
  }

  return (
    <div>
      <PageHeader title="Roles" description="Gestionar roles y sus permisos del sistema">
        <Button onClick={() => setModal({ mode: "crear" })}>
          <Plus className="h-4 w-4" /> Nuevo rol
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={[
              ...columns,
              {
                id: "acciones",
                header: "",
                cell: ({ row }) => (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setModal({ mode: "editar", rol: row.original })}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => handleEliminar(row.original.id, row.original.nombre)}
                      disabled={deleting === row.original.id}
                    >
                      {deleting === row.original.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                    </Button>
                  </div>
                ),
              },
            ]}
            data={roles ?? []}
            searchKey="nombre"
            searchPlaceholder="Buscar roles..."
            emptyIcon={Shield}
            emptyTitle="No hay roles"
            emptyDescription="Crea un nuevo rol para comenzar."
          />
        </CardContent>
      </Card>

      {modal.mode && <RolModal mode={modal.mode} rol={modal.rol} onClose={() => setModal({ mode: null })} />}
    </div>
  )
}
