'use client'

import { useState, useEffect } from 'react'
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
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'

const fmt = (n: number) => `$${n.toLocaleString('en-US')}`

interface Affiliate {
  id: number
  name: string
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  clicks: number
  signups: number
  ftd: number
  revenue: number
  earnings: number
  conversionRate: number
}

interface CommissionTier {
  tier: string
  minFtd: number
  maxFtd: number
  rate: number
  color: string
}

function getMockData() {
  const affiliates: Affiliate[] = [
    { id: 1, name: 'CasinoReviewPro', tier: 'platinum', clicks: 45200, signups: 3200, ftd: 2100, revenue: 485000, earnings: 48500, conversionRate: 4.6 },
    { id: 2, name: 'SlotMasterHub', tier: 'gold', clicks: 38100, signups: 2800, ftd: 1890, revenue: 412000, earnings: 37080, conversionRate: 5.0 },
    { id: 3, name: 'LuckyAffiliate', tier: 'gold', clicks: 29400, signups: 2100, ftd: 1420, revenue: 328000, earnings: 29520, conversionRate: 4.8 },
    { id: 4, name: 'BetReviews247', tier: 'silver', clicks: 22800, signups: 1650, ftd: 980, revenue: 245000, earnings: 19600, conversionRate: 4.3 },
    { id: 5, name: 'GamblingGuru', tier: 'silver', clicks: 18300, signups: 1200, ftd: 720, revenue: 189000, earnings: 15120, conversionRate: 3.9 },
    { id: 6, name: 'TopSlotsDir', tier: 'bronze', clicks: 12400, signups: 800, ftd: 450, revenue: 112000, earnings: 7840, conversionRate: 3.6 },
    { id: 7, name: 'PlayWinToday', tier: 'bronze', clicks: 8900, signups: 560, ftd: 310, revenue: 78000, earnings: 5460, conversionRate: 3.5 },
    { id: 8, name: 'NewCasinoDeal', tier: 'bronze', clicks: 5200, signups: 340, ftd: 180, revenue: 42000, earnings: 2940, conversionRate: 3.5 },
  ]

  const tiers: CommissionTier[] = [
    { tier: 'Bronze', minFtd: 0, maxFtd: 500, rate: 8, color: '#cd7f32' },
    { tier: 'Silver', minFtd: 501, maxFtd: 1500, rate: 12, color: '#c0c0c0' },
    { tier: 'Gold', minFtd: 1501, maxFtd: 3000, rate: 15, color: '#ffd700' },
    { tier: 'Platinum', minFtd: 3001, maxFtd: 99999, rate: 20, color: '#e5e4e2' },
  ]

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
  ]

  const performanceByMonth = Array.from({ length: 6 }, (_, i) => ({
    month: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'][i],
    clicks: Math.floor(totalClicks / 6 * (0.8 + Math.random() * 0.4)),
    ftd: Math.floor(totalFtd / 6 * (0.8 + Math.random() * 0.4)),
  }))

  return { affiliates, tiers, metrics, tierDistribution, performanceByMonth }
}

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

export function AffiliatesView() {
  const [data, setData] = useState<ReturnType<typeof getMockData> | null>(null)
  const [loading, setLoading] = useState(true)

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-16 w-full" /></CardContent></Card>
          ))}
        </div>
        <Card><CardContent className="p-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
      </div>
    )
  }

  const { affiliates, tiers, metrics, tierDistribution, performanceByMonth } = data
  const sorted = [...affiliates].sort((a, b) => b.earnings - a.earnings)

  return (
    <div className="space-y-4">
      {/* Performance Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                  const TierIcon = tierIcon[af.tier]
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
                          <TierIcon className={`size-3 ${tierColorClass[af.tier]}`} />
                          <span className={`text-[10px] font-medium ${tierColorClass[af.tier]}`}>
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
              {tiers.map((tier) => {
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
                    <Progress value={(count / affiliates.length) * 100} className="h-1.5" />
                  </div>
                )
              })}
            </div>

            {/* Tier Distribution Pie */}
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Affiliate Performance — 6 Months</CardTitle>
            <CardDescription>Clicks & FTD trend</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
