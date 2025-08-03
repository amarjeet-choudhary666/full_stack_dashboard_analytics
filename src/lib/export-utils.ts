import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Papa from 'papaparse'

export interface ExportColumn {
  key: string
  label: string
  width?: number
}

export interface ExportOptions {
  filename: string
  title?: string
  columns: ExportColumn[]
  data: any[]
}

export function exportToCSV(options: ExportOptions) {
  try {
    const csvData = options.data.map(row => {
      const csvRow: any = {}
      options.columns.forEach(col => {
        csvRow[col.label] = row[col.key] || ''
      })
      return csvRow
    })

    const csv = Papa.unparse(csvData)
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `${options.filename}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    return true
  } catch (error) {
    return false
  }
}

export function exportToPDF(options: ExportOptions) {
  try {
    const doc = new jsPDF()
    
    if (options.title) {
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text(options.title, 14, 22)
    }
    
    const timestamp = new Date().toLocaleString()
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Generated on: ${timestamp}`, 14, options.title ? 32 : 22)
    
    const tableColumns = options.columns.map(col => col.label)
    const tableRows = options.data.map(row => 
      options.columns.map(col => {
        const value = row[col.key]
        if (typeof value === 'number') {
          return value.toLocaleString()
        }
        if (value instanceof Date) {
          return value.toLocaleDateString()
        }
        return String(value || '')
      })
    )
    
    autoTable(doc, {
      head: [tableColumns],
      body: tableRows,
      startY: options.title ? 40 : 30,
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: options.columns.reduce((acc, col, index) => {
        if (col.width) {
          acc[index] = { cellWidth: col.width }
        }
        return acc
      }, {} as any),
      margin: { top: 40, right: 14, bottom: 20, left: 14 },
    })
    
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width - 30,
        doc.internal.pageSize.height - 10
      )
    }
    
    doc.save(`${options.filename}.pdf`)
    
    return true
  } catch (error) {
    return false
  }
}

export function exportData(format: 'csv' | 'pdf', options: ExportOptions) {
  if (format === 'csv') {
    return exportToCSV(options)
  } else if (format === 'pdf') {
    return exportToPDF(options)
  }
  return false
}

export function formatDataForExport(data: any[], columns: ExportColumn[]) {
  return data.map(item => {
    const formattedItem: any = {}
    columns.forEach(col => {
      const value = item[col.key]
      
      if (typeof value === 'number') {
        formattedItem[col.key] = value
      } else if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)))) {
        formattedItem[col.key] = new Date(value).toLocaleDateString()
      } else {
        formattedItem[col.key] = String(value || '')
      }
    })
    return formattedItem
  })
}

export const EXPORT_COLUMNS = {
  campaigns: [
    { key: 'campaign', label: 'Campaign Name', width: 60 },
    { key: 'conversions', label: 'Conversions', width: 30 },
    { key: 'date', label: 'Date', width: 40 },
  ] as ExportColumn[],
  
  revenue: [
    { key: 'date', label: 'Date', width: 40 },
    { key: 'revenue', label: 'Revenue ($)', width: 40 },
  ] as ExportColumn[],
  
  overview: [
    { key: 'date', label: 'Date', width: 40 },
    { key: 'revenue', label: 'Revenue ($)', width: 30 },
    { key: 'users', label: 'Users', width: 25 },
    { key: 'conversions', label: 'Conversions', width: 30 },
    { key: 'growth', label: 'Growth (%)', width: 25 },
  ] as ExportColumn[],
}
