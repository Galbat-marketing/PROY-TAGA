"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, Save, FileArchive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { FileUploader } from "@/components/shared/file-uploader"
import { crearDocumento, subirArchivo } from "@/lib/actions/documentos"
import { TIPOS_DOCUMENTO } from "@/lib/documento-utils"
import { toast } from "sonner"
import { useState } from "react"

export default function NuevoDocumentoPage() {
  const router = useRouter()
  const [nombre, setNombre] = useState("")
  const [tipoDocumento, setTipoDocumento] = useState("adjunto")
  const [descripcion, setDescripcion] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [documentoId, setDocumentoId] = useState<string | null>(null)

  async function handleCrear(e: React.FormEvent) {
    e.preventDefault()
    if (!nombre.trim()) {
      toast.error("El nombre es requerido")
      return
    }
    setIsSubmitting(true)
    try {
      const doc = await crearDocumento({
        nombre: nombre.trim(),
        tipo_documento: tipoDocumento,
        descripcion: descripcion.trim() || null,
        tags: undefined,
      })
      setDocumentoId(doc.id)
      toast.success("Documento creado. Ahora puedes subir un archivo.")
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleUpload(file: File) {
    if (!documentoId) return
    try {
      await subirArchivo(documentoId, file)
      toast.success("Documento creado y archivo subido correctamente")
      router.push(`/documentos/${documentoId}`)
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Nuevo documento" description="Registra un documento con control de versiones">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información del documento</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCrear} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre *</label>
                <Input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Contrato de importación #123"
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
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Descripción</label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Descripción opcional del documento"
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                <Save className="h-4 w-4" />
                {isSubmitting ? "Creando..." : "Crear documento"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subir archivo</CardTitle>
          </CardHeader>
          <CardContent>
            {documentoId ? (
              <FileUploader onUpload={handleUpload} />
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border px-6 py-16 text-center">
                <FileArchive className="mb-3 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Primero crea el documento para habilitar la carga de archivos
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
