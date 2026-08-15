'use client'

import { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Gift,
  Ticket,
  Plus,
  Clock,
  Target,
  Zap,
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { usePromotions } from '@/hooks/use-promotions'

const fmt = (n: number) => `$${n.toLocaleString('en-US')}`

const typeBadge: Record<string, string> = {
  deposit_match: 'Match',
  free_spins: 'Spins',
  cashback: 'Cashback',
  reload: 'Reload',
}

const statusVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  active: 'default',
  paused: 'secondary',
  expired: 'destructive',
  scheduled: 'outline',
  inactive: 'secondary',
}

export function PromotionsView() {
  const { data: promotionsData, loading, error, refetch } = usePromotions()
  const [newPromoName, setNewPromoName] = useState('')
  const [newPromoType, setNewPromoType] = useState('deposit_match')

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-32 w-full" /></CardContent></Card>
          ))}
        </div>
      </div>
    )
  }

  if (error || !promotionsData) {
    return (
      <Card className="border-destructive/40">
        <CardContent className="p-6 text-center">
          <AlertCircle className="size-8 text-destructive mx-auto mb-2" />
          <p className="text-sm font-medium text-destructive">Failed to load promotions</p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
          <Button variant="outline" size="sm" className="mt-3 gap-1" onClick={refetch}>
            <RefreshCw className="size-3" /> Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Map API data to UI format
  const promotions = promotionsData.map((p) => {
    // Get latest stat if available
    const latestStat = p.stats && p.stats.length > 0 ? p.stats[p.stats.length - 1] : null
    const claims = latestStat?.claims || 0
    const conversions = latestStat?.conversions || 0
    const totalBonusGiven = latestStat?.totalBonusGiven || 0
    const revenue = latestStat?.revenue || 0
    const roi = totalBonusGiven > 0 ? Math.round((revenue / totalBonusGiven) * 100) : 0
    const budget = p.maxAmount || 0
    const spent = totalBonusGiven || 0

    return {
      id: p.id,
      name: p.name,
      type: p.type,
      status: p.isActive ? 'active' : 'inactive',
      claims,
      conversions,
      roi,
      budget: budget || 50000,
      spent,
      wageringReq: p.wageringMultiplier,
      startDate: p.startsAt ? new Date(p.startsAt).toLocaleDateString() : '',
      endDate: p.endsAt ? new Date(p.endsAt).toLocaleDateString() : '',
      segmentName: p.segment?.name || null,
    }
  })

  // Bonus codes from API
  const bonusCodes = promotionsData
    .flatMap((p) => (p.bonusCodes || []).map((bc) => ({
      code: bc.code,
      promotionId: p.id,
      promotionName: p.name,
      usesRemaining: (bc.maxUses || 0) - bc.currentUses,
      maxUses: bc.maxUses || 0,
      currentUses: bc.currentUses,
      expiresAt: bc.expiresAt ? new Date(bc.expiresAt).toLocaleDateString() : 'Never',
      isActive: bc.isActive,
    })))

  // Performance chart data
  const promoPerformance = promotions
    .filter((p) => p.status === 'active')
    .map((p) => ({ name: p.name.slice(0, 15), claims: p.claims, conversions: p.conversions }))

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Promotion Builder</h2>
          <p className="text-xs text-muted-foreground">{promotions.filter((p) => p.status === 'active').length} active promotions</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1 text-xs">
              <Plus className="size-3" /> Create Promotion
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Promotion</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium mb-1 block">Name</label>
                <Input value={newPromoName} onChange={(e) => setNewPromoName(e.target.value)} placeholder="Promotion name" className="h-9 text-xs" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Type</label>
                <Select value={newPromoType} onValueChange={setNewPromoType}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deposit_match">Deposit Match</SelectItem>
                    <SelectItem value="free_spins">Free Spins</SelectItem>
                    <SelectItem value="cashback">Cashback</SelectItem>
                    <SelectItem value="reload">Reload Bonus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Description</label>
                <Textarea placeholder="Describe this promotion..." className="text-xs min-h-[60px]" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium mb-1 block">Budget</label>
                  <Input type="number" placeholder="50000" className="h-9 text-xs" />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Wagering Req</label>
                  <Input type="number" placeholder="30" className="h-9 text-xs" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="ghost" size="sm" className="text-xs">Cancel</Button></DialogClose>
              <DialogClose asChild><Button size="sm" className="text-xs">Create</Button></DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Promotions Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {promotions.map((promo) => (
          <Card key={promo.id} className="relative overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold">{promo.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Badge variant="outline" className="text-[9px] h-4">{typeBadge[promo.type] || promo.type}</Badge>
                    <Badge variant={statusVariant[promo.status] || 'secondary'} className="text-[9px] h-4">{promo.status}</Badge>
                    {promo.segmentName && (
                      <Badge variant="secondary" className="text-[9px] h-4">{promo.segmentName}</Badge>
                    )}
                  </div>
                </div>
                <Gift className="size-5 text-primary" />
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center p-1.5 rounded bg-muted/50">
                  <p className="text-sm font-bold">{promo.claims.toLocaleString()}</p>
                  <p className="text-[9px] text-muted-foreground">Claims</p>
                </div>
                <div className="text-center p-1.5 rounded bg-muted/50">
                  <p className="text-sm font-bold text-emerald-400">{promo.conversions.toLocaleString()}</p>
                  <p className="text-[9px] text-muted-foreground">Conv.</p>
                </div>
                <div className="text-center p-1.5 rounded bg-muted/50">
                  <p className="text-sm font-bold text-primary">{promo.roi}%</p>
                  <p className="text-[9px] text-muted-foreground">ROI</p>
                </div>
              </div>

              {/* Budget Progress */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Budget Used</span>
                  <span>{fmt(promo.spent)} / {fmt(promo.budget)}</span>
                </div>
                <Progress value={promo.budget > 0 ? (promo.spent / promo.budget) * 100 : 0} className="h-1.5" />
              </div>

              {/* Wagering & Dates */}
              <div className="flex items-center justify-between mt-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><Target className="size-3" /> {promo.wageringReq}x wagering</span>
                <span>{promo.startDate} → {promo.endDate}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bonus Codes */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Ticket className="size-4 text-primary" />
              <CardTitle className="text-sm">Bonus Codes</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {bonusCodes.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Code</TableHead>
                    <TableHead className="text-xs">Promo</TableHead>
                    <TableHead className="text-xs">Usage</TableHead>
                    <TableHead className="text-xs">Expires</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bonusCodes.map((bc) => (
                    <TableRow key={bc.code}>
                      <TableCell className="text-xs font-mono font-bold text-primary">{bc.code}</TableCell>
                      <TableCell className="text-xs">{bc.promotionName ? bc.promotionName.slice(0, 20) : `#${bc.promotionId}`}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <div className="w-16 bg-muted rounded-full h-1.5">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${bc.maxUses > 0 ? (bc.currentUses / bc.maxUses) * 100 : 0}%` }} />
                          </div>
                          <span className="text-[10px] text-muted-foreground">{bc.usesRemaining}/{bc.maxUses || '∞'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{bc.expiresAt}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">No bonus codes available</p>
            )}
          </CardContent>
        </Card>

        {/* Performance Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Promotion Performance</CardTitle>
            <CardDescription>Claims vs conversions for active promos</CardDescription>
          </CardHeader>
          <CardContent>
            {promoPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={promoPerformance} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="var(--muted-foreground)" />
                  <YAxis tick={{ fontSize: 9 }} stroke="var(--muted-foreground)" />
                  <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="claims" fill="var(--chart-1)" radius={[4, 4, 0, 0]} name="Claims" />
                  <Bar dataKey="conversions" fill="var(--chart-2)" radius={[4, 4, 0, 0]} name="Conversions" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
                No active promotion data
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
