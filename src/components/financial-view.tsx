'use client'

import { useState, useEffect } from 'react'
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
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
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

const fmt = (n: number) => `$${n.toLocaleString('en-US')}`

// --- Mock Data ---
function getMockData() {
  const summary = {
    totalRevenue: 4258900,
    totalDeposits: 2847563,
    totalWithdrawals: 1558113,
    pendingSettlements: 342500,
    escrowBalance: 1289450,
    netHouseEdge: 4.32,
  }

  const depositTrend = Array.from({ length: 12 }, (_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    deposits: Math.floor(200000 + Math.random() * 80000 + i * 5000),
    withdrawals: Math.floor(100000 + Math.random() * 40000 + i * 3000),
  }))

  const escrowAccounts = [
    { id: 'ESC-001', name: 'Player Escrow (EUR)', balance: 548200, status: 'active', lastSettlement: '2h ago' },
    { id: 'ESC-002', name: 'Player Escrow (USD)', balance: 412300, status: 'active', lastSettlement: '1h ago' },
    { id: 'ESC-003', name: 'Affiliate Reserve', balance: 189500, status: 'active', lastSettlement: '4h ago' },
    { id: 'ESC-004', name: 'Jackpot Reserve', balance: 89400, status: 'frozen', lastSettlement: '24h ago' },
    { id: 'ESC-005', name: 'Regulatory Hold', balance: 50050, status: 'pending', lastSettlement: 'Pending' },
  ]

  const settlements = [
    { id: 'STL-1001', from: 'Player Escrow (EUR)', to: 'Operator Account', amount: 125000, status: 'completed', date: '2024-01-15' },
    { id: 'STL-1002', from: 'Affiliate Reserve', to: 'Affiliate Payouts', amount: 45000, status: 'completed', date: '2024-01-15' },
    { id: 'STL-1003', from: 'Player Escrow (USD)', to: 'Payment Processor', amount: 89000, status: 'pending', date: '2024-01-16' },
    { id: 'STL-1004', from: 'Jackpot Reserve', to: 'Progressive Pool', amount: 25000, status: 'scheduled', date: '2024-01-17' },
  ]

  const waterfallTiers = [
    { tier: 'Payment Processing', pct: 3.5, amount: 149062, color: 'var(--chart-1)' },
    { tier: 'Game Providers', pct: 15.0, amount: 638835, color: 'var(--chart-2)' },
    { tier: 'Affiliate Commission', pct: 8.0, amount: 340712, color: 'var(--chart-3)' },
    { tier: 'Platform Fee', pct: 5.0, amount: 212945, color: 'var(--chart-4)' },
    { tier: 'Regulatory Reserve', pct: 4.0, amount: 170356, color: 'var(--chart-5)' },
    { tier: 'Tax Obligations', pct: 12.0, amount: 511068, color: '#f59e0b' },
    { tier: 'Net Operator Revenue', pct: 52.5, amount: 2235922, color: '#10b981' },
  ]

  const ledgerEntries = [
    { id: 'LDG-001', date: '2024-01-15', category: 'Revenue', description: 'GGR - Slot Games', debit: 0, credit: 567800, balance: 2847563 },
    { id: 'LDG-002', date: '2024-01-15', category: 'Revenue', description: 'GGR - Table Games', debit: 0, credit: 356200, balance: 3203763 },
    { id: 'LDG-003', date: '2024-01-15', category: 'Payout', description: 'Player Withdrawals', debit: 155811, credit: 0, balance: 3047952 },
    { id: 'LDG-004', date: '2024-01-15', category: 'Provider', description: 'Game Studio Fees', debit: 140490, credit: 0, balance: 2907462 },
    { id: 'LDG-005', date: '2024-01-15', category: 'Affiliate', description: 'Affiliate Commissions', debit: 45000, credit: 0, balance: 2862462 },
    { id: 'LDG-006', date: '2024-01-16', category: 'Escrow', description: 'Escrow Settlement EUR', debit: 125000, credit: 0, balance: 2737462 },
    { id: 'LDG-007', date: '2024-01-16', category: 'Revenue', description: 'GGR - Live Casino', debit: 0, credit: 289400, balance: 3026862 },
  ]

  const varianceItems = [
    { category: 'GGR', budget: 4500000, actual: 4258900, variance: -241100, pct: -5.36, severity: 'high' },
    { category: 'Payment Processing', budget: 150000, actual: 149062, variance: -938, pct: -0.63, severity: 'low' },
    { category: 'Game Provider Fees', budget: 650000, actual: 638835, variance: -11165, pct: -1.72, severity: 'medium' },
    { category: 'Affiliate Payouts', budget: 340000, actual: 340712, variance: 712, pct: 0.21, severity: 'low' },
    { category: 'Tax Obligations', budget: 500000, actual: 511068, variance: 11068, pct: 2.21, severity: 'medium' },
    { category: 'Net Revenue', budget: 2300000, actual: 2235922, variance: -64078, pct: -2.79, severity: 'high' },
  ]

  return { summary, depositTrend, escrowAccounts, settlements, waterfallTiers, ledgerEntries, varianceItems }
}

