"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus, FileArchive, FileText, BadgeCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { useDocumentos, useClientes, useProveedores, useProductos, useOfertas } from "@/lib/queries"
import { TIPOS_DOCUMENTO, TIPO_COLOR, formatFileSize } from "@/lib/documento-utils"
import { type ColumnDef } from "@tanstack/react-table"
import type { Documento } from "@shared/types"

type EntidadFiltro = "" | "cliente" | "proveedor" | "producto" | "oferta"

const ENTIDADES: { value: EntidadFiltro; label: string }[] = [
  { value: "", label: "Todas las entidades" },
  { value: "cliente", label: "Cliente" },
  { value: "proveedor", label: "Proveedor" },
  { value: "producto", label: "Producto" },
  { value: "oferta", label: "Oferta" },
]

const selectCls = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

export default function DocumentosPage() {
  const router = useRouter()
  const [tipoDocumento, setTipoDocumento] = useState("")
  const [entidad, setEntidad] = useState<EntidadFiltro>("")
  const [entidadId, setEntidadId] = useState("")

  const { data: clientes } = useClientes()
  const { data: proveedores } = useProveedores()
  const { data: productos } = useProductos()
  const { data: ofertas } = useOfertas()

  const { data: documentos, isLoading } = useDocumentos({
    tipo_documento: tipoDocumento || undefined,
    cliente_id: entidad === "cliente" && entidadId ? entidadId : undefined,
    proveedor_id: entidad === "proveedor" && entidadId ? entidadId : undefined,
    producto_id: entidad === "producto" && entidadId ? entidadId : undefined,
    oferta_id: entidad === "oferta" && entidadId ? entidadId : undefined,
  })

  function handleEntidadChange(value: string) {
    setEntidad(value as EntidadFiltro)
    setEntidadId("")
  }

  const opcionesEntidad =
    entidad === "cliente" ? clientes?.map((c) => ({ value: c.id, label: c.nombre })) ?? []
    : entidad === "proveedor" ? proveedores?.map((p) => ({ value: p.id, label: p.nombre })) ?? []
    : entidad === "producto" ? productos?.map((p) => ({ value: p.id, label: `${p.codigo} — ${p.nombre}` })) ?? []
    : entidad === "oferta" ? ofertas?.map((o) => ({ value: o.id, label: `${o.folio} — ${o.cliente_nombre ?? ""}` })) ?? []
    : []

  const columns: ColumnDef<Documento>[] = [
    {
      accessorKey: "nombre",
      header: "Nombre",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <div>
            <Link
              href={`/documentos/${row.original.id}`}
              className="font-medium hover:text-primary transition-colors"
            >
              {row.original.nombre}
            </Link>
            {row.original.descripcion && (
              <p className="text-xs text-muted-foreground truncate max-w-xs">{row.original.descripcion}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "tipo_documento",
      header: "Tipo",
      cell: ({ row }) => (
        <Badge variant={TIPO_COLOR[row.original.tipo_documento] ?? "neutral"}>
          {row.original.tipo_documento}
        </Badge>
      ),
    },
    {
      accessorKey: "cliente_nombre",
      header: "Cliente",
      cell: ({ row }) => row.original.cliente_nombre ?? "—",
    },
    {
      accessorKey: "proveedor_nombre",
      header: "Proveedor",
      cell: ({ row }) => row.original.proveedor_nombre ?? "—",
    },
    {
      accessorKey: "producto_nombre",
      header: "Producto",
      cell: ({ row }) => row.original.producto_nombre ?? "—",
    },
    {
      accessorKey: "oferta_folio",
      header: "Oferta",
      cell: ({ row }) => row.original.oferta_folio ?? "—",
    },
    {
      accessorKey: "version_actual",
      header: "Versión",
      cell: ({ row }) => (
        <span className="font-mono text-xs">v{row.original.version_actual}</span>
      ),
    },
    {
      accessorKey: "firmado",
      header: "Firmado",
      cell: ({ row }) => (
        row.original.firmado ? (
          <BadgeCheck className="h-5 w-5 text-success" />
        ) : (
          <span className="text-muted-foreground">—</span>
        )
      ),
    },
    {
      accessorKey: "file_size",
      header: "Tamaño",
      cell: ({ row }) => formatFileSize(row.original.file_size),
    },
    {
      accessorKey: "created_at",
      header: "Subido",
      cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Documentos"
        description="Gestión documental con control de versiones"
      >
        <Button onClick={() => router.push("/documentos/nuevo")}>
          <Plus className="h-4 w-4" />
          Nuevo documento
        </Button>
      </PageHeader>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Tipo de documento</label>
          <select value={tipoDocumento} onChange={(e) => setTipoDocumento(e.target.value)} className={selectCls}>
            <option value="">Todos los tipos</option>
            {TIPOS_DOCUMENTO.map((tipo) => (
              <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Entidad</label>
          <select value={entidad} onChange={(e) => handleEntidadChange(e.target.value)} className={selectCls}>
            {ENTIDADES.map((e) => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Relacionado a</label>
          <select
            value={entidadId}
            onChange={(e) => setEntidadId(e.target.value)}
            disabled={!entidad}
            className={selectCls}
          >
            <option value="">{entidad ? "Todos..." : "Selecciona una entidad"}</option>
            {opcionesEntidad.map((op) => (
              <option key={op.value} value={op.value}>{op.label}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={documentos ?? []}
          searchKey="nombre"
          searchPlaceholder="Buscar documentos..."
          emptyIcon={FileArchive}
          emptyTitle="No hay documentos"
          emptyDescription="Sube tu primer documento para comenzar."
        />
      )}
    </div>
  )
}
