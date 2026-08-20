"use client"

import { Download, FileSpreadsheet, FileText, FileType } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useReporte } from "@/lib/queries"
import { toast } from "sonner"
import { useState } from "react"

export function ExportButton({ 
  tipo, 
  filtro, 
  className 
}: { 
  tipo: string
  filtro?: Record<string, unknown>
  className?: string
}) {
  const [isLoading, setIsLoading] = useState(false)
  const { mutateAsync: generarReporte, isPending } = useReporte()

  const handleExport = async (formato: "excel" | "csv" | "pdf") => {
    setIsLoading(true)
    try {
      const { blob, fileName } = await generarReporte({ tipo, formato, filtro })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast.success(`Reporte ${formato.toUpperCase()} descargado`)
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={className}
          disabled={isLoading || isPending}
        >
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport("excel")}>
          <FileSpreadsheet className="h-4 w-4" />
          <span>Excel (.xlsx)</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("csv")}>
          <FileText className="h-4 w-4" />
          <span>CSV (.csv)</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("pdf")}>
          <FileType className="h-4 w-4" />
          <span>PDF (.pdf)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}