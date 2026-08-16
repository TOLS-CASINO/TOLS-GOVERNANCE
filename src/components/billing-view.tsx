'use client'

import { useState } from 'react'
import {
  CreditCard,
  Receipt,
  Crown,
  Zap,
  CheckCircle,
  Plus,
  Download,
  Star,
  TrendingUp,
  AlertTriangle,
  ExternalLink,
  Settings,
  RefreshCw,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { useApi } from '@/hooks/use-api'
import { api } from '@/services/api'

/* ─── Types ─── */

interface Plan {
  id: string
  name: string
  price: string
  priceValue: number
  period: string
  features: string[]
  highlight: string[]
  icon: React.ElementType
  color: string
  badge?: string
}

interface Invoice {
  id: string
  date: string
  description: string
  amount: string
  status: 'paid' | 'open' | 'void'
}

interface PaymentMethod {
  id: string
  type: 'card' | 'bank' | 'crypto'
  label: string
  detail: string
  icon: React.ElementType
  isDefault: boolean
  expiry?: string
}

interface UsageMeter {
  label: string
  used: number
  limit: number
  unit: string
}

/* ─── Mock Data ─── */

const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$499',
    priceValue: 499,
    period: '/mo',
    features: [
      'Dashboard base',
      'Financial management',
      'Up to 1,000 players',
      'Standard reports',
      'Email support',
    ],
    highlight: [],
    icon: Star,
    color: 'emerald',
    badge: undefined,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '$1,499',
    priceValue: 1499,
    period: '/mo',
    features: [
      'Everything in Starter',
      'AI Governance',
      'Revenue Optimizer',
      'Player Intelligence',
      'Up to 10,000 players',
      'Priority support',
    ],
    highlight: ['AI Governance', 'Revenue Optimizer', 'Player Intelligence'],
    icon: Zap,
    color: 'amber',
    badge: 'POPULAR',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    priceValue: 0,
    period: '',
    features: [
      'Everything in Professional',
      'Advanced AI Tutor',
      'Blockchain integration',
      'Automated compliance',
      'Unlimited players',
      '24/7 dedicated support',
    ],
    highlight: ['Advanced AI Tutor', 'Blockchain integration', 'Automated compliance'],
    icon: Crown,
    color: 'red',
    badge: 'CUSTOM',
  },
]

const MOCK_INVOICES: Invoice[] = [
  { id: 'INV-2025-001', date: '2025-03-01', description: 'Professional Plan - March 2025', amount: '$1,499.00', status: 'paid' },
  { id: 'INV-2025-002', date: '2025-02-01', description: 'Professional Plan - February 2025', amount: '$1,499.00', status: 'paid' },
  { id: 'INV-2025-003', date: '2025-01-01', description: 'Professional Plan - January 2025', amount: '$1,499.00', status: 'paid' },
  { id: 'INV-2024-012', date: '2024-12-01', description: 'Professional Plan - December 2024', amount: '$1,499.00', status: 'paid' },
  { id: 'INV-2024-011', date: '2024-11-01', description: 'Professional Plan - November 2024', amount: '$1,499.00', status: 'paid' },
  { id: 'INV-2024-010', date: '2024-10-01', description: 'Starter Plan - October 2024', amount: '$499.00', status: 'paid' },
  { id: 'INV-2024-009', date: '2024-09-15', description: 'Plan Upgrade Fee (Starter → Professional)', amount: '$1,000.00', status: 'paid' },
  { id: 'INV-2024-008', date: '2024-09-01', description: 'Starter Plan - September 2024', amount: '$499.00', status: 'void' },
]

const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'pm-1',
    type: 'card',
    label: 'Visa',
    detail: '•••• •••• •••• 4242',
    icon: CreditCard,
    isDefault: true,
    expiry: '12/2027',
  },
  {
    id: 'pm-2',
    type: 'bank',
    label: 'Bank Account',
    detail: 'Chase •••• 7831',
    icon: CreditCard,
    isDefault: false,
  },
  {
    id: 'pm-3',
    type: 'crypto',
    label: 'Crypto Wallet',
    detail: '0x71C7...3F4e',
    icon: CreditCard,
    isDefault: false,
  },
]

