'use client'

import { useState, useMemo } from 'react'
import {
  Bell,
  BellOff,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ShieldAlert,
  Mail,
  Smartphone,
  Webhook,
  MessageSquare,
  Send,
  Settings,
  Clock,
  Filter,
  Search,
  Trash2,
  CheckCheck,
  Eye,
  Volume2,
  VolumeX,
  Plus,
  ExternalLink,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { useApi } from '@/hooks/use-api'
import { api } from '@/services/api'

/* ─── Types ─── */

interface Notification {
  id: string
  userId: string
  type: string
  category: string
  title: string
  message: string
  metadata: string
  isRead: boolean
  readAt: string
  channel: string
  priority: string
  createdAt: string
}

interface Preference {
  id: string
  category: string
  channel: string
  isEnabled: boolean
  minPriority: string
  quietHoursStart: string
  quietHoursEnd: string
}

interface Template {
  id: string
  name: string
  category: string
  titleTemplate: string
  bodyTemplate: string
  channel: string
  isActive: boolean
}

interface Channel {
  id: string
  type: string
  config: string
  isVerified: boolean
  isActive: boolean
}

interface NotificationsData {
  notifications: Notification[]
  preferences: Preference[]
  templates: Template[]
  channels: Channel[]
  stats: {
    total: number
    unread: number
    byCategory: Record<string, number>
    byPriority: Record<string, number>
    byType: Record<string, number>
  }
}

/* ─── Constants ─── */

const TYPE_ICON: Record<string, { icon: React.ElementType; color: string }> = {
  info: { icon: Info, color: 'text-blue-400' },
  warning: { icon: AlertTriangle, color: 'text-amber-400' },
  success: { icon: CheckCircle, color: 'text-emerald-400' },
  error: { icon: XCircle, color: 'text-red-400' },
  critical: { icon: ShieldAlert, color: 'text-red-500' },
}

const PRIORITY_BADGE: Record<string, { bg: string; text: string; pulse: boolean }> = {
  low: { bg: 'bg-gray-500/20', text: 'text-gray-300', pulse: false },
  normal: { bg: 'bg-blue-500/20', text: 'text-blue-300', pulse: false },
  high: { bg: 'bg-amber-500/20', text: 'text-amber-300', pulse: false },
  urgent: { bg: 'bg-red-500/20', text: 'text-red-300', pulse: true },
}

const CATEGORY_BADGE: Record<string, { bg: string; text: string }> = {
  financial: { bg: 'bg-emerald-500/20', text: 'text-emerald-300' },
  player: { bg: 'bg-blue-500/20', text: 'text-blue-300' },
  system: { bg: 'bg-gray-500/20', text: 'text-gray-300' },
  webhook: { bg: 'bg-purple-500/20', text: 'text-purple-300' },
  integration: { bg: 'bg-cyan-500/20', text: 'text-cyan-300' },
  compliance: { bg: 'bg-red-500/20', text: 'text-red-300' },
}

const CATEGORIES = ['financial', 'player', 'system', 'webhook', 'integration', 'compliance']
const CHANNEL_TYPES = ['in_app', 'email', 'sms', 'webhook', 'push']
const CHANNEL_LABELS: Record<string, string> = {
  in_app: 'In-App',
  email: 'Email',
  sms: 'SMS',
  webhook: 'Webhook',
  push: 'Push',
}
const PRIORITIES = ['low', 'normal', 'high', 'urgent']
const NOTIFICATION_TYPES = ['info', 'warning', 'success', 'error', 'critical']

const CHANNEL_TYPE_ICON: Record<string, { emoji: string; label: string }> = {
  email: { emoji: '📧', label: 'Email' },
  sms: { emoji: '📱', label: 'SMS' },
  webhook: { emoji: '🔗', label: 'Webhook' },
  slack: { emoji: '💬', label: 'Slack' },
  discord: { emoji: '🎮', label: 'Discord' },
  telegram: { emoji: '✈️', label: 'Telegram' },
}

/* ─── Helpers ─── */

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function parseMetadata(raw: string): Record<string, string> {
  try {
    return JSON.parse(raw || '{}')
  } catch {
    return {}
  }
}

function highlightTemplateVars(text: string): React.ReactNode[] {
  const parts = text.split(/(\{\{[^}]+\}\})/g)
  return parts.map((part, i) => {
    if (part.startsWith('{{') && part.endsWith('}}')) {
      return (
        <span key={i} className="bg-amber-500/20 text-amber-300 px-0.5 rounded font-mono text-xs">
          {part}
        </span>
      )
    }
    return <span key={i}>{part}</span>
  })
}

