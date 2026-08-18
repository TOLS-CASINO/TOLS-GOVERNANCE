'use client'

import { useState } from 'react'
import {
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  ShieldCheck,
  MessageSquare,
  Clock,
  X,
  Crown,
  RefreshCw,
  LogIn,
  Play,
  DollarSign,
  Trophy,
  TrendingDown,
  ArrowDownToLine,
  ArrowUpFromLine,
  Gift,
  Shield,
  Monitor,
  Smartphone,
  Wallet,
  Activity,
  Gamepad2,
  Coins,
  CheckCircle2,
  XCircle,
  Users,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { usePlayers } from '@/hooks/use-players'
import { useApi } from '@/hooks/use-api'
import { api } from '@/services/api'

// ─── Helpers ───

const fmt = (n: number) => `$${n.toLocaleString('en-US')}`
const fmtNum = (n: number) => n.toLocaleString('en-US')

function truncateAddr(addr: string, start = 8, end = 6): string {
  if (!addr || addr.length <= start + end + 3) return addr
  return `${addr.slice(0, start)}...${addr.slice(-end)}`
}

function formatTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days > 30) return `${Math.floor(days / 30)}mo ago`
  if (days > 0) return `${days}d ago`
  const hours = Math.floor(diff / 3600000)
  if (hours > 0) return `${hours}h ago`
  const mins = Math.floor(diff / 60000)
  if (mins > 0) return `${mins}m ago`
  return 'just now'
}

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// ─── Roster Types ───

type VipLevel = 1 | 2 | 3 | 4 | 5
type PlayerStatus = 'active' | 'dormant' | 'suspended' | 'self_excluded'

const statusColor: Record<string, string> = {
  active: 'text-emerald-400',
  dormant: 'text-yellow-400',
  suspended: 'text-destructive',
  self_excluded: 'text-muted-foreground',
  selfexcluded: 'text-muted-foreground',
}

const vipStars = (level: number) => '★'.repeat(level)

function mapVipLevel(vip: string): VipLevel {
  const lvl = parseInt(vip, 10)
  if (lvl >= 1 && lvl <= 5) return lvl as VipLevel
  const lower = vip.toLowerCase()
  if (lower.includes('elite') || lower.includes('platinum')) return 5
  if (lower.includes('gold') || lower.includes('vip')) return 4
  if (lower.includes('silver')) return 3
  if (lower.includes('bronze')) return 2
  return 1
}

// ─── Action Icons & Colors ───

const actionConfig: Record<string, { icon: React.ElementType; color: string }> = {
  login: { icon: LogIn, color: 'text-blue-400' },
  game_launch: { icon: Play, color: 'text-emerald-400' },
  bet_placed: { icon: DollarSign, color: 'text-primary' },
  win: { icon: Trophy, color: 'text-emerald-400' },
  loss: { icon: TrendingDown, color: 'text-red-400' },
  deposit: { icon: ArrowDownToLine, color: 'text-primary' },
  withdrawal_request: { icon: ArrowUpFromLine, color: 'text-yellow-400' },
  bonus_claim: { icon: Gift, color: 'text-primary' },
  game_switch: { icon: RefreshCw, color: 'text-gray-400' },
  jackpot_trigger: { icon: Crown, color: 'text-primary' },
  limit_increase_request: { icon: Shield, color: 'text-orange-400' },
}

const categoryColors: Record<string, string> = {
  auth: 'bg-blue-500/20 text-blue-400',
  game: 'bg-emerald-500/20 text-emerald-400',
  wager: 'bg-primary/20 text-primary',
  payment: 'bg-yellow-500/20 text-yellow-400',
  promotion: 'bg-purple-500/20 text-purple-400',
  compliance: 'bg-orange-500/20 text-orange-400',
}

const chainColors: Record<string, string> = {
  Bitcoin: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Ethereum: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Tron: 'bg-red-500/20 text-red-400 border-red-500/30',
  SEPA: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
}

// ─── Risk Score Color ───

function riskScoreColor(score: number): string {
  if (score < 20) return 'text-emerald-400'
  if (score <= 50) return 'text-yellow-400'
  return 'text-red-400'
}

function riskScoreBg(score: number): string {
  if (score < 20) return 'bg-emerald-500/20 text-emerald-400'
  if (score <= 50) return 'bg-yellow-500/20 text-yellow-400'
  return 'bg-red-500/20 text-red-400'
}

