'use client'

import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { exportToCSV } from '@/utils/export'

interface ExportButtonProps {
  data: Record<string, unknown>[]
  filename: string
  label?: string
}

export function ExportButton({ data, filename, label = 'Export CSV' }: ExportButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="h-7 text-xs gap-1"
      onClick={() => exportToCSV(data, filename)}
      disabled={data.length === 0}
    >
      <Download className="size-3" />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  )
}