const SAMPLE_DATA: Record<string, string> = {
  amount: '$5,000.00',
  currency: 'USD',
  method: 'Visa',
  txId: 'TX-20250304-001',
  balance: '25,430.50',
  eta: '2-4 hours',
  refId: 'REF-WD-789',
  playerName: 'Sarah Mitchell',
  playerId: 'P-2001',
  docType: 'Passport',
  deadline: '48 hours',
  alertType: 'Structuring',
  riskScore: '87',
  threshold: '80',
  gameName: 'Mega Moolah',
  multiplier: '150',
  jackpotName: 'Mega Moolah',
  resetAmount: '$1,000,000.00',
  category: 'Revenue',
  variancePercent: '-18%',
  period: '7-day',
  expected: '$45,000',
  actual: '$36,900',
  startTime: '2025-03-08 02:00 UTC',
  endTime: '2025-03-08 04:00 UTC',
  timezone: 'UTC',
  services: 'Deposits, Withdrawals, Game API',
  duration: '2 hours',
  endpoint: 'https://api.example.com/hooks',
  retries: '3',
  error: '503 Service Unavailable',
  eventType: 'deposit.confirmed',
  webhookId: 'WH-12345',
  promoName: 'Spring Bonus',
  promoId: 'PROMO-2025-001',
  totalClaims: '1,247',
  totalValue: '$62,350.00',
  conversionRate: '34.2',
}

function renderTemplate(template: string): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => SAMPLE_DATA[key] || `{{${key}}}`)
}

/* ─── Component ─── */

