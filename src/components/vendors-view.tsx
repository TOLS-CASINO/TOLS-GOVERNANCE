'use client'

import { useState, useMemo } from 'react'
import {
  Server,
  Webhook,
  Gamepad2,
  Key,
  HeartPulse,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Shield,
  ExternalLink,
  Plus,
  Settings,
  Eye,
  Trash2,
  Copy,
  Globe,
  Zap,
  Activity,
  TrendingUp,
  Clock,
  Lock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
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

interface GameProvider {
  id: string
  name: string
  slug: string
  type: string
  status: string
  logoUrl: string | null
  website: string | null
  description: string | null
  integrationType: string
  apiVersion: string | null
  baseUrl: string | null
  callbackUrl: string | null
  secretKey: string | null
  apiKey: string | null
  allowedIps: string | null
  supportedCurrencies: string | null
  supportedLocales: string | null
  maxConcurrentSessions: number
  defaultRtp: number | null
  isActive: boolean
  isCertified: boolean
  certifiedAt: string | null
  lastHealthCheck: string | null
  totalGames: number
  activeGames: number
  activePlayers: number
  monthlyRevenue: number
  errorRate: number
  avgLatencyMs: number
  uptime: number
  joinedAt: string
  createdAt: string
}

interface ProviderCallback {
  id: string
  providerId: string
  name: string
  eventType: string
  url: string
  method: string
  authType: string
  secretKey: string | null
  ipWhitelist: string | null
  isActive: boolean
  retryPolicy: string | null
  timeoutMs: number
  lastReceivedAt: string | null
  lastSuccessAt: string | null
  totalReceived: number
  totalSuccess: number
  totalFailed: number
  avgProcessingMs: number
}

interface ProviderGame {
  id: string
  providerId: string
  externalId: string
  name: string
  slug: string
  type: string
  category: string | null
  subCategory: string | null
  rtp: number | null
  volatility: string | null
  hitFrequency: number | null
  maxWin: number | null
  maxBet: number | null
  minBet: number | null
  defaultBet: number | null
  lines: number | null
  features: string | null
  isActive: boolean
  isFeatured: boolean
  isNew: boolean
  totalBets: number
  totalWins: number
  totalSessions: number
  avgSessionMin: number
  popularityScore: number
}

interface ProviderCredential {
  id: string
  providerId: string
  environment: string
  apiKey: string | null
  apiSecret: string | null
  bearerToken: string | null
  certPath: string | null
  additional: string | null
  isActive: boolean
  lastUsedAt: string | null
  expiresAt: string | null
}

interface ProviderHealthLog {
  id: string
  providerId: string
  metric: string
  value: number
  unit: string
  threshold: number | null
  isAlert: boolean
  details: string | null
  checkedAt: string
}

interface VendorsData {
  providers: GameProvider[]
  callbacks: ProviderCallback[]
  games: ProviderGame[]
  credentials: ProviderCredential[]
  healthLogs: ProviderHealthLog[]
  stats: {
    totalProviders: number
    activeProviders: number
    totalGames: number
    activeGames: number
    totalCallbacks: number
    totalActivePlayers: number
    totalMonthlyRevenue: number
    avgUptime: number
    avgErrorRate: number
    certifiedProviders: number
    pendingProviders: number
  }
}

/* ─── Helpers ─── */

function relativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

function formatRevenue(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  return `$${n.toFixed(0)}`
}

function maskValue(val: string | null | undefined): string {
  if (!val) return '—'
  if (val.length <= 8) return '••••••••'
  return `${val.slice(0, 4)}${'•'.repeat(8)}${val.slice(-4)}`
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  suspended: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  disconnected: 'bg-red-500/15 text-red-400 border-red-500/25',
  pending: 'bg-gray-500/15 text-gray-400 border-gray-500/25',
}

const TYPE_LABELS: Record<string, string> = {
  live_casino: 'Live Casino',
  slots: 'Slots',
  table_games: 'Table Games',
  sports: 'Sports',
  virtual_sports: 'Virtual Sports',
  lottery: 'Lottery',
  bingo: 'Bingo',
  poker: 'Poker',
}

const GAME_TYPE_LABELS: Record<string, string> = {
  slot: 'Slot',
  live_table: 'Live Table',
  jackpot: 'Jackpot',
  table_game: 'Table Game',
  instant_win: 'Instant Win',
  video_poker: 'Video Poker',
  scratch: 'Scratch',
}

const VOLATILITY_STYLES: Record<string, string> = {
  low: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  medium: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  high: 'bg-red-500/15 text-red-400 border-red-500/25',
  very_high: 'bg-red-500/15 text-red-400 border-red-500/25',
}

const ENV_STYLES: Record<string, string> = {
  production: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  staging: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  sandbox: 'bg-gray-500/15 text-gray-400 border-gray-500/25',
  development: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
}

const METRIC_ICONS: Record<string, React.ElementType> = {
  error_rate: XCircle,
  latency: Clock,
  uptime: CheckCircle,
  api_connectivity: Globe,
  callback_success: Webhook,
}

function successRateColor(rate: number): string {
  if (rate >= 99) return 'text-emerald-400'
  if (rate >= 95) return 'text-amber-400'
  return 'text-red-400'
}

function isExpiringSoon(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false
  const diff = new Date(dateStr).getTime() - Date.now()
  return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000
}

/* ─── Component ─── */

export function VendorsView() {
  const { data, loading, error, refetch } = useApi<VendorsData>(
    () => api.vendors.get()
  )

  /* local state */
  const [providerSearch, setProviderSearch] = useState('')
  const [providerTypeFilter, setProviderTypeFilter] = useState('all')
  const [providerStatusFilter, setProviderStatusFilter] = useState('all')

  const [callbackProviderFilter, setCallbackProviderFilter] = useState('all')

  const [gameProviderFilter, setGameProviderFilter] = useState('all')
  const [gameSearch, setGameSearch] = useState('')
  const [gameTypeFilter, setGameTypeFilter] = useState('all')
  const [gameActiveFilter, setGameActiveFilter] = useState('all')

  const [credProviderFilter, setCredProviderFilter] = useState('all')
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const [healthProviderFilter, setHealthProviderFilter] = useState('all')

  const [configDialogOpen, setConfigDialogOpen] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<GameProvider | null>(null)

  /* derived */
  const providers = data?.providers ?? []
  const callbacks = data?.callbacks ?? []
  const games = data?.games ?? []
  const credentials = data?.credentials ?? []
  const healthLogs = data?.healthLogs ?? []
  const stats = data?.stats

  const providerMap = useMemo(
    () => new Map(providers.map((p) => [p.id, p])),
    [providers]
  )

  const filteredProviders = useMemo(() => {
    return providers.filter((p) => {
      if (providerSearch && !p.name.toLowerCase().includes(providerSearch.toLowerCase())) return false
      if (providerTypeFilter !== 'all' && p.type !== providerTypeFilter) return false
      if (providerStatusFilter !== 'all' && p.status !== providerStatusFilter) return false
      return true
    })
  }, [providers, providerSearch, providerTypeFilter, providerStatusFilter])

  const filteredCallbacks = useMemo(() => {
    return callbacks.filter((c) => {
      if (callbackProviderFilter !== 'all' && c.providerId !== callbackProviderFilter) return false
      return true
    })
  }, [callbacks, callbackProviderFilter])

  const filteredGames = useMemo(() => {
    return games.filter((g) => {
      if (gameProviderFilter !== 'all' && g.providerId !== gameProviderFilter) return false
      if (gameSearch && !g.name.toLowerCase().includes(gameSearch.toLowerCase())) return false
      if (gameTypeFilter !== 'all' && g.type !== gameTypeFilter) return false
      if (gameActiveFilter === 'active' && !g.isActive) return false
      return true
    })
  }, [games, gameProviderFilter, gameSearch, gameTypeFilter, gameActiveFilter])

  const filteredCredentials = useMemo(() => {
    return credentials.filter((c) => {
      if (credProviderFilter !== 'all' && c.providerId !== credProviderFilter) return false
      return true
    })
  }, [credentials, credProviderFilter])

  const filteredHealth = useMemo(() => {
    return healthLogs.filter((h) => {
      if (healthProviderFilter !== 'all' && h.providerId !== healthProviderFilter) return false
      return true
    })
  }, [healthLogs, healthProviderFilter])

  /* copy handler (UI-only) */
  const handleCopy = (fieldId: string) => {
    setCopiedField(fieldId)
    setTimeout(() => setCopiedField(null), 2000)
  }

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  /* ─── Error ─── */
  if (error || !data) {
    return (
      <Card className="border-destructive/40">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="size-8 text-destructive mx-auto mb-2" />
          <p className="text-sm font-medium text-destructive">
            Failed to load vendors data
          </p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
          <Button variant="outline" size="sm" className="mt-3 gap-1" onClick={refetch}>
            <RefreshCw className="size-3" /> Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  /* ─── Provider select options ─── */
  const providerSelectItems = providers.map((p) => (
    <SelectItem key={p.id} value={p.id}>
      {p.name}
    </SelectItem>
  ))

  /* ─── Render ─── */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Server className="size-6 text-amber-500" />
            Vendors &amp; Providers
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage game providers, callbacks, credentials, and health monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1" onClick={refetch}>
            <RefreshCw className="size-3.5" /> Refresh
          </Button>
          <Button size="sm" className="gap-1 bg-amber-600 hover:bg-amber-700 text-white">
            <Plus className="size-3.5" /> Add Provider
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="providers" className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="providers" className="gap-1.5">
            <Server className="size-3.5" />
            <span className="hidden sm:inline">Providers</span>
          </TabsTrigger>
          <TabsTrigger value="callbacks" className="gap-1.5">
            <Webhook className="size-3.5" />
            <span className="hidden sm:inline">Callbacks</span>
          </TabsTrigger>
          <TabsTrigger value="games" className="gap-1.5">
            <Gamepad2 className="size-3.5" />
            <span className="hidden sm:inline">Games</span>
          </TabsTrigger>
          <TabsTrigger value="credentials" className="gap-1.5">
            <Key className="size-3.5" />
            <span className="hidden sm:inline">Credentials</span>
          </TabsTrigger>
          <TabsTrigger value="health" className="gap-1.5">
            <HeartPulse className="size-3.5" />
            <span className="hidden sm:inline">Health</span>
          </TabsTrigger>
        </TabsList>

        {/* ═══════ Tab 1: Providers ═══════ */}
        <TabsContent value="providers" className="space-y-4 mt-4">
          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      Total Providers
                    </p>
                    <p className="text-2xl font-bold text-primary mt-1">
                      {stats?.totalProviders ?? 0}
                    </p>
                  </div>
                  <Server className="size-8 text-amber-500/60" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {stats?.activeProviders ?? 0} active · {stats?.certifiedProviders ?? 0} certified
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      Active Games
                    </p>
                    <p className="text-2xl font-bold text-primary mt-1">
                      {stats?.activeGames?.toLocaleString() ?? 0}
                    </p>
                  </div>
                  <Gamepad2 className="size-8 text-amber-500/60" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  of {stats?.totalGames?.toLocaleString() ?? 0} total
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      Monthly Revenue
                    </p>
                    <p className="text-2xl font-bold text-primary mt-1">
                      {formatRevenue(stats?.totalMonthlyRevenue ?? 0)}
                    </p>
                  </div>
                  <TrendingUp className="size-8 text-amber-500/60" />
                </div>
                <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                  <TrendingUp className="size-3" /> Across all providers
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      Avg Uptime
                    </p>
                    <p className="text-2xl font-bold text-primary mt-1">
                      {(stats?.avgUptime ?? 0).toFixed(2)}%
                    </p>
                  </div>
                  <Activity className="size-8 text-amber-500/60" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Avg error rate: {(stats?.avgErrorRate ?? 0).toFixed(2)}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filter Bar */}
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search providers..."
                    value={providerSearch}
                    onChange={(e) => setProviderSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={providerTypeFilter} onValueChange={setProviderTypeFilter}>
                  <SelectTrigger className="w-full sm:w-[160px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="live_casino">Live Casino</SelectItem>
                    <SelectItem value="slots">Slots</SelectItem>
                    <SelectItem value="table_games">Table Games</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={providerStatusFilter} onValueChange={setProviderStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[160px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="disconnected">Disconnected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Provider Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredProviders.map((provider) => (
              <Card
                key={provider.id}
                className="bg-card border-border hover:border-amber-500/30 transition-colors"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        {provider.logoUrl ? (
                          <img
                            src={provider.logoUrl}
                            alt={provider.name}
                            className="size-8 rounded"
                          />
                        ) : (
                          <Server className="size-5 text-amber-500" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-base text-primary">
                          {provider.name}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {TYPE_LABELS[provider.type] ?? provider.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {provider.isCertified && (
                        <Badge
                          variant="outline"
                          className="bg-blue-500/15 text-blue-400 border-blue-500/25 text-[10px] px-1.5"
                        >
                          <Shield className="size-3 mr-0.5" /> Certified
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 ${STATUS_COLORS[provider.status] ?? STATUS_COLORS.pending}`}
                      >
                        {provider.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  {/* Metrics Row */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-bold text-primary">
                        {provider.activeGames}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Active Games</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-primary">
                        {provider.activePlayers}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Players</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-primary">
                        {formatRevenue(provider.monthlyRevenue)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Revenue</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Health Indicators */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p
                        className={`text-sm font-semibold ${
                          provider.errorRate > 2 ? 'text-red-400' : 'text-emerald-400'
                        }`}
                      >
                        {provider.errorRate.toFixed(2)}%
                      </p>
                      <p className="text-[10px] text-muted-foreground">Error Rate</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-primary">
                        {provider.avgLatencyMs}ms
                      </p>
                      <p className="text-[10px] text-muted-foreground">Latency</p>
                    </div>
                    <div>
                      <p
                        className={`text-sm font-semibold ${
                          provider.uptime >= 99.9
                            ? 'text-emerald-400'
                            : provider.uptime >= 99
                              ? 'text-amber-400'
                              : 'text-red-400'
                        }`}
                      >
                        {provider.uptime.toFixed(2)}%
                      </p>
                      <p className="text-[10px] text-muted-foreground">Uptime</p>
                    </div>
                  </div>

                  {/* Integration Info */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Zap className="size-3 text-amber-500" />
                    <span>{provider.integrationType}</span>
                    {provider.apiVersion && (
                      <>
                        <span className="text-border">·</span>
                        <span>v{provider.apiVersion}</span>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1 text-xs h-7"
                      onClick={() => {
                        setSelectedProvider(provider)
                        setConfigDialogOpen(true)
                      }}
                    >
                      <Settings className="size-3" /> Configure
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 gap-1 text-xs h-7">
                      <Eye className="size-3" /> Games
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 text-xs h-7"
                    >
                      <Activity className="size-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProviders.length === 0 && (
            <Card className="bg-card border-border">
              <CardContent className="p-8 text-center">
                <Server className="size-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No providers match your filters
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ═══════ Tab 2: Callbacks ═══════ */}
        <TabsContent value="callbacks" className="space-y-4 mt-4">
          {/* Filter */}
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <Select value={callbackProviderFilter} onValueChange={setCallbackProviderFilter}>
                  <SelectTrigger className="w-full sm:w-[220px]">
                    <SelectValue placeholder="All Providers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Providers</SelectItem>
                    {providerSelectItems}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {filteredCallbacks.length} callback{filteredCallbacks.length !== 1 ? 's' : ''}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Callbacks Table */}
          <Card className="bg-card border-border">
            <CardContent className="p-0">
              <ScrollArea className="max-h-96">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Provider</TableHead>
                      <TableHead>Callback</TableHead>
                      <TableHead>Event Type</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Auth</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Received</TableHead>
                      <TableHead className="text-right">Success Rate</TableHead>
                      <TableHead className="text-right">Avg ms</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCallbacks.map((cb) => {
                      const prov = providerMap.get(cb.providerId)
                      const sRate =
                        cb.totalReceived > 0
                          ? (cb.totalSuccess / cb.totalReceived) * 100
                          : 0
                      return (
                        <TableRow key={cb.id}>
                          <TableCell className="font-medium text-primary text-xs">
                            {prov?.name ?? '—'}
                          </TableCell>
                          <TableCell className="text-xs">{cb.name}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/25"
                            >
                              {cb.eventType}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs font-mono max-w-[200px] truncate">
                            {cb.url}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="text-[10px] bg-slate-500/10 text-slate-300 border-slate-500/25"
                            >
                              {cb.authType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${cb.isActive ? STATUS_COLORS.active : STATUS_COLORS.suspended}`}
                            >
                              {cb.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {relativeTime(cb.lastReceivedAt)}
                          </TableCell>
                          <TableCell
                            className={`text-xs text-right font-semibold ${successRateColor(sRate)}`}
                          >
                            {sRate.toFixed(1)}%
                          </TableCell>
                          <TableCell className="text-xs text-right text-muted-foreground">
                            {cb.avgProcessingMs}ms
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>

          {filteredCallbacks.length === 0 && (
            <Card className="bg-card border-border">
              <CardContent className="p-8 text-center">
                <Webhook className="size-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No callbacks found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ═══════ Tab 3: Games ═══════ */}
        <TabsContent value="games" className="space-y-4 mt-4">
          {/* Filters */}
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={gameProviderFilter} onValueChange={setGameProviderFilter}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="All Providers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Providers</SelectItem>
                    {providerSelectItems}
                  </SelectContent>
                </Select>
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search games..."
                    value={gameSearch}
                    onChange={(e) => setGameSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={gameTypeFilter} onValueChange={setGameTypeFilter}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="slot">Slot</SelectItem>
                    <SelectItem value="live_table">Live Table</SelectItem>
                    <SelectItem value="jackpot">Jackpot</SelectItem>
                    <SelectItem value="table_game">Table Game</SelectItem>
                    <SelectItem value="instant_win">Instant Win</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={gameActiveFilter} onValueChange={setGameActiveFilter}>
                  <SelectTrigger className="w-full sm:w-[120px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Games Table */}
          <Card className="bg-card border-border">
            <CardContent className="p-0">
              <ScrollArea className="max-h-96">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Game</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">RTP</TableHead>
                      <TableHead>Volatility</TableHead>
                      <TableHead className="text-right">Max Win</TableHead>
                      <TableHead className="text-right">Bet Range</TableHead>
                      <TableHead className="text-right">Sessions</TableHead>
                      <TableHead className="text-right">Popularity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGames.map((game) => {
                      const prov = providerMap.get(game.providerId)
                      return (
                        <TableRow key={game.id}>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-xs text-primary">
                                {game.name}
                              </span>
                              {game.isNew && (
                                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[9px] px-1 py-0">
                                  NEW
                                </Badge>
                              )}
                              {game.isFeatured && (
                                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-[9px] px-1 py-0">
                                  FEATURED
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {prov?.name ?? '—'}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/25"
                            >
                              {GAME_TYPE_LABELS[game.type] ?? game.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-right font-mono">
                            {game.rtp != null ? `${game.rtp.toFixed(1)}%` : '—'}
                          </TableCell>
                          <TableCell>
                            {game.volatility ? (
                              <Badge
                                variant="outline"
                                className={`text-[10px] ${VOLATILITY_STYLES[game.volatility] ?? ''} ${game.volatility === 'very_high' ? 'animate-pulse' : ''}`}
                              >
                                {game.volatility.replace('_', ' ')}
                              </Badge>
                            ) : (
                              '—'
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-right font-mono">
                            {game.maxWin != null
                              ? game.maxWin >= 1000
                                ? `${(game.maxWin / 1000).toFixed(0)}K`
                                : game.maxWin.toFixed(0)
                              : '—'}
                          </TableCell>
                          <TableCell className="text-xs text-right font-mono">
                            {game.minBet != null && game.maxBet != null
                              ? `$${game.minBet}-$${game.maxBet}`
                              : '—'}
                          </TableCell>
                          <TableCell className="text-xs text-right text-muted-foreground">
                            {game.totalSessions.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-amber-500"
                                  style={{ width: `${Math.min(game.popularityScore, 100)}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-muted-foreground w-6 text-right">
                                {game.popularityScore}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>

          {filteredGames.length === 0 && (
            <Card className="bg-card border-border">
              <CardContent className="p-8 text-center">
                <Gamepad2 className="size-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No games match your filters</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ═══════ Tab 4: Credentials ═══════ */}
        <TabsContent value="credentials" className="space-y-4 mt-4">
          {/* Filter */}
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <Select value={credProviderFilter} onValueChange={setCredProviderFilter}>
                  <SelectTrigger className="w-full sm:w-[220px]">
                    <SelectValue placeholder="All Providers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Providers</SelectItem>
                    {providerSelectItems}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {filteredCredentials.length} credential set{filteredCredentials.length !== 1 ? 's' : ''}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Credential Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCredentials.map((cred) => {
              const prov = providerMap.get(cred.providerId)
              const expiringSoon = isExpiringSoon(cred.expiresAt)
              const expired =
                cred.expiresAt && new Date(cred.expiresAt).getTime() < Date.now()

              return (
                <Card
                  key={cred.id}
                  className={`bg-card border-border ${expiringSoon ? 'border-amber-500/40' : ''} ${expired ? 'border-red-500/40' : ''}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base text-primary">
                          {prov?.name ?? 'Unknown Provider'}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {cred.environment} environment
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${ENV_STYLES[cred.environment] ?? ENV_STYLES.sandbox}`}
                        >
                          {cred.environment}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${cred.isActive ? STATUS_COLORS.active : STATUS_COLORS.suspended}`}
                        >
                          {cred.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    {/* API Key */}
                    {cred.apiKey && (
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            API Key
                          </p>
                          <p className="text-xs font-mono text-primary truncate">
                            {maskValue(cred.apiKey)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="size-7 p-0 shrink-0"
                          onClick={() => handleCopy(`${cred.id}-apikey`)}
                        >
                          {copiedField === `${cred.id}-apikey` ? (
                            <CheckCircle className="size-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="size-3.5 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    )}

                    {/* API Secret */}
                    {cred.apiSecret && (
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            API Secret
                          </p>
                          <p className="text-xs font-mono text-primary truncate">
                            {maskValue(cred.apiSecret)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="size-7 p-0 shrink-0"
                          onClick={() => handleCopy(`${cred.id}-apisecret`)}
                        >
                          {copiedField === `${cred.id}-apisecret` ? (
                            <CheckCircle className="size-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="size-3.5 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Bearer Token */}
                    {cred.bearerToken && (
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            Bearer Token
                          </p>
                          <p className="text-xs font-mono text-primary truncate">
                            {maskValue(cred.bearerToken)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="size-7 p-0 shrink-0"
                          onClick={() => handleCopy(`${cred.id}-bearer`)}
                        >
                          {copiedField === `${cred.id}-bearer` ? (
                            <CheckCircle className="size-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="size-3.5 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    )}

                    <Separator />

                    {/* Expiry & Last Used */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="size-3" />
                        <span>Last used: {relativeTime(cred.lastUsedAt)}</span>
                      </div>
                      {cred.expiresAt && (
                        <div className="flex items-center gap-1.5">
                          {expired ? (
                            <>
                              <XCircle className="size-3 text-red-400" />
                              <span className="text-red-400">Expired</span>
                            </>
                          ) : expiringSoon ? (
                            <>
                              <AlertTriangle className="size-3 text-amber-400" />
                              <span className="text-amber-400">
                                Expires {relativeTime(cred.expiresAt)}
                              </span>
                            </>
                          ) : (
                            <>
                              <Lock className="size-3" />
                              <span>Expires {relativeTime(cred.expiresAt)}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredCredentials.length === 0 && (
            <Card className="bg-card border-border">
              <CardContent className="p-8 text-center">
                <Key className="size-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No credentials found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ═══════ Tab 5: Health ═══════ */}
        <TabsContent value="health" className="space-y-4 mt-4">
          {/* Filter */}
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <Select value={healthProviderFilter} onValueChange={setHealthProviderFilter}>
                  <SelectTrigger className="w-full sm:w-[220px]">
                    <SelectValue placeholder="All Providers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Providers</SelectItem>
                    {providerSelectItems}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {filteredHealth.length} log{filteredHealth.length !== 1 ? 's' : ''}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Health Table */}
          <Card className="bg-card border-border">
            <CardContent className="p-0">
              <ScrollArea className="max-h-96">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Provider</TableHead>
                      <TableHead>Metric</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead className="text-right">Threshold</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Checked</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHealth.map((log) => {
                      const prov = providerMap.get(log.providerId)
                      const MetricIcon = METRIC_ICONS[log.metric] ?? Activity
                      return (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium text-xs text-primary">
                            {prov?.name ?? '—'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <MetricIcon className="size-3.5 text-amber-500" />
                              <span className="text-xs">
                                {log.metric.replace(/_/g, ' ')}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-right font-mono font-semibold">
                            {log.value} {log.unit}
                          </TableCell>
                          <TableCell className="text-xs text-right font-mono text-muted-foreground">
                            {log.threshold != null ? `${log.threshold} ${log.unit}` : '—'}
                          </TableCell>
                          <TableCell>
                            {log.isAlert ? (
                              <Badge
                                variant="outline"
                                className="text-[10px] bg-red-500/15 text-red-400 border-red-500/25 gap-1"
                              >
                                <XCircle className="size-3" /> ALERT
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-[10px] bg-emerald-500/15 text-emerald-400 border-emerald-500/25 gap-1"
                              >
                                <CheckCircle className="size-3" /> OK
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {relativeTime(log.checkedAt)}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>

          {filteredHealth.length === 0 && (
            <Card className="bg-card border-border">
              <CardContent className="p-8 text-center">
                <HeartPulse className="size-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No health logs found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* ═══════ Configure Provider Dialog ═══════ */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="size-5 text-amber-500" />
              Configure Provider
              {selectedProvider && (
                <span className="text-muted-foreground font-normal">
                  — {selectedProvider.name}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedProvider && (
            <div className="space-y-4 py-2">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Provider Name</Label>
                  <Input value={selectedProvider.name} readOnly className="text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Integration Type</Label>
                  <Input value={selectedProvider.integrationType} readOnly className="text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Base URL</Label>
                  <Input
                    value={selectedProvider.baseUrl ?? ''}
                    readOnly
                    className="text-xs font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Callback URL</Label>
                  <Input
                    value={selectedProvider.callbackUrl ?? ''}
                    readOnly
                    className="text-xs font-mono"
                  />
                </div>
              </div>

              <Separator />

              {/* Settings */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs">Active</Label>
                    <p className="text-[10px] text-muted-foreground">
                      Enable or disable this provider
                    </p>
                  </div>
                  <Switch defaultChecked={selectedProvider.isActive} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs">Certified</Label>
                    <p className="text-[10px] text-muted-foreground">
                      Provider certification status
                    </p>
                  </div>
                  <Switch defaultChecked={selectedProvider.isCertified} disabled />
                </div>
              </div>

              <Separator />

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">API Version</Label>
                  <Input
                    value={selectedProvider.apiVersion ?? '—'}
                    readOnly
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Max Concurrent Sessions</Label>
                  <Input
                    value={String(selectedProvider.maxConcurrentSessions)}
                    readOnly
                    className="text-xs"
                  />
                </div>
              </div>

              {selectedProvider.allowedIps && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Allowed IPs</Label>
                  <Textarea
                    value={selectedProvider.allowedIps}
                    readOnly
                    className="text-xs font-mono min-h-[60px]"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfigDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-700 text-white gap-1"
                  onClick={() => setConfigDialogOpen(false)}
                >
                  <CheckCircle className="size-3.5" /> Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