const USAGE_METERS: UsageMeter[] = [
  { label: 'Players', used: 4287, limit: 10000, unit: 'players' },
  { label: 'API Calls', used: 782400, limit: 1000000, unit: 'calls' },
  { label: 'Storage', used: 42, limit: 100, unit: 'GB' },
]

/* ─── Helpers ─── */

const statusColor: Record<string, string> = {
  paid: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  open: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  void: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const planColorMap: Record<string, { border: string; bg: string; text: string; glow: string }> = {
  emerald: {
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    glow: 'shadow-emerald-500/10',
  },
  amber: {
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    glow: 'shadow-amber-500/10',
  },
  red: {
    border: 'border-red-500/30',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    glow: 'shadow-red-500/10',
  },
}

function formatNumber(n: number): string {
  return n.toLocaleString('en-US')
}

/* ─── Sub-Components ─── */

function PlanCard({
  plan,
  isCurrent,
  onUpgrade,
  onDowngrade,
}: {
  plan: Plan
  isCurrent: boolean
  onUpgrade: () => void
  onDowngrade: () => void
}) {
  const colors = planColorMap[plan.color]
  const PlanIcon = plan.icon

  return (
    <Card
      className={`relative overflow-hidden transition-all duration-200 hover:scale-[1.02] ${
        isCurrent
          ? `${colors.border} ${colors.glow} shadow-lg`
          : 'border-border hover:border-primary/30'
      }`}
    >
      {isCurrent && (
        <div className={`absolute top-0 left-0 right-0 h-1 ${colors.bg}`} />
      )}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${colors.bg}`}>
              <PlanIcon className={`size-4 ${colors.text}`} />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-primary">
                {plan.name}
              </CardTitle>
              {plan.badge && (
                <Badge
                  variant="secondary"
                  className={`mt-0.5 h-4 px-1.5 text-[9px] font-bold ${colors.bg} ${colors.text} border ${colors.border}`}
                >
                  {plan.badge}
                </Badge>
              )}
            </div>
          </div>
          {isCurrent && (
            <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px]">
              CURRENT
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Price */}
        <div className="flex items-baseline gap-1">
          <span className="text-xl sm:text-2xl font-bold text-primary">{plan.price}</span>
          {plan.period && (
            <span className="text-xs text-muted-foreground">{plan.period}</span>
          )}
        </div>

        {/* Features */}
        <ul className="space-y-1.5">
          {plan.features.map((feature, i) => {
            const isHighlight = plan.highlight.includes(feature)
            return (
              <li key={i} className="flex items-start gap-2 text-xs">
                <CheckCircle
                  className={`size-3 mt-0.5 shrink-0 ${
                    isHighlight ? colors.text : 'text-muted-foreground'
                  }`}
                />
                <span className={isHighlight ? `font-medium ${colors.text}` : 'text-muted-foreground'}>
                  {feature}
                </span>
              </li>
            )
          })}
        </ul>

        <Separator className="opacity-50" />

        {/* Action */}
        {isCurrent ? (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="flex-1 gap-1 text-xs" disabled>
              <CheckCircle className="size-3" /> Active Plan
            </Button>
          </div>
        ) : plan.priceValue > 1499 || plan.priceValue === 0 ? (
          <Button
            size="sm"
            className={`flex-1 gap-1 text-xs ${colors.bg} ${colors.text} hover:opacity-80 border ${colors.border}`}
            variant="outline"
            onClick={onUpgrade}
          >
            <ExternalLink className="size-3" /> Contact Sales
          </Button>
        ) : plan.priceValue > 499 ? (
          <Button
            size="sm"
            className="flex-1 gap-1 text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:opacity-80"
            variant="outline"
            onClick={onUpgrade}
          >
            <TrendingUp className="size-3" /> Upgrade
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="flex-1 gap-1 text-xs"
            onClick={onDowngrade}
          >
            Downgrade
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

function AddPaymentMethodDialog({ onAdd }: { onAdd: (method: PaymentMethod) => void }) {
  const [type, setType] = useState<'card' | 'bank' | 'crypto'>('card')
  const [label, setLabel] = useState('')
  const [detail, setDetail] = useState('')
  const [open, setOpen] = useState(false)

  const handleAdd = () => {
    if (!label || !detail) return
    const newMethod: PaymentMethod = {
      id: `pm-${Date.now()}`,
      type,
      label,
      detail,
      icon: CreditCard,
      isDefault: false,
    }
    onAdd(newMethod)
    setLabel('')
    setDetail('')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1 text-xs">
          <Plus className="size-3" /> Add Method
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-primary">Add Payment Method</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as 'card' | 'bank' | 'crypto')}>
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="card">Credit / Debit Card</SelectItem>
                <SelectItem value="bank">Bank Account</SelectItem>
                <SelectItem value="crypto">Crypto Wallet</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Label</Label>
            <Input
              placeholder={type === 'card' ? 'Visa' : type === 'bank' ? 'Chase' : 'MetaMask'}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="text-xs"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              {type === 'card' ? 'Card Number' : type === 'bank' ? 'Account Number' : 'Wallet Address'}
            </Label>
            <Input
              placeholder={type === 'card' ? '4242 4242 4242 4242' : type === 'bank' ? '0000 0000' : '0x...'}
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              className="text-xs"
            />
          </div>
          <Button onClick={handleAdd} className="w-full gap-1 text-xs" disabled={!label || !detail}>
            <Plus className="size-3" /> Add Payment Method
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ─── Main Component ─── */

export function BillingView() {
  const [currentPlan, setCurrentPlan] = useState<string>('professional')
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(MOCK_PAYMENT_METHODS)
  const [autoRenew, setAutoRenew] = useState(true)
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)
  const [targetPlan, setTargetPlan] = useState<string>('')

  const [emailInvoices, setEmailInvoices] = useState(true)
  const [usageAlerts, setUsageAlerts] = useState(true)
  const [cryptoPayments, setCryptoPayments] = useState(false)

  const { data: billingData, loading, error, refetch } = useApi(
    () => api.billing.get(),
    []
  )

  const handleUpgrade = (planId: string) => {
    setTargetPlan(planId)
    setUpgradeDialogOpen(true)
  }

  const handleDowngrade = (planId: string) => {
    setTargetPlan(planId)
    setUpgradeDialogOpen(true)
  }

  const confirmPlanChange = () => {
    setCurrentPlan(targetPlan)
    setUpgradeDialogOpen(false)
    setTargetPlan('')
  }

  const handleAddPaymentMethod = (method: PaymentMethod) => {
    setPaymentMethods((prev) => [...prev, method])
  }

  const handleSetDefault = (id: string) => {
    setPaymentMethods((prev) =>
      prev.map((m) => ({ ...m, isDefault: m.id === id }))
    )
  }

  const handleRemovePaymentMethod = (id: string) => {
    setPaymentMethods((prev) => {
      const filtered = prev.filter((m) => m.id !== id)
      if (filtered.length > 0 && !filtered.some((m) => m.isDefault)) {
        filtered[0].isDefault = true
      }
      return filtered
    })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 sm:p-6">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
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
          <p className="text-sm font-medium text-destructive">Failed to load billing data</p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
          <Button variant="outline" size="sm" className="mt-3 gap-1" onClick={refetch}>
            <RefreshCw className="size-3" /> Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  const currentPlanData = PLANS.find((p) => p.id === currentPlan)
  const usagePercent = (used: number, limit: number) => Math.min(Math.round((used / limit) * 100), 100)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Receipt className="size-5 text-primary" />
          <h2 className="text-lg font-semibold text-primary">Billing & Subscription</h2>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[9px] border-emerald-500/30 text-emerald-400">
            ACTIVE
          </Badge>
          <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={refetch}>
            <RefreshCw className="size-3" /> Refresh
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="plans" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-muted/50">
          <TabsTrigger value="plans" className="text-xs gap-1">
            <Star className="size-3" /> Plans
          </TabsTrigger>
          <TabsTrigger value="subscription" className="text-xs gap-1">
            <Settings className="size-3" /> Subscription
          </TabsTrigger>
          <TabsTrigger value="invoices" className="text-xs gap-1">
            <Receipt className="size-3" /> Invoices
          </TabsTrigger>
          <TabsTrigger value="payment" className="text-xs gap-1">
            <CreditCard className="size-3" /> Payment
          </TabsTrigger>
        </TabsList>

        {/* ─── Tab 1: Plans ─── */}
        <TabsContent value="plans">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PLANS.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isCurrent={currentPlan === plan.id}
                onUpgrade={() => handleUpgrade(plan.id)}
                onDowngrade={() => handleDowngrade(plan.id)}
              />
            ))}
          </div>

          {/* Comparison note */}
          <Card className="mt-4 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <Zap className="size-4 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-primary">Need more power?</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    All plans include core platform access. Upgrade anytime — prorated billing applied automatically.
                    Enterprise plans include dedicated infrastructure and custom SLAs.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Tab 2: Subscription ─── */}
        <TabsContent value="subscription">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Subscription Details */}
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
                  <Crown className="size-4 text-amber-400" />
                  Current Subscription
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Plan</p>
                    <p className="text-sm font-medium text-primary">{currentPlanData?.name ?? '—'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Status</p>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px]">
                      Active
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Billing Period</p>
                    <p className="text-xs font-medium text-muted-foreground">Monthly</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Next Billing</p>
                    <p className="text-xs font-medium text-muted-foreground">April 1, 2025</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Trial Status</p>
                    <Badge variant="outline" className="text-[10px] border-muted text-muted-foreground">
                      No Trial
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Amount</p>
                    <p className="text-sm font-bold text-primary">{currentPlanData?.price}{currentPlanData?.period}</p>
                  </div>
                </div>

                <Separator className="opacity-50" />

                {/* Auto-renew toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="size-3 text-muted-foreground" />
                    <Label className="text-xs text-muted-foreground">Auto-renew</Label>
                  </div>
                  <Switch checked={autoRenew} onCheckedChange={setAutoRenew} />
                </div>
              </CardContent>
            </Card>

            {/* Usage Meters */}
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
                  <TrendingUp className="size-4 text-emerald-400" />
                  Usage Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {USAGE_METERS.map((meter) => {
                  const pct = usagePercent(meter.used, meter.limit)
                  const isHigh = pct > 80
                  const isWarning = pct > 60 && pct <= 80
                  return (
                    <div key={meter.label} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-primary">{meter.label}</span>
                          {isHigh && (
                            <Badge className="bg-red-500/20 text-red-400 border border-red-500/30 text-[9px]">
                              HIGH
                            </Badge>
                          )}
                          {isWarning && (
                            <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px]">
                              MODERATE
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatNumber(meter.used)} / {formatNumber(meter.limit)} {meter.unit}
                        </span>
                      </div>
                      <Progress
                        value={pct}
                        className={`h-2 ${isHigh ? '[&>div]:bg-red-500' : isWarning ? '[&>div]:bg-amber-500' : '[&>div]:bg-emerald-500'}`}
                      />
                      <p className="text-[10px] text-muted-foreground">{pct}% utilized</p>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => handleUpgrade('enterprise')}>
              <Crown className="size-3 text-red-400" /> Upgrade to Enterprise
            </Button>
            <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => {
              const rows = [['Metric','Used','Limit','Utilization %']]
              USAGE_METERS.forEach((m) => {
                rows.push([m.label, String(m.used), String(m.limit), `${Math.min(Math.round((m.used / m.limit) * 100), 100)}%`])
              })
              rows.push([])
              rows.push(['Plan', currentPlan, '', ''])
              rows.push(['Invoices', String(MOCK_INVOICES.length), '', ''])
              const csv = rows.map((r) => r.join(',')).join('\n')
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'usage-report.csv'
              a.click()
              URL.revokeObjectURL(url)
            }}>
              <Download className="size-3" /> Export Usage Report
            </Button>
          </div>
        </TabsContent>

        {/* ─── Tab 3: Invoices ─── */}
        <TabsContent value="invoices">
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
                  <Receipt className="size-4 text-primary" />
                  Invoice History
                </CardTitle>
                <Badge variant="outline" className="text-[9px] border-muted text-muted-foreground">
                  {MOCK_INVOICES.length} invoices
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
              <ScrollArea className="max-h-96">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground">Date</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground">Invoice</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Description</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground text-right">Amount</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground">Status</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground text-right hidden sm:table-cell">PDF</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_INVOICES.map((inv) => (
                      <TableRow key={inv.id} className="group">
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(inv.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-primary">{inv.id}</TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate hidden sm:table-cell">
                          {inv.description}
                        </TableCell>
                        <TableCell className="text-xs font-medium text-primary text-right">
                          {inv.amount}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`text-[9px] border ${statusColor[inv.status]}`}
                            variant="secondary"
                          >
                            {inv.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right hidden sm:table-cell">
                          {inv.status !== 'void' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="size-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => {
                                const lines = [
                                  `Invoice: ${inv.id}`,
                                  `Date: ${inv.date}`,
                                  `Description: ${inv.description}`,
                                  `Amount: ${inv.amount}`,
                                  `Status: ${inv.status.toUpperCase()}`,
                                  '',
                                  'Thank you for your business.',
                                  'TOLS Casino Platform',
                                ]
                                const text = lines.join('\n')
                                const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' })
                                const url = URL.createObjectURL(blob)
                                const a = document.createElement('a')
                                a.href = url
                                a.download = `${inv.id}.txt`
                                a.click()
                                URL.revokeObjectURL(url)
                              }}
                            >
                              <Download className="size-3 text-muted-foreground" />
                            </Button>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Tab 4: Payment Methods ─── */}
        <TabsContent value="payment">
          <div className="space-y-4">
            {/* Header with Add button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                Manage your payment methods and billing preferences
              </p>
              <AddPaymentMethodDialog onAdd={handleAddPaymentMethod} />
            </div>

            {/* Payment method cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paymentMethods.map((method) => {
                const MethodIcon = method.icon
                const typeColors: Record<string, string> = {
                  card: 'border-emerald-500/30',
                  bank: 'border-amber-500/30',
                  crypto: 'border-red-500/30',
                }
                const typeIconColors: Record<string, string> = {
                  card: 'text-emerald-400 bg-emerald-500/10',
                  bank: 'text-amber-400 bg-amber-500/10',
                  crypto: 'text-red-400 bg-red-500/10',
                }

                return (
                  <Card key={method.id} className={`${typeColors[method.type]} transition-all hover:scale-[1.01]`}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${typeIconColors[method.type]}`}>
                            <MethodIcon className="size-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-primary">{method.label}</p>
                            <p className="text-xs text-muted-foreground font-mono">{method.detail}</p>
                          </div>
                        </div>
                        {method.isDefault && (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px]">
                            DEFAULT
                          </Badge>
                        )}
                      </div>

                      {method.expiry && (
                        <p className="text-[10px] text-muted-foreground">
                          Expires: {method.expiry}
                        </p>
                      )}

                      <Separator className="opacity-50" />

                      <div className="flex items-center gap-2">
                        {!method.isDefault && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-[10px] gap-1"
                            onClick={() => handleSetDefault(method.id)}
                          >
                            <Star className="size-3" /> Set Default
                          </Button>
                        )}
                        {paymentMethods.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-[10px] gap-1 text-red-400 border-red-500/30 hover:bg-red-500/10"
                            onClick={() => handleRemovePaymentMethod(method.id)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Billing preferences */}
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
                  <Settings className="size-4 text-primary" />
                  Billing Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-medium text-primary">Email invoices</Label>
                    <p className="text-[10px] text-muted-foreground">Receive invoice PDFs via email</p>
                  </div>
                  <Switch checked={emailInvoices} onCheckedChange={setEmailInvoices} />
                </div>
                <Separator className="opacity-50" />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-medium text-primary">Usage alerts</Label>
                    <p className="text-[10px] text-muted-foreground">Notify when usage exceeds 80%</p>
                  </div>
                  <Switch checked={usageAlerts} onCheckedChange={setUsageAlerts} />
                </div>
                <Separator className="opacity-50" />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-medium text-primary">Crypto payments</Label>
                    <p className="text-[10px] text-muted-foreground">Enable stablecoin / crypto settlements</p>
                  </div>
                  <Switch checked={cryptoPayments} onCheckedChange={setCryptoPayments} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Plan Change Confirmation Dialog */}
      <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary">Confirm Plan Change</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <AlertTriangle className="size-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs font-medium text-primary">
                  Changing from {currentPlanData?.name} to {PLANS.find((p) => p.id === targetPlan)?.name}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {PLANS.find((p) => p.id === targetPlan)?.priceValue > (currentPlanData?.priceValue ?? 0)
                    ? 'Prorated upgrade charges will apply immediately.'
                    : 'Downgrade takes effect at the end of the current billing period.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={confirmPlanChange} className="flex-1 text-xs gap-1">
                <CheckCircle className="size-3" /> Confirm Change
              </Button>
              <Button
                variant="outline"
                onClick={() => setUpgradeDialogOpen(false)}
                className="flex-1 text-xs"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
