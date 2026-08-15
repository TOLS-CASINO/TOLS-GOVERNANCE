'use client'

import { useState, useEffect } from 'react'
import { Bell, AlertTriangle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Alert {
  id: string
  category: string
  expectedValue: number
  actualValue: number
  variancePercent: number
  threshold: number
  severity: string
  isRead: boolean
  createdAt: string
}

const severityColors: Record<string, string> = {
  critical: 'text-destructive',
  high: 'text-orange-400',
  medium: 'text-yellow-400',
  low: 'text-muted-foreground',
}

const severityBg: Record<string, string> = {
  critical: 'bg-destructive/10',
  high: 'bg-orange-400/10',
  medium: 'bg-yellow-400/10',
  low: 'bg-muted/50',
}

export function NotificationPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetch('/api/variance')
      .then(r => r.json())
      .then(data => {
        setAlerts(data.alerts || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const unreadCount = alerts.filter(a => !a.isRead).length
  const criticalCount = alerts.filter(a => a.severity === 'critical' || a.severity === 'high').length

  const markAsRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a))
  }

  const markAllRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, isRead: true })))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-1.5 rounded-md hover:bg-muted transition-colors">
          <Bell className="size-4 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 rounded-full bg-destructive text-[9px] text-destructive-foreground font-bold flex items-center justify-center px-1">
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Alerts</span>
            {criticalCount > 0 && (
              <Badge variant="destructive" className="text-[9px] h-4 px-1">
                {criticalCount} Critical
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={markAllRead}>
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-64">
          {loading ? (
            <div className="p-4 text-center text-xs text-muted-foreground">Loading...</div>
          ) : alerts.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground">No alerts</div>
          ) : (
            <div className="divide-y divide-border">
              {alerts.map(alert => (
                <div
                  key={alert.id}
                  className={`p-3 ${!alert.isRead ? 'bg-muted/30' : ''} ${severityBg[alert.severity]}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className={`size-3 ${severityColors[alert.severity]}`} />
                      <Badge
                        variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}
                        className="text-[8px] h-3.5 px-1"
                      >
                        {alert.severity.toUpperCase()}
                      </Badge>
                    </div>
                    {!alert.isRead && (
                      <button
                        className="p-0.5 rounded hover:bg-muted"
                        onClick={() => markAsRead(alert.id)}
                      >
                        <X className="size-3 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs mt-1">
                    <span className="font-medium">{alert.category}</span>{' '}
                    variance: <span className={severityColors[alert.severity]}>{alert.variancePercent > 0 ? '+' : ''}{alert.variancePercent}%</span>
                    {' '}(threshold: ±{alert.threshold}%)
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Expected: ${alert.expectedValue.toLocaleString()} → Actual: ${alert.actualValue.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
