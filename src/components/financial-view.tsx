'use client'

import { useState } from 'react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  DollarSign,
  ArrowDownToLine,
  ArrowUpFromLine,
  ShieldCheck,
  Clock,
  AlertTriangle,
  TrendingUp,
  Layers,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useFinancial, useEscrow, useWaterfall, useVariance } from '@/hooks/use-financial'

const fmt = (n: number) => `$${n.toLocaleString('en-US')}`

const WATERFALL_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)', '#f59e0b', '#10b981']

export function FinancialView() {
  const { data: financialData, loading: finLoading, error: finError, refetch: finRefetch } = useFinancial()
  const { data: escrowData, loading: escLoading, error: escError, refetch: escRefetch } = useEscrow()
  const { data: waterfallData, loading: wfLoading, error: wfError, refetch: wfRefetch } = useWaterfall()
  const { data: varianceData, loading: varLoading, error: varError, refetch: varRefetch } = useVariance()

  const [ledgerFilter, setLedgerFilter] = useState('all')

  const loading = finLoading || escLoading || wfLoading || varLoading
  const error = finError || escError || wfError || varError

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
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
          <AlertTriangle className="size-8 text-destructive mx-auto mb-2" />
          <p className="text-sm font-medium text-destructive">Failed to load financial data</p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
          <Button variant="outline" size="sm" className="mt-3 gap-1" onClick={() => { finRefetch(); escRefetch(); wfRefetch(); varRefetch() }}>
            <RefreshCw className="size-3" /> Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Financial API returns: { deposits, withdrawals, houseEarnings, ledger }
  const financial = financialData as any
  const escrow = escrowData as any
  const waterfall = waterfallData as any
  const variance = varianceData as any

  const totalDeposits = (financial?.deposits || []).reduce((s: number, d: any) => s + d.amount, 0)
  const totalWithdrawals = (financial?.withdrawals || []).reduce((s: number, w: any) => s + w.amount, 0)
  const totalRevenue = (financial?.houseEarnings || []).reduce((s: number, h: any) => s + h.grossRevenue, 0)
  const escrowBalance = escrow?.totalBalance || 0
  const pendingSettlements = escrow?.pendingSettlement || 0

  const summary = {
    totalRevenue: Math.round(totalRevenue),
    totalDeposits: Math.round(totalDeposits),
    totalWithdrawals: Math.round(totalWithdrawals),
    pendingSettlements: Math.round(pendingSettlements),
    escrowBalance: Math.round(escrowBalance),
    netHouseEdge: financial?.houseEarnings?.length > 0
      ? Math.round((financial.houseEarnings.reduce((s: number, h: any) => s + h.houseEdge, 0) / financial.houseEarnings.length) * 100) / 100
      : 4.32,
  }

  // Deposit trend — group by month
  const depositTrend = (() => {
    const deposits = financial?.deposits || []
    const withdrawals = financial?.withdrawals || []
    const monthMap = new Map<string, { deposits: number; withdrawals: number }>()
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    deposits.forEach((d: any) => {
      const date = new Date(d.createdAt)
      const monthLabel = months[date.getMonth()] || 'Unknown'
      if (!monthMap.has(monthLabel)) monthMap.set(monthLabel, { deposits: 0, withdrawals: 0 })
      monthMap.get(monthLabel)!.deposits += d.amount
    })
    withdrawals.forEach((w: any) => {
      const date = new Date(w.createdAt)
      const monthLabel = months[date.getMonth()] || 'Unknown'
      if (!monthMap.has(monthLabel)) monthMap.set(monthLabel, { deposits: 0, withdrawals: 0 })
      monthMap.get(monthLabel)!.withdrawals += w.amount
    })

    if (monthMap.size === 0) {
      return months.map((month) => ({ month, deposits: 0, withdrawals: 0 }))
    }
    return Array.from(monthMap.entries()).map(([month, data]) => ({
      month,
      deposits: Math.round(data.deposits),
      withdrawals: Math.round(data.withdrawals),
    }))
  })()

  // Escrow accounts from API
  const escrowAccounts = (() => {
    if (escrow) {
      return [{
        id: escrow.id || 'ESC-001',
        name: `Player Escrow (${escrow.settlementFrequency || 'daily'})`,
        balance: Math.round(escrow.totalBalance || 0),
        status: escrow.status || 'active',
        lastSettlement: escrow.lastSettlement
          ? new Date(escrow.lastSettlement).toLocaleString()
          : 'N/A',
      }]
    }
    return []
  })()

  // Settlement history from escrow
  const settlements = (escrow?.settlements || []).map((s: any) => ({
    id: s.id,
    amount: Math.round(s.amount),
    status: s.status,
    date: new Date(s.settledAt).toLocaleDateString(),
  }))

  // Waterfall tiers from API
  const waterfallTiers = (waterfall?.waterfallSteps || []).map((step: any, i: number) => ({
    tier: step.name,
    pct: Math.round(step.rate * 100),
    amount: Math.round(step.amount),
    color: WATERFALL_COLORS[i % WATERFALL_COLORS.length],
  }))

  // Ledger entries from API
  const ledgerEntries = (financial?.ledger || []).map((entry: any) => ({
    id: entry.id,
    date: new Date(entry.createdAt).toLocaleDateString(),
    category: entry.category,
    description: entry.description,
    debit: entry.type === 'debit' ? Math.round(entry.amount) : 0,
    credit: entry.type === 'credit' ? Math.round(entry.amount) : 0,
    balance: Math.round(entry.amount),
    reference: entry.reference || '',
  }))

  const filteredLedger = ledgerFilter === 'all'
    ? ledgerEntries
    : ledgerEntries.filter((e) => e.category.toLowerCase() === ledgerFilter)

  // Variance items from API
  const varianceItems = (variance?.budgets || []).map((b: any) => ({
    category: b.category,
    budget: Math.round(b.targetAmount),
    actual: Math.round(b.actualAmount),
    variance: Math.round(b.variance),
    pct: b.targetAmount !== 0 ? Math.round((b.variance / b.targetAmount) * 10000) / 100 : 0,
    severity: Math.abs(b.variance / Math.max(b.targetAmount, 1)) > 0.05 ? 'high' : Math.abs(b.variance / Math.max(b.targetAmount, 1)) > 0.02 ? 'medium' : 'low',
  }))

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList className="w-full sm:w-auto">
        <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
        <TabsTrigger value="escrow" className="text-xs">Escrow</TabsTrigger>
        <TabsTrigger value="waterfall" className="text-xs">Waterfall</TabsTrigger>
        <TabsTrigger value="ledger" className="text-xs">Ledger</TabsTrigger>
        <TabsTrigger value="variance" className="text-xs">Variance</TabsTrigger>
      </TabsList>

      {/* ---- OVERVIEW TAB ---- */}
      <TabsContent value="overview" className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Revenue', value: fmt(summary.totalRevenue), icon: DollarSign, color: 'text-emerald-400' },
            { label: 'Total Deposits', value: fmt(summary.totalDeposits), icon: ArrowDownToLine, color: 'text-chart-2' },
            { label: 'Escrow Balance', value: fmt(summary.escrowBalance), icon: ShieldCheck, color: 'text-primary' },
          ].map((item) => (
            <Card key={item.label}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{item.label}</p>
                    <p className="text-2xl font-bold mt-1">{item.value}</p>
                  </div>
                  <div className="rounded-lg bg-muted p-2"><item.icon className={`size-4 ${item.color}`} /></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Deposit / Withdrawal Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={depositTrend} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="depGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="wdGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                  <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                  <Tooltip
                    formatter={(value: number) => fmt(value)}
                    contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey="deposits" stroke="var(--chart-2)" fill="url(#depGrad)" strokeWidth={2} name="Deposits" />
                  <Area type="monotone" dataKey="withdrawals" stroke="var(--chart-3)" fill="url(#wdGrad)" strokeWidth={2} name="Withdrawals" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Financial Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: 'Net House Edge', value: `${summary.netHouseEdge}%`, pct: summary.netHouseEdge / 5 * 100 },
                  { label: 'Deposit Ratio', value: summary.totalRevenue > 0 ? `${((summary.totalDeposits / summary.totalRevenue) * 100).toFixed(1)}%` : '0%', pct: summary.totalRevenue > 0 ? (summary.totalDeposits / summary.totalRevenue) * 100 : 0 },
                  { label: 'Settlement Coverage', value: summary.pendingSettlements > 0 ? `${((summary.escrowBalance / summary.pendingSettlements) * 100).toFixed(0)}%` : '0%', pct: summary.pendingSettlements > 0 ? (summary.escrowBalance / summary.pendingSettlements) * 100 : 0 },
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-medium">{item.value}</span>
                    </div>
                    <Progress value={Math.min(item.pct, 100)} className="h-1.5" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* ---- ESCROW TAB ---- */}
      <TabsContent value="escrow" className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" />
                <CardTitle className="text-sm">Escrow Accounts</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {escrowAccounts.length > 0 ? (
                <div className="space-y-3">
                  {escrowAccounts.map((acc: any) => (
                    <div key={acc.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="text-xs font-medium">{acc.name}</p>
                        <p className="text-[10px] text-muted-foreground">{acc.id} · Last: {acc.lastSettlement}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{fmt(acc.balance)}</p>
                        <Badge variant={acc.status === 'active' ? 'default' : acc.status === 'frozen' ? 'destructive' : 'secondary'} className="text-[9px] h-4 px-1">
                          {acc.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">No escrow accounts</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-chart-4" />
                <CardTitle className="text-sm">Settlement History</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {settlements.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">ID</TableHead>
                      <TableHead className="text-xs">Amount</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {settlements.map((s: any) => (
                      <TableRow key={s.id}>
                        <TableCell className="text-xs font-mono">{s.id}</TableCell>
                        <TableCell className="text-xs">{fmt(s.amount)}</TableCell>
                        <TableCell>
                          <Badge variant={s.status === 'completed' ? 'default' : s.status === 'pending' ? 'secondary' : 'outline'} className="text-[9px] h-4">
                            {s.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{s.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">No settlements</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Settlement Schedule</CardTitle>
            <CardDescription>Next scheduled settlements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {escrowAccounts.length > 0 ? (
                escrowAccounts.map((acc: any) => (
                  <div key={acc.id} className="p-3 rounded-lg border border-border bg-muted/30 space-y-1">
                    <p className="text-xs font-medium">{acc.name}</p>
                    <p className="text-sm font-bold text-primary">{fmt(acc.balance)}</p>
                    <p className="text-[10px] text-muted-foreground">Last: {acc.lastSettlement}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">No scheduled settlements</p>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* ---- WATERFALL TAB ---- */}
      <TabsContent value="waterfall" className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Layers className="size-4 text-primary" />
              <CardTitle className="text-sm">Revenue Waterfall Distribution</CardTitle>
            </div>
            <CardDescription>Payment priority tiers from gross revenue</CardDescription>
          </CardHeader>
          <CardContent>
            {waterfallTiers.length > 0 ? (
              <>
                {/* Visual Stacked Bar */}
                <div className="mb-6">
                  <div className="flex h-10 rounded-lg overflow-hidden">
                    {waterfallTiers.map((tier: any) => (
                      <div
                        key={tier.tier}
                        style={{ width: `${tier.pct}%`, backgroundColor: tier.color }}
                        className="flex items-center justify-center text-[9px] font-bold text-white transition-all hover:opacity-80"
                        title={`${tier.tier}: ${tier.pct}% (${fmt(tier.amount)})`}
                      >
                        {tier.pct >= 8 ? `${tier.pct}%` : ''}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3 mt-3">
                    {waterfallTiers.map((tier: any) => (
                      <div key={tier.tier} className="flex items-center gap-1.5 text-[10px]">
                        <div className="size-2.5 rounded-sm shrink-0" style={{ backgroundColor: tier.color }} />
                        <span className="text-muted-foreground">{tier.tier}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detail Table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Tier</TableHead>
                      <TableHead className="text-xs text-right">Percentage</TableHead>
                      <TableHead className="text-xs text-right">Amount</TableHead>
                      <TableHead className="text-xs">Distribution</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {waterfallTiers.map((tier: any) => (
                      <TableRow key={tier.tier}>
                        <TableCell className="text-xs font-medium">{tier.tier}</TableCell>
                        <TableCell className="text-xs text-right">{tier.pct}%</TableCell>
                        <TableCell className="text-xs text-right font-mono">{fmt(tier.amount)}</TableCell>
                        <TableCell>
                          <div className="w-full bg-muted rounded-full h-2 max-w-[120px]">
                            <div className="h-full rounded-full" style={{ width: `${tier.pct}%`, backgroundColor: tier.color }} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-8">No waterfall data available</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* ---- LEDGER TAB ---- */}
      <TabsContent value="ledger" className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <CardTitle className="text-sm">Master Ledger</CardTitle>
              <div className="flex gap-2">
                <Select value={ledgerFilter} onValueChange={setLedgerFilter}>
                  <SelectTrigger className="w-[140px] h-8 text-xs">
                    <SelectValue placeholder="Filter category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="payout">Payout</SelectItem>
                    <SelectItem value="provider">Provider</SelectItem>
                    <SelectItem value="affiliate">Affiliate</SelectItem>
                    <SelectItem value="escrow">Escrow</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Search entries..." className="w-[160px] h-8 text-xs" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredLedger.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">ID</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Category</TableHead>
                    <TableHead className="text-xs">Description</TableHead>
                    <TableHead className="text-xs text-right">Debit</TableHead>
                    <TableHead className="text-xs text-right">Credit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLedger.map((entry: any) => (
                    <TableRow key={entry.id}>
                      <TableCell className="text-xs font-mono">{entry.id}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{entry.date}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[9px] h-4">{entry.category}</Badge></TableCell>
                      <TableCell className="text-xs">{entry.description}</TableCell>
                      <TableCell className="text-xs text-right text-destructive font-mono">
                        {entry.debit > 0 ? fmt(entry.debit) : '—'}
                      </TableCell>
                      <TableCell className="text-xs text-right text-emerald-400 font-mono">
                        {entry.credit > 0 ? fmt(entry.credit) : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">No ledger entries</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* ---- VARIANCE TAB ---- */}
      <TabsContent value="variance" className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-4 text-primary" />
                <CardTitle className="text-sm">Budget vs Actual</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {varianceItems.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={varianceItems} margin={{ top: 5, right: 5, left: 0, bottom: 0 }} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis type="number" tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                    <YAxis type="category" dataKey="category" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" width={100} />
                    <Tooltip
                      formatter={(value: number) => fmt(value)}
                      contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                    />
                    <Bar dataKey="budget" fill="var(--chart-4)" radius={[0, 4, 4, 0]} name="Budget" />
                    <Bar dataKey="actual" fill="var(--chart-1)" radius={[0, 4, 4, 0]} name="Actual" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
                  No variance data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-4 text-yellow-400" />
                <CardTitle className="text-sm">Variance Analysis</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {varianceItems.length > 0 ? (
                <div className="space-y-3">
                  {varianceItems.map((item: any) => (
                    <div key={item.category} className="p-3 rounded-lg bg-muted/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">{item.category}</span>
                        <Badge
                          variant={item.severity === 'high' ? 'destructive' : item.severity === 'medium' ? 'secondary' : 'outline'}
                          className="text-[9px] h-4 px-1"
                        >
                          {item.severity}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>Budget: {fmt(item.budget)}</span>
                        <span>Actual: {fmt(item.actual)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div
                            className={`h-full rounded-full ${item.variance >= 0 ? 'bg-emerald-400' : 'bg-destructive'}`}
                            style={{ width: `${Math.min(Math.abs(item.pct) * 10, 100)}%` }}
                          />
                        </div>
                        <span className={`text-xs font-mono font-medium ${item.variance >= 0 ? 'text-emerald-400' : 'text-destructive'}`}>
                          {item.pct >= 0 ? '+' : ''}{item.pct.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">No variance data</p>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  )
}
