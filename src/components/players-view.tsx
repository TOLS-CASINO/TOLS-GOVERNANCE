'use client'

import { useState, useEffect } from 'react'
import {
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  Star,
  AlertCircle,
  ShieldCheck,
  MessageSquare,
  Clock,
  X,
  Crown,
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

const fmt = (n: number) => `$${n.toLocaleString('en-US')}`

type VipLevel = 1 | 2 | 3 | 4 | 5
type PlayerStatus = 'active' | 'dormant' | 'suspended' | 'self_excluded'

interface Player {
  id: number
  username: string
  email: string
  vipLevel: VipLevel
  ltv: number
  churnRisk: number
  status: PlayerStatus
  segment: string
  totalDeposits: number
  totalWagers: number
  lastActive: string
  country: string
  rgLimits: { deposit: number; loss: number; session: number }
  notes: string[]
  activity: { time: string; action: string; amount?: number }[]
}

function generateMockPlayers(): Player[] {
  const names = ['AlexM88', 'LuckyJenny', 'HighRoller_X', 'CasinoKing99', 'NightOwl42', 'SpinMaster', 'GoldRush_', 'DiamondPete', 'AceHigh77', 'PhantomBet', 'SilverFox', 'MaxBet_Mike', 'LadyLuck88', 'RollTheDice', 'BlackJackPro']
  const segments = ['High Value', 'Medium Value', 'Casual', 'VIP Elite', 'New Player', 'Churning']
  const countries = ['US', 'UK', 'CA', 'DE', 'AU', 'JP', 'BR', 'FR', 'NL', 'SE']
  const statuses: PlayerStatus[] = ['active', 'active', 'active', 'active', 'dormant', 'suspended', 'self_excluded']
  const actions = ['Deposit', 'Wager', 'Withdraw', 'Login', 'Bonus Claim', 'Game Session']

  return names.map((name, i) => {
    const vipLevel = (Math.floor(Math.random() * 5) + 1) as VipLevel
    const ltv = Math.floor(500 + Math.random() * 45000)
    return {
      id: i + 1,
      username: name,
      email: `${name.toLowerCase()}@email.com`,
      vipLevel,
      ltv,
      churnRisk: Math.floor(Math.random() * 100),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      segment: segments[Math.floor(Math.random() * segments.length)],
      totalDeposits: Math.floor(ltv * (0.8 + Math.random() * 0.4)),
      totalWagers: Math.floor(ltv * (2 + Math.random() * 3)),
      lastActive: `${Math.floor(Math.random() * 30)}d ago`,
      country: countries[Math.floor(Math.random() * countries.length)],
      rgLimits: {
        deposit: [500, 1000, 2500, 5000, 10000][vipLevel - 1],
        loss: [250, 500, 1500, 3000, 10000][vipLevel - 1],
        session: [60, 120, 180, 240, 480][vipLevel - 1],
      },
      notes: vipLevel >= 4 ? ['VIP treatment approved', 'Personal manager assigned'] : [],
      activity: Array.from({ length: 5 }, (_, j) => ({
        time: `${j + 1}h ago`,
        action: actions[Math.floor(Math.random() * actions.length)],
        amount: Math.floor(Math.random() * 5000),
      })),
    }
  })
}

const statusColor: Record<PlayerStatus, string> = {
  active: 'text-emerald-400',
  dormant: 'text-yellow-400',
  suspended: 'text-destructive',
  self_excluded: 'text-muted-foreground',
}

const vipStars = (level: number) => '★'.repeat(level)

export function PlayersView() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [vipFilter, setVipFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [segmentFilter, setSegmentFilter] = useState('all')
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [sortKey, setSortKey] = useState<'ltv' | 'churnRisk' | 'totalDeposits'>('ltv')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    const timer = setTimeout(() => {
      setPlayers(generateMockPlayers())
      setLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

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
                {['High Value', 'Medium Value', 'Casual', 'VIP Elite', 'New Player', 'Churning'].map((s) => (
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
                    onClick={() => setSelectedPlayer(player)}
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
                      <span className={`text-[10px] font-medium ${statusColor[player.status]}`}>
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
      <Sheet open={!!selectedPlayer} onOpenChange={(open) => { if (!open) setSelectedPlayer(null) }}>
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

                {/* Activity Timeline */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Clock className="size-3" /> Activity
                  </h4>
                  {selectedPlayer.activity.map((a, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs p-1.5 rounded bg-muted/30">
                      <span className="text-muted-foreground w-14 shrink-0">{a.time}</span>
                      <Badge variant="outline" className="text-[9px] h-4">{a.action}</Badge>
                      {a.amount && <span className="font-mono ml-auto">{fmt(a.amount)}</span>}
                    </div>
                  ))}
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

                {/* RG Limits */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="size-3" /> Responsible Gaming Limits
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between"><span className="text-muted-foreground">Deposit Limit</span><span className="font-medium">{fmt(selectedPlayer.rgLimits.deposit)}/mo</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Loss Limit</span><span className="font-medium">{fmt(selectedPlayer.rgLimits.loss)}/mo</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Session Limit</span><span className="font-medium">{selectedPlayer.rgLimits.session} min</span></div>
                  </div>
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