export function NotificationsView() {
  const { data, loading, error, refetch } = useApi<NotificationsData>(() => api.notifications.get())
  const [localNotifications, setLocalNotifications] = useState<Notification[] | null>(null)
  const [localTemplates, setLocalTemplates] = useState<Template[] | null>(null)
  const [localChannels, setLocalChannels] = useState<Channel[] | null>(null)

  const notifications = localNotifications ?? data?.notifications ?? []
  const preferences = data?.preferences ?? []
  const templates = localTemplates ?? data?.templates ?? []
  const channels = localChannels ?? data?.channels ?? []

  /* Tab 1 state */
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterRead, setFilterRead] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 8

  /* Tab 2 state */
  const [prefOverrides, setPrefOverrides] = useState<Record<string, Record<string, boolean>> | null>(null)
  const [minPriorityOverrides, setMinPriorityOverrides] = useState<Record<string, string> | null>(null)
  const [quietStart, setQuietStart] = useState('22:00')
  const [quietEnd, setQuietEnd] = useState('08:00')
  const [quietEnabled, setQuietEnabled] = useState(true)

  /* Tab 3 state */
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)
  const [newTemplateOpen, setNewTemplateOpen] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState('')
  const [newTemplateCategory, setNewTemplateCategory] = useState('financial')
  const [newTemplateTitle, setNewTemplateTitle] = useState('')
  const [newTemplateBody, setNewTemplateBody] = useState('')
  const [newTemplateChannel, setNewTemplateChannel] = useState('in_app')

  /* Tab 4 state */
  const [addChannelOpen, setAddChannelOpen] = useState(false)
  const [newChannelType, setNewChannelType] = useState('email')
  const [channelForm, setChannelForm] = useState<Record<string, string>>({})
  const [testChannelId, setTestChannelId] = useState<string | null>(null)

  /* Derive preference matrix from data */
  const prefMatrix = useMemo(() => {
    if (prefOverrides) return prefOverrides
    const matrix: Record<string, Record<string, boolean>> = {}
    for (const cat of CATEGORIES) {
      matrix[cat] = {}
      for (const ch of CHANNEL_TYPES) {
        matrix[cat][ch] = false
      }
    }
    for (const p of preferences) {
      if (matrix[p.category]) {
        matrix[p.category][p.channel] = p.isEnabled
      }
    }
    return matrix
  }, [prefOverrides, preferences])

  const prefMinPriority = useMemo(() => {
    if (minPriorityOverrides) return minPriorityOverrides
    const minP: Record<string, string> = {}
    for (const p of preferences) {
      if (!minP[p.category]) minP[p.category] = p.minPriority
    }
    return minP
  }, [minPriorityOverrides, preferences])

  /* Filtered notifications */
  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (filterCategory !== 'all' && n.category !== filterCategory) return false
      if (filterType !== 'all' && n.type !== filterType) return false
      if (filterPriority !== 'all' && n.priority !== filterPriority) return false
      if (filterRead === 'unread' && n.isRead) return false
      if (filterRead === 'read' && !n.isRead) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        if (!n.title.toLowerCase().includes(q) && !n.message.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [notifications, filterCategory, filterType, filterPriority, filterRead, searchQuery])

  const paged = filtered.slice(0, (page + 1) * PAGE_SIZE)
  const hasMore = filtered.length > (page + 1) * PAGE_SIZE
  const unreadCount = notifications.filter(n => !n.isRead).length

  const markAsRead = (id: string) => {
    setLocalNotifications(prev => {
      const source = prev ?? data?.notifications ?? []
      return source.map(n => n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)
    })
  }

  const markAllAsRead = () => {
    setLocalNotifications(prev => {
      const source = prev ?? data?.notifications ?? []
      return source.map(n => n.isRead ? n : { ...n, isRead: true, readAt: new Date().toISOString() })
    })
  }

  const deleteAllRead = () => {
    setLocalNotifications(prev => {
      const source = prev ?? data?.notifications ?? []
      return source.filter(n => !n.isRead)
    })
  }

  const toggleTemplateActive = (id: string) => {
    setLocalTemplates(prev => {
      const source = prev ?? data?.templates ?? []
      return source.map(t => t.id === id ? { ...t, isActive: !t.isActive } : t)
    })
  }

  const toggleChannelActive = (id: string) => {
    setLocalChannels(prev => {
      const source = prev ?? data?.channels ?? []
      return source.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c)
    })
  }

  const togglePref = (category: string, channel: string) => {
    setPrefOverrides(prev => {
      const base = prev ?? prefMatrix
      return {
        ...base,
        [category]: {
          ...base[category],
          [channel]: !base[category]?.[channel],
        },
      }
    })
  }

  const setMinPriorityForCategory = (category: string, value: string) => {
    setMinPriorityOverrides(prev => ({
      ...prev ?? prefMinPriority,
      [category]: value,
    }))
  }

  const addChannel = () => {
    const newId = `ch_${Date.now()}`
    const newCh: Channel = {
      id: newId,
      type: newChannelType,
      config: JSON.stringify(channelForm),
      isVerified: false,
      isActive: true,
    }
    setLocalChannels(prev => [...(prev ?? data?.channels ?? []), newCh])
    setAddChannelOpen(false)
    setChannelForm({})
  }

  const addTemplate = () => {
    const newId = `t_${Date.now()}`
    const newT: Template = {
      id: newId,
      name: newTemplateName,
      category: newTemplateCategory,
      titleTemplate: newTemplateTitle,
      bodyTemplate: newTemplateBody,
      channel: newTemplateChannel,
      isActive: true,
    }
    setLocalTemplates(prev => [...(prev ?? data?.templates ?? []), newT])
    setNewTemplateOpen(false)
    setNewTemplateName('')
    setNewTemplateTitle('')
    setNewTemplateBody('')
  }

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-lg" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="p-6 text-center">
          <XCircle className="size-8 text-destructive mx-auto mb-2" />
          <p className="text-sm text-destructive">Failed to load notifications</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={refetch}>
            <RefreshCw className="size-3 mr-1" /> Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  /* ─── Render ─── */
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <Bell className="size-5 text-primary" />
          <div>
            <h2 className="text-lg font-bold">Notifications Center</h2>
            <p className="text-xs text-muted-foreground">
              {data?.stats.total ?? 0} total · {unreadCount} unread
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={refetch}>
          <RefreshCw className="size-3 mr-1" /> Refresh
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="bg-card border-border">
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total</p>
            <p className="text-xl font-bold text-primary">{data?.stats.total ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Unread</p>
            <p className="text-xl font-bold text-amber-400">{unreadCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Urgent</p>
            <p className="text-xl font-bold text-red-400">{data?.stats.byPriority?.urgent ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Templates</p>
            <p className="text-xl font-bold text-cyan-400">{templates.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="all" className="text-xs">
            <Bell className="size-3 mr-1" /> All
          </TabsTrigger>
          <TabsTrigger value="preferences" className="text-xs">
            <Settings className="size-3 mr-1" /> Preferences
          </TabsTrigger>
          <TabsTrigger value="templates" className="text-xs">
            <MessageSquare className="size-3 mr-1" /> Templates
          </TabsTrigger>
          <TabsTrigger value="channels" className="text-xs">
            <Send className="size-3 mr-1" /> Channels
          </TabsTrigger>
        </TabsList>

        {/* ─── Tab 1: All Notifications ─── */}
        <TabsContent value="all" className="space-y-3">
          {/* Filter Bar */}
          <Card className="bg-card border-border">
            <CardContent className="p-3">
              <div className="flex flex-wrap items-center gap-2">
                <Filter className="size-4 text-muted-foreground shrink-0" />
                <Select value={filterCategory} onValueChange={v => { setFilterCategory(v); setPage(0) }}>
                  <SelectTrigger className="w-[130px] h-8 text-xs">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {CATEGORIES.map(c => (
                      <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={v => { setFilterType(v); setPage(0) }}>
                  <SelectTrigger className="w-[110px] h-8 text-xs">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {NOTIFICATION_TYPES.map(t => (
                      <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterPriority} onValueChange={v => { setFilterPriority(v); setPage(0) }}>
                  <SelectTrigger className="w-[110px] h-8 text-xs">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    {PRIORITIES.map(p => (
                      <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterRead} onValueChange={v => { setFilterRead(v); setPage(0) }}>
                  <SelectTrigger className="w-[110px] h-8 text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative flex-1 min-w-[150px]">
                  <Search className="size-3 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={e => { setSearchQuery(e.target.value); setPage(0) }}
                    className="h-8 pl-7 text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-xs text-muted-foreground">
              Showing {paged.length} of {filtered.length} notification{filtered.length !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={markAllAsRead}>
                  <CheckCheck className="size-3 mr-1" /> Mark All as Read
                </Button>
              )}
              <Button variant="outline" size="sm" className="h-7 text-xs text-destructive hover:text-destructive" onClick={deleteAllRead}>
                <Trash2 className="size-3 mr-1" /> Delete All Read
              </Button>
            </div>
          </div>

          {/* Notification List */}
          <ScrollArea className="max-h-[520px]">
            <div className="space-y-2 pr-1">
              {paged.length === 0 ? (
                <Card className="bg-card border-border">
                  <CardContent className="p-4 sm:p-8 text-center">
                    <BellOff className="size-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No notifications match your filters</p>
                  </CardContent>
                </Card>
              ) : (
                paged.map(n => {
                  const typeInfo = TYPE_ICON[n.type] || TYPE_ICON.info
                  const prioInfo = PRIORITY_BADGE[n.priority] || PRIORITY_BADGE.normal
                  const catInfo = CATEGORY_BADGE[n.category] || CATEGORY_BADGE.system
                  const TypeIcon = typeInfo.icon
                  const meta = parseMetadata(n.metadata)
                  const borderAccent = !n.isRead
                    ? n.type === 'critical' ? 'border-l-red-500'
                    : n.type === 'error' ? 'border-l-red-400'
                    : n.type === 'warning' ? 'border-l-amber-400'
                    : n.type === 'success' ? 'border-l-emerald-400'
                    : 'border-l-blue-400'
                    : 'border-l-transparent'

                  return (
                    <Card
                      key={n.id}
                      className={`bg-card border-border border-l-2 ${borderAccent} ${!n.isRead ? 'bg-muted/20' : ''} transition-colors hover:bg-muted/10`}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          {/* Type Icon */}
                          <div className={`shrink-0 mt-0.5 ${typeInfo.color}`}>
                            <TypeIcon className="size-4" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap mb-1">
                              <span className={`text-sm ${!n.isRead ? 'font-bold' : 'font-medium'} truncate`}>
                                {n.title}
                              </span>
                              <Badge className={`text-[9px] h-4 px-1 ${prioInfo.bg} ${prioInfo.text} ${prioInfo.pulse ? 'animate-pulse' : ''}`}>
                                {n.priority}
                              </Badge>
                              <Badge className={`text-[9px] h-4 px-1 ${catInfo.bg} ${catInfo.text}`}>
                                {n.category}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Clock className="size-3" /> {relativeTime(n.createdAt)}
                              </span>
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                {CHANNEL_LABELS[n.channel] || n.channel}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 shrink-0">
                            {!n.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-[10px] text-primary hover:text-primary"
                                onClick={() => markAsRead(n.id)}
                              >
                                <Eye className="size-3 mr-0.5" /> Read
                              </Button>
                            )}
                            {meta.actionUrl && (
                              <Button variant="ghost" size="sm" className="h-6 text-[10px]">
                                <ExternalLink className="size-3 mr-0.5" /> View
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </ScrollArea>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)}>
                Load More ({filtered.length - paged.length} remaining)
              </Button>
            </div>
          )}
        </TabsContent>

        {/* ─── Tab 2: Preferences ─── */}
        <TabsContent value="preferences" className="space-y-4">
          {/* Category-Channel Matrix */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Volume2 className="size-4 text-primary" /> Notification Channels by Category
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs w-[120px]">Category</TableHead>
                      {CHANNEL_TYPES.map(ch => (
                        <TableHead key={ch} className="text-xs text-center">{CHANNEL_LABELS[ch]}</TableHead>
                      ))}
                      <TableHead className="text-xs text-center">Min Priority</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {CATEGORIES.map(cat => (
                      <TableRow key={cat}>
                        <TableCell className="text-xs font-medium">
                          <Badge className={`text-[9px] ${CATEGORY_BADGE[cat]?.bg || ''} ${CATEGORY_BADGE[cat]?.text || ''}`}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </Badge>
                        </TableCell>
                        {CHANNEL_TYPES.map(ch => (
                          <TableCell key={ch} className="text-center">
                            <Switch
                              checked={!!prefMatrix[cat]?.[ch]}
                              onCheckedChange={() => togglePref(cat, ch)}
                              className="data-[state=checked]:bg-primary"
                            />
                          </TableCell>
                        ))}
                        <TableCell className="text-center">
                          <Select
                            value={prefMinPriority[cat] || 'normal'}
                            onValueChange={v => setMinPriorityForCategory(cat, v)}
                          >
                            <SelectTrigger className="w-[90px] h-7 text-xs mx-auto">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {PRIORITIES.map(p => (
                                <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Quiet Hours */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="size-4 text-primary" /> Quiet Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={quietEnabled}
                    onCheckedChange={setQuietEnabled}
                    className="data-[state=checked]:bg-primary"
                  />
                  <Label className="text-xs">Enabled</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground">From</Label>
                  <Input
                    type="time"
                    value={quietStart}
                    onChange={e => setQuietStart(e.target.value)}
                    disabled={!quietEnabled}
                    className="w-[120px] h-8 text-xs"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground">To</Label>
                  <Input
                    type="time"
                    value={quietEnd}
                    onChange={e => setQuietEnd(e.target.value)}
                    disabled={!quietEnabled}
                    className="w-[120px] h-8 text-xs"
                  />
                </div>
                {quietEnabled && (
                  <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                    {quietStart} – {quietEnd}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Save */}
          <div className="flex justify-end">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <CheckCheck className="size-3 mr-1" /> Save Preferences
            </Button>
          </div>
        </TabsContent>

        {/* ─── Tab 3: Templates ─── */}
        <TabsContent value="templates" className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{templates.length} template{templates.length !== 1 ? 's' : ''}</p>
            <Dialog open={newTemplateOpen} onOpenChange={setNewTemplateOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="size-3 mr-1" /> Create Template
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-sm">Create Notification Template</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Name</Label>
                      <Input value={newTemplateName} onChange={e => setNewTemplateName(e.target.value)} placeholder="Template name" className="h-8 text-xs mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">Category</Label>
                      <Select value={newTemplateCategory} onValueChange={setNewTemplateCategory}>
                        <SelectTrigger className="h-8 text-xs mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(c => (
                            <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Channel</Label>
                    <Select value={newTemplateChannel} onValueChange={setNewTemplateChannel}>
                      <SelectTrigger className="h-8 text-xs mt-1 w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CHANNEL_TYPES.map(c => (
                          <SelectItem key={c} value={c}>{CHANNEL_LABELS[c]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Title Template <span className="text-amber-400">(use {'{{variable}}'})</span></Label>
                    <Input value={newTemplateTitle} onChange={e => setNewTemplateTitle(e.target.value)} placeholder="e.g. Deposit of {{amount}} Confirmed" className="h-8 text-xs mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Body Template <span className="text-amber-400">(use {'{{variable}}'})</span></Label>
                    <Textarea value={newTemplateBody} onChange={e => setNewTemplateBody(e.target.value)} placeholder="e.g. Your deposit of {{amount}} {{currency}} has been confirmed." className="text-xs mt-1 min-h-[80px]" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setNewTemplateOpen(false)}>Cancel</Button>
                    <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={addTemplate} disabled={!newTemplateName || !newTemplateTitle || !newTemplateBody}>
                      Create
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="bg-card border-border">
            <CardContent className="p-0">
              <ScrollArea className="max-h-[480px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Name</TableHead>
                      <TableHead className="text-xs">Category</TableHead>
                      <TableHead className="text-xs">Title Template</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Body Template</TableHead>
                      <TableHead className="text-xs">Channel</TableHead>
                      <TableHead className="text-xs text-center">Active</TableHead>
                      <TableHead className="text-xs text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map(t => (
                      <TableRow key={t.id}>
                        <TableCell className="text-xs font-medium">{t.name}</TableCell>
                        <TableCell className="text-xs">
                          <Badge className={`text-[9px] ${CATEGORY_BADGE[t.category]?.bg || ''} ${CATEGORY_BADGE[t.category]?.text || ''}`}>
                            {t.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs max-w-[200px]">
                          <div className="truncate">{highlightTemplateVars(t.titleTemplate)}</div>
                        </TableCell>
                        <TableCell className="text-xs max-w-[250px] hidden md:table-cell">
                          <div className="truncate">{highlightTemplateVars(t.bodyTemplate)}</div>
                        </TableCell>
                        <TableCell className="text-xs">
                          <Badge variant="outline" className="text-[9px]">{CHANNEL_LABELS[t.channel] || t.channel}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={t.isActive}
                            onCheckedChange={() => toggleTemplateActive(t.id)}
                            className="data-[state=checked]:bg-primary"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-[10px]"
                            onClick={() => setPreviewTemplate(t)}
                          >
                            <Eye className="size-3 mr-0.5" /> Preview
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Template Preview Dialog */}
          <Dialog open={!!previewTemplate} onOpenChange={open => !open && setPreviewTemplate(null)}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-sm">Template Preview: {previewTemplate?.name}</DialogTitle>
              </DialogHeader>
              {previewTemplate && (
                <div className="space-y-3 pt-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Rendered Title</Label>
                    <Card className="mt-1 bg-muted/30 border-border">
                      <CardContent className="p-3">
                        <p className="text-sm font-medium">{renderTemplate(previewTemplate.titleTemplate)}</p>
                      </CardContent>
                    </Card>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Rendered Body</Label>
                    <Card className="mt-1 bg-muted/30 border-border">
                      <CardContent className="p-3">
                        <p className="text-xs leading-relaxed">{renderTemplate(previewTemplate.bodyTemplate)}</p>
                      </CardContent>
                    </Card>
                  </div>
                  <Separator />
                  <div>
                    <Label className="text-xs text-muted-foreground">Original Title Template</Label>
                    <p className="text-xs mt-1">{highlightTemplateVars(previewTemplate.titleTemplate)}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Original Body Template</Label>
                    <p className="text-xs mt-1 leading-relaxed">{highlightTemplateVars(previewTemplate.bodyTemplate)}</p>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ─── Tab 4: Channels ─── */}
        <TabsContent value="channels" className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{channels.length} configured channel{channels.length !== 1 ? 's' : ''}</p>
            <Dialog open={addChannelOpen} onOpenChange={setAddChannelOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="size-3 mr-1" /> Add Channel
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-sm">Add Notification Channel</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 pt-2">
                  <div>
                    <Label className="text-xs">Channel Type</Label>
                    <Select value={newChannelType} onValueChange={v => { setNewChannelType(v); setChannelForm({}) }}>
                      <SelectTrigger className="h-8 text-xs mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CHANNEL_TYPE_ICON).map(([key, val]) => (
                          <SelectItem key={key} value={key}>
                            {val.emoji} {val.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Channel Type Forms */}
                  {newChannelType === 'email' && (
                    <div>
                      <Label className="text-xs">Email Address</Label>
                      <Input
                        value={channelForm.address || ''}
                        onChange={e => setChannelForm(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="ops@example.com"
                        className="h-8 text-xs mt-1"
                      />
                    </div>
                  )}
                  {newChannelType === 'sms' && (
                    <div>
                      <Label className="text-xs">Phone Number</Label>
                      <Input
                        value={channelForm.phoneNumber || ''}
                        onChange={e => setChannelForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        placeholder="+1-555-0100"
                        className="h-8 text-xs mt-1"
                      />
                    </div>
                  )}
                  {newChannelType === 'webhook' && (
                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs">Webhook URL</Label>
                        <Input
                          value={channelForm.url || ''}
                          onChange={e => setChannelForm(prev => ({ ...prev, url: e.target.value }))}
                          placeholder="https://example.com/webhooks"
                          className="h-8 text-xs mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Secret</Label>
                        <Input
                          value={channelForm.secret || ''}
                          onChange={e => setChannelForm(prev => ({ ...prev, secret: e.target.value }))}
                          placeholder="whsec_..."
                          className="h-8 text-xs mt-1"
                        />
                      </div>
                    </div>
                  )}
                  {newChannelType === 'slack' && (
                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs">Webhook URL</Label>
                        <Input
                          value={channelForm.webhookUrl || ''}
                          onChange={e => setChannelForm(prev => ({ ...prev, webhookUrl: e.target.value }))}
                          placeholder="https://hooks.slack.com/services/..."
                          className="h-8 text-xs mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Channel Name</Label>
                        <Input
                          value={channelForm.channel || ''}
                          onChange={e => setChannelForm(prev => ({ ...prev, channel: e.target.value }))}
                          placeholder="#ops-alerts"
                          className="h-8 text-xs mt-1"
                        />
                      </div>
                    </div>
                  )}
                  {newChannelType === 'discord' && (
                    <div>
                      <Label className="text-xs">Webhook URL</Label>
                      <Input
                        value={channelForm.webhookUrl || ''}
                        onChange={e => setChannelForm(prev => ({ ...prev, webhookUrl: e.target.value }))}
                        placeholder="https://discord.com/api/webhooks/..."
                        className="h-8 text-xs mt-1"
                      />
                    </div>
                  )}
                  {newChannelType === 'telegram' && (
                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs">Bot Token</Label>
                        <Input
                          value={channelForm.botToken || ''}
                          onChange={e => setChannelForm(prev => ({ ...prev, botToken: e.target.value }))}
                          placeholder="123456:AAF..."
                          className="h-8 text-xs mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Chat ID</Label>
                        <Input
                          value={channelForm.chatId || ''}
                          onChange={e => setChannelForm(prev => ({ ...prev, chatId: e.target.value }))}
                          placeholder="-1001234567890"
                          className="h-8 text-xs mt-1"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setAddChannelOpen(false)}>Cancel</Button>
                    <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={addChannel}>
                      Add Channel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Channel Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {channels.map(ch => {
              const typeInfo = CHANNEL_TYPE_ICON[ch.type] || { emoji: '📡', label: ch.type }
              let configDisplay = ''
              try {
                const cfg = JSON.parse(ch.config)
                if (ch.type === 'email') configDisplay = cfg.address ? `${cfg.address.slice(0, 3)}***@${cfg.address.split('@')[1] || '***'}` : 'Not configured'
                else if (ch.type === 'sms') configDisplay = cfg.phoneNumber ? `${cfg.phoneNumber.slice(0, 6)}****` : 'Not configured'
                else if (ch.type === 'webhook') configDisplay = cfg.url ? `${cfg.url.slice(0, 30)}...` : 'Not configured'
                else if (ch.type === 'slack') configDisplay = cfg.channel || cfg.webhookUrl?.slice(0, 30) + '...' || 'Not configured'
                else if (ch.type === 'discord') configDisplay = cfg.webhookUrl ? `${cfg.webhookUrl.slice(0, 35)}...` : 'Not configured'
                else if (ch.type === 'telegram') configDisplay = cfg.chatId ? `Chat: ${cfg.chatId}` : 'Not configured'
                else configDisplay = JSON.stringify(cfg).slice(0, 40)
              } catch {
                configDisplay = 'Invalid config'
              }

              const isTesting = testChannelId === ch.id

              return (
                <Card key={ch.id} className={`bg-card border-border ${!ch.isActive ? 'opacity-60' : ''} transition-opacity`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{typeInfo.emoji}</span>
                        <div>
                          <p className="text-sm font-medium">{typeInfo.label}</p>
                          <p className="text-[10px] text-muted-foreground truncate max-w-[180px]">{configDisplay}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {ch.isVerified ? (
                          <Badge className="text-[9px] bg-emerald-500/20 text-emerald-300">
                            <CheckCircle className="size-2.5 mr-0.5" /> Verified
                          </Badge>
                        ) : (
                          <Badge className="text-[9px] bg-amber-500/20 text-amber-300">
                            <AlertTriangle className="size-2.5 mr-0.5" /> Unverified
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={ch.isActive}
                          onCheckedChange={() => toggleChannelActive(ch.id)}
                          className="data-[state=checked]:bg-primary"
                        />
                        <Label className="text-[10px] text-muted-foreground">
                          {ch.isActive ? 'Active' : 'Inactive'}
                        </Label>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 text-[10px]"
                          onClick={() => {
                            setTestChannelId(ch.id)
                            setTimeout(() => setTestChannelId(null), 2000)
                          }}
                          disabled={isTesting}
                        >
                          {isTesting ? (
                            <RefreshCw className="size-3 mr-0.5 animate-spin" />
                          ) : (
                            <Send className="size-3 mr-0.5" />
                          )}
                          {isTesting ? 'Sending...' : 'Test'}
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="h-6 text-[10px]">
                              <Settings className="size-3 mr-0.5" /> Configure
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle className="text-sm">Configure {typeInfo.label} Channel</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-3 pt-2">
                              {ch.type === 'email' && (
                                <ChannelConfigForm fields={[
                                  { key: 'address', label: 'Email Address', type: 'email', placeholder: 'ops@example.com' },
                                  { key: 'smtpHost', label: 'SMTP Host', type: 'text', placeholder: 'smtp.sendgrid.net' },
                                  { key: 'smtpPort', label: 'SMTP Port', type: 'text', placeholder: '587' },
                                ]} config={ch.config} />
                              )}
                              {ch.type === 'sms' && (
                                <ChannelConfigForm fields={[
                                  { key: 'phoneNumber', label: 'Phone Number', type: 'tel', placeholder: '+1-555-0100' },
                                  { key: 'provider', label: 'Provider', type: 'text', placeholder: 'Twilio' },
                                  { key: 'fromNumber', label: 'From Number', type: 'tel', placeholder: '+1-555-0200' },
                                ]} config={ch.config} />
                              )}
                              {ch.type === 'webhook' && (
                                <ChannelConfigForm fields={[
                                  { key: 'url', label: 'Webhook URL', type: 'url', placeholder: 'https://example.com/webhooks' },
                                  { key: 'secret', label: 'Signing Secret', type: 'text', placeholder: 'whsec_...' },
                                ]} config={ch.config} />
                              )}
                              {ch.type === 'slack' && (
                                <ChannelConfigForm fields={[
                                  { key: 'webhookUrl', label: 'Webhook URL', type: 'url', placeholder: 'https://hooks.slack.com/...' },
                                  { key: 'channel', label: 'Channel', type: 'text', placeholder: '#ops-alerts' },
                                ]} config={ch.config} />
                              )}
                              {ch.type === 'discord' && (
                                <ChannelConfigForm fields={[
                                  { key: 'webhookUrl', label: 'Webhook URL', type: 'url', placeholder: 'https://discord.com/api/webhooks/...' },
                                ]} config={ch.config} />
                              )}
                              {ch.type === 'telegram' && (
                                <ChannelConfigForm fields={[
                                  { key: 'botToken', label: 'Bot Token', type: 'text', placeholder: '123456:AAF...' },
                                  { key: 'chatId', label: 'Chat ID', type: 'text', placeholder: '-1001234567890' },
                                ]} config={ch.config} />
                              )}
                              <div className="flex justify-end">
                                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                                  <CheckCheck className="size-3 mr-1" /> Save Configuration
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

/* ─── Sub-Component: Channel Config Form ─── */

interface ConfigField {
  key: string
  label: string
  type: string
  placeholder: string
}

function ChannelConfigForm({ fields, config }: { fields: ConfigField[]; config: string }) {
  const parsed = (() => {
    try { return JSON.parse(config || '{}') } catch { return {} }
  })()

  return (
    <div className="space-y-2">
      {fields.map(f => (
        <div key={f.key}>
          <Label className="text-xs">{f.label}</Label>
          <Input
            type={f.type}
            defaultValue={parsed[f.key] || ''}
            placeholder={f.placeholder}
            className="h-8 text-xs mt-1"
          />
        </div>
      ))}
    </div>
  )
}
