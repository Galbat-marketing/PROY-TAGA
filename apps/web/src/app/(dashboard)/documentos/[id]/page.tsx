"use client"

import { useRouter, useParams } from "next/navigation"
import {
  ArrowLeft,
  FileText,
  Upload,
  Download,
  BadgeCheck,
  Trash2,
  History,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/shared/page-header"
import { FileUploader } from "@/components/shared/file-uploader"
import { VersionHistory } from "@/components/shared/version-history"
import { DocumentPreview } from "@/components/shared/document-preview"
import { useDocumento, useVersiones, useHistorial } from "@/lib/queries"
import { subirArchivo, obtenerUrlDescarga, firmarDocumento, eliminarDocumento } from "@/lib/actions/documentos"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import type { VersionDocumento } from "@shared/types"

export default function DocumentoDetailPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const params = useParams()
  const id = params.id as string
  const { data: documento, isLoading, refetch } = useDocumento(id)
  const { data: versiones, refetch: refetchVersiones } = useVersiones(id)
  const { data: historial } = useHistorial(id)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  if (isLoading) {
    return <div className="flex items-center justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
  }

  if (!documento) {
    return <div className="py-16 text-center text-muted-foreground">Documento no encontrado</div>
  }

  const handleUpload = async (file: File) => {
    await subirArchivo(id, file)
    toast.success("Archivo subido correctamente")
    refetch()
    refetchVersiones()
  }

  const handleDownload = async (version: VersionDocumento) => {
    try {
      const url = await obtenerUrlDescarga(version.storage_path)
      window.open(url, "_blank")
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  const handleDownloadCurrent = async () => {
    if (!documento.storage_path) {
      toast.error("No hay archivo asociado")
      return
    }
    try {
      const url = await obtenerUrlDescarga(documento.storage_path)
      setPreviewUrl(url)
      window.open(url, "_blank")
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  const handleFirmar = async () => {
    try {
      await firmarDocumento(id)
      toast.success("Documento firmado correctamente")
      refetch()
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  const handlePreview = async () => {
    if (!documento.storage_path) {
      toast.error("No hay archivo asociado")
      return
    }
    try {
      const url = await obtenerUrlDescarga(documento.storage_path)
      setPreviewUrl(url)
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  const handleEliminar = async () => {
    if (!confirm("¿Eliminar este documento? Esta acción no se puede deshacer.")) return
    try {
      await eliminarDocumento(id)
      toast.success("Documento eliminado")
      await queryClient.invalidateQueries({ queryKey: ["documentos"], refetchType: "all" })
      router.push("/documentos")
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={documento.nombre}
        description={documento.descripcion ?? "Sin descripción"}
      >
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Tipo:</span>{" "}
                <Badge variant="info">{documento.tipo_documento}</Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Versión actual:</span>{" "}
                <span className="font-mono font-medium">v{documento.version_actual}</span>
              </div>
              {documento.cliente_nombre && (
                <div>
                  <span className="text-muted-foreground">Cliente:</span>{" "}
                  <span className="font-medium">{documento.cliente_nombre}</span>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Firmado:</span>{" "}
                {documento.firmado ? (
                  <Badge variant="success">Sí</Badge>
                ) : (
                  <Badge variant="neutral">No</Badge>
                )}
              </div>
              {documento.file_size && (
                <div>
                  <span className="text-muted-foreground">Tamaño:</span>{" "}
                  <span className="font-medium">
                    {(documento.file_size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              )}
              {documento.file_type && (
                <div>
                  <span className="text-muted-foreground">Tipo MIME:</span>{" "}
                  <span className="font-medium">{documento.file_type}</span>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Creado:</span>{" "}
                <span className="font-medium">
                  {new Date(documento.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader><CardTitle>Acciones</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {documento.storage_path && (
              <Button className="w-full" variant="secondary" onClick={handlePreview}>
                <FileText className="h-4 w-4" /> Vista previa
              </Button>
            )}
            {documento.storage_path && (
              <Button className="w-full" variant="secondary" onClick={handleDownloadCurrent}>
                <Download className="h-4 w-4" /> Descargar
              </Button>
            )}
            {!documento.firmado && (
              <Button className="w-full" onClick={handleFirmar}>
                <BadgeCheck className="h-4 w-4" /> Firmar documento
              </Button>
            )}
            <Button className="w-full" variant="ghost" onClick={handleEliminar}>
              <Trash2 className="h-4 w-4" /> Eliminar
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Preview */}
      {previewUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Vista Previa</CardTitle>
          </CardHeader>
          <CardContent>
            <DocumentPreview
              url={previewUrl}
              fileName={documento.nombre}
              fileType={documento.file_type}
            />
          </CardContent>
        </Card>
      )}

      {/* Tabs: Versions + Upload + History */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Versiones</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="versiones">
            <TabsList>
              <TabsTrigger value="versiones" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Versiones
              </TabsTrigger>
              <TabsTrigger value="subir" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Subir nueva versión
              </TabsTrigger>
              <TabsTrigger value="historial" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Historial
              </TabsTrigger>
            </TabsList>
            <TabsContent value="versiones" className="pt-4">
              <VersionHistory
                versiones={versiones ?? []}
                onDownload={handleDownload}
              />
            </TabsContent>
            <TabsContent value="subir" className="pt-4">
              <FileUploader onUpload={handleUpload} />
            </TabsContent>
            <TabsContent value="historial" className="pt-4">
              {!historial?.length ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No hay eventos registrados
                </div>
              ) : (
                <div className="space-y-3">
                  {historial.map((evento) => (
                    <div key={evento.id} className="flex items-start gap-3 rounded-lg border border-border bg-muted/20 p-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium capitalize">
                          {evento.accion.replace(/_/g, " ")}
                        </p>
                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                          {evento.usuario_nombre && (
                            <span>{evento.usuario_nombre}</span>
                          )}
                          <span>
                            {new Date(evento.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
