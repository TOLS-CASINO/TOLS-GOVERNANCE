'use client'

import { useState } from 'react'
import {
  AreaChart,
  Area,
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
  Legend,
} from 'recharts'
import {
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Building2,
  Smartphone,
  Bitcoin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Search,
  Shield,
  DollarSign,
  Percent,
  Timer,
  Globe,
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useApi } from '@/hooks/use-api'
import { api } from '@/services/api'

/* ─── helpers ─── */

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', CAD: 'C$', AUD: 'A$',
  BTC: '₿', ETH: 'Ξ', USDC: 'USDC', USDT: 'USDT',
}

const fmtAmount = (amount: number, currency: string) => {
  const sym = CURRENCY_SYMBOLS[currency] || currency
  const isCrypto = ['BTC', 'ETH', 'USDC', 'USDT'].includes(currency)
  if (isCrypto) return `${sym}${amount.toFixed(isCrypto && currency === 'BTC' ? 4 : 3)}`
  return `${sym}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const fmtUsd = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

function timeAgo(iso: string): string {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`
  const days = Math.floor(hrs / 24)
  return `${days} day${days > 1 ? 's' : ''} ago`
}

const METHOD_ICONS: Record<string, string> = {
  card: '💳',
  crypto: '₿',
  bank_transfer: '🏦',
  e_wallet: '📱',
}

const PROVIDER_ICONS: Record<string, string> = {
  Stripe: '💳',
  Coinbase: '₿',
  MoonPay: '🌙',
  Neteller: '🟢',
  Skrill: '💜',
  PayPal: '🅿️',
}

const CHART_COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4']

/* ─── deposit status badge ─── */

function DepositStatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { cls: string; pulse?: boolean }> = {
    pending: { cls: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', pulse: true },
    processing: { cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30', pulse: true },
    confirmed: { cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    failed: { cls: 'bg-red-500/20 text-red-400 border-red-500/30' },
    expired: { cls: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  }
  const c = cfg[status] || cfg.pending
  return (
    <Badge variant="outline" className={`${c.cls} ${c.pulse ? 'animate-pulse' : ''}`}>
      {status}
    </Badge>
  )
}

/* ─── withdrawal status badge ─── */

function WithdrawalStatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { cls: string; pulse?: boolean }> = {
    pending: { cls: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    under_review: { cls: 'bg-orange-500/20 text-orange-400 border-orange-500/30', pulse: true },
    approved: { cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    processing: { cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30', pulse: true },
    completed: { cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    rejected: { cls: 'bg-red-500/20 text-red-400 border-red-500/30' },
    cancelled: { cls: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  }
  const c = cfg[status] || cfg.pending
  return (
    <Badge variant="outline" className={`${c.cls} ${c.pulse ? 'animate-pulse' : ''}`}>
      {status.replace('_', ' ')}
    </Badge>
  )
}

/* ─── KPI card ─── */

function KpiCard({ icon: Icon, label, value, color, sub }: {
  icon: React.ElementType; label: string; value: string; color: string; sub?: string
}) {
  return (
    <Card className="bg-card/60 border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`flex size-9 items-center justify-center rounded-lg ${color}`}>
            <Icon className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-muted-foreground truncate">{label}</p>
            <p className="text-lg font-bold truncate">{value}</p>
            {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* ─── type badge for provider ─── */

function TypeBadge({ type }: { type: string }) {
  const cls = type === 'crypto' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    : type === 'hybrid' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
    : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
  return <Badge variant="outline" className={cls}>{type}</Badge>
}

/* ═══════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════ */

export function PaymentsView() {
  const { data, loading, error, refetch } = useApi(() => api.payments.get())

  /* filters */
  const [depStatusFilter, setDepStatusFilter] = useState('all')
  const [depMethodFilter, setDepMethodFilter] = useState('all')
  const [depProviderFilter, setDepProviderFilter] = useState('all')
  const [depCurrencyFilter, setDepCurrencyFilter] = useState('all')
  const [depSearch, setDepSearch] = useState('')

  const [wdStatusFilter, setWdStatusFilter] = useState('all')
  const [wdMethodFilter, setWdMethodFilter] = useState('all')
  const [wdSearch, setWdSearch] = useState('')

  /* selected deposit for detail dialog */
  const [selectedDeposit, setSelectedDeposit] = useState<any>(null)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null)

  /* ─── loading / error ─── */

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-16 w-full" /></CardContent></Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive/40">
        <CardContent className="p-6 text-center">
          <AlertCircle className="size-8 text-destructive mx-auto mb-2" />
          <p className="text-sm font-medium text-destructive">Failed to load payment data</p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
          <Button variant="outline" size="sm" className="mt-3 gap-1" onClick={refetch}>
            <RefreshCw className="size-3" /> Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  const { deposits, withdrawals, providers, stats } = data as any

  /* ─── filtered data ─── */

  const filteredDeposits = (deposits || []).filter((d: any) => {
    if (depStatusFilter !== 'all' && d.status !== depStatusFilter) return false
    if (depMethodFilter !== 'all' && d.method !== depMethodFilter) return false
    if (depProviderFilter !== 'all' && d.provider !== depProviderFilter) return false
    if (depCurrencyFilter !== 'all' && d.currency !== depCurrencyFilter) return false
    if (depSearch && !d.playerName.toLowerCase().includes(depSearch.toLowerCase()) && !d.id.toLowerCase().includes(depSearch.toLowerCase())) return false
    return true
  })

  const filteredWithdrawals = (withdrawals || []).filter((w: any) => {
    if (wdStatusFilter !== 'all' && w.status !== wdStatusFilter) return false
    if (wdMethodFilter !== 'all' && w.method !== wdMethodFilter) return false
    if (wdSearch && !w.playerName.toLowerCase().includes(wdSearch.toLowerCase()) && !w.id.toLowerCase().includes(wdSearch.toLowerCase())) return false
    return true
  })

  /* ─── chart data ─── */

  const trendData = [
    { hour: '00:00', deposits: 1200, withdrawals: 800 },
    { hour: '04:00', deposits: 600, withdrawals: 300 },
    { hour: '08:00', deposits: 2800, withdrawals: 1500 },
    { hour: '12:00', deposits: 4200, withdrawals: 2100 },
    { hour: '16:00', deposits: 3800, withdrawals: 2600 },
    { hour: '20:00', deposits: 5100, withdrawals: 3200 },
    { hour: 'Now', deposits: stats?.totalDeposits || 0, withdrawals: stats?.totalWithdrawals || 0 },
  ]

  const methodData = Object.entries(stats?.byMethod || {}).map(([name, val]: [string, any]) => ({
    name, value: val.total, count: val.count,
  }))

  const providerData = Object.entries(stats?.byProvider || {}).map(([name, val]: [string, any]) => ({
    name, volume: val.total, count: val.count,
  }))

  /* unique values for filter dropdowns */
  const allMethods = [...new Set((deposits || []).map((d: any) => d.method))]
  const allProviders = [...new Set((deposits || []).map((d: any) => d.provider))]
  const allCurrencies = [...new Set((deposits || []).map((d: any) => d.currency))]
  const allDepStatuses = [...new Set((deposits || []).map((d: any) => d.status))]
  const allWdStatuses = [...new Set((withdrawals || []).map((w: any) => w.status))]
  const allWdMethods = [...new Set((withdrawals || []).map((w: any) => w.method))]

  /* ─── action handlers (mock) ─── */

  const handleConfirmDeposit = (dep: any) => {
    alert(`Deposit ${dep.id} confirmed!`)
    refetch()
  }

  const handleApproveWithdrawal = (wd: any) => {
    alert(`Withdrawal ${wd.id} approved!`)
    refetch()
  }

  const handleRejectWithdrawal = (wd: any) => {
    alert(`Withdrawal ${wd.id} rejected!`)
    refetch()
  }

  /* ═══════════════════════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════════════════════ */

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deposits">Deposits</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
        </TabsList>
        <Button variant="outline" size="sm" className="gap-1" onClick={refetch}>
          <RefreshCw className="size-3" /> Refresh
        </Button>
      </div>

      {/* ────────── Overview ────────── */}
      <TabsContent value="overview" className="space-y-4">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard icon={ArrowDownLeft} label="Total Deposits" value={fmtUsd(stats?.totalDeposits || 0)} color="bg-emerald-500/20 text-emerald-400" />
          <KpiCard icon={ArrowUpRight} label="Total Withdrawals" value={fmtUsd(stats?.totalWithdrawals || 0)} color="bg-blue-500/20 text-blue-400" />
          <KpiCard icon={Clock} label="Pending Deposits" value={String(stats?.pendingDeposits || 0)} color="bg-yellow-500/20 text-yellow-400" sub="Requires confirmation" />
          <KpiCard icon={AlertCircle} label="Pending Withdrawals" value={String(stats?.pendingWithdrawals || 0)} color="bg-orange-500/20 text-orange-400" sub="Awaiting processing" />
          <KpiCard icon={Shield} label="Approval Queue" value={String(stats?.approvalQueue || 0)} color="bg-red-500/20 text-red-400" sub="Needs manual review" />
          <KpiCard icon={DollarSign} label="Total Fees" value={fmtUsd(stats?.totalFees || 0)} color="bg-amber-500/20 text-amber-400" />
          <KpiCard icon={Percent} label="Success Rate" value={`${stats?.successRate || 0}%`} color="bg-emerald-500/20 text-emerald-400" />
          <KpiCard icon={Timer} label="Avg Processing" value={`${stats?.avgProcessingTime || 0} min`} color="bg-blue-500/20 text-blue-400" />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Deposit vs Withdrawal Trend */}
          <Card className="bg-card/60 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Deposit vs Withdrawal Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="hour" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="deposits" name="Deposits" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} />
                  <Area type="monotone" dataKey="withdrawals" name="Withdrawals" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Method Distribution */}
          <Card className="bg-card/60 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Payment Method Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={methodData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={2} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {methodData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Provider Volume Chart */}
        <Card className="bg-card/60 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Provider Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={providerData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="volume" name="Volume ($)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>

      {/* ────────── Deposits ────────── */}
      <TabsContent value="deposits" className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input placeholder="Search player or ID..." value={depSearch} onChange={(e) => setDepSearch(e.target.value)} className="pl-8 h-8 text-xs" />
          </div>
          <Select value={depStatusFilter} onValueChange={setDepStatusFilter}>
            <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {allDepStatuses.map((s: string) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={depMethodFilter} onValueChange={setDepMethodFilter}>
            <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Method" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              {allMethods.map((m: string) => <SelectItem key={m} value={m}>{m.replace('_', ' ')}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={depProviderFilter} onValueChange={setDepProviderFilter}>
            <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Provider" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Providers</SelectItem>
              {allProviders.map((p: string) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={depCurrencyFilter} onValueChange={setDepCurrencyFilter}>
            <SelectTrigger className="w-[110px] h-8 text-xs"><SelectValue placeholder="Currency" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Currencies</SelectItem>
              {allCurrencies.map((c: string) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card className="bg-card/60 border-border/50">
          <CardContent className="p-0">
            <ScrollArea className="max-h-[520px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[11px]">Time</TableHead>
                    <TableHead className="text-[11px]">Player</TableHead>
                    <TableHead className="text-[11px] text-right">Amount</TableHead>
                    <TableHead className="text-[11px]">Currency</TableHead>
                    <TableHead className="text-[11px]">Method</TableHead>
                    <TableHead className="text-[11px]">Provider</TableHead>
                    <TableHead className="text-[11px] text-right">Fee</TableHead>
                    <TableHead className="text-[11px] text-right">Net</TableHead>
                    <TableHead className="text-[11px]">Status</TableHead>
                    <TableHead className="text-[11px]">TX Hash</TableHead>
                    <TableHead className="text-[11px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeposits.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center text-muted-foreground py-8">No deposits found</TableCell>
                    </TableRow>
                  )}
                  {filteredDeposits.map((d: any) => (
                    <TableRow key={d.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setSelectedDeposit(d)}>
                      <TableCell className="text-xs whitespace-nowrap">{timeAgo(d.createdAt)}</TableCell>
                      <TableCell className="text-xs font-medium">{d.playerName}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{fmtAmount(d.amount, d.currency)}</TableCell>
                      <TableCell className="text-xs"><Badge variant="secondary" className="text-[9px]">{d.currency}</Badge></TableCell>
                      <TableCell className="text-xs">{METHOD_ICONS[d.method] || '💰'} {d.method.replace('_', ' ')}</TableCell>
                      <TableCell className="text-xs">{PROVIDER_ICONS[d.provider] || ''} {d.provider}</TableCell>
                      <TableCell className="text-xs text-right font-mono text-muted-foreground">{fmtAmount(d.feeAmount, d.currency)}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{fmtAmount(d.netAmount, d.currency)}</TableCell>
                      <TableCell><DepositStatusBadge status={d.status} /></TableCell>
                      <TableCell className="text-xs font-mono max-w-[80px] truncate">{d.txHash ? `${d.txHash.slice(0, 10)}...` : '—'}</TableCell>
                      <TableCell>
                        {d.status === 'pending' && (
                          <Button size="sm" variant="outline" className="h-6 text-[10px] gap-1 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10" onClick={(e) => { e.stopPropagation(); handleConfirmDeposit(d) }}>
                            <CheckCircle className="size-3" /> Confirm
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Deposit Detail Dialog */}
        <Dialog open={!!selectedDeposit} onOpenChange={(open) => !open && setSelectedDeposit(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ArrowDownLeft className="size-4 text-emerald-400" />
                Deposit Details
              </DialogTitle>
            </DialogHeader>
            {selectedDeposit && (
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div><span className="text-muted-foreground text-xs">ID</span><p className="font-mono text-xs">{selectedDeposit.id}</p></div>
                  <div><span className="text-muted-foreground text-xs">Player</span><p className="font-medium">{selectedDeposit.playerName}</p></div>
                  <div><span className="text-muted-foreground text-xs">Amount</span><p className="font-mono">{fmtAmount(selectedDeposit.amount, selectedDeposit.currency)}</p></div>
                  <div><span className="text-muted-foreground text-xs">Currency</span><p>{selectedDeposit.currency}</p></div>
                  <div><span className="text-muted-foreground text-xs">Method</span><p>{METHOD_ICONS[selectedDeposit.method]} {selectedDeposit.method.replace('_', ' ')}</p></div>
                  <div><span className="text-muted-foreground text-xs">Provider</span><p>{PROVIDER_ICONS[selectedDeposit.provider]} {selectedDeposit.provider}</p></div>
                  <div><span className="text-muted-foreground text-xs">Fee</span><p className="font-mono">{fmtAmount(selectedDeposit.feeAmount, selectedDeposit.currency)}</p></div>
                  <div><span className="text-muted-foreground text-xs">Net Amount</span><p className="font-mono">{fmtAmount(selectedDeposit.netAmount, selectedDeposit.currency)}</p></div>
                  <div><span className="text-muted-foreground text-xs">Status</span><p><DepositStatusBadge status={selectedDeposit.status} /></p></div>
                  <div><span className="text-muted-foreground text-xs">TX Hash</span><p className="font-mono text-xs break-all">{selectedDeposit.txHash || '—'}</p></div>
                  <div><span className="text-muted-foreground text-xs">Created</span><p className="text-xs">{new Date(selectedDeposit.createdAt).toLocaleString()}</p></div>
                  <div><span className="text-muted-foreground text-xs">Expires</span><p className="text-xs">{selectedDeposit.expiresAt ? new Date(selectedDeposit.expiresAt).toLocaleString() : '—'}</p></div>
                </div>
                {selectedDeposit.status === 'pending' && (
                  <Button className="w-full gap-1" onClick={() => { handleConfirmDeposit(selectedDeposit); setSelectedDeposit(null) }}>
                    <CheckCircle className="size-4" /> Confirm Deposit
                  </Button>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </TabsContent>

      {/* ────────── Withdrawals ────────── */}
      <TabsContent value="withdrawals" className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input placeholder="Search player or ID..." value={wdSearch} onChange={(e) => setWdSearch(e.target.value)} className="pl-8 h-8 text-xs" />
          </div>
          <Select value={wdStatusFilter} onValueChange={setWdStatusFilter}>
            <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {allWdStatuses.map((s: string) => <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={wdMethodFilter} onValueChange={setWdMethodFilter}>
            <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Method" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              {allWdMethods.map((m: string) => <SelectItem key={m} value={m}>{m.replace('_', ' ')}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card className="bg-card/60 border-border/50">
          <CardContent className="p-0">
            <ScrollArea className="max-h-[520px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[11px]">Time</TableHead>
                    <TableHead className="text-[11px]">Player</TableHead>
                    <TableHead className="text-[11px] text-right">Amount</TableHead>
                    <TableHead className="text-[11px]">Currency</TableHead>
                    <TableHead className="text-[11px]">Method</TableHead>
                    <TableHead className="text-[11px] text-right">Fee</TableHead>
                    <TableHead className="text-[11px] text-right">Net</TableHead>
                    <TableHead className="text-[11px]">Status</TableHead>
                    <TableHead className="text-[11px]">Approved By</TableHead>
                    <TableHead className="text-[11px]">TX Hash</TableHead>
                    <TableHead className="text-[11px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWithdrawals.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center text-muted-foreground py-8">No withdrawals found</TableCell>
                    </TableRow>
                  )}
                  {filteredWithdrawals.map((w: any) => (
                    <TableRow key={w.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setSelectedWithdrawal(w)}>
                      <TableCell className="text-xs whitespace-nowrap">{timeAgo(w.createdAt)}</TableCell>
                      <TableCell className="text-xs font-medium">{w.playerName}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{fmtAmount(w.amount, w.currency)}</TableCell>
                      <TableCell className="text-xs"><Badge variant="secondary" className="text-[9px]">{w.currency}</Badge></TableCell>
                      <TableCell className="text-xs">{METHOD_ICONS[w.method] || '💰'} {w.method.replace('_', ' ')}</TableCell>
                      <TableCell className="text-xs text-right font-mono text-muted-foreground">{fmtAmount(w.feeAmount, w.currency)}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{fmtAmount(w.netAmount, w.currency)}</TableCell>
                      <TableCell><WithdrawalStatusBadge status={w.status} /></TableCell>
                      <TableCell className="text-xs">{w.approvedBy || '—'}</TableCell>
                      <TableCell className="text-xs font-mono max-w-[80px] truncate">{w.txHash ? `${w.txHash.slice(0, 10)}...` : '—'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          {(w.status === 'pending' || w.status === 'under_review') && (
                            <>
                              <Button size="sm" variant="outline" className="h-6 text-[10px] gap-0.5 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10" onClick={() => handleApproveWithdrawal(w)}>
                                <CheckCircle className="size-3" /> Approve
                              </Button>
                              <Button size="sm" variant="outline" className="h-6 text-[10px] gap-0.5 text-red-400 border-red-500/30 hover:bg-red-500/10" onClick={() => handleRejectWithdrawal(w)}>
                                <XCircle className="size-3" /> Reject
                              </Button>
                            </>
                          )}
                          {w.status === 'rejected' && w.rejectionReason && (
                            <Badge variant="outline" className="text-[9px] border-red-500/30 text-red-400 max-w-[120px] truncate">{w.rejectionReason}</Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Withdrawal Detail Dialog */}
        <Dialog open={!!selectedWithdrawal} onOpenChange={(open) => !open && setSelectedWithdrawal(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ArrowUpRight className="size-4 text-blue-400" />
                Withdrawal Details
              </DialogTitle>
            </DialogHeader>
            {selectedWithdrawal && (
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div><span className="text-muted-foreground text-xs">ID</span><p className="font-mono text-xs">{selectedWithdrawal.id}</p></div>
                  <div><span className="text-muted-foreground text-xs">Player</span><p className="font-medium">{selectedWithdrawal.playerName}</p></div>
                  <div><span className="text-muted-foreground text-xs">Amount</span><p className="font-mono">{fmtAmount(selectedWithdrawal.amount, selectedWithdrawal.currency)}</p></div>
                  <div><span className="text-muted-foreground text-xs">Currency</span><p>{selectedWithdrawal.currency}</p></div>
                  <div><span className="text-muted-foreground text-xs">Method</span><p>{METHOD_ICONS[selectedWithdrawal.method]} {selectedWithdrawal.method.replace('_', ' ')}</p></div>
                  <div><span className="text-muted-foreground text-xs">Provider</span><p>{PROVIDER_ICONS[selectedWithdrawal.provider] || ''} {selectedWithdrawal.provider}</p></div>
                  <div><span className="text-muted-foreground text-xs">Fee</span><p className="font-mono">{fmtAmount(selectedWithdrawal.feeAmount, selectedWithdrawal.currency)}</p></div>
                  <div><span className="text-muted-foreground text-xs">Net Amount</span><p className="font-mono">{fmtAmount(selectedWithdrawal.netAmount, selectedWithdrawal.currency)}</p></div>
                  <div><span className="text-muted-foreground text-xs">Status</span><p><WithdrawalStatusBadge status={selectedWithdrawal.status} /></p></div>
                  <div><span className="text-muted-foreground text-xs">Approved By</span><p>{selectedWithdrawal.approvedBy || '—'}</p></div>
                  <div><span className="text-muted-foreground text-xs">TX Hash</span><p className="font-mono text-xs break-all">{selectedWithdrawal.txHash || '—'}</p></div>
                  <div><span className="text-muted-foreground text-xs">Created</span><p className="text-xs">{new Date(selectedWithdrawal.createdAt).toLocaleString()}</p></div>
                  <div><span className="text-muted-foreground text-xs">Processed</span><p className="text-xs">{selectedWithdrawal.processedAt ? new Date(selectedWithdrawal.processedAt).toLocaleString() : '—'}</p></div>
                  <div><span className="text-muted-foreground text-xs">Approved At</span><p className="text-xs">{selectedWithdrawal.approvedAt ? new Date(selectedWithdrawal.approvedAt).toLocaleString() : '—'}</p></div>
                </div>
                {selectedWithdrawal.rejectionReason && (
                  <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3">
                    <p className="text-xs text-red-400 font-medium">Rejection Reason</p>
                    <p className="text-xs text-red-300 mt-1">{selectedWithdrawal.rejectionReason}</p>
                  </div>
                )}
                {(selectedWithdrawal.status === 'pending' || selectedWithdrawal.status === 'under_review') && (
                  <div className="flex gap-2">
                    <Button className="flex-1 gap-1" onClick={() => { handleApproveWithdrawal(selectedWithdrawal); setSelectedWithdrawal(null) }}>
                      <CheckCircle className="size-4" /> Approve
                    </Button>
                    <Button variant="destructive" className="flex-1 gap-1" onClick={() => { handleRejectWithdrawal(selectedWithdrawal); setSelectedWithdrawal(null) }}>
                      <XCircle className="size-4" /> Reject
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </TabsContent>

      {/* ────────── Providers ────────── */}
      <TabsContent value="providers" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {(providers || []).map((p: any) => (
            <Card key={p.id} className={`bg-card/60 border-border/50 ${!p.isActive ? 'opacity-60' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <span className="text-lg">{PROVIDER_ICONS[p.name] || p.logo || '💰'}</span>
                    {p.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <TypeBadge type={p.type} />
                    <span className={`size-2.5 rounded-full ${p.isActive ? 'bg-emerald-500' : 'bg-gray-500'}`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Active toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <Badge variant={p.isActive ? 'default' : 'secondary'} className={`text-[10px] ${p.isActive ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                    {p.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                {/* Deposit limits */}
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Deposit Limits</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Min</span>
                    <span className="font-mono">{fmtAmount(p.minDeposit, p.supportedCurrencies?.[0] || 'USD')}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Max</span>
                    <span className="font-mono">{fmtAmount(p.maxDeposit, p.supportedCurrencies?.[0] || 'USD')}</span>
                  </div>
                </div>

                {/* Withdrawal limits */}
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Withdrawal Limits</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Min</span>
                    <span className="font-mono">{fmtAmount(p.minWithdrawal, p.supportedCurrencies?.[0] || 'USD')}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Max</span>
                    <span className="font-mono">{fmtAmount(p.maxWithdrawal, p.supportedCurrencies?.[0] || 'USD')}</span>
                  </div>
                </div>

                {/* Fees */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1"><Percent className="size-3" /> Fees</span>
                  <span className="font-mono text-amber-400">{p.feePercent}% + {fmtAmount(p.feeFixed, p.supportedCurrencies?.[0] || 'USD')}</span>
                </div>

                {/* Processing time */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1"><Clock className="size-3" /> Processing</span>
                  <span>{p.processingTime}</span>
                </div>

                {/* Supported currencies */}
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1">
                    <Globe className="size-3" /> Currencies
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {(p.supportedCurrencies || []).map((c: string) => (
                      <Badge key={c} variant="secondary" className="text-[9px]">{c}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  )
}
