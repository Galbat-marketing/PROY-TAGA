"use client"

import { useState } from "react"
import { Shield, Plus, Pencil, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { usePermisos, useCrearPermiso, useActualizarPermiso, useEliminarPermiso } from "@/lib/queries"
import { type ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"

interface PermisoRow {
  id: string
  codigo: string
  nombre: string
  modulo: string
  accion: string
}

const columns: ColumnDef<PermisoRow>[] = [
  { accessorKey: "codigo", header: "Código", cell: ({ row }) => <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">{row.original.codigo}</code> },
  { accessorKey: "nombre", header: "Nombre" },
  { accessorKey: "modulo", header: "Módulo", cell: ({ row }) => <span className="text-xs font-medium uppercase text-muted-foreground">{row.original.modulo}</span> },
  { accessorKey: "accion", header: "Acción", cell: ({ row }) => <span className="capitalize">{row.original.accion}</span> },
]

type ModalMode = "crear" | "editar" | null

function PermisoModal({
  mode,
  permiso,
  onClose,
}: {
  mode: ModalMode
  permiso?: PermisoRow
  onClose: () => void
}) {
  const crearPermiso = useCrearPermiso()
  const actualizarPermiso = useActualizarPermiso()
  const [saving, setSaving] = useState(false)
  const [codigo, setCodigo] = useState(permiso?.codigo ?? "")
  const [nombre, setNombre] = useState(permiso?.nombre ?? "")
  const [modulo, setModulo] = useState(permiso?.modulo ?? "")
  const [accion, setAccion] = useState(permiso?.accion ?? "read")

  async function handleSave() {
    if (!codigo.trim() || !nombre.trim() || !modulo.trim()) {
      toast.error("Código, nombre y módulo son obligatorios")
      return
    }
    setSaving(true)
    try {
      const data = { codigo: codigo.trim(), nombre: nombre.trim(), modulo: modulo.trim(), accion }
      if (mode === "crear") await crearPermiso.mutateAsync(data)
      else if (permiso) await actualizarPermiso.mutateAsync({ id: permiso.id, data })
      toast.success(mode === "crear" ? "Permiso creado" : "Permiso actualizado")
      onClose()
    } catch (e) { toast.error((e as Error).message) }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-xl">
        <h2 className="text-lg font-semibold mb-4">{mode === "crear" ? "Nuevo Permiso" : "Editar Permiso"}</h2>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Código</label>
            <Input value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Ej: productos:read" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Nombre</label>
            <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Ver productos" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Módulo</label>
              <Input value={modulo} onChange={(e) => setModulo(e.target.value)} placeholder="Ej: productos" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Acción</label>
              <select value={accion} onChange={(e) => setAccion(e.target.value)}
                className="flex h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option value="read">read</option>
                <option value="write">write</option>
                <option value="delete">delete</option>
                <option value="approve">approve</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "crear" ? "Crear permiso" : "Guardar cambios"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function PermisosPage() {
  const { data: permisos, isLoading } = usePermisos()
  const eliminarPermiso = useEliminarPermiso()
  const [modal, setModal] = useState<{ mode: ModalMode; permiso?: PermisoRow }>({ mode: null })
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleEliminar(id: string, codigo: string) {
    if (!confirm(`¿Eliminar el permiso "${codigo}"?`)) return
    setDeleting(id)
    try {
      await eliminarPermiso.mutateAsync(id)
      toast.success("Permiso eliminado")
    } catch (e) { toast.error((e as Error).message) }
    finally { setDeleting(null) }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
  }

  return (
    <div>
      <PageHeader title="Permisos del Sistema" description="Catálogo de permisos disponibles para asignar a roles">
        <Button onClick={() => setModal({ mode: "crear" })}>
          <Plus className="h-4 w-4" /> Nuevo permiso
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
                    <Button variant="ghost" size="sm" onClick={() => setModal({ mode: "editar", permiso: row.original })}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => handleEliminar(row.original.id, row.original.codigo)}
                      disabled={deleting === row.original.id}
                    >
                      {deleting === row.original.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                    </Button>
                  </div>
                ),
              },
            ]}
            data={permisos ?? []}
            searchKey="nombre"
            searchPlaceholder="Buscar permisos..."
            emptyIcon={Shield}
            emptyTitle="No hay permisos"
            emptyDescription="Crea un nuevo permiso para comenzar."
          />
        </CardContent>
      </Card>

      {modal.mode && <PermisoModal mode={modal.mode} permiso={modal.permiso} onClose={() => setModal({ mode: null })} />}
    </div>
  )
}
