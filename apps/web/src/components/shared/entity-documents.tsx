"use client"

import { useState } from "react"
import Link from "next/link"
import { FileText, Plus, Download, BadgeCheck, Loader2, FileArchive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { FileUploader } from "@/components/shared/file-uploader"
import { useDocumentosPorEntidad } from "@/lib/queries"
import { crearDocumento, subirArchivo, obtenerUrlDescarga } from "@/lib/actions/documentos"
import { TIPOS_DOCUMENTO, TIPO_COLOR, formatFileSize } from "@/lib/documento-utils"
import { toast } from "sonner"

export type EntidadDocumento = "cliente" | "proveedor" | "producto" | "oferta" | "contenedor" | "expediente"

interface EntityDocumentsProps {
  entidad: EntidadDocumento
  entityId: string
}

const TITULO_ENTIDAD: Record<EntidadDocumento, string> = {
  cliente: "Cliente",
  proveedor: "Proveedor",
  producto: "Producto",
  oferta: "Oferta",
  contenedor: "Contenedor",
  expediente: "Expediente",
}

export function EntityDocuments({ entidad, entityId }: EntityDocumentsProps) {
  const { data: documentos, isLoading } = useDocumentosPorEntidad(entidad, entityId)

  const [open, setOpen] = useState(false)
  const [nombre, setNombre] = useState("")
  const [tipoDocumento, setTipoDocumento] = useState("adjunto")
  const [descripcion, setDescripcion] = useState("")
  const [documentoId, setDocumentoId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  function resetForm() {
    setNombre("")
    setTipoDocumento("adjunto")
    setDescripcion("")
    setDocumentoId(null)
  }

  async function handleCrear(e: React.FormEvent) {
    e.preventDefault()
    if (!nombre.trim()) {
      toast.error("El nombre es requerido")
      return
    }
    setIsCreating(true)
    try {
      const doc = await crearDocumento({
        nombre: nombre.trim(),
        tipo_documento: tipoDocumento,
        descripcion: descripcion.trim() || null,
        [`${entidad}_id`]: entityId,
        tags: undefined,
      })
      setDocumentoId(doc.id)
      toast.success("Documento creado. Ahora puedes subir un archivo.")
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setIsCreating(false)
    }
  }

  async function handleUpload(file: File) {
    if (!documentoId) return
    await subirArchivo(documentoId, file)
    toast.success("Documento subido correctamente")
    setOpen(false)
    resetForm()
  }

  async function handleDescargar(storagePath: string) {
    try {
      const url = await obtenerUrlDescarga(storagePath)
      window.open(url, "_blank")
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Documentos</CardTitle>
              <p className="text-sm text-muted-foreground">
                {documentos?.length ? `${documentos.length} documento(s)` : "Sin documentos"} de este {TITULO_ENTIDAD[entidad].toLowerCase()}
              </p>
            </div>
          </div>
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Nuevo documento
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : !documentos?.length ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border px-6 py-10 text-center">
            <FileArchive className="mb-2 h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No hay documentos vinculados a este {TITULO_ENTIDAD[entidad].toLowerCase()}.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {documentos.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between gap-3 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <Link
                      href={`/documentos/${doc.id}`}
                      className="block truncate font-medium hover:text-primary transition-colors"
                    >
                      {doc.nombre}
                    </Link>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant={TIPO_COLOR[doc.tipo_documento] ?? "neutral"}>{doc.tipo_documento}</Badge>
                      <span className="font-mono">v{doc.version_actual}</span>
                      {doc.firmado && <BadgeCheck className="h-4 w-4 text-success" />}
                      <span>{formatFileSize(doc.file_size)}</span>
                      <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!doc.storage_path}
                  onClick={() => handleDescargar(doc.storage_path)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo documento</DialogTitle>
            <DialogDescription>
              Documento vinculado a este {TITULO_ENTIDAD[entidad].toLowerCase()}.
            </DialogDescription>
          </DialogHeader>
          {!documentoId ? (
            <form onSubmit={handleCrear} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre *</label>
                <Input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Contrato de compra"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de documento</label>
                <select
                  value={tipoDocumento}
                  onChange={(e) => setTipoDocumento(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {TIPOS_DOCUMENTO.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Descripción</label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Descripción opcional"
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <Button type="submit" disabled={isCreating} className="w-full">
                {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
                {isCreating ? "Creando..." : "Crear documento"}
              </Button>
            </form>
          ) : (
            <FileUploader onUpload={handleUpload} />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
