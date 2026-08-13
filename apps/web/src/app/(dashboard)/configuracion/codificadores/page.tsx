"use client"

import { useState } from "react"
import { ArrowLeft, Plus, Pencil, Trash2, Tags, DollarSign, Ruler, Globe, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/shared/data-table"
import { useCodificadores } from "@/lib/queries"
import { type ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { toast } from "sonner"
import {
  crearMoneda, actualizarMoneda, eliminarMoneda,
  crearUnidadMedida, actualizarUnidadMedida, eliminarUnidadMedida,
  crearPais, actualizarPais, eliminarPais,
  crearCategoriaProducto, actualizarCategoriaProducto, eliminarCategoriaProducto,
} from "@/lib/actions/codificadores"

type CodificadorTab = "categorias" | "monedas" | "unidades" | "paises"

interface TabDef {
  key: CodificadorTab
  label: string
  icon: React.ElementType
}

const tabs: TabDef[] = [
  { key: "categorias", label: "Categorías", icon: Tags },
  { key: "monedas", label: "Monedas", icon: DollarSign },
  { key: "unidades", label: "Unidades de Medida", icon: Ruler },
  { key: "paises", label: "Países", icon: Globe },
]

interface EditState {
  id: string | null
  editing: boolean
}

function CodificadorForm<T extends Record<string, string | number | boolean | null | undefined>>({
  fields,
  onSubmit,
  onCancel,
  initial,
  loading,
}: {
  fields: Array<{ key: string; label: string; type?: string; required?: boolean; placeholder?: string }>
  onSubmit: (values: T) => Promise<void>
  onCancel: () => void
  initial?: T
  loading: boolean
}) {
  const [values, setValues] = useState<T>(initial ?? {} as T)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      await onSubmit(values)
      toast.success("Guardado correctamente")
      onCancel()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{initial ? "Editar" : "Nuevo"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((f) => (
              <div key={f.key} className="space-y-2">
                <label className="text-sm font-medium">{f.label}</label>
                <Input
                  type={f.type ?? "text"}
                  value={(values[f.key] as string) ?? ""}
                  onChange={(e) => setValues({ ...values, [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value })}
                  placeholder={f.placeholder}
                  required={f.required}
                />
              </div>
            ))}
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {initial ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function CategoriasTab() {
  const { data, refetch } = useCodificadores()
  const [edit, setEdit] = useState<EditState>({ id: null, editing: false })
  const [loading, setLoading] = useState(false)

  const columns: ColumnDef<{ id: string; nombre: string; descripcion: string | null; padre_id: string | null; activo: boolean; orden: number }>[] = [
    { accessorKey: "nombre", header: "Nombre" },
    { accessorKey: "descripcion", header: "Descripción", cell: ({ row }) => row.original.descripcion ?? "—" },
    {
      accessorKey: "activo", header: "Estado",
      cell: ({ row }) => row.original.activo ? <Badge variant="success">Activo</Badge> : <Badge variant="destructive">Inactivo</Badge>,
    },
    {
      accessorKey: "orden", header: "Orden",
      cell: ({ row }) => row.original.orden,
    },
    {
      id: "acciones",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => setEdit({ id: row.original.id, editing: true })}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={async () => { await eliminarCategoriaProducto(row.original.id); refetch() }}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ]

  const item = data?.categorias?.find((c) => c.id === edit.id)

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setEdit({ id: null, editing: true })}><Plus className="h-4 w-4" /> Nueva categoría</Button>
      </div>
      {edit.editing && (
        <CodificadorForm
          fields={[
            { key: "nombre", label: "Nombre", required: true },
            { key: "descripcion", label: "Descripción" },
            { key: "orden", label: "Orden", type: "number" },
          ]}
          initial={item ? { nombre: item.nombre, descripcion: item.descripcion ?? "", orden: item.orden } : undefined}
          onSubmit={async (values) => {
            setLoading(true)
            if (item) { await actualizarCategoriaProducto(item.id, values as unknown as Parameters<typeof actualizarCategoriaProducto>[1]) } else { await crearCategoriaProducto(values as unknown as Parameters<typeof crearCategoriaProducto>[0]) }
            setLoading(false)
            refetch()
          }}
          onCancel={() => setEdit({ id: null, editing: false })}
          loading={loading}
        />
      )}
      <DataTable columns={columns} data={data?.categorias ?? []} searchKey="nombre" searchPlaceholder="Buscar categorías..." emptyIcon={Tags} emptyTitle="Sin categorías" emptyDescription="No hay categorías de producto registradas." />
    </div>
  )
}

function MonedasTab() {
  const { data, refetch } = useCodificadores()
  const [edit, setEdit] = useState<EditState>({ id: null, editing: false })
  const [loading, setLoading] = useState(false)

  const columns: ColumnDef<{ id: string; codigo: string; nombre: string; simbolo: string | null; activo: boolean }>[] = [
    { accessorKey: "codigo", header: "Código" },
    { accessorKey: "nombre", header: "Nombre" },
    { accessorKey: "simbolo", header: "Símbolo", cell: ({ row }) => row.original.simbolo ?? "—" },
    {
      accessorKey: "activo", header: "Estado",
      cell: ({ row }) => row.original.activo ? <Badge variant="success">Activo</Badge> : <Badge variant="destructive">Inactivo</Badge>,
    },
    {
      id: "acciones",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => setEdit({ id: row.original.id, editing: true })}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={async () => { await eliminarMoneda(row.original.id); refetch() }}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ]

  const item = data?.monedas?.find((m) => m.id === edit.id)

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setEdit({ id: null, editing: true })}><Plus className="h-4 w-4" /> Nueva moneda</Button>
      </div>
      {edit.editing && (
        <CodificadorForm
          fields={[
            { key: "codigo", label: "Código", required: true, placeholder: "Ej: USD" },
            { key: "nombre", label: "Nombre", required: true, placeholder: "Ej: Dólar estadounidense" },
            { key: "simbolo", label: "Símbolo", placeholder: "Ej: $" },
          ]}
          initial={item ? { codigo: item.codigo, nombre: item.nombre, simbolo: item.simbolo ?? "" } : undefined}
          onSubmit={async (values) => {
            setLoading(true)
            if (item) { await actualizarMoneda(item.id, values as unknown as Parameters<typeof actualizarMoneda>[1]) } else { await crearMoneda(values as unknown as Parameters<typeof crearMoneda>[0]) }
            setLoading(false)
            refetch()
          }}
          onCancel={() => setEdit({ id: null, editing: false })}
          loading={loading}
        />
      )}
      <DataTable columns={columns} data={data?.monedas ?? []} searchKey="nombre" searchPlaceholder="Buscar monedas..." emptyIcon={DollarSign} emptyTitle="Sin monedas" emptyDescription="No hay monedas registradas." />
    </div>
  )
}

function UnidadesTab() {
  const { data, refetch } = useCodificadores()
  const [edit, setEdit] = useState<EditState>({ id: null, editing: false })
  const [loading, setLoading] = useState(false)

  const columns: ColumnDef<{ id: string; codigo: string; nombre: string; categoria: string; activo: boolean }>[] = [
    { accessorKey: "codigo", header: "Código" },
    { accessorKey: "nombre", header: "Nombre" },
    {
      accessorKey: "categoria", header: "Categoría",
      cell: ({ row }) => <Badge variant="info">{row.original.categoria}</Badge>,
    },
    {
      accessorKey: "activo", header: "Estado",
      cell: ({ row }) => row.original.activo ? <Badge variant="success">Activo</Badge> : <Badge variant="destructive">Inactivo</Badge>,
    },
    {
      id: "acciones",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => setEdit({ id: row.original.id, editing: true })}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={async () => { await eliminarUnidadMedida(row.original.id); refetch() }}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ]

  const item = data?.unidadesMedida?.find((u) => u.id === edit.id)

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setEdit({ id: null, editing: true })}><Plus className="h-4 w-4" /> Nueva unidad</Button>
      </div>
      {edit.editing && (
        <CodificadorForm
          fields={[
            { key: "codigo", label: "Código", required: true, placeholder: "Ej: kg" },
            { key: "nombre", label: "Nombre", required: true, placeholder: "Ej: Kilogramo" },
            { key: "categoria", label: "Categoría", required: true, placeholder: "peso, volumen, unidad, longitud" },
          ]}
          initial={item ? { codigo: item.codigo, nombre: item.nombre, categoria: item.categoria } : undefined}
          onSubmit={async (values) => {
            setLoading(true)
            if (item) { await actualizarUnidadMedida(item.id, values as unknown as Parameters<typeof actualizarUnidadMedida>[1]) } else { await crearUnidadMedida(values as unknown as Parameters<typeof crearUnidadMedida>[0]) }
            setLoading(false)
            refetch()
          }}
          onCancel={() => setEdit({ id: null, editing: false })}
          loading={loading}
        />
      )}
      <DataTable columns={columns} data={data?.unidadesMedida ?? []} searchKey="nombre" searchPlaceholder="Buscar unidades..." emptyIcon={Ruler} emptyTitle="Sin unidades" emptyDescription="No hay unidades de medida registradas." />
    </div>
  )
}

