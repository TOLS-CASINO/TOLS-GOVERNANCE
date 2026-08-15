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

const fmt = (n: number) => `$${n.toLocaleString('en-US')}`

interface Promotion {
  id: number
  name: string
  type: 'deposit_match' | 'free_spins' | 'cashback' | 'reload'
  status: 'active' | 'paused' | 'expired' | 'scheduled'
  claims: number
  conversions: number
  roi: number
  budget: number
  spent: number
  wageringReq: number
  startDate: string
  endDate: string
}

interface BonusCode {
  code: string
  promotionId: number
  usesRemaining: number
  maxUses: number
  expiresAt: string
}

function getMockData() {
  const promotions: Promotion[] = [
    { id: 1, name: 'Welcome Bonus 100%', type: 'deposit_match', status: 'active', claims: 4520, conversions: 1890, roi: 285, budget: 50000, spent: 42300, wageringReq: 35, startDate: '2024-01-01', endDate: '2024-03-31' },
    { id: 2, name: 'Weekend Free Spins', type: 'free_spins', status: 'active', claims: 2340, conversions: 1120, roi: 142, budget: 15000, spent: 12800, wageringReq: 25, startDate: '2024-01-06', endDate: '2024-12-31' },
    { id: 3, name: '10% Cashback VIP', type: 'cashback', status: 'active', claims: 890, conversions: 756, roi: 95, budget: 25000, spent: 18900, wageringReq: 15, startDate: '2024-01-01', endDate: '2024-12-31' },
    { id: 4, name: 'Monday Reload 50%', type: 'reload', status: 'paused', claims: 1560, conversions: 680, roi: 120, budget: 20000, spent: 15200, wageringReq: 30, startDate: '2024-01-01', endDate: '2024-06-30' },
    { id: 5, name: 'Spring Frenzy 200%', type: 'deposit_match', status: 'scheduled', claims: 0, conversions: 0, roi: 0, budget: 75000, spent: 0, wageringReq: 40, startDate: '2024-03-20', endDate: '2024-04-20' },
  ]

  const bonusCodes: BonusCode[] = [
    { code: 'WELCOME100', promotionId: 1, usesRemaining: 5480, maxUses: 10000, expiresAt: '2024-03-31' },
    { code: 'SPINWKND', promotionId: 2, usesRemaining: 7660, maxUses: 10000, expiresAt: '2024-12-31' },
    { code: 'VIPCB10', promotionId: 3, usesRemaining: 2110, maxUses: 3000, expiresAt: '2024-12-31' },
    { code: 'RELOAD50', promotionId: 4, usesRemaining: 8440, maxUses: 10000, expiresAt: '2024-06-30' },
    { code: 'SPRING200', promotionId: 5, usesRemaining: 5000, maxUses: 5000, expiresAt: '2024-04-20' },
  ]

  const cronSchedules = [
    { task: 'Free Spins Credit', schedule: '0 10 * * 6,0', nextRun: 'Sat 10:00 AM', status: 'active' },
    { task: 'Cashback Calculation', schedule: '0 2 * * 1', nextRun: 'Mon 2:00 AM', status: 'active' },
    { task: 'Bonus Expiry Cleanup', schedule: '0 3 * * *', nextRun: 'Daily 3:00 AM', status: 'active' },
    { task: 'VIP Tier Recalculation', schedule: '0 0 1 * *', nextRun: '1st of month', status: 'active' },
  ]

  const promoPerformance = promotions
    .filter((p) => p.status === 'active')
    .map((p) => ({ name: p.name.slice(0, 15), claims: p.claims, conversions: p.conversions }))

  return { promotions, bonusCodes, cronSchedules, promoPerformance }
}

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
}

export function PromotionsView() {
  const [data, setData] = useState<ReturnType<typeof getMockData> | null>(null)
  const [loading, setLoading] = useState(true)
  const [newPromoName, setNewPromoName] = useState('')
  const [newPromoType, setNewPromoType] = useState('deposit_match')

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-32 w-full" /></CardContent></Card>
          ))}
        </div>
      </div>
    )
  }

  const { promotions, bonusCodes, cronSchedules, promoPerformance } = data

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
                    <Badge variant="outline" className="text-[9px] h-4">{typeBadge[promo.type]}</Badge>
                    <Badge variant={statusVariant[promo.status]} className="text-[9px] h-4">{promo.status}</Badge>
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
                <Progress value={(promo.spent / promo.budget) * 100} className="h-1.5" />
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
                    <TableCell className="text-xs">#{bc.promotionId}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 bg-muted rounded-full h-1.5">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${((bc.maxUses - bc.usesRemaining) / bc.maxUses) * 100}%` }} />
                        </div>
                        <span className="text-[10px] text-muted-foreground">{bc.usesRemaining}/{bc.maxUses}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{bc.expiresAt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Cron Schedules + Performance Chart */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-chart-4" />
                <CardTitle className="text-sm">Automated Schedules</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {cronSchedules.map((cs) => (
                  <div key={cs.task} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-xs">
                    <div>
                      <p className="font-medium">{cs.task}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{cs.schedule}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px]">{cs.nextRun}</p>
                      <Badge variant="default" className="text-[9px] h-3 px-1">{cs.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Promotion Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={promoPerformance} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="var(--muted-foreground)" />
                  <YAxis tick={{ fontSize: 9 }} stroke="var(--muted-foreground)" />
                  <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="claims" fill="var(--chart-1)" radius={[4, 4, 0, 0]} name="Claims" />
                  <Bar dataKey="conversions" fill="var(--chart-2)" radius={[4, 4, 0, 0]} name="Conversions" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
