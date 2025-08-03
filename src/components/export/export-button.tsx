import { useState } from "react"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Download, FileText, Table } from "lucide-react"
import { exportData, type ExportColumn, formatDataForExport } from "../../lib/export-utils"

interface ExportButtonProps {
  data: any[]
  columns: ExportColumn[]
  filename: string
  title: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
}

export function ExportButton({
  data,
  columns,
  filename,
  title,
  variant = "outline",
  size = "default"
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (format: 'csv' | 'pdf') => {
    if (data.length === 0) {
      alert('No data available to export')
      return
    }

    setIsExporting(true)
    
    try {
      const formattedData = formatDataForExport(data, columns)
      const success = exportData(format, {
        filename: `${filename}-${new Date().toISOString().split('T')[0]}`,
        title,
        columns,
        data: formattedData
      })

      if (success) {
        // Show success message (you could use a toast here)
        console.log(`✅ ${format.toUpperCase()} export completed successfully`)
      } else {
        alert(`Failed to export ${format.toUpperCase()}. Please try again.`)
      }
    } catch (error) {
      console.error('Export error:', error)
      alert(`Export failed: ${error}`)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          disabled={isExporting || data.length === 0}
        >
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          <Table className="mr-2 h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          <FileText className="mr-2 h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}