export function FinancialView() {
  const [data, setData] = useState<ReturnType<typeof getMockData> | null>(null)
  const [loading, setLoading] = useState(true)
  const [ledgerFilter, setLedgerFilter] = useState('all')

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(getMockData())
      setLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  if (loading || !data) {
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

  const { summary, depositTrend, escrowAccounts, settlements, waterfallTiers, ledgerEntries, varianceItems } = data
  const filteredLedger = ledgerFilter === 'all' ? ledgerEntries : ledgerEntries.filter((e) => e.category.toLowerCase() === ledgerFilter)

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
                  { label: 'Deposit Ratio', value: `${((summary.totalDeposits / summary.totalRevenue) * 100).toFixed(1)}%`, pct: (summary.totalDeposits / summary.totalRevenue) * 100 },
                  { label: 'Settlement Coverage', value: `${((summary.escrowBalance / summary.pendingSettlements) * 100).toFixed(0)}%`, pct: (summary.escrowBalance / summary.pendingSettlements) * 100 },
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
              <div className="space-y-3">
                {escrowAccounts.map((acc) => (
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
                  {settlements.map((s) => (
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
              {[
                { label: 'EUR Player Payout', time: 'Next: 2h 15m', amount: 125000 },
                { label: 'USD Affiliate Payout', time: 'Next: 4h 30m', amount: 45000 },
                { label: 'GBP Regulatory', time: 'Next: 23h 45m', amount: 32000 },
              ].map((s) => (
                <div key={s.label} className="p-3 rounded-lg border border-border bg-muted/30 space-y-1">
                  <p className="text-xs font-medium">{s.label}</p>
                  <p className="text-sm font-bold text-primary">{fmt(s.amount)}</p>
                  <p className="text-[10px] text-muted-foreground">{s.time}</p>
                </div>
              ))}
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
            {/* Visual Stacked Bar */}
            <div className="mb-6">
              <div className="flex h-10 rounded-lg overflow-hidden">
                {waterfallTiers.map((tier) => (
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
                {waterfallTiers.map((tier) => (
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
                {waterfallTiers.map((tier) => (
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">ID</TableHead>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Category</TableHead>
                  <TableHead className="text-xs">Description</TableHead>
                  <TableHead className="text-xs text-right">Debit</TableHead>
                  <TableHead className="text-xs text-right">Credit</TableHead>
                  <TableHead className="text-xs text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLedger.map((entry) => (
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
                    <TableCell className="text-xs text-right font-mono font-medium">{fmt(entry.balance)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
              <div className="space-y-3">
                {varianceItems.map((item) => (
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
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  )
}
