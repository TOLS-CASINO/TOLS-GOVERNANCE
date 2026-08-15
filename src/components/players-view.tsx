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
import { usePlayers } from '@/hooks/use-players'

const fmt = (n: number) => `$${n.toLocaleString('en-US')}`

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

export function PlayersView() {
  const { data: playersData, loading, error, refetch } = usePlayers()

  const [search, setSearch] = useState('')
  const [vipFilter, setVipFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [segmentFilter, setSegmentFilter] = useState('all')
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<'ltv' | 'churnRisk' | 'totalDeposits'>('ltv')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  // Map API data to UI-friendly format
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

  function formatTimeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const days = Math.floor(diff / 86400000)
    if (days > 30) return `${Math.floor(days / 30)}mo ago`
    if (days > 0) return `${days}d ago`
    const hours = Math.floor(diff / 3600000)
    if (hours > 0) return `${hours}h ago`
    return 'just now'
  }

  // Extract unique segments for filter
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

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive/40">
        <CardContent className="p-6 text-center">
          <AlertCircle className="size-8 text-destructive mx-auto mb-2" />
          <p className="text-sm font-medium text-destructive">Failed to load players</p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
          <Button variant="outline" size="sm" className="mt-3 gap-1" onClick={refetch}>
            <RefreshCw className="size-3" /> Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
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
              <SelectTrigger className="w-[110px] h-9 text-xs"><SelectValue placeholder="VIP Level" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All VIP</SelectItem>
                {[1, 2, 3, 4, 5].map((v) => (
                  <SelectItem key={v} value={String(v)}>VIP {v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px] h-9 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="dormant">Dormant</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="self_excluded">Self-Excluded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={segmentFilter} onValueChange={setSegmentFilter}>
              <SelectTrigger className="w-[130px] h-9 text-xs"><SelectValue placeholder="Segment" /></SelectTrigger>
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

      {/* Player Roster */}
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
                  <TableHead className="text-xs">Segment</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Last Active</TableHead>
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
                    <TableCell><Badge variant="outline" className="text-[9px] h-4">{player.segment}</Badge></TableCell>
                    <TableCell>
                      <span className={`text-[10px] font-medium ${statusColor[player.status] || 'text-muted-foreground'}`}>
                        {player.status.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{player.lastActive}</TableCell>
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
                {/* Profile Info */}
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

                {/* Recent Deposits */}
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

                {/* Segment */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Filter className="size-3" /> Segment
                  </h4>
                  <Badge variant="secondary">{selectedPlayer.segment}</Badge>
                </div>

                <Separator />

                {/* Notes */}
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
    </div>
  )
}