// ─── RTP Color ───

function rtpColor(rtp: number): string {
  if (rtp > 100) return 'text-blue-400'
  if (rtp > 95) return 'text-emerald-400'
  if (rtp >= 85) return 'text-yellow-400'
  return 'text-red-400'
}

// ─── Deposit Status Badge ───

function depositStatusBadge(status: string) {
  if (status === 'confirmed') return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[9px] h-4">{status}</Badge>
  if (status === 'pending') return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[9px] h-4">{status}</Badge>
  return <Badge variant="destructive" className="text-[9px] h-4">{status}</Badge>
}

// ─── Session Status Badge ───

function sessionStatusBadge(status: string) {
  if (status === 'active') return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[9px] h-4">{status}</Badge>
  if (status === 'idle') return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[9px] h-4">{status}</Badge>
  return <Badge variant="secondary" className="text-[9px] h-4">{status}</Badge>
}

// ─── Net Result ───

function netResultCell(value: number, prefix = false) {
  if (value > 0) return <span className="text-emerald-400 text-xs font-mono">{prefix ? '+' : ''}{fmtNum(value)}</span>
  if (value < 0) return <span className="text-red-400 text-xs font-mono">{fmtNum(value)}</span>
  return <span className="text-xs font-mono text-muted-foreground">$0</span>
}

// ─── Main Component ───

