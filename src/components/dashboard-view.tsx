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
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Trophy,
  AlertTriangle,
  Zap,
  Crown,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'

// Types
interface KpiData {
  totalDeposits: number
  netCashFlow: number
  houseEarnings: number
  activePlayers: number
  depositsTrend: number
  cashFlowTrend: number
  earningsTrend: number
  playersTrend: number
}

interface CashFlowPoint {
  week: string
  inflow: number
  outflow: number
  net: number
}

interface TopGame {
  id: number
  name: string
  category: string
  netEarning: number
  ggr: number
  rtp: number
}

interface ForecastPoint {
  week: string
  projected: number
  baseline: number
}

interface Jackpot {
  name: string
  amount: number
  seed: number
  game: string
}

interface VarianceAlert {
  id: number
  category: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  message: string
  value: number
}

// Mock data generators
function generateMockData() {
  const kpi: KpiData = {
    totalDeposits: 2847563,
    netCashFlow: 1289450,
    houseEarnings: 1847290,
    activePlayers: 12847,
    depositsTrend: 12.4,
    cashFlowTrend: -3.2,
    earningsTrend: 8.7,
    playersTrend: 5.1,
  }

  const cashFlow: CashFlowPoint[] = Array.from({ length: 12 }, (_, i) => ({
    week: `W${i + 1}`,
    inflow: Math.floor(180000 + Math.random() * 120000),
    outflow: Math.floor(80000 + Math.random() * 60000),
    net: Math.floor(60000 + Math.random() * 80000),
  }))

  const topGames: TopGame[] = [
    { id: 1, name: 'Mega Moolah', category: 'Slots', netEarning: 423500, ggr: 567800, rtp: 94.2 },
    { id: 2, name: 'Lightning Roulette', category: 'Table', netEarning: 387200, ggr: 489100, rtp: 97.3 },
    { id: 3, name: 'Book of Dead', category: 'Slots', netEarning: 312800, ggr: 398400, rtp: 94.5 },
    { id: 4, name: 'Blackjack VIP', category: 'Table', netEarning: 289400, ggr: 356200, rtp: 99.1 },
    { id: 5, name: 'Gonzo\'s Quest', category: 'Slots', netEarning: 256100, ggr: 312500, rtp: 95.8 },
  ]

  const forecast: ForecastPoint[] = Array.from({ length: 13 }, (_, i) => ({
    week: `W${i + 1}`,
    projected: Math.floor(150000 + i * 8000 + Math.random() * 20000),
    baseline: Math.floor(140000 + i * 5000),
  }))

  const jackpots: Jackpot[] = [
    { name: 'Mega Moolah Grand', amount: 4523890, seed: 1000000, game: 'Mega Moolah' },
    { name: 'WowPot!', amount: 1289450, seed: 500000, game: 'WowPot Series' },
    { name: 'Jackpot King', amount: 876230, seed: 200000, game: 'Jackpot King Slots' },
  ]

  const alerts: VarianceAlert[] = [
    { id: 1, category: 'Revenue', severity: 'critical', message: 'GGR variance exceeds 15% threshold', value: -18.3 },
    { id: 2, category: 'Escrow', severity: 'high', message: 'Settlement delay > 24h in EUR corridor', value: -8.7 },
    { id: 3, category: 'Player', severity: 'medium', message: 'Churn rate uptick in VIP segment', value: 4.2 },
    { id: 4, category: 'Compliance', severity: 'low', message: 'KYC pending queue above normal', value: 2.1 },
  ]

  return { kpi, cashFlow, topGames, forecast, jackpots, alerts }
}

