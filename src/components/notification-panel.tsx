'use client'

import { useState, useEffect } from 'react'
import { Bell, AlertTriangle, Info, CheckCircle, XCircle, ShieldAlert, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAppStore } from '@/lib/store'

interface Notification {
  id: string
  type: string
  category: string
  title: string
  message: string
  isRead: boolean
  priority: string
  createdAt: string
}

interface VarianceAlert {
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

const typeIcons: Record<string, React.ElementType> = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  error: XCircle,
  critical: ShieldAlert,
}

const typeColors: Record<string, string> = {
  info: 'text-blue-400',
  warning: 'text-amber-400',
  success: 'text-emerald-400',
  error: 'text-red-400',
  critical: 'text-red-500',
}

const priorityColors: Record<string, string> = {
  low: 'text-muted-foreground',
  normal: 'text-blue-400',
  high: 'text-amber-400',
  urgent: 'text-red-500',
}

const categoryColors: Record<string, string> = {
  financial: 'bg-emerald-500/20 text-emerald-400',
  player: 'bg-blue-500/20 text-blue-400',
  system: 'bg-gray-500/20 text-gray-400',
  webhook: 'bg-purple-500/20 text-purple-400',
  integration: 'bg-cyan-500/20 text-cyan-400',
  compliance: 'bg-red-500/20 text-red-400',
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return `${sec}s`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h`
  return `${Math.floor(hr / 24)}d`
}

export function NotificationPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [alerts, setAlerts] = useState<VarianceAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const { setActiveSection } = useAppStore()

  useEffect(() => {
    Promise.all([
      fetch('/api/notifications').then(r => r.json()).catch(() => ({ notifications: [] })),
      fetch('/api/variance').then(r => r.json()).catch(() => ({ alerts: [] })),
    ]).then(([notifData, varianceData]) => {
      setNotifications((notifData.notifications || []).slice(0, 10))
      setAlerts((varianceData.alerts || []).slice(0, 5))
      setLoading(false)
    })
  }, [])

  const unreadNotifs = notifications.filter(n => !n.isRead).length
  const unreadAlerts = alerts.filter(a => !a.isRead).length
  const totalUnread = unreadNotifs + unreadAlerts
  const urgentCount = notifications.filter(n => n.priority === 'urgent' && !n.isRead).length
  const criticalAlerts = alerts.filter(a => (a.severity === 'critical' || a.severity === 'high') && !a.isRead).length

  const markNotifRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
  }

  const markAlertRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a))
  }

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    setAlerts(prev => prev.map(a => ({ ...a, isRead: true })))
  }

  const openNotificationCenter = () => {
    setOpen(false)
    setActiveSection('notifications')
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2.5 rounded-md hover:bg-muted transition-colors">
          <Bell className={`size-4 ${totalUnread > 0 ? 'text-primary' : 'text-muted-foreground'}`} />
          {totalUnread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 rounded-full bg-destructive text-[9px] text-destructive-foreground font-bold flex items-center justify-center px-1">
              {totalUnread > 9 ? '9+' : totalUnread}
            </span>
          )}
          {urgentCount > 0 && (
            <span className="absolute top-0 left-0 size-2 rounded-full bg-red-500 animate-pulse" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[calc(100vw-2rem)] sm:w-96 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Notifications</span>
            {totalUnread > 0 && (
              <Badge variant="secondary" className="text-[9px] h-4 px-1">
                {totalUnread} new
              </Badge>
            )}
            {(urgentCount > 0 || criticalAlerts > 0) && (
              <Badge variant="destructive" className="text-[9px] h-4 px-1">
                {urgentCount + criticalAlerts} urgent
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {totalUnread > 0 && (
              <Button variant="ghost" size="sm" className="h-8 sm:h-6 text-[10px]" onClick={markAllRead}>
                Mark all read
              </Button>
            )}
            <Button variant="ghost" size="sm" className="h-8 sm:h-6 text-[10px] text-primary" onClick={openNotificationCenter}>
              View all
            </Button>
          </div>
        </div>
        <ScrollArea className="h-80">
          {loading ? (
            <div className="p-4 text-center text-xs text-muted-foreground">Loading...</div>
          ) : notifications.length === 0 && alerts.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground">No notifications</div>
          ) : (
            <div className="divide-y divide-border">
              {/* Notifications */}
              {notifications.map(n => {
                const Icon = typeIcons[n.type] || Info
                return (
                  <div
                    key={n.id}
                    className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors ${!n.isRead ? 'bg-muted/30 border-l-2 border-l-primary' : ''}`}
                    onClick={() => markNotifRead(n.id)}
                  >
                    <div className="flex items-start gap-2">
                      <Icon className={`size-3.5 mt-0.5 shrink-0 ${typeColors[n.type] || 'text-muted-foreground'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-medium truncate ${!n.isRead ? '' : 'text-muted-foreground'}`}>{n.title}</span>
                          {n.priority === 'urgent' && (
                            <Badge variant="destructive" className="text-[7px] h-3 px-0.5 shrink-0">URGENT</Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate">{n.message}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Badge variant="secondary" className={`text-[7px] h-3 px-1 ${categoryColors[n.category] || ''}`}>
                            {n.category}
                          </Badge>
                          <span className="text-[9px] text-muted-foreground">{timeAgo(n.createdAt)}</span>
                        </div>
                      </div>
                      {!n.isRead && (
                        <button className="p-2 rounded hover:bg-muted shrink-0" onClick={(e) => { e.stopPropagation(); markNotifRead(n.id) }}>
                          <X className="size-3 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* Variance Alerts */}
              {alerts.length > 0 && (
                <div className="p-2 bg-muted/20">
                  <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Variance Alerts</span>
                </div>
              )}
              {alerts.map(alert => (
                <div
                  key={alert.id}
                  className={`p-3 cursor-pointer hover:bg-muted/50 ${!alert.isRead ? 'bg-orange-500/5 border-l-2 border-l-orange-400' : ''}`}
                  onClick={() => markAlertRead(alert.id)}
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle className={`size-3.5 mt-0.5 ${alert.severity === 'critical' ? 'text-destructive' : alert.severity === 'high' ? 'text-orange-400' : 'text-yellow-400'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs">
                        <span className="font-medium">{alert.category}</span>{' '}
                        variance: <span className={alert.severity === 'critical' ? 'text-destructive' : 'text-orange-400'}>{alert.variancePercent > 0 ? '+' : ''}{alert.variancePercent}%</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Expected: ${alert.expectedValue.toLocaleString()} → Actual: ${alert.actualValue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="border-t border-border p-2">
          <Button variant="ghost" size="sm" className="w-full h-7 text-[10px] text-primary" onClick={openNotificationCenter}>
            Open Notification Center
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
