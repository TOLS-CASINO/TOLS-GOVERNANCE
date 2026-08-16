'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import {
  Users,
  Activity,
  Globe,
  Trophy,
  Crown,
  LogIn,
  Play,
  ArrowDown,
  ArrowUp,
  Gift,
  ChevronUp,
  Monitor,
  Smartphone,
  RefreshCw,
  Wifi,
  Clock,
  Zap,
  Search,
  AlertTriangle,
  Pause,
  Eye,
  Square,
  Percent,
  Timer,
  BarChart3,
  ShieldCheck,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useApi } from '@/hooks/use-api'
import { api } from '@/services/api'

const fmt = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
const fmtDec = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const COUNTRY_FLAGS: Record<string, string> = {
  US: '🇺🇸', GB: '🇬🇧', DE: '🇩🇪', FR: '🇫🇷', CA: '🇨🇦', AU: '🇦🇺',
  JP: '🇯🇵', BR: '🇧🇷', IN: '🇮🇳', MX: '🇲🇽', NL: '🇳🇱', SE: '🇸🇪',
  NO: '🇳🇴', FI: '🇫🇮', DK: '🇩🇰', IT: '🇮🇹', ES: '🇪🇸', PT: '🇵🇹',
  PL: '🇵🇱', CZ: '🇨🇿',
}

const DEVICE_COLORS: Record<string, string> = {
  desktop: '#f59e0b',
  mobile: '#10b981',
  tablet: '#6366f1',
}

const EVENT_CONFIG: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  player_login: { color: 'text-blue-400', icon: LogIn, label: 'logged in' },
  game_start: { color: 'text-emerald-400', icon: Play, label: 'started playing' },
  big_win: { color: 'text-amber-400', icon: Trophy, label: 'won big on' },
  jackpot_win: { color: 'text-yellow-300', icon: Crown, label: 'hit JACKPOT on' },
  deposit: { color: 'text-emerald-500', icon: ArrowDown, label: 'deposited to' },
  withdrawal: { color: 'text-orange-400', icon: ArrowUp, label: 'withdrew from' },
  bonus_claim: { color: 'text-purple-400', icon: Gift, label: 'claimed bonus on' },
  level_up: { color: 'text-cyan-400', icon: ChevronUp, label: 'leveled up on' },
}

const DEVICE_ICON: Record<string, React.ElementType> = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Smartphone,
}

function formatDuration(start: string, end: string): string {
  const ms = new Date(end).getTime() - new Date(start).getTime()
  const mins = Math.floor(ms / 60000)
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  const remMins = mins % 60
  return `${hrs}h ${remMins}m`
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const secs = Math.floor(diff / 1000)
  if (secs < 60) return `${secs}s ago`
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  return `${hrs}h ago`
}

function isNew(dateStr: string): boolean {
  return Date.now() - new Date(dateStr).getTime() < 30000
}

interface LiveSession {
  id: string; playerId: string; playerName: string; gameId: string; gameName: string;
  country: string; city: string; latitude: number; longitude: number;
  deviceType: string; browser: string; os: string; entryPoint: string;
  wagerAmount: number; winAmount: number; spinsPlayed: number;
  startedAt: string; lastActivityAt: string; status: string;
}

interface LiveEvent {
  id: string; eventType: string; playerName: string; gameName: string;
  amount: number; currency: string; country: string; createdAt: string;
}

interface LiveStats {
  totalOnline: number; activeGames: number; avgSessionDuration: number;
  peakConcurrent: number; totalWageredLive: number; totalWonLive: number;
  byDevice: { desktop: number; mobile: number; tablet: number };
  byCountry: Array<{ country: string; count: number }>;
  byGame: Array<{ game: string; count: number }>;
}

interface RtpMonitoring {
  id: string; gameId: string; gameName: string; provider: string; gameType: string;
  theoreticalRtp: number; actualRtp24h: number; actualRtp7d: number; actualRtp30d: number;
  totalSpins: number; totalWagered: number; totalWon: number; variance: number;
  status: 'normal' | 'warning' | 'alert' | 'critical'; lastCheckedAt: string;
}

interface TrackingSession {
  id: string; playerId: string; playerUsername: string; gameId: string; gameName: string;
  provider: string; gameType: string; status: 'active' | 'idle' | 'ended';
  startedAt: string; lastActivityAt: string; durationMinutes: number;
  totalBets: number; totalWagered: number; totalWon: number; netResult: number;
  rtp: number; ip: string; country: string; device: string;
  betRange: string; avgBetSize: number;
}

interface TrackingBet {
  id: string; sessionId: string; playerId: string; playerUsername: string;
  gameId: string; gameName: string; roundId: string; betAmount: number;
  winAmount: number; netResult: number; currency: string; multiplier: number;
  isFreeSpin: boolean; isBonus: boolean; createdAt: string;
}