const fmt = (n: number) => `$${n.toLocaleString('en-US')}`
const fmtK = (n: number) => n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M` : `$${(n / 1000).toFixed(0)}K`

const severityColor: Record<string, string> = {
  critical: 'text-destructive',
  high: 'text-orange-400',
  medium: 'text-yellow-400',
  low: 'text-muted-foreground',
}

const CHART_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)']

export function DashboardView() {
  const [data, setData] = useState<ReturnType<typeof generateMockData> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(generateMockData())
      setLoading(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
          <Card><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
        </div>
      </div>
    )
  }

  const { kpi, cashFlow, topGames, forecast, jackpots, alerts } = data
  const criticalAlerts = alerts.filter((a) => a.severity === 'critical' || a.severity === 'high')

  const kpiCards = [
    { label: 'Total Deposits', value: fmt(kpi.totalDeposits), trend: kpi.depositsTrend, icon: DollarSign, color: 'text-emerald-400' },
    { label: 'Net Cash Flow', value: fmt(kpi.netCashFlow), trend: kpi.cashFlowTrend, icon: TrendingUp, color: 'text-primary' },
    { label: 'House Earnings', value: fmt(kpi.houseEarnings), trend: kpi.earningsTrend, icon: Zap, color: 'text-chart-4' },
    { label: 'Active Players', value: kpi.activePlayers.toLocaleString(), trend: kpi.playersTrend, icon: Users, color: 'text-chart-2' },
  ]

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpiItem) => (
          <Card key={kpiItem.label} className="relative overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{kpiItem.label}</p>
                  <p className="text-2xl font-bold tracking-tight">{kpiItem.value}</p>
                </div>
                <div className="rounded-lg bg-muted p-2">
                  <kpiItem.icon className={`size-4 ${kpiItem.color}`} />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2">
                {kpiItem.trend >= 0 ? (
                  <TrendingUp className="size-3 text-emerald-400" />
                ) : (
                  <TrendingDown className="size-3 text-destructive" />
                )}
                <span className={`text-xs font-medium ${kpiItem.trend >= 0 ? 'text-emerald-400' : 'text-destructive'}`}>
                  {kpiItem.trend >= 0 ? '+' : ''}{kpiItem.trend}%
                </span>
                <span className="text-xs text-muted-foreground">vs last period</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Variance Alert Banner */}
      {criticalAlerts.length > 0 && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="size-4 text-destructive" />
              <span className="text-sm font-semibold text-destructive">
                {criticalAlerts.length} Critical Alert{criticalAlerts.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="space-y-1">
              {criticalAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center gap-2 text-xs">
                  <Badge variant="destructive" className="text-[9px] h-4 px-1">
                    {alert.severity.toUpperCase()}
                  </Badge>
                  <span className={severityColor[alert.severity]}>{alert.message}</span>
                  <span className="text-muted-foreground">({alert.value}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Net Cash Flow Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Net Cash Flow — 12 Weeks</CardTitle>
            <CardDescription>Inflow vs Outflow trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={cashFlow} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="week" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                <Tooltip
                  formatter={(value: number) => fmt(value)}
                  contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: 'var(--card-foreground)' }}
                />
                <Area type="monotone" dataKey="inflow" stroke="var(--chart-2)" fill="url(#inflowGrad)" strokeWidth={2} name="Inflow" />
                <Area type="monotone" dataKey="net" stroke="var(--chart-1)" fill="url(#netGrad)" strokeWidth={2} name="Net" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 13-Week Forecast */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">13-Week Revenue Forecast</CardTitle>
            <CardDescription>Projected vs baseline</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={forecast} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="week" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                <Tooltip
                  formatter={(value: number) => fmt(value)}
                  contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: 'var(--card-foreground)' }}
                />
                <Bar dataKey="baseline" fill="var(--chart-4)" radius={[4, 4, 0, 0]} name="Baseline" opacity={0.5} />
                <Bar dataKey="projected" fill="var(--chart-1)" radius={[4, 4, 0, 0]} name="Projected" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Top 5 Games */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Trophy className="size-4 text-primary" />
              <CardTitle className="text-sm">Top 5 Games by Net Earning</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">#</TableHead>
                  <TableHead className="text-xs">Game</TableHead>
                  <TableHead className="text-xs">Category</TableHead>
                  <TableHead className="text-xs text-right">Net Earning</TableHead>
                  <TableHead className="text-xs text-right">GGR</TableHead>
                  <TableHead className="text-xs text-right">RTP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topGames.map((game, idx) => (
                  <TableRow key={game.id}>
                    <TableCell className="text-xs font-bold text-primary">{idx + 1}</TableCell>
                    <TableCell className="text-xs font-medium">{game.name}</TableCell>
                    <TableCell><Badge variant="secondary" className="text-[9px] h-4">{game.category}</Badge></TableCell>
                    <TableCell className="text-xs text-right text-emerald-400 font-medium">{fmt(game.netEarning)}</TableCell>
                    <TableCell className="text-xs text-right">{fmt(game.ggr)}</TableCell>
                    <TableCell className="text-xs text-right">{game.rtp}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Global Jackpots */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Crown className="size-4 text-primary" />
              <CardTitle className="text-sm">Global Jackpots</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {jackpots.map((jp) => (
                <div key={jp.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{jp.name}</span>
                    <Badge variant="outline" className="text-[9px] border-primary/30 text-primary">{jp.game}</Badge>
                  </div>
                  <div className="text-xl font-bold text-primary">{fmt(jp.amount)}</div>
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full"
                      style={{ width: `${Math.min(((jp.amount - jp.seed) / jp.seed) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Seed: {fmt(jp.seed)}</span>
                    <span>{(((jp.amount - jp.seed) / jp.seed) * 100).toFixed(0)}% growth</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Variance Alerts */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="size-4 text-yellow-400" />
            Variance Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <Badge
                  variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}
                  className="text-[9px] h-4 px-1.5"
                >
                  {alert.severity.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="text-[9px] h-4">{alert.category}</Badge>
                <span className="text-xs flex-1">{alert.message}</span>
                <span className={`text-xs font-mono font-medium ${severityColor[alert.severity]}`}>
                  {alert.value}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
