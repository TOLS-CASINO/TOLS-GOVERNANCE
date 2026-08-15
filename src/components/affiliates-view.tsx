'use client'

import {
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
  Trophy,
  DollarSign,
  Users,
  MousePointerClick,
  TrendingUp,
  Crown,
  Medal,
  AlertCircle,
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
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useAffiliates } from '@/hooks/use-affiliates'

const fmt = (n: number) => `$${n.toLocaleString('en-US')}`

const tierIcon: Record<string, React.ElementType> = {
  bronze: Medal,
  silver: Medal,
  gold: Crown,
  platinum: Crown,
}

const tierColorClass: Record<string, string> = {
  bronze: 'text-amber-700',
  silver: 'text-gray-400',
  gold: 'text-yellow-400',
  platinum: 'text-primary',
}

const TIER_COLORS: Record<string, string> = {
  bronze: '#cd7f32',
  silver: '#c0c0c0',
  gold: '#ffd700',
  platinum: '#e5e4e2',
}

const COMMISSION_TIERS = [
  { tier: 'Bronze', minFtd: 0, maxFtd: 500, rate: 8, color: '#cd7f32' },
  { tier: 'Silver', minFtd: 501, maxFtd: 1500, rate: 12, color: '#c0c0c0' },
  { tier: 'Gold', minFtd: 1501, maxFtd: 3000, rate: 15, color: '#ffd700' },
  { tier: 'Platinum', minFtd: 3001, maxFtd: 99999, rate: 20, color: '#e5e4e2' },
]