export function LivePlayersView() {
  const { data, loading, error, refetch } = useApi(() => api.livePlayers.get())
  const { data: trackingData } = useApi(() => api.playerTracking.get())
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [gameFilter, setGameFilter] = useState('all')
  const [countryFilter, setCountryFilter] = useState('all')
  const [deviceFilter, setDeviceFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const feedEndRef = useRef<HTMLDivElement>(null)
  const [now, setNow] = useState(Date.now())

  // RTP Control filters
  const [rtpStatusFilter, setRtpStatusFilter] = useState('all')
  const [rtpGameTypeFilter, setRtpGameTypeFilter] = useState('all')
  const [rtpSearch, setRtpSearch] = useState('')

  // Session Control filters
  const [scStatusFilter, setScStatusFilter] = useState('active')
  const [scGameTypeFilter, setScGameTypeFilter] = useState('all')
  const [scDeviceFilter, setScDeviceFilter] = useState('all')
  const [scSearch, setScSearch] = useState('')
  const [selectedSession, setSelectedSession] = useState<TrackingSession | null>(null)

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(() => refetch(), 15000)
    return () => clearInterval(interval)
  }, [autoRefresh, refetch])

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [data?.liveEvents])

  const sessions: LiveSession[] = data?.activeSessions ?? []
  const events: LiveEvent[] = data?.liveEvents ?? []
  const stats: LiveStats | null = data?.stats ?? null

  const uniqueGames = useMemo(() => [...new Set(sessions.map(s => s.gameName))].sort(), [sessions])
  const uniqueCountries = useMemo(() => [...new Set(sessions.map(s => s.country))].sort(), [sessions])

  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      if (gameFilter !== 'all' && s.gameName !== gameFilter) return false
      if (countryFilter !== 'all' && s.country !== countryFilter) return false
      if (deviceFilter !== 'all' && s.deviceType !== deviceFilter) return false
      if (statusFilter !== 'all' && s.status !== statusFilter) return false
      if (searchQuery && !s.playerName.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
  }, [sessions, gameFilter, countryFilter, deviceFilter, statusFilter, searchQuery])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-4 sm:p-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
          ))}
        </div>
        <Card><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
      </div>
    )
  }

  if (error || !data) {
    return (
      <Card className="border-destructive/40">
        <CardContent className="p-6 text-center">
          <Activity className="size-8 text-destructive mx-auto mb-2" />
          <p className="text-sm font-medium text-destructive">Failed to load live player data</p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
          <Button variant="outline" size="sm" className="mt-3 gap-1" onClick={refetch}>
            <RefreshCw className="size-3" /> Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  const statusBadge = (status: string) => {
    if (status === 'active') {
      return (
        <Badge className="text-[9px] h-4 bg-emerald-500/20 text-emerald-400 border-emerald-500/30 gap-1">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Active
        </Badge>
      )
    }
    if (status === 'idle') {
      return <Badge className="text-[9px] h-4 bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Idle</Badge>
    }
    return <Badge variant="secondary" className="text-[9px] h-4">Ended</Badge>
  }

  const devicePct = (type: string) => {
    if (!stats) return 0
    const total = stats.byDevice.desktop + stats.byDevice.mobile + stats.byDevice.tablet
    return total > 0 ? Math.round((stats.byDevice[type as keyof typeof stats.byDevice] / total) * 100) : 0
  }

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Wifi className="size-4 text-emerald-400" />
          <span className="text-sm font-medium text-emerald-400">LIVE</span>
          <Badge variant="secondary" className="text-[10px]">{stats?.totalOnline ?? 0} online</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1 text-xs h-7"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`size-3 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </Button>
          <Button variant="outline" size="sm" className="gap-1 text-xs h-7" onClick={refetch}>
            <RefreshCw className="size-3" /> Refresh
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="sessions" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 h-9">
          <TabsTrigger value="sessions" className="text-xs gap-1">
            <Users className="size-3" /> Sessions
          </TabsTrigger>
          <TabsTrigger value="feed" className="text-xs gap-1">
            <Activity className="size-3" /> Feed
          </TabsTrigger>
          <TabsTrigger value="region" className="text-xs gap-1">
            <Globe className="size-3" /> By Region
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs gap-1">
            <Zap className="size-3" /> Analytics
          </TabsTrigger>
          <TabsTrigger value="rtp-control" className="text-xs gap-1">
            <Percent className="size-3" /> RTP Control
          </TabsTrigger>
          <TabsTrigger value="session-control" className="text-xs gap-1">
            <Timer className="size-3" /> Session Ctrl
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Active Sessions */}
        <TabsContent value="sessions" className="mt-4 space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-3">
              <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
                <div className="relative flex-1 min-w-[140px]">
                  <Users className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                  <Input
                    placeholder="Search player..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-8 text-xs"
                  />
                </div>
                <Select value={gameFilter} onValueChange={setGameFilter}>
                  <SelectTrigger className="w-full sm:w-[150px] h-8 text-xs"><SelectValue placeholder="All Games" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Games</SelectItem>
                    {uniqueGames.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={countryFilter} onValueChange={setCountryFilter}>
                  <SelectTrigger className="w-full sm:w-[100px] h-8 text-xs"><SelectValue placeholder="Country" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    {uniqueCountries.map(c => <SelectItem key={c} value={c}>{COUNTRY_FLAGS[c] || ''} {c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={deviceFilter} onValueChange={setDeviceFilter}>
                  <SelectTrigger className="w-full sm:w-[100px] h-8 text-xs"><SelectValue placeholder="Device" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Devices</SelectItem>
                    <SelectItem value="desktop">Desktop</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                    <SelectItem value="tablet">Tablet</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[100px] h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="idle">Idle</SelectItem>
                    <SelectItem value="ended">Ended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Sessions Table */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Active Sessions</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">{filteredSessions.length} sessions</Badge>
                  {autoRefresh && (
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <RefreshCw className="size-3 animate-spin text-primary" />
                      Live
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Player</TableHead>
                      <TableHead className="text-xs">Game</TableHead>
                      <TableHead className="text-xs">Country</TableHead>
                      <TableHead className="text-xs">Device</TableHead>
                      <TableHead className="text-xs text-right">Wager</TableHead>
                      <TableHead className="text-xs text-right">Win</TableHead>
                      <TableHead className="text-xs text-right">Spins</TableHead>
                      <TableHead className="text-xs">Duration</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSessions.map(session => {
                      const DeviceIcon = DEVICE_ICON[session.deviceType] || Monitor
                      const isExpanded = expandedRow === session.id
                      return (
                        <TableRow
                          key={session.id}
                          className="cursor-pointer hover:bg-muted/80"
                          onClick={() => setExpandedRow(isExpanded ? null : session.id)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <span className="size-5 rounded-full bg-primary/20 text-primary text-[8px] font-bold flex items-center justify-center shrink-0">
                                {session.playerName.slice(0, 2).toUpperCase()}
                              </span>
                              <span className="text-xs font-medium truncate max-w-[80px]">{session.playerName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs truncate max-w-[100px]">{session.gameName}</TableCell>
                          <TableCell>
                            <span className="text-xs">{COUNTRY_FLAGS[session.country] || session.country}</span>
                          </TableCell>
                          <TableCell>
                            <DeviceIcon className="size-3.5 text-muted-foreground" />
                          </TableCell>
                          <TableCell className="text-xs text-right font-mono">{fmtDec(session.wagerAmount)}</TableCell>
                          <TableCell className="text-xs text-right font-mono">{fmtDec(session.winAmount)}</TableCell>
                          <TableCell className="text-xs text-right">{session.spinsPlayed}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatDuration(session.startedAt, session.lastActivityAt)}
                          </TableCell>
                          <TableCell>{statusBadge(session.status)}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Expanded Row Detail */}
              {expandedRow && (() => {
                const session = filteredSessions.find(s => s.id === expandedRow)
                if (!session) return null
                return (
                  <div className="mt-3 p-3 rounded-lg border border-primary/20 bg-muted/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-primary">Session Details — {session.playerName}</h4>
                      <Badge variant="outline" className="text-[9px] h-4">{session.id}</Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <div className="p-2 rounded bg-muted/50"><span className="text-muted-foreground">Player ID</span><br /><span className="font-medium">{session.playerId}</span></div>
                      <div className="p-2 rounded bg-muted/50"><span className="text-muted-foreground">City</span><br /><span className="font-medium">{session.city}, {session.country}</span></div>
                      <div className="p-2 rounded bg-muted/50"><span className="text-muted-foreground">Browser</span><br /><span className="font-medium">{session.browser}</span></div>
                      <div className="p-2 rounded bg-muted/50"><span className="text-muted-foreground">OS</span><br /><span className="font-medium">{session.os}</span></div>
                      <div className="p-2 rounded bg-muted/50"><span className="text-muted-foreground">Entry Point</span><br /><span className="font-medium">{session.entryPoint}</span></div>
                      <div className="p-2 rounded bg-muted/50"><span className="text-muted-foreground">Started</span><br /><span className="font-medium">{new Date(session.startedAt).toLocaleTimeString()}</span></div>
                      <div className="p-2 rounded bg-muted/50"><span className="text-muted-foreground">Last Activity</span><br /><span className="font-medium">{new Date(session.lastActivityAt).toLocaleTimeString()}</span></div>
                      <div className="p-2 rounded bg-muted/50"><span className="text-muted-foreground">Net Result</span><br /><span className={`font-mono font-bold ${session.winAmount - session.wagerAmount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmtDec(session.winAmount - session.wagerAmount)}</span></div>
                    </div>
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Activity Feed */}
        <TabsContent value="feed" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Activity Feed</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">{events.length} events</Badge>
                  {autoRefresh && (
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <RefreshCw className="size-3 animate-spin text-primary" /> Live
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-1.5 pr-3">
                  {events.map(event => {
                    const config = EVENT_CONFIG[event.eventType]
                    if (!config) return null
                    const EventIcon = config.icon
                    const eventIsNew = isNew(event.createdAt)
                    const isJackpot = event.eventType === 'jackpot_win'
                    const isBigWin = event.eventType === 'big_win'

                    return (
                      <div
                        key={event.id}
                        className={`flex items-start gap-2.5 p-2 rounded-md transition-colors ${
                          eventIsNew ? 'bg-primary/5 border border-primary/10' : 'hover:bg-muted/30'
                        }`}
                      >
                        <div className={`mt-0.5 shrink-0 ${config.color} ${isBigWin ? 'animate-pulse' : ''}`}>
                          <EventIcon className={`size-4 ${isJackpot ? 'animate-pulse' : ''}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-medium">{event.playerName}</span>
                            <span className={`text-[10px] ${config.color}`}>{config.label}</span>
                            {event.amount > 0 && (
                              <span className="text-xs font-mono font-bold text-primary">
                                {fmtDec(event.amount)}
                              </span>
                            )}
                            {eventIsNew && (
                              <Badge className="text-[8px] h-3.5 px-1 bg-primary/20 text-primary border-primary/30 animate-pulse">
                                NEW
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-muted-foreground truncate">{event.gameName}</span>
                            <span className="text-[10px]">{COUNTRY_FLAGS[event.country] || ''}</span>
                          </div>
                        </div>
                        <div className="shrink-0 text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="size-2.5" />
                          {formatTimeAgo(event.createdAt)}
                        </div>
                      </div>
                    )
                  })}
                  <div ref={feedEndRef} />
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: By Region */}
        <TabsContent value="region" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Players by Region</CardTitle>
                <Badge variant="secondary" className="text-[10px]">Top 10</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {stats ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {stats.byCountry.slice(0, 10).map((item, index) => {
                    const maxCount = stats.byCountry[0]?.count || 1
                    const intensity = Math.max(0.15, item.count / maxCount)
                    const countryWagered = sessions
                      .filter(s => s.country === item.country)
                      .reduce((sum, s) => sum + s.wagerAmount, 0)
                    return (
                      <div
                        key={item.country}
                        className="p-3 rounded-lg border border-border hover:border-primary/30 transition-all cursor-default"
                        style={{ backgroundColor: `rgba(245, 158, 11, ${intensity * 0.12})` }}
                      >
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="text-lg">{COUNTRY_FLAGS[item.country] || '🌍'}</span>
                          <span className="text-xs font-semibold">{item.country}</span>
                          {index === 0 && <Trophy className="size-3 text-amber-400" />}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-muted-foreground">Players</span>
                            <span className="text-xs font-bold text-primary">{item.count}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-muted-foreground">Wagered</span>
                            <span className="text-[10px] font-mono font-medium">{fmt(countryWagered)}</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-1 mt-1">
                            <div
                              className="h-full rounded-full bg-primary/70 transition-all"
                              style={{ width: `${intensity * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-muted-foreground">No region data</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Session Analytics */}
        <TabsContent value="analytics" className="mt-4 space-y-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="size-3.5 text-primary" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg Duration</span>
                </div>
                <p className="text-base sm:text-lg font-bold">{stats?.avgSessionDuration ?? 0}<span className="text-xs font-normal text-muted-foreground ml-1">min</span></p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="size-3.5 text-primary" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Peak Concurrent</span>
                </div>
                <p className="text-base sm:text-lg font-bold">{stats?.peakConcurrent ?? 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="size-3.5 text-amber-400" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Wagered</span>
                </div>
                <p className="text-base sm:text-lg font-bold">{fmt(stats?.totalWageredLive ?? 0)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="size-3.5 text-emerald-400" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Won</span>
                </div>
                <p className="text-base sm:text-lg font-bold">{fmt(stats?.totalWonLive ?? 0)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Device Distribution PieChart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Device Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {stats ? (
                  <div className="flex flex-col items-center">
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Desktop', value: stats.byDevice.desktop },
                            { name: 'Mobile', value: stats.byDevice.mobile },
                            { name: 'Tablet', value: stats.byDevice.tablet },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={3}
                          dataKey="value"
                          stroke="none"
                        >
                          <Cell fill={DEVICE_COLORS.desktop} />
                          <Cell fill={DEVICE_COLORS.mobile} />
                          <Cell fill={DEVICE_COLORS.tablet} />
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--popover))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px',
                            fontSize: '11px',
                          }}
                          formatter={(value: number) => [value, 'Players']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      {(['desktop', 'mobile', 'tablet'] as const).map(type => (
                        <div key={type} className="flex items-center gap-1.5">
                          <span className="size-2.5 rounded-full" style={{ backgroundColor: DEVICE_COLORS[type] }} />
                          <span className="text-[10px] text-muted-foreground capitalize">{type}</span>
                          <span className="text-[10px] font-bold">{devicePct(type)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Skeleton className="h-48 w-full" />
                )}
              </CardContent>
            </Card>

            {/* Players by Game BarChart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Players by Game</CardTitle>
              </CardHeader>
              <CardContent>
                {stats ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      data={stats.byGame.slice(0, 8)}
                      layout="vertical"
                      margin={{ top: 0, right: 20, bottom: 0, left: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis
                        type="category"
                        dataKey="game"
                        tick={{ fontSize: 9 }}
                        stroke="hsl(var(--muted-foreground))"
                        width={90}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px',
                          fontSize: '11px',
                        }}
                        formatter={(value: number) => [value, 'Players']}
                      />
                      <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={14} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Skeleton className="h-48 w-full" />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Session Duration Histogram */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Session Duration Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const buckets = [
                  { label: '0-5m', min: 0, max: 5 },
                  { label: '5-15m', min: 5, max: 15 },
                  { label: '15-30m', min: 15, max: 30 },
                  { label: '30-60m', min: 30, max: 60 },
                  { label: '60-120m', min: 60, max: 120 },
                  { label: '120m+', min: 120, max: Infinity },
                ]
                const histogram = buckets.map(b => {
                  const count = sessions.filter(s => {
                    const dur = (new Date(s.lastActivityAt).getTime() - new Date(s.startedAt).getTime()) / 60000
                    return dur >= b.min && dur < b.max
                  }).length
                  return { label: b.label, count }
                })
                return (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={histogram} margin={{ top: 0, right: 20, bottom: 0, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px',
                          fontSize: '11px',
                        }}
                        formatter={(value: number) => [value, 'Sessions']}
                      />
                      <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                )
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: RTP Control */}
        <TabsContent value="rtp-control" className="mt-4 space-y-4">
          {(() => {
            const rtpData: RtpMonitoring[] = trackingData?.rtpMonitoring ?? []
            const filteredRtp = rtpData.filter(r => {
              if (rtpStatusFilter !== 'all' && r.status !== rtpStatusFilter) return false
              if (rtpGameTypeFilter !== 'all' && r.gameType !== rtpGameTypeFilter) return false
              if (rtpSearch && !r.gameName.toLowerCase().includes(rtpSearch.toLowerCase()) && !r.provider.toLowerCase().includes(rtpSearch.toLowerCase())) return false
              return true
            })
            const normalCount = rtpData.filter(r => r.status === 'normal').length
            const warningCount = rtpData.filter(r => r.status === 'warning').length
            const alertCount = rtpData.filter(r => r.status === 'alert' || r.status === 'critical').length
            const alertGames = rtpData.filter(r => r.status === 'warning' || r.status === 'alert' || r.status === 'critical')

            const rtpColor = (actual: number, theoretical: number) => {
              const diff = Math.abs(actual - theoretical)
              if (diff <= 1) return 'text-emerald-400'
              if (diff <= 3) return 'text-yellow-400'
              return 'text-red-400'
            }

            const rtpStatusBadge = (status: string) => {
              if (status === 'normal') return <Badge className="text-[9px] h-4 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Normal</Badge>
              if (status === 'warning') return <Badge variant="outline" className="text-[9px] h-4 border-yellow-500/30 text-yellow-400">Warning</Badge>
              if (status === 'alert') return <Badge variant="secondary" className="text-[9px] h-4 bg-orange-500/20 text-orange-400">Alert</Badge>
              return <Badge variant="destructive" className="text-[9px] h-4">Critical</Badge>
            }

            return (
              <>
                {/* Summary Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Card>
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <BarChart3 className="size-3.5 text-primary" />
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Games Monitored</span>
                      </div>
                      <p className="text-base sm:text-lg font-bold">{rtpData.length}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <ShieldCheck className="size-3.5 text-emerald-400" />
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Normal</span>
                      </div>
                      <p className="text-base sm:text-lg font-bold text-emerald-400">{normalCount}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="size-3.5 text-yellow-400" />
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Warning</span>
                      </div>
                      <p className="text-base sm:text-lg font-bold text-yellow-400">{warningCount}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="size-3.5 text-red-400" />
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Alert/Critical</span>
                      </div>
                      <p className="text-base sm:text-lg font-bold text-red-400">{alertCount}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Filters */}
                <Card>
                  <CardContent className="p-3">
                    <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
                      <div className="relative flex-1 min-w-[140px]">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                        <Input
                          placeholder="Search game or provider..."
                          value={rtpSearch}
                          onChange={(e) => setRtpSearch(e.target.value)}
                          className="pl-8 h-8 text-xs"
                        />
                      </div>
                      <Select value={rtpStatusFilter} onValueChange={setRtpStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[120px] h-8 text-xs"><SelectValue placeholder="All Status" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="warning">Warning</SelectItem>
                          <SelectItem value="alert">Alert</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={rtpGameTypeFilter} onValueChange={setRtpGameTypeFilter}>
                        <SelectTrigger className="w-full sm:w-[120px] h-8 text-xs"><SelectValue placeholder="All Types" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="slot">Slot</SelectItem>
                          <SelectItem value="live_table">Live Table</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* RTP Monitoring Table */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">RTP Monitoring</CardTitle>
                      <Badge variant="secondary" className="text-[10px]">{filteredRtp.length} games</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">Game</TableHead>
                            <TableHead className="text-xs hidden sm:table-cell">Provider</TableHead>
                            <TableHead className="text-xs">Type</TableHead>
                            <TableHead className="text-xs text-right">Theo. RTP</TableHead>
                            <TableHead className="text-xs text-right">24h</TableHead>
                            <TableHead className="text-xs text-right hidden sm:table-cell">7d</TableHead>
                            <TableHead className="text-xs text-right hidden md:table-cell">30d</TableHead>
                            <TableHead className="text-xs text-right hidden lg:table-cell">Variance</TableHead>
                            <TableHead className="text-xs text-right hidden md:table-cell">Spins</TableHead>
                            <TableHead className="text-xs">Status</TableHead>
                            <TableHead className="text-xs hidden sm:table-cell">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredRtp.map(rtp => (
                            <TableRow key={rtp.id}>
                              <TableCell className="text-xs font-medium truncate max-w-[120px]">{rtp.gameName}</TableCell>
                              <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{rtp.provider}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-[9px] h-4">
                                  {rtp.gameType === 'slot' ? 'Slot' : 'Live'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs text-right font-mono">{rtp.theoreticalRtp.toFixed(2)}%</TableCell>
                              <TableCell className={`text-xs text-right font-mono ${rtpColor(rtp.actualRtp24h, rtp.theoreticalRtp)}`}>
                                {rtp.actualRtp24h.toFixed(1)}%
                              </TableCell>
                              <TableCell className={`text-xs text-right font-mono hidden sm:table-cell ${rtpColor(rtp.actualRtp7d, rtp.theoreticalRtp)}`}>
                                {rtp.actualRtp7d.toFixed(1)}%
                              </TableCell>
                              <TableCell className={`text-xs text-right font-mono hidden md:table-cell ${rtpColor(rtp.actualRtp30d, rtp.theoreticalRtp)}`}>
                                {rtp.actualRtp30d.toFixed(1)}%
                              </TableCell>
                              <TableCell className="text-xs text-right font-mono hidden lg:table-cell">
                                <span className={rtp.variance >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                                  {rtp.variance >= 0 ? '+' : ''}{rtp.variance.toFixed(2)}%
                                </span>
                              </TableCell>
                              <TableCell className="text-xs text-right hidden md:table-cell">{rtp.totalSpins.toLocaleString()}</TableCell>
                              <TableCell>{rtpStatusBadge(rtp.status)}</TableCell>
                              <TableCell className="hidden sm:table-cell">
                                {(rtp.status === 'warning' || rtp.status === 'alert' || rtp.status === 'critical') && (
                                  <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1">
                                    <Search className="size-3" /> Investigate
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                {/* RTP Alert Panel */}
                {alertGames.length > 0 && (
                  <Card className="border-yellow-500/30">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="size-4 text-yellow-400" />
                        <CardTitle className="text-sm">RTP Alert Panel</CardTitle>
                        <Badge variant="destructive" className="text-[10px]">{alertGames.length} alerts</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {alertGames.map(rtp => (
                          <div key={rtp.id} className="p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold">{rtp.gameName}</span>
                              {rtpStatusBadge(rtp.status)}
                            </div>
                            <div className="text-[10px] text-muted-foreground">{rtp.provider} • {rtp.gameType === 'slot' ? 'Slot' : 'Live Table'}</div>
                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                              <div><span className="text-muted-foreground">Theoretical</span><br /><span className="font-mono font-medium">{rtp.theoreticalRtp.toFixed(2)}%</span></div>
                              <div><span className="text-muted-foreground">Actual 24h</span><br /><span className={`font-mono font-medium ${rtpColor(rtp.actualRtp24h, rtp.theoreticalRtp)}`}>{rtp.actualRtp24h.toFixed(1)}%</span></div>
                              <div><span className="text-muted-foreground">Variance</span><br /><span className={`font-mono font-medium ${rtp.variance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{rtp.variance >= 0 ? '+' : ''}{rtp.variance.toFixed(2)}%</span></div>
                              <div><span className="text-muted-foreground">Spins</span><br /><span className="font-mono font-medium">{rtp.totalSpins.toLocaleString()}</span></div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1 flex-1">
                                <Search className="size-3" /> Investigate
                              </Button>
                              <Button variant="destructive" size="sm" className="h-6 text-[10px] gap-1 flex-1">
                                <Pause className="size-3" /> Pause Game
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )
          })()}
        </TabsContent>

        {/* Tab 6: Session Control */}
        <TabsContent value="session-control" className="mt-4 space-y-4">
          {(() => {
            const scSessions: TrackingSession[] = trackingData?.sessions ?? []
            const scBets: TrackingBet[] = trackingData?.bets ?? []
            const activeSessions = scSessions.filter(s => s.status === 'active')
            const idleSessions = scSessions.filter(s => s.status === 'idle')
            const totalActiveWagered = activeSessions.reduce((sum, s) => sum + s.totalWagered, 0)
            const avgActiveRtp = activeSessions.length > 0 ? activeSessions.reduce((sum, s) => sum + s.rtp, 0) / activeSessions.length : 0

            const filteredScSessions = scSessions.filter(s => {
              if (scStatusFilter !== 'all' && s.status !== scStatusFilter) return false
              if (scGameTypeFilter !== 'all' && s.gameType !== scGameTypeFilter) return false
              if (scDeviceFilter !== 'all' && s.device !== scDeviceFilter) return false
              if (scSearch && !s.playerUsername.toLowerCase().includes(scSearch.toLowerCase())) return false
              return true
            })

            const scRtpColor = (rtp: number) => {
              if (rtp > 100) return 'text-blue-400'
              if (rtp > 95) return 'text-emerald-400'
              if (rtp >= 85) return 'text-yellow-400'
              return 'text-red-400'
            }

            const scStatusBadge = (status: string) => {
              if (status === 'active') return <Badge className="text-[9px] h-4 bg-emerald-500/20 text-emerald-400 border-emerald-500/30 gap-1"><span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />Active</Badge>
              if (status === 'idle') return <Badge className="text-[9px] h-4 bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Idle</Badge>
              return <Badge variant="secondary" className="text-[9px] h-4">Ended</Badge>
            }

            return (
              <>
                {/* Summary Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Card>
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Activity className="size-3.5 text-emerald-400" />
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Active Sessions</span>
                      </div>
                      <p className="text-base sm:text-lg font-bold text-emerald-400">{activeSessions.length}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="size-3.5 text-yellow-400" />
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Idle Sessions</span>
                      </div>
                      <p className="text-base sm:text-lg font-bold text-yellow-400">{idleSessions.length}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Trophy className="size-3.5 text-primary" />
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Active Wagered</span>
                      </div>
                      <p className="text-base sm:text-lg font-bold">{fmt(totalActiveWagered)}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Percent className="size-3.5 text-primary" />
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg Session RTP</span>
                      </div>
                      <p className="text-base sm:text-lg font-bold">{avgActiveRtp.toFixed(1)}%</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Filters */}
                <Card>
                  <CardContent className="p-3">
                    <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
                      <div className="relative flex-1 min-w-[140px]">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                        <Input
                          placeholder="Search player..."
                          value={scSearch}
                          onChange={(e) => setScSearch(e.target.value)}
                          className="pl-8 h-8 text-xs"
                        />
                      </div>
                      <Select value={scStatusFilter} onValueChange={setScStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[100px] h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="idle">Idle</SelectItem>
                          <SelectItem value="ended">Ended</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={scGameTypeFilter} onValueChange={setScGameTypeFilter}>
                        <SelectTrigger className="w-full sm:w-[120px] h-8 text-xs"><SelectValue placeholder="All Types" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="slot">Slot</SelectItem>
                          <SelectItem value="live_table">Live Table</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={scDeviceFilter} onValueChange={setScDeviceFilter}>
                        <SelectTrigger className="w-full sm:w-[100px] h-8 text-xs"><SelectValue placeholder="Device" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="desktop">Desktop</SelectItem>
                          <SelectItem value="mobile">Mobile</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Active Sessions Table */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Session Control</CardTitle>
                      <Badge variant="secondary" className="text-[10px]">{filteredScSessions.length} sessions</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">Player</TableHead>
                            <TableHead className="text-xs">Game</TableHead>
                            <TableHead className="text-xs hidden sm:table-cell">Provider</TableHead>
                            <TableHead className="text-xs hidden sm:table-cell">Type</TableHead>
                            <TableHead className="text-xs text-right hidden md:table-cell">Duration</TableHead>
                            <TableHead className="text-xs text-right hidden lg:table-cell">Bets</TableHead>
                            <TableHead className="text-xs text-right">Wagered</TableHead>
                            <TableHead className="text-xs text-right hidden sm:table-cell">Won</TableHead>
                            <TableHead className="text-xs text-right">Net</TableHead>
                            <TableHead className="text-xs text-right">RTP</TableHead>
                            <TableHead className="text-xs hidden md:table-cell">Device</TableHead>
                            <TableHead className="text-xs hidden lg:table-cell">IP</TableHead>
                            <TableHead className="text-xs">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredScSessions.map(session => {
                            const DeviceIcon = session.device === 'desktop' ? Monitor : Smartphone
                            return (
                              <TableRow key={session.id}>
                                <TableCell>
                                  <div className="flex items-center gap-1.5">
                                    <span className="size-5 rounded-full bg-primary/20 text-primary text-[8px] font-bold flex items-center justify-center shrink-0">
                                      {session.playerUsername.slice(0, 2).toUpperCase()}
                                    </span>
                                    <span className="text-xs font-medium truncate max-w-[70px]">{session.playerUsername}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-xs truncate max-w-[100px]">{session.gameName}</TableCell>
                                <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{session.provider}</TableCell>
                                <TableCell className="hidden sm:table-cell">
                                  <Badge variant="outline" className="text-[9px] h-4">{session.gameType === 'slot' ? 'Slot' : 'Live'}</Badge>
                                </TableCell>
                                <TableCell className="text-xs text-right text-muted-foreground hidden md:table-cell">{session.durationMinutes}m</TableCell>
                                <TableCell className="text-xs text-right hidden lg:table-cell">{session.totalBets}</TableCell>
                                <TableCell className="text-xs text-right font-mono">{fmt(session.totalWagered)}</TableCell>
                                <TableCell className="text-xs text-right font-mono hidden sm:table-cell">{fmt(session.totalWon)}</TableCell>
                                <TableCell className={`text-xs text-right font-mono font-medium ${session.netResult >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {fmt(Math.abs(session.netResult))}
                                </TableCell>
                                <TableCell className={`text-xs text-right font-mono ${scRtpColor(session.rtp)}`}>
                                  {session.rtp.toFixed(1)}%
                                </TableCell>
                                <TableCell className="hidden md:table-cell"><DeviceIcon className="size-3.5 text-muted-foreground" /></TableCell>
                                <TableCell className="text-xs text-muted-foreground font-mono hidden lg:table-cell">{session.ip}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() => setSelectedSession(session)}
                                    >
                                      <Eye className="size-3" />
                                    </Button>
                                    {session.status === 'active' && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                                      >
                                        <Square className="size-3" />
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                {/* Session Detail Dialog */}
                <Dialog open={!!selectedSession} onOpenChange={(open) => !open && setSelectedSession(null)}>
                  <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    {selectedSession && (() => {
                      const sessionBets = scBets.filter(b => b.sessionId === selectedSession.id)
                      return (
                        <>
                          <DialogHeader>
                            <DialogTitle className="text-sm">Session Details — {selectedSession.playerUsername}</DialogTitle>
                            <DialogDescription className="text-xs">
                              {selectedSession.gameName} • {selectedSession.provider} • {selectedSession.gameType === 'slot' ? 'Slot' : 'Live Table'}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            {/* Session Info */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                              <div className="p-2 rounded bg-muted/50"><span className="text-muted-foreground">Player ID</span><br /><span className="font-medium">{selectedSession.playerId}</span></div>
                              <div className="p-2 rounded bg-muted/50"><span className="text-muted-foreground">IP</span><br /><span className="font-mono font-medium">{selectedSession.ip}</span></div>
                              <div className="p-2 rounded bg-muted/50"><span className="text-muted-foreground">Country</span><br /><span className="font-medium">{COUNTRY_FLAGS[selectedSession.country] || ''} {selectedSession.country}</span></div>
                              <div className="p-2 rounded bg-muted/50"><span className="text-muted-foreground">Device</span><br /><span className="font-medium capitalize">{selectedSession.device}</span></div>
                              <div className="p-2 rounded bg-muted/50"><span className="text-muted-foreground">Started</span><br /><span className="font-medium">{new Date(selectedSession.startedAt).toLocaleString()}</span></div>
                              <div className="p-2 rounded bg-muted/50"><span className="text-muted-foreground">Last Activity</span><br /><span className="font-medium">{new Date(selectedSession.lastActivityAt).toLocaleString()}</span></div>
                            </div>

                            {/* Session Stats */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                              <div className="p-2 rounded border border-border"><span className="text-muted-foreground">Duration</span><br /><span className="font-bold">{selectedSession.durationMinutes}m</span></div>
                              <div className="p-2 rounded border border-border"><span className="text-muted-foreground">Total Bets</span><br /><span className="font-bold">{selectedSession.totalBets}</span></div>
                              <div className="p-2 rounded border border-border"><span className="text-muted-foreground">Bet Range</span><br /><span className="font-bold">{selectedSession.betRange}</span></div>
                              <div className="p-2 rounded border border-border"><span className="text-muted-foreground">Avg Bet</span><br /><span className="font-bold font-mono">{fmtDec(selectedSession.avgBetSize)}</span></div>
                            </div>

                            {/* RTP Analysis */}
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div className="p-2 rounded border border-border"><span className="text-muted-foreground">Wagered</span><br /><span className="font-bold font-mono">{fmt(selectedSession.totalWagered)}</span></div>
                              <div className="p-2 rounded border border-border"><span className="text-muted-foreground">Won</span><br /><span className="font-bold font-mono">{fmt(selectedSession.totalWon)}</span></div>
                              <div className="p-2 rounded border border-border">
                                <span className="text-muted-foreground">Net Result</span><br />
                                <span className={`font-bold font-mono ${selectedSession.netResult >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {selectedSession.netResult >= 0 ? '+' : ''}{fmt(Math.abs(selectedSession.netResult))}
                                </span>
                              </div>
                            </div>

                            {/* Session RTP */}
                            <div className="p-3 rounded-lg border border-primary/20 bg-primary/5">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold">Session RTP</span>
                                <span className={`text-lg font-bold font-mono ${scRtpColor(selectedSession.rtp)}`}>{selectedSession.rtp.toFixed(1)}%</span>
                              </div>
                            </div>

                            {/* Bets Table */}
                            {sessionBets.length > 0 && (
                              <div>
                                <h4 className="text-xs font-semibold mb-2">Bet History ({sessionBets.length})</h4>
                                <div className="overflow-x-auto">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="text-[10px]">Round</TableHead>
                                        <TableHead className="text-[10px] text-right">Bet</TableHead>
                                        <TableHead className="text-[10px] text-right">Win</TableHead>
                                        <TableHead className="text-[10px] text-right">Net</TableHead>
                                        <TableHead className="text-[10px] text-right hidden sm:table-cell">Mult</TableHead>
                                        <TableHead className="text-[10px] hidden sm:table-cell">Flags</TableHead>
                                        <TableHead className="text-[10px] hidden md:table-cell">Time</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {sessionBets.map(bet => (
                                        <TableRow key={bet.id}>
                                          <TableCell className="text-[10px] font-mono">{bet.roundId}</TableCell>
                                          <TableCell className="text-[10px] text-right font-mono">{fmtDec(bet.betAmount)}</TableCell>
                                          <TableCell className="text-[10px] text-right font-mono">{fmtDec(bet.winAmount)}</TableCell>
                                          <TableCell className={`text-[10px] text-right font-mono font-medium ${bet.netResult >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {bet.netResult >= 0 ? '+' : ''}{fmtDec(Math.abs(bet.netResult))}
                                          </TableCell>
                                          <TableCell className="text-[10px] text-right font-mono hidden sm:table-cell">{bet.multiplier > 0 ? `${bet.multiplier}x` : '-'}</TableCell>
                                          <TableCell className="hidden sm:table-cell">
                                            <div className="flex gap-1">
                                              {bet.isFreeSpin && <Badge className="text-[8px] h-3.5 px-1 bg-purple-500/20 text-purple-400 border-purple-500/30">FS</Badge>}
                                              {bet.isBonus && <Badge className="text-[8px] h-3.5 px-1 bg-amber-500/20 text-amber-400 border-amber-500/30">Bonus</Badge>}
                                            </div>
                                          </TableCell>
                                          <TableCell className="text-[10px] text-muted-foreground hidden md:table-cell">{new Date(bet.createdAt).toLocaleTimeString()}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      )
                    })()}
                  </DialogContent>
                </Dialog>
              </>
            )
          })()}
        </TabsContent>
      </Tabs>
    </div>
  )
}
