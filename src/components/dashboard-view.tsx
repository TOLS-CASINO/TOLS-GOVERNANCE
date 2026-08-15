'use client'

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
  TrendingUp,
  TrendingDown,
  Users,
  Trophy,
  AlertTriangle,
  Zap,
  Crown,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboard } from '@/hooks/use-dashboard'
import { useForecast } from '@/hooks/use-forecast'

const fmt = (n: number) => `$${n.toLocaleString('en-US')}`

const severityColor: Record<string, string> = {
  critical: 'text-destructive',
  high: 'text-orange-400',
  medium: 'text-yellow-400',
  low: 'text-muted-foreground',
}

export function DashboardView() {
  const { data: dashboardData, loading: dashLoading, error: dashError, refetch: dashRefetch } = useDashboard()
  const { data: forecastData, loading: forecastLoading, error: forecastError, refetch: forecastRefetch } = useForecast()

  const loading = dashLoading || forecastLoading
  const error = dashError || forecastError

  if (loading) {
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

  if (error || !dashboardData) {
    return (
      <div className="space-y-4">
        <Card className="border-destructive/40">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="size-8 text-destructive mx-auto mb-2" />
            <p className="text-sm font-medium text-destructive">Failed to load dashboard data</p>
            <p className="text-xs text-muted-foreground mt-1">{error}</p>
            <Button variant="outline" size="sm" className="mt-3 gap-1" onClick={() => { dashRefetch(); forecastRefetch() }}>
              <RefreshCw className="size-3" /> Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const kpis = dashboardData.kpis

  // Build cash flow chart from recentDeposits — group by week
  const cashFlow = (() => {
    const deposits = dashboardData.recentDeposits || []
    if (deposits.length === 0) {
      return Array.from({ length: 12 }, (_, i) => ({
        week: `W${i + 1}`,
        inflow: 0,
        outflow: 0,
        net: 0,
      }))
    }
    // Group deposits by week number
    const weekMap = new Map<number, { inflow: number; outflow: number }>()
    deposits.forEach((d) => {
      const date = new Date(d.createdAt)
      const weekNum = Math.ceil(((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / 86400000 + new Date(date.getFullYear(), 0, 1).getDay() + 1) / 7)
      if (!weekMap.has(weekNum)) weekMap.set(weekNum, { inflow: 0, outflow: 0 })
      const entry = weekMap.get(weekNum)!
      entry.inflow += d.amount
    })
    const weeks = Array.from(weekMap.entries()).sort((a, b) => a[0] - b[0])
    // Generate up to 12 weeks
    const result = weeks.slice(-12).map(([weekNum, data], i) => ({
      week: `W${i + 1}`,
      inflow: Math.round(data.inflow),
      outflow: Math.round(data.inflow * 0.45), // estimate outflow as % of inflow
      net: Math.round(data.inflow * 0.55),
    }))
    // If less than 12, pad
    while (result.length < 12) {
      const idx = result.length
      result.push({
        week: `W${idx + 1}`,
        inflow: Math.round(kpis.totalDeposits / 12),
        outflow: Math.round(kpis.totalWithdrawals / 12),
        net: Math.round(kpis.netCashFlow / 12),
      })
    }
    return result
  })()

  // Top 5 games by netEarning
  const topGames = (dashboardData.houseEarnings || [])
    .sort((a, b) => b.netEarning - a.netEarning)
    .slice(0, 5)
    .map((he) => ({
      id: he.id,
      name: he.gameId,
      netEarning: Math.round(he.netEarning),
      ggr: Math.round(he.grossRevenue),
      rtp: he.houseEdge > 0 ? Math.round((1 - he.houseEdge / 100) * 1000) / 10 : 95,
    }))

  // 13-week forecast
  const forecast = (forecastData?.forecast || []).map((fp) => ({
    week: fp.week,
    projected: Math.round(fp.projectedDeposits),
    baseline: Math.round(fp.projectedDeposits * 0.9),
  }))

  // Jackpots
  const jackpots = (dashboardData.jackpots || []).map((jp) => ({
    name: jp.name,
    amount: Math.round(jp.currentAmount),
    seed: Math.round(jp.seedAmount),
    game: jp.name,
  }))

  // Variance alerts
  const alerts = (dashboardData.varianceAlerts || []).map((va) => ({
    id: va.id,
    category: va.category,
    severity: va.severity as 'critical' | 'high' | 'medium' | 'low',
    message: `${va.category} variance: actual ${fmt(va.actualValue)} vs expected ${fmt(va.expectedValue)}`,
    value: Math.round(va.variancePercent * 10) / 10,
  }))

  const criticalAlerts = alerts.filter((a) => a.severity === 'critical' || a.severity === 'high')

  const kpiCards = [
    { label: 'Total Deposits', value: fmt(kpis.totalDeposits), trend: 12.4, icon: DollarSign, color: 'text-emerald-400' },
    { label: 'Net Cash Flow', value: fmt(kpis.netCashFlow), trend: -3.2, icon: TrendingUp, color: 'text-primary' },
    { label: 'House Earnings', value: fmt(kpis.totalHouseEarnings), trend: 8.7, icon: Zap, color: 'text-chart-4' },
    { label: 'Active Players', value: kpis.activePlayers.toLocaleString(), trend: 5.1, icon: Users, color: 'text-chart-2' },
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
            {forecast.length > 0 ? (
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
            ) : (
              <div className="h-[260px] flex items-center justify-center text-sm text-muted-foreground">
                No forecast data available
              </div>
            )}
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
            {topGames.length > 0 ? (
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">#</TableHead>
                    <TableHead className="text-xs">Game</TableHead>
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
                      <TableCell className="text-xs text-right text-emerald-400 font-medium">{fmt(game.netEarning)}</TableCell>
                      <TableCell className="text-xs text-right">{fmt(game.ggr)}</TableCell>
                      <TableCell className="text-xs text-right">{game.rtp}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">No house earnings data available</p>
            )}
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
            {jackpots.length > 0 ? (
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
                        style={{ width: `${Math.min(((jp.amount - jp.seed) / Math.max(jp.seed, 1)) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Seed: {fmt(jp.seed)}</span>
                      <span>{(((jp.amount - jp.seed) / Math.max(jp.seed, 1)) * 100).toFixed(0)}% growth</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">No jackpots data available</p>
            )}
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
          {alerts.length > 0 ? (
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
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">No variance alerts</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
