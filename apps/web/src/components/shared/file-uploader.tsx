"use client"

import { useState, useRef, type DragEvent } from "react"
import { Upload, File, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface FileUploaderProps {
  onUpload: (file: File) => Promise<void>
  accept?: string
  maxSizeMB?: number
  className?: string
}

export function FileUploader({
  onUpload,
  accept = ".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx",
  maxSizeMB = 20,
  className,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true)
    } else {
      setIsDragging(false)
    }
  }

  const validateFile = (file: File) => {
    setError(null)
    const maxSize = maxSizeMB * 1024 * 1024
    if (file.size > maxSize) {
      setError(`El archivo excede el límite de ${maxSizeMB}MB`)
      return false
    }
    const allowedTypes = accept.split(",").map((t) => t.trim().toLowerCase())
    const ext = "." + file.name.split(".").pop()?.toLowerCase()
    if (!allowedTypes.includes(ext) && !allowedTypes.includes(file.type)) {
      setError(`Tipo de archivo no soportado. Formatos: ${accept}`)
      return false
    }
    return true
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && validateFile(file)) {
      setSelectedFile(file)
    }
  }

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && validateFile(file)) {
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    setIsUploading(true)
    setError(null)
    try {
      await onUpload(selectedFile)
      setSelectedFile(null)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-muted-foreground/50",
          error && "border-destructive"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleSelect}
        />
        {selectedFile ? (
          <div className="flex items-center gap-3">
            <File className="h-8 w-8 text-primary" />
            <div className="text-left">
              <p className="text-sm font-medium">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setSelectedFile(null)
                setError(null)
              }}
              className="rounded-full p-1 hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">
              Arrastra un archivo o haz clic para seleccionar
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {accept.replace(/,/g, ", ")} — Máx. {maxSizeMB}MB
            </p>
          </>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {selectedFile && (
        <Button
          onClick={handleUpload}
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {isUploading ? "Subiendo..." : "Subir archivo"}
        </Button>
      )}
    </div>
  )
}
