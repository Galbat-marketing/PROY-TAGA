"use client"

import { FileText, Download, User, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { VersionDocumento } from "@shared/types"

interface VersionHistoryProps {
  versiones: VersionDocumento[]
  onDownload: (version: VersionDocumento) => void
}

export function VersionHistory({ versiones, onDownload }: VersionHistoryProps) {
  if (!versiones?.length) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        No hay versiones registradas
      </div>
    )
  }

  return (
    <div className="relative space-y-0">
      {versiones.map((version, index) => (
        <div key={version.id} className="relative flex gap-4 pb-6 last:pb-0">
          <div className="flex flex-col items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-primary/5">
              <span className="text-xs font-bold text-primary">
                v{version.version}
              </span>
            </div>
            {index < versiones.length - 1 && (
              <div className="mt-1 w-0.5 flex-1 bg-border" />
            )}
          </div>
          <div className="flex-1 space-y-1 pt-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                Versión {version.version}
              </p>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDownload(version)}
                title="Descargar"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
            {version.notas_cambio && (
              <p className="text-xs text-muted-foreground">
                {version.notas_cambio}
              </p>
            )}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {version.subido_por_nombre && (
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {version.subido_por_nombre}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(version.created_at).toLocaleDateString()}
              </span>
              {version.file_size && (
                <span>
                  {(version.file_size / 1024 / 1024).toFixed(2)} MB
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