export function AffiliatesView() {
  const { data: affiliatesData, loading, error, refetch } = useAffiliates()

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-16 w-full" /></CardContent></Card>
          ))}
        </div>
        <Card><CardContent className="p-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
      </div>
    )
  }

  if (error || !affiliatesData) {
    return (
      <Card className="border-destructive/40">
        <CardContent className="p-6 text-center">
          <AlertCircle className="size-8 text-destructive mx-auto mb-2" />
          <p className="text-sm font-medium text-destructive">Failed to load affiliates</p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
          <Button variant="outline" size="sm" className="mt-3 gap-1" onClick={refetch}>
            <RefreshCw className="size-3" /> Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Map API data to UI format
  const affiliates = affiliatesData.map((af) => {
    // Get latest performance data
    const latestPerf = af.performance && af.performance.length > 0
      ? af.performance[af.performance.length - 1]
      : null
    const clicks = latestPerf?.clicks || 0
    const signups = latestPerf?.signups || 0
    const ftd = latestPerf?.ftd || 0
    const revenue = latestPerf?.revenue || 0
    const conversionRate = clicks > 0 ? Math.round((signups / clicks) * 1000) / 10 : 0

    return {
      id: af.id,
      name: af.name,
      tier: af.tier.toLowerCase(),
      clicks,
      signups,
      ftd,
      revenue: Math.round(revenue),
      earnings: Math.round(af.totalEarnings),
      conversionRate,
      activePlayers: af.activePlayers,
      commissionRate: af.commissionRate,
    }
  })

  const totalClicks = affiliates.reduce((a, af) => a + af.clicks, 0)
  const totalSignups = affiliates.reduce((a, af) => a + af.signups, 0)
  const totalFtd = affiliates.reduce((a, af) => a + af.ftd, 0)
  const totalRevenue = affiliates.reduce((a, af) => a + af.revenue, 0)

  const metrics = { totalClicks, totalSignups, totalFtd, totalRevenue }

  const tierDistribution = [
    { name: 'Bronze', value: affiliates.filter((a) => a.tier === 'bronze').length, color: '#cd7f32' },
    { name: 'Silver', value: affiliates.filter((a) => a.tier === 'silver').length, color: '#c0c0c0' },
    { name: 'Gold', value: affiliates.filter((a) => a.tier === 'gold').length, color: '#ffd700' },
    { name: 'Platinum', value: affiliates.filter((a) => a.tier === 'platinum').length, color: '#e5e4e2' },
  ].filter((t) => t.value > 0)

  // Build performance by month from affiliate performance data
  const performanceByMonth = (() => {
    const monthMap = new Map<string, { clicks: number; ftd: number }>()
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    affiliatesData.forEach((af) => {
      (af.performance || []).forEach((perf) => {
        if (perf.period) {
          if (!monthMap.has(perf.period)) monthMap.set(perf.period, { clicks: 0, ftd: 0 })
          const entry = monthMap.get(perf.period)!
          entry.clicks += perf.clicks
          entry.ftd += perf.ftd
        }
      })
    })

    if (monthMap.size > 0) {
      return Array.from(monthMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6)
        .map(([month, data]) => ({
          month,
          clicks: data.clicks,
          ftd: data.ftd,
        }))
    }

    // Fallback: generate from totals
    return Array.from({ length: 6 }, (_, i) => ({
      month: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'][i],
      clicks: Math.floor(totalClicks / 6),
      ftd: Math.floor(totalFtd / 6),
    }))
  })()

  const sorted = [...affiliates].sort((a, b) => b.earnings - a.earnings)

  return (
    <div className="space-y-4">
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Clicks', value: metrics.totalClicks.toLocaleString(), icon: MousePointerClick, color: 'text-chart-4' },
          { label: 'Signups', value: metrics.totalSignups.toLocaleString(), icon: Users, color: 'text-chart-2' },
          { label: 'First-Time Deposits', value: metrics.totalFtd.toLocaleString(), icon: TrendingUp, color: 'text-primary' },
          { label: 'Total Revenue', value: fmt(metrics.totalRevenue), icon: DollarSign, color: 'text-emerald-400' },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-2"><item.icon className={`size-4 ${item.color}`} /></div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">{item.label}</p>
                  <p className="text-lg font-bold">{item.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Leaderboard */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Trophy className="size-4 text-primary" />
            <CardTitle className="text-sm">Affiliate Leaderboard</CardTitle>
          </div>
          <CardDescription>Ranked by total earnings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Rank</TableHead>
                  <TableHead className="text-xs">Affiliate</TableHead>
                  <TableHead className="text-xs">Tier</TableHead>
                  <TableHead className="text-xs text-right">Clicks</TableHead>
                  <TableHead className="text-xs text-right">Signups</TableHead>
                  <TableHead className="text-xs text-right">FTD</TableHead>
                  <TableHead className="text-xs text-right">Revenue</TableHead>
                  <TableHead className="text-xs text-right">Earnings</TableHead>
                  <TableHead className="text-xs text-right">Conv. Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((af, idx) => {
                  const TierIcon = tierIcon[af.tier] || Medal
                  return (
                    <TableRow key={af.id}>
                      <TableCell className="text-xs">
                        <span className={`font-bold ${idx === 0 ? 'text-primary' : idx === 1 ? 'text-yellow-400' : idx === 2 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                          #{idx + 1}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs font-medium">{af.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <TierIcon className={`size-3 ${tierColorClass[af.tier] || 'text-muted-foreground'}`} />
                          <span className={`text-[10px] font-medium ${tierColorClass[af.tier] || 'text-muted-foreground'}`}>
                            {af.tier.charAt(0).toUpperCase() + af.tier.slice(1)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-right">{af.clicks.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-right">{af.signups.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-right font-medium">{af.ftd.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-right">{fmt(af.revenue)}</TableCell>
                      <TableCell className="text-xs text-right text-primary font-bold">{fmt(af.earnings)}</TableCell>
                      <TableCell className="text-xs text-right">{af.conversionRate}%</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Commission Tiers & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Commission Tier Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {COMMISSION_TIERS.map((tier) => {
                const count = affiliates.filter((a) => a.tier === tier.tier.toLowerCase()).length
                return (
                  <div key={tier.tier} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="size-3 rounded-full" style={{ backgroundColor: tier.color }} />
                        <span className="font-medium">{tier.tier}</span>
                        <Badge variant="outline" className="text-[9px] h-4">{count} affiliates</Badge>
                      </div>
                      <span className="font-bold" style={{ color: tier.color }}>{tier.rate}% commission</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>FTD: {tier.minFtd} – {tier.maxFtd === 99999 ? '∞' : tier.maxFtd}</span>
                    </div>
                    <Progress value={affiliates.length > 0 ? (count / affiliates.length) * 100 : 0} className="h-1.5" />
                  </div>
                )
              })}
            </div>

            {/* Tier Distribution Pie */}
            {tierDistribution.length > 0 && (
              <div className="mt-4 flex justify-center">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie data={tierDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={35}>
                      {tierDistribution.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Affiliate Performance — 6 Months</CardTitle>
            <CardDescription>Clicks & FTD trend</CardDescription>
          </CardHeader>
          <CardContent>
            {performanceByMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={performanceByMonth} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                  <YAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                  <Tooltip
                    contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                  />
                  <Bar dataKey="clicks" fill="var(--chart-1)" radius={[4, 4, 0, 0]} name="Clicks" />
                  <Bar dataKey="ftd" fill="var(--chart-2)" radius={[4, 4, 0, 0]} name="FTD" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
                No performance data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