function PaisesTab() {
  const { data, refetch } = useCodificadores()
  const [edit, setEdit] = useState<EditState>({ id: null, editing: false })
  const [loading, setLoading] = useState(false)

  const columns: ColumnDef<{ id: string; codigo: string; codigo_alpha3: string | null; nombre: string; nacionalidad: string | null; activo: boolean }>[] = [
    { accessorKey: "codigo", header: "ISO" },
    { accessorKey: "codigo_alpha3", header: "ISO-3", cell: ({ row }) => row.original.codigo_alpha3 ?? "—" },
    { accessorKey: "nombre", header: "Nombre" },
    { accessorKey: "nacionalidad", header: "Nacionalidad", cell: ({ row }) => row.original.nacionalidad ?? "—" },
    {
      accessorKey: "activo", header: "Estado",
      cell: ({ row }) => row.original.activo ? <Badge variant="success">Activo</Badge> : <Badge variant="destructive">Inactivo</Badge>,
    },
    {
      id: "acciones",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => setEdit({ id: row.original.id, editing: true })}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={async () => { await eliminarPais(row.original.id); refetch() }}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ]

  const item = data?.paises?.find((p) => p.id === edit.id)

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setEdit({ id: null, editing: true })}><Plus className="h-4 w-4" /> Nuevo país</Button>
      </div>
      {edit.editing && (
        <CodificadorForm
          fields={[
            { key: "codigo", label: "Código ISO", required: true, placeholder: "Ej: MX" },
            { key: "codigo_alpha3", label: "Código ISO-3", placeholder: "Ej: MEX" },
            { key: "nombre", label: "Nombre", required: true, placeholder: "Ej: México" },
            { key: "nacionalidad", label: "Gentilicio", placeholder: "Ej: mexicana" },
          ]}
          initial={item ? { codigo: item.codigo, codigo_alpha3: item.codigo_alpha3 ?? "", nombre: item.nombre, nacionalidad: item.nacionalidad ?? "" } : undefined}
          onSubmit={async (values) => {
            setLoading(true)
            if (item) { await actualizarPais(item.id, values as unknown as Parameters<typeof actualizarPais>[1]) } else { await crearPais(values as unknown as Parameters<typeof crearPais>[0]) }
            setLoading(false)
            refetch()
          }}
          onCancel={() => setEdit({ id: null, editing: false })}
          loading={loading}
        />
      )}
      <DataTable columns={columns} data={data?.paises ?? []} searchKey="nombre" searchPlaceholder="Buscar países..." emptyIcon={Globe} emptyTitle="Sin países" emptyDescription="No hay países registrados." />
    </div>
  )
}

export default function CodificadoresPage() {
  const [tab, setTab] = useState<CodificadorTab>("categorias")
  const { isLoading } = useCodificadores()

  if (isLoading) {
    return <div className="flex items-center justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/configuracion">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Codificadores</h1>
          <p className="text-sm text-muted-foreground">Catálogos base del sistema (solo administradores)</p>
        </div>
      </div>

      <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "categorias" && <CategoriasTab />}
      {tab === "monedas" && <MonedasTab />}
      {tab === "unidades" && <UnidadesTab />}
      {tab === "paises" && <PaisesTab />}
    </div>
  )
}