export function PlayersView() {
  const { data: playersData, loading: playersLoading, error: playersError, refetch: playersRefetch } = usePlayers()
  const { data: trackingData, loading: trackingLoading, error: trackingError, refetch: trackingRefetch } = useApi(() => api.playerTracking.get())

  const deposits = trackingData?.deposits ?? []
  const actions = trackingData?.actions ?? []
  const sessions = trackingData?.sessions ?? []
  const bets = trackingData?.bets ?? []
  const walletTracker = trackingData?.walletTracker ?? []

  // ─── Roster State ───
  const [search, setSearch] = useState('')
  const [vipFilter, setVipFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [segmentFilter, setSegmentFilter] = useState('all')
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<'ltv' | 'churnRisk' | 'totalDeposits'>('ltv')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  // ─── Deposits State ───
  const [depSearch, setDepSearch] = useState('')
  const [depMethod, setDepMethod] = useState('all')
  const [depStatus, setDepStatus] = useState('all')
  const [depRisk, setDepRisk] = useState('all')

  // ─── Actions State ───
  const [actSearch, setActSearch] = useState('')
  const [actCategory, setActCategory] = useState('all')
  const [actType, setActType] = useState('all')

  // ─── Sessions State ───
  const [sesStatus, setSesStatus] = useState('all')
  const [sesGameType, setSesGameType] = useState('all')
  const [sesDevice, setSesDevice] = useState('all')

  // ─── Bets State ───
  const [betSearch, setBetSearch] = useState('')
  const [betGame, setBetGame] = useState('all')
  const [betPlayer, setBetPlayer] = useState('all')
  const [betType, setBetType] = useState('all')

  // ─── Wallet State ───
  const [wtSearch, setWtSearch] = useState('')
  const [wtType, setWtType] = useState('all')
  const [wtChain, setWtChain] = useState('all')
  const [wtVerified, setWtVerified] = useState('all')

  // ─── Roster Logic ───
  const players = (playersData || []).map((p) => ({
    id: p.id,
    username: p.username,
    email: p.email || `${p.username.toLowerCase()}@email.com`,
    vipLevel: mapVipLevel(p.vipLevel),
    ltv: Math.round(p.lifetimeValue),
    churnRisk: Math.round(p.churnRisk),
    status: (p.status === 'self_excluded' ? 'self_excluded' : p.status) as PlayerStatus,
    segment: p.segments?.[0]?.segment?.name || 'Unassigned',
    totalDeposits: Math.round(p.totalDeposits),
    totalWagers: Math.round(p.totalWagers),
    lastActive: p.lastActivityAt ? formatTimeAgo(p.lastActivityAt) : 'N/A',
    country: p.country || 'US',
    notes: p.notes?.map((n) => n.content) || [],
    deposits: p.deposits || [],
  }))

  const uniqueSegments = [...new Set(players.map((p) => p.segment))].sort()
  const selectedPlayer = players.find((p) => p.id === selectedPlayerId) || null

  const filtered = players
    .filter((p) => {
      if (search && !p.username.toLowerCase().includes(search.toLowerCase())) return false
      if (vipFilter !== 'all' && p.vipLevel !== Number(vipFilter)) return false
      if (statusFilter !== 'all' && p.status !== statusFilter) return false
      if (segmentFilter !== 'all' && p.segment !== segmentFilter) return false
      return true
    })
    .sort((a, b) => {
      const diff = a[sortKey] - b[sortKey]
      return sortDir === 'desc' ? -diff : diff
    })

  const toggleSort = (key: 'ltv' | 'churnRisk' | 'totalDeposits') => {
    if (sortKey === key) setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    else { setSortKey(key); setSortDir('desc') }
  }

  // ─── Deposits Filtered ───
  const filteredDeposits = deposits.filter((d: any) => {
    if (depSearch) {
      const q = depSearch.toLowerCase()
      if (!d.playerUsername.toLowerCase().includes(q) && !d.walletAddress.toLowerCase().includes(q)) return false
    }
    if (depMethod !== 'all' && d.method !== depMethod) return false
    if (depStatus !== 'all' && d.status !== depStatus) return false
    if (depRisk !== 'all') {
      if (depRisk === 'low' && d.riskScore >= 20) return false
      if (depRisk === 'medium' && (d.riskScore < 20 || d.riskScore > 50)) return false
      if (depRisk === 'high' && d.riskScore <= 50) return false
    }
    return true
  })

  // ─── Actions Filtered ───
  const filteredActions = actions.filter((a: any) => {
    if (actSearch) {
      const q = actSearch.toLowerCase()
      if (!a.playerUsername.toLowerCase().includes(q) && !a.ip.toLowerCase().includes(q)) return false
    }
    if (actCategory !== 'all' && a.category !== actCategory) return false
    if (actType !== 'all' && a.action !== actType) return false
    return true
  })

  // ─── Sessions Filtered ───
  const filteredSessions = sessions.filter((s: any) => {
    if (sesStatus !== 'all' && s.status !== sesStatus) return false
    if (sesGameType !== 'all' && s.gameType !== sesGameType) return false
    if (sesDevice !== 'all' && s.device !== sesDevice) return false
    return true
  })

  // ─── Bets Filtered ───
  const uniqueBetGames = Array.from(new Set<string>(bets.map((b: any) => b.gameName))).sort()
  const uniqueBetPlayers = Array.from(new Set<string>(bets.map((b: any) => b.playerUsername))).sort()

  const filteredBets = bets.filter((b: any) => {
    if (betSearch) {
      const q = betSearch.toLowerCase()
      if (!b.playerUsername.toLowerCase().includes(q) && !b.roundId.toLowerCase().includes(q)) return false
    }
    if (betGame !== 'all' && b.gameName !== betGame) return false
    if (betPlayer !== 'all' && b.playerUsername !== betPlayer) return false
    if (betType !== 'all') {
      if (betType === 'normal' && (b.isFreeSpin || b.isBonus)) return false
      if (betType === 'free_spin' && !b.isFreeSpin) return false
      if (betType === 'bonus' && !b.isBonus) return false
    }
    return true
  })

  // ─── Wallets Filtered ───
  const filteredWallets = walletTracker.filter((w: any) => {
    if (wtSearch) {
      const q = wtSearch.toLowerCase()
      if (!w.playerUsername.toLowerCase().includes(q) && !w.address.toLowerCase().includes(q)) return false
    }
    if (wtType !== 'all' && w.walletType !== wtType) return false
    if (wtChain !== 'all' && w.chain !== wtChain) return false
    if (wtVerified !== 'all') {
      if (wtVerified === 'true' && !w.verified) return false
      if (wtVerified === 'false' && w.verified) return false
    }
    return true
  })

  // ─── Unique Action Types ───
  const uniqueActionTypes = Array.from(new Set<string>(actions.map((a: any) => a.action))).sort()

  // ─── Loading ───
  if (playersLoading || trackingLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  // ─── Error ───
  if (playersError || trackingError) {
    return (
      <Card className="border-destructive/40">
        <CardContent className="p-6 text-center">
          <AlertCircle className="size-8 text-destructive mx-auto mb-2" />
          <p className="text-sm font-medium text-destructive">Failed to load player data</p>
          <p className="text-xs text-muted-foreground mt-1">{playersError || trackingError}</p>
          <Button variant="outline" size="sm" className="mt-3 gap-1" onClick={() => { playersRefetch(); trackingRefetch() }}>
            <RefreshCw className="size-3" /> Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="roster" className="w-full">
        <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full">
          <TabsTrigger value="roster" className="gap-1"><Users className="size-3.5" /> <span className="hidden sm:inline">Roster</span><span className="sm:hidden">Roster</span></TabsTrigger>
          <TabsTrigger value="deposits" className="gap-1"><ArrowDownToLine className="size-3.5" /> <span className="hidden sm:inline">Deposits</span><span className="sm:hidden">Deposits</span></TabsTrigger>
          <TabsTrigger value="activity" className="gap-1"><Activity className="size-3.5" /> <span className="hidden sm:inline">Activity</span><span className="sm:hidden">Activity</span></TabsTrigger>
          <TabsTrigger value="sessions" className="gap-1"><Gamepad2 className="size-3.5" /> <span className="hidden sm:inline">Sessions</span><span className="sm:hidden">Sessions</span></TabsTrigger>
          <TabsTrigger value="bets" className="gap-1"><Coins className="size-3.5" /> <span className="hidden sm:inline">Bets</span><span className="sm:hidden">Bets</span></TabsTrigger>
          <TabsTrigger value="wallets" className="gap-1"><Wallet className="size-3.5" /> <span className="hidden sm:inline">Wallets</span><span className="sm:hidden">Wallets</span></TabsTrigger>
        </TabsList>

        {/* ═══════════ TAB 1: ROSTER ═══════════ */}
        <TabsContent value="roster" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search players..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-9 text-xs"
                  />
                </div>
                <Select value={vipFilter} onValueChange={setVipFilter}>
                  <SelectTrigger className="w-full sm:w-[110px] h-9 text-xs"><SelectValue placeholder="VIP Level" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All VIP</SelectItem>
                    {[1, 2, 3, 4, 5].map((v) => (
                      <SelectItem key={v} value={String(v)}>VIP {v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[120px] h-9 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="dormant">Dormant</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="self_excluded">Self-Excluded</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={segmentFilter} onValueChange={setSegmentFilter}>
                  <SelectTrigger className="w-full sm:w-[130px] h-9 text-xs"><SelectValue placeholder="Segment" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Segments</SelectItem>
                    {uniqueSegments.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Player Roster</CardTitle>
                <Badge variant="secondary" className="text-[10px]">{filtered.length} players</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Player</TableHead>
                      <TableHead className="text-xs">VIP</TableHead>
                      <TableHead className="text-xs cursor-pointer" onClick={() => toggleSort('ltv')}>
                        <span className="flex items-center gap-1">LTV {sortKey === 'ltv' && (sortDir === 'desc' ? <ChevronDown className="size-3" /> : <ChevronUp className="size-3" />)}</span>
                      </TableHead>
                      <TableHead className="text-xs cursor-pointer" onClick={() => toggleSort('churnRisk')}>
                        <span className="flex items-center gap-1">Churn {sortKey === 'churnRisk' && (sortDir === 'desc' ? <ChevronDown className="size-3" /> : <ChevronUp className="size-3" />)}</span>
                      </TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Segment</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Last Active</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((player) => (
                      <TableRow
                        key={player.id}
                        className="cursor-pointer hover:bg-muted/80"
                        onClick={() => setSelectedPlayerId(player.id)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="size-7">
                              <AvatarFallback className="text-[9px] bg-primary/20 text-primary">
                                {player.username.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-xs font-medium">{player.username}</p>
                              <p className="text-[10px] text-muted-foreground">{player.country}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-[10px] text-primary" title={`VIP ${player.vipLevel}`}>
                            {vipStars(player.vipLevel)}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs font-mono">{fmt(player.ltv)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <div className="w-12 bg-muted rounded-full h-1.5">
                              <div
                                className={`h-full rounded-full ${player.churnRisk > 60 ? 'bg-destructive' : player.churnRisk > 30 ? 'bg-yellow-400' : 'bg-emerald-400'}`}
                                style={{ width: `${player.churnRisk}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-muted-foreground">{player.churnRisk}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell"><Badge variant="outline" className="text-[9px] h-4">{player.segment}</Badge></TableCell>
                        <TableCell>
                          <span className={`text-[10px] font-medium ${statusColor[player.status] || 'text-muted-foreground'}`}>
                            {player.status.replace('_', ' ')}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{player.lastActive}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Player Detail Sheet */}
          <Sheet open={!!selectedPlayer} onOpenChange={(open) => { if (!open) setSelectedPlayerId(null) }}>
            <SheetContent className="w-full sm:max-w-md overflow-y-auto">
              {selectedPlayer && (
                <>
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <Avatar className="size-8">
                        <AvatarFallback className="text-xs bg-primary/20 text-primary">
                          {selectedPlayer.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {selectedPlayer.username}
                      <Badge variant="secondary" className="text-[9px]">VIP {selectedPlayer.vipLevel}</Badge>
                    </SheetTitle>
                    <SheetDescription>{selectedPlayer.email}</SheetDescription>
                  </SheetHeader>

                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Profile</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded bg-muted/50"><span className="text-muted-foreground">LTV</span><br /><span className="font-bold">{fmt(selectedPlayer.ltv)}</span></div>
                        <div className="p-2 rounded bg-muted/50"><span className="text-muted-foreground">Deposits</span><br /><span className="font-bold">{fmt(selectedPlayer.totalDeposits)}</span></div>
                        <div className="p-2 rounded bg-muted/50"><span className="text-muted-foreground">Wagers</span><br /><span className="font-bold">{fmt(selectedPlayer.totalWagers)}</span></div>
                        <div className="p-2 rounded bg-muted/50"><span className="text-muted-foreground">Country</span><br /><span className="font-bold">{selectedPlayer.country}</span></div>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <Clock className="size-3" /> Recent Deposits
                      </h4>
                      {selectedPlayer.deposits.length > 0 ? (
                        selectedPlayer.deposits.slice(0, 5).map((d) => (
                          <div key={d.id} className="flex items-center gap-2 text-xs p-1.5 rounded bg-muted/30">
                            <Badge variant="outline" className="text-[9px] h-4">{d.method}</Badge>
                            <span className="font-mono ml-auto">{fmt(d.amount)}</span>
                            <Badge variant={d.status === 'confirmed' ? 'default' : 'secondary'} className="text-[9px] h-4 px-1">{d.status}</Badge>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground">No recent deposits</p>
                      )}
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <Filter className="size-3" /> Segment
                      </h4>
                      <Badge variant="secondary">{selectedPlayer.segment}</Badge>
                    </div>
                    <Separator />
                    {selectedPlayer.notes.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                          <MessageSquare className="size-3" /> Notes
                        </h4>
                        {selectedPlayer.notes.map((note, i) => (
                          <p key={i} className="text-xs p-2 rounded bg-muted/50">{note}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </SheetContent>
          </Sheet>
        </TabsContent>

        {/* ═══════════ TAB 2: DEPOSITS ═══════════ */}
        <TabsContent value="deposits" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search player or wallet..."
                    value={depSearch}
                    onChange={(e) => setDepSearch(e.target.value)}
                    className="pl-9 h-9 text-xs"
                  />
                </div>
                <Select value={depMethod} onValueChange={setDepMethod}>
                  <SelectTrigger className="w-full sm:w-[140px] h-9 text-xs"><SelectValue placeholder="Method" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="crypto_btc">Crypto BTC</SelectItem>
                    <SelectItem value="crypto_eth">Crypto ETH</SelectItem>
                    <SelectItem value="crypto_usdt">Crypto USDT</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={depStatus} onValueChange={setDepStatus}>
                  <SelectTrigger className="w-full sm:w-[120px] h-9 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={depRisk} onValueChange={setDepRisk}>
                  <SelectTrigger className="w-full sm:w-[120px] h-9 text-xs"><SelectValue placeholder="Risk" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risk</SelectItem>
                    <SelectItem value="low">Low (&lt;20)</SelectItem>
                    <SelectItem value="medium">Medium (20-50)</SelectItem>
                    <SelectItem value="high">High (&gt;50)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-1.5"><ArrowDownToLine className="size-4" /> Deposits</CardTitle>
                <Badge variant="secondary" className="text-[10px]">{filteredDeposits.length} records</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Player</TableHead>
                      <TableHead className="text-xs">Amount</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Currency</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Method</TableHead>
                      <TableHead className="text-xs">Wallet</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">TX Hash</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Risk</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">KYC</TableHead>
                      <TableHead className="text-xs">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDeposits.map((d: any) => (
                      <TableRow key={d.id}>
                        <TableCell className="text-xs font-medium">{d.playerUsername}</TableCell>
                        <TableCell className="text-xs font-mono">{fmt(d.amount)}</TableCell>
                        <TableCell className="text-xs hidden sm:table-cell"><Badge variant="outline" className="text-[9px] h-4">{d.currency}</Badge></TableCell>
                        <TableCell className="text-xs hidden sm:table-cell"><Badge variant="outline" className="text-[9px] h-4">{d.method.replace('crypto_', '').replace('_', ' ').toUpperCase()}</Badge></TableCell>
                        <TableCell className="text-xs font-mono truncate max-w-[120px] sm:max-w-[200px]" title={d.walletAddress}>{truncateAddr(d.walletAddress)}</TableCell>
                        <TableCell className="text-xs font-mono truncate max-w-[120px] sm:max-w-[200px] hidden sm:table-cell" title={d.txHash}>{truncateAddr(d.txHash, 10, 4)}</TableCell>
                        <TableCell>{depositStatusBadge(d.status)}</TableCell>
                        <TableCell><span className={`text-xs font-mono ${riskScoreColor(d.riskScore)}`}>{d.riskScore}</span></TableCell>
                        <TableCell className="hidden sm:table-cell"><Badge variant="outline" className="text-[9px] h-4">{d.kycLevel}</Badge></TableCell>
                        <TableCell className="text-xs text-muted-foreground">{formatTimeAgo(d.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════ TAB 3: ACTIVITY LOG ═══════════ */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search player or IP..."
                    value={actSearch}
                    onChange={(e) => setActSearch(e.target.value)}
                    className="pl-9 h-9 text-xs"
                  />
                </div>
                <Select value={actCategory} onValueChange={setActCategory}>
                  <SelectTrigger className="w-full sm:w-[130px] h-9 text-xs"><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="auth">Auth</SelectItem>
                    <SelectItem value="game">Game</SelectItem>
                    <SelectItem value="wager">Wager</SelectItem>
                    <SelectItem value="payment">Payment</SelectItem>
                    <SelectItem value="promotion">Promotion</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={actType} onValueChange={setActType}>
                  <SelectTrigger className="w-full sm:w-[160px] h-9 text-xs"><SelectValue placeholder="Action Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    {uniqueActionTypes.map((t) => (
                      <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-1.5"><Activity className="size-4" /> Activity Log</CardTitle>
                <Badge variant="secondary" className="text-[10px]">{filteredActions.length} events</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Time</TableHead>
                      <TableHead className="text-xs">Player</TableHead>
                      <TableHead className="text-xs">Action</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Category</TableHead>
                      <TableHead className="text-xs">Details</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">IP</TableHead>
                      <TableHead className="text-xs hidden lg:table-cell">Country</TableHead>
                      <TableHead className="text-xs hidden lg:table-cell">Session</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredActions.map((a: any) => {
                      const cfg = actionConfig[a.action] || { icon: Activity, color: 'text-muted-foreground' }
                      const Icon = cfg.icon
                      return (
                        <TableRow key={a.id}>
                          <TableCell className="text-[10px] text-muted-foreground whitespace-nowrap">{formatTimeAgo(a.createdAt)}</TableCell>
                          <TableCell className="text-xs font-medium">{a.playerUsername}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <Icon className={`size-3.5 ${cfg.color}`} />
                              <span className="text-xs">{a.action.replace(/_/g, ' ')}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge className={`text-[9px] h-4 ${categoryColors[a.category] || 'bg-muted text-muted-foreground'}`}>{a.category}</Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground truncate max-w-[120px] sm:max-w-[200px] lg:max-w-[300px]" title={a.details}>{a.details}</TableCell>
                          <TableCell className="text-xs font-mono text-muted-foreground hidden sm:table-cell">{a.ip}</TableCell>
                          <TableCell className="hidden lg:table-cell"><Badge variant="outline" className="text-[9px] h-4">{a.country}</Badge></TableCell>
                          <TableCell className="text-[10px] text-muted-foreground hidden lg:table-cell">{a.sessionId}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════ TAB 4: SESSIONS ═══════════ */}
        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={sesStatus} onValueChange={setSesStatus}>
                  <SelectTrigger className="w-full sm:w-[120px] h-9 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="idle">Idle</SelectItem>
                    <SelectItem value="ended">Ended</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sesGameType} onValueChange={setSesGameType}>
                  <SelectTrigger className="w-full sm:w-[130px] h-9 text-xs"><SelectValue placeholder="Game Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="slot">Slot</SelectItem>
                    <SelectItem value="live_table">Live Table</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sesDevice} onValueChange={setSesDevice}>
                  <SelectTrigger className="w-full sm:w-[120px] h-9 text-xs"><SelectValue placeholder="Device" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Devices</SelectItem>
                    <SelectItem value="desktop">Desktop</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-1.5"><Gamepad2 className="size-4" /> Gaming Sessions</CardTitle>
                <Badge variant="secondary" className="text-[10px]">{filteredSessions.length} sessions</Badge>
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
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Duration</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Bets</TableHead>
                      <TableHead className="text-xs hidden lg:table-cell">Wagered</TableHead>
                      <TableHead className="text-xs hidden lg:table-cell">Won</TableHead>
                      <TableHead className="text-xs">Net</TableHead>
                      <TableHead className="text-xs">RTP</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Device</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSessions.map((s: any) => (
                      <TableRow key={s.id}>
                        <TableCell className="text-xs font-medium">{s.playerUsername}</TableCell>
                        <TableCell>
                          <div>
                            <p className="text-xs font-medium">{s.gameName}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{s.provider}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline" className="text-[9px] h-4">{s.gameType === 'live_table' ? 'Live' : 'Slot'}</Badge>
                        </TableCell>
                        <TableCell>{sessionStatusBadge(s.status)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{s.durationMinutes}m</TableCell>
                        <TableCell className="text-xs font-mono hidden sm:table-cell">{fmtNum(s.totalBets)}</TableCell>
                        <TableCell className="text-xs font-mono hidden lg:table-cell">{fmt(s.totalWagered)}</TableCell>
                        <TableCell className="text-xs font-mono hidden lg:table-cell">{fmt(s.totalWon)}</TableCell>
                        <TableCell>{netResultCell(s.netResult)}</TableCell>
                        <TableCell><span className={`text-xs font-mono ${rtpColor(s.rtp)}`}>{s.rtp.toFixed(1)}%</span></TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {s.device === 'desktop' ? <Monitor className="size-4 text-muted-foreground" /> : <Smartphone className="size-4 text-muted-foreground" />}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════ TAB 5: BETS (GIOCATE) ═══════════ */}
        <TabsContent value="bets" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search player or round ID..."
                    value={betSearch}
                    onChange={(e) => setBetSearch(e.target.value)}
                    className="pl-9 h-9 text-xs"
                  />
                </div>
                <Select value={betGame} onValueChange={setBetGame}>
                  <SelectTrigger className="w-full sm:w-[160px] h-9 text-xs"><SelectValue placeholder="Game" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Games</SelectItem>
                    {uniqueBetGames.map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={betPlayer} onValueChange={setBetPlayer}>
                  <SelectTrigger className="w-full sm:w-[140px] h-9 text-xs"><SelectValue placeholder="Player" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Players</SelectItem>
                    {uniqueBetPlayers.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={betType} onValueChange={setBetType}>
                  <SelectTrigger className="w-full sm:w-[120px] h-9 text-xs"><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="free_spin">Free Spin</SelectItem>
                    <SelectItem value="bonus">Bonus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-1.5"><Coins className="size-4" /> Bets (Giocate)</CardTitle>
                <Badge variant="secondary" className="text-[10px]">{filteredBets.length} bets</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Time</TableHead>
                      <TableHead className="text-xs">Player</TableHead>
                      <TableHead className="text-xs">Game</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Round</TableHead>
                      <TableHead className="text-xs">Bet</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Win</TableHead>
                      <TableHead className="text-xs">Net</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Multiplier</TableHead>
                      <TableHead className="text-xs">Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBets.map((b: any) => {
                      const isNormal = !b.isFreeSpin && !b.isBonus
                      return (
                        <TableRow key={b.id}>
                          <TableCell className="text-[10px] text-muted-foreground whitespace-nowrap">{formatTimeAgo(b.createdAt)}</TableCell>
                          <TableCell className="text-xs font-medium">{b.playerUsername}</TableCell>
                          <TableCell>
                            <p className="text-xs">{b.gameName}</p>
                          </TableCell>
                          <TableCell className="text-xs font-mono text-muted-foreground hidden sm:table-cell">{b.roundId}</TableCell>
                          <TableCell className="text-xs font-mono">{fmt(b.betAmount)}</TableCell>
                          <TableCell className="text-xs font-mono hidden sm:table-cell">{fmt(b.winAmount)}</TableCell>
                          <TableCell>{netResultCell(b.netResult, true)}</TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <span className={`text-xs font-mono ${b.multiplier > 5 ? 'text-yellow-400' : 'text-muted-foreground'}`}>
                              {b.multiplier > 0 ? `${b.multiplier}x` : '-'}
                            </span>
                          </TableCell>
                          <TableCell>
                            {b.isFreeSpin ? (
                              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[9px] h-4">free spin</Badge>
                            ) : b.isBonus ? (
                              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-[9px] h-4">bonus</Badge>
                            ) : (
                              <Badge variant="outline" className="text-[9px] h-4">normal</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════ TAB 6: WALLET TRACKER ═══════════ */}
        <TabsContent value="wallets" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search player or address..."
                    value={wtSearch}
                    onChange={(e) => setWtSearch(e.target.value)}
                    className="pl-9 h-9 text-xs"
                  />
                </div>
                <Select value={wtType} onValueChange={setWtType}>
                  <SelectTrigger className="w-full sm:w-[140px] h-9 text-xs"><SelectValue placeholder="Wallet Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="crypto_btc">Crypto BTC</SelectItem>
                    <SelectItem value="crypto_eth">Crypto ETH</SelectItem>
                    <SelectItem value="crypto_usdt">Crypto USDT</SelectItem>
                    <SelectItem value="bank">Bank</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={wtChain} onValueChange={setWtChain}>
                  <SelectTrigger className="w-full sm:w-[120px] h-9 text-xs"><SelectValue placeholder="Chain" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Chains</SelectItem>
                    <SelectItem value="Bitcoin">Bitcoin</SelectItem>
                    <SelectItem value="Ethereum">Ethereum</SelectItem>
                    <SelectItem value="Tron">Tron</SelectItem>
                    <SelectItem value="SEPA">SEPA</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={wtVerified} onValueChange={setWtVerified}>
                  <SelectTrigger className="w-full sm:w-[120px] h-9 text-xs"><SelectValue placeholder="Verified" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="true">Verified</SelectItem>
                    <SelectItem value="false">Unverified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWallets.map((w: any) => (
              <Card key={w.id} className="border-border/60">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-1.5">
                      <Wallet className="size-4 text-primary" />
                      {w.playerUsername}
                    </CardTitle>
                    <div className="flex items-center gap-1.5">
                      {w.verified ? (
                        <CheckCircle2 className="size-4 text-emerald-400" />
                      ) : (
                        <XCircle className="size-4 text-red-400" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className={`text-[9px] h-4 ${chainColors[w.chain] || 'bg-muted text-muted-foreground'}`}>{w.chain}</Badge>
                    <Badge variant="outline" className="text-[9px] h-4">{w.walletType.replace('crypto_', '').replace(/_/g, ' ').toUpperCase()}</Badge>
                    {w.label && <span className="text-[10px] text-muted-foreground truncate">{w.label}</span>}
                  </div>

                  <div className="text-xs font-mono text-muted-foreground truncate" title={w.address}>
                    {truncateAddr(w.address, 12, 8)}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded bg-muted/50 text-xs">
                      <span className="text-muted-foreground">Deposited</span>
                      <p className="font-bold font-mono">{fmt(w.totalDeposited)}</p>
                    </div>
                    <div className="p-2 rounded bg-muted/50 text-xs">
                      <span className="text-muted-foreground">Withdrawn</span>
                      <p className="font-bold font-mono">{fmt(w.totalWithdrawn)}</p>
                    </div>
                  </div>

                  {w.riskFlags && w.riskFlags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {w.riskFlags.map((flag: string, i: number) => (
                        <Badge key={i} className="bg-red-500/20 text-red-400 border-red-500/30 text-[8px] h-3.5 px-1">{flag.replace(/_/g, ' ')}</Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>First: {formatTimeAgo(w.firstSeen)}</span>
                    <span>Last: {formatTimeAgo(w.lastUsed)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredWallets.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Wallet className="size-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No wallets match your filters</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
