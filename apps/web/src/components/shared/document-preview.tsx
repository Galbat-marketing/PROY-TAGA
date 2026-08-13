"use client"

import { useState } from "react"
import { FileText, Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DocumentPreviewProps {
  url: string | null
  fileName: string
  fileType?: string | null
  onDownload?: () => void
}

export function DocumentPreview({
  url,
  fileName,
  fileType,
  onDownload,
}: DocumentPreviewProps) {
  const [isLoading, setIsLoading] = useState(true)

  if (!url) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-muted/30 py-16">
        <FileText className="mb-3 h-12 w-12 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Vista previa no disponible</p>
      </div>
    )
  }

  const isPDF = fileType === "application/pdf" || fileName.endsWith(".pdf")
  const isImage =
    fileType?.startsWith("image/") ||
    /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName)

  return (
    <div className="space-y-3">
      {isPDF ? (
        <div className="relative overflow-hidden rounded-xl border border-border">
          {isLoading && (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
          <iframe
            src={url}
            className="h-[500px] w-full"
            onLoad={() => setIsLoading(false)}
            title={fileName}
          />
        </div>
      ) : isImage ? (
        <div className="relative overflow-hidden rounded-xl border border-border">
          {isLoading && (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
          <img
            src={url}
            alt={fileName}
            className="max-h-[500px] w-full object-contain"
            onLoad={() => setIsLoading(false)}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-muted/30 py-16">
          <FileText className="mb-3 h-12 w-12 text-primary" />
          <p className="text-sm font-medium">{fileName}</p>
          <p className="text-xs text-muted-foreground">
            Vista previa no disponible para este tipo de archivo
          </p>
        </div>
      )}
      {onDownload && (
        <Button variant="outline" className="w-full" onClick={onDownload}>
          <Download className="h-4 w-4" />
          Descargar archivo
        </Button>
      )}
    </div>
  )
}
