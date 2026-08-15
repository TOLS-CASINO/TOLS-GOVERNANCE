'use client'

import { useState, useMemo } from 'react'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'
import {
  Wallet, CreditCard, Lock, Gift,
  RefreshCw, Search, Star, Coins,
  TrendingUp, DollarSign, Bitcoin,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useApi } from '@/hooks/use-api'
import { api } from '@/services/api'
import type { WalletsData } from '@/types/wallet'

/* ─── Currency helpers ─── */
const CURRENCY_EMOJI: Record<string, string> = {
  USD: '💵', EUR: '💶', GBP: '💷', BTC: '₿', ETH: '⟠', USDT: '₮', USDC: '◎', LTC: 'Ł',
}

const CRYPTO_CURRENCIES = ['BTC', 'ETH', 'LTC']

function fmtCurrency(amount: number, currency: string): string {
  if (CRYPTO_CURRENCIES.includes(currency)) {
    return `${CURRENCY_EMOJI[currency] ?? ''} ${amount.toFixed(8)}`
  }
  const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', USDT: '₮', USDC: '◎' }
  const sym = symbols[currency] ?? currency
  return `${sym}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtUsd(amount: number): string {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtDate(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

/* ─── Status badge ─── */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    frozen: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    closed: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
  }
  return (
    <Badge variant="outline" className={`text-[10px] ${map[status] ?? 'bg-muted text-muted-foreground'}`}>
      {status}
    </Badge>
  )
}

/* ─── Transaction type badge ─── */
function TxTypeBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    deposit: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    withdrawal: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    bet: 'bg-red-500/15 text-red-400 border-red-500/30',
    win: 'bg-green-500/15 text-green-400 border-green-500/30',
    bonus: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    cashback: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    transfer: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    fee: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
    exchange: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  }
  return (
    <Badge variant="outline" className={`text-[10px] ${map[type] ?? ''}`}>
      {type}
    </Badge>
  )
}

/* ─── Payment type icon ─── */
function PaymentTypeIcon({ type }: { type: string }) {
  const map: Record<string, string> = {
    Visa: '💳', Mastercard: '💳', Bank: '🏦', Crypto: '₿', 'E-Wallet': '📱', Prepaid: '🎫',
  }
  const emoji = map[type]
  if (emoji) return <span className="text-xl">{emoji}</span>
  return <Coins className="size-5 text-muted-foreground" />
}

/* ─── Provider badge color ─── */
function ProviderBadge({ provider }: { provider: string }) {
  const colors: Record<string, string> = {
    Visa: 'bg-blue-600/20 text-blue-300 border-blue-500/30',
    Mastercard: 'bg-orange-600/20 text-orange-300 border-orange-500/30',
    HSBC: 'bg-red-600/20 text-red-300 border-red-500/30',
    MUFG: 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30',
    Coinbase: 'bg-blue-600/20 text-blue-300 border-blue-500/30',
    Binance: 'bg-yellow-600/20 text-yellow-300 border-yellow-500/30',
    MetaMask: 'bg-orange-600/20 text-orange-300 border-orange-500/30',
    Skrill: 'bg-purple-600/20 text-purple-300 border-purple-500/30',
    PayPal: 'bg-blue-600/20 text-blue-300 border-blue-500/30',
    Paysafecard: 'bg-emerald-600/20 text-emerald-300 border-emerald-500/30',
  }
  return (
    <Badge variant="outline" className={`text-[9px] ${colors[provider] ?? 'bg-muted text-muted-foreground'}`}>
      {provider}
    </Badge>
  )
}

/* ─── PIE CHART COLORS ─── */
const PIE_COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#84cc16']

/* ═══════════════════════════════════════════════════
   OVERVIEW TAB
   ═══════════════════════════════════════════════════ */
function OverviewTab({
  totals, currencyEntries, totalBalanceAll, pieData, barData,
}: {
  totals: NonNullable<WalletsData['totals']>
  currencyEntries: [string, { balance: number; count: number }][]
  totalBalanceAll: number
  pieData: { name: string; value: number; emoji: string }[]
  barData: { currency: string; balance: number }[]
}) {
  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">Total Balance</span>
              <Wallet className="size-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-amber-400">{fmtUsd(totals.totalBalance)}</p>
            <p className="text-[10px] text-muted-foreground mt-1">All currencies in USD equiv.</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">Available</span>
              <DollarSign className="size-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-emerald-400">{fmtUsd(totals.totalAvailable)}</p>
            <p className="text-[10px] text-muted-foreground mt-1">Ready for play/withdrawal</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">Locked</span>
              <Lock className="size-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-blue-400">{fmtUsd(totals.totalLocked)}</p>
            <p className="text-[10px] text-muted-foreground mt-1">In active wagers</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">Bonus Funds</span>
              <Gift className="size-4 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-purple-400">{fmtUsd(totals.totalBonus)}</p>
            <p className="text-[10px] text-muted-foreground mt-1">Subject to wagering req.</p>
          </CardContent>
        </Card>
      </div>

      {/* Currency breakdown cards */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-amber-400/90">Currency Breakdown</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {currencyEntries.map(([currency, info]) => {
            const pct = totalBalanceAll > 0 ? ((info.balance / totalBalanceAll) * 100) : 0
            return (
              <Card key={currency} className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{CURRENCY_EMOJI[currency] ?? currency}</span>
                    <span className="text-sm font-bold">{currency}</span>
                    <Badge variant="outline" className="text-[9px] ml-auto border-amber-500/30 text-amber-400">
                      {info.count} wallet{info.count !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <p className="text-lg font-bold">
                    {CRYPTO_CURRENCIES.includes(currency)
                      ? info.balance.toFixed(8)
                      : `$${info.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-amber-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{pct.toFixed(1)}%</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Distribution by Currency</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, emoji, percent }: { name: string; emoji: string; percent: number }) => `${emoji} ${name} ${(percent * 100).toFixed(1)}%`}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [fmtUsd(value), name]}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Wallet Balances by Currency</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="currency" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  formatter={(value: number) => [fmtUsd(value), 'Balance']}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend />
                <Bar dataKey="balance" name="Balance" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   ALL WALLETS TAB
   ═══════════════════════════════════════════════════ */
function AllWalletsTab({
  filteredWallets, allCurrencies, allStatuses,
  walletCurrencyFilter, setWalletCurrencyFilter,
  walletStatusFilter, setWalletStatusFilter,
  walletSearch, setWalletSearch,
  walletSort, setWalletSort,
}: {
  filteredWallets: WalletsData['wallets']
  allCurrencies: string[]
  allStatuses: string[]
  walletCurrencyFilter: string
  setWalletCurrencyFilter: (v: string) => void
  walletStatusFilter: string
  setWalletStatusFilter: (v: string) => void
  walletSearch: string
  setWalletSearch: (v: string) => void
  walletSort: 'balance-desc' | 'balance-asc'
  setWalletSort: (v: 'balance-desc' | 'balance-asc') => void
}) {
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search player..."
            value={walletSearch}
            onChange={e => setWalletSearch(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
        <Select value={walletCurrencyFilter} onValueChange={setWalletCurrencyFilter}>
          <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Currency" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Currencies</SelectItem>
            {allCurrencies.map(c => <SelectItem key={c} value={c}>{CURRENCY_EMOJI[c]} {c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={walletStatusFilter} onValueChange={setWalletStatusFilter}>
          <SelectTrigger className="w-[110px] h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {allStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={walletSort} onValueChange={v => setWalletSort(v as 'balance-desc' | 'balance-asc')}>
          <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="Sort" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="balance-desc">Balance ↓</SelectItem>
            <SelectItem value="balance-asc">Balance ↑</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-400">
          {filteredWallets.length} wallets
        </Badge>
      </div>

      {/* Table */}
      <Card className="bg-card border-border">
        <ScrollArea className="max-h-[520px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[10px]">Player</TableHead>
                <TableHead className="text-[10px]">Currency</TableHead>
                <TableHead className="text-[10px] text-right">Balance</TableHead>
                <TableHead className="text-[10px] text-right">Available</TableHead>
                <TableHead className="text-[10px] text-right">Locked</TableHead>
                <TableHead className="text-[10px] text-right">Bonus</TableHead>
                <TableHead className="text-[10px]">Status</TableHead>
                <TableHead className="text-[10px]">Last Activity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWallets.map(w => {
                const lastActivity = w.lastDepositAt || w.lastWithdrawAt
                return (
                  <TableRow key={w.id}>
                    <TableCell className="text-xs font-medium">
                      <span className="flex items-center gap-1">
                        {w.isPrimary && <Star className="size-3 text-amber-400 fill-amber-400" />}
                        {w.playerName}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs">
                      <span className="flex items-center gap-1">
                        <span>{CURRENCY_EMOJI[w.currency]}</span>
                        <span>{w.currency}</span>
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-right font-mono">{fmtCurrency(w.balance, w.currency)}</TableCell>
                    <TableCell className="text-xs text-right font-mono text-emerald-400">{fmtCurrency(w.availableBalance, w.currency)}</TableCell>
                    <TableCell className="text-xs text-right font-mono text-blue-400">{fmtCurrency(w.lockedBalance, w.currency)}</TableCell>
                    <TableCell className="text-xs text-right font-mono text-purple-400">{fmtCurrency(w.bonusBalance, w.currency)}</TableCell>
                    <TableCell><StatusBadge status={w.status} /></TableCell>
                    <TableCell className="text-[10px] text-muted-foreground">{fmtDate(lastActivity)}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   TRANSACTIONS TAB
   ═══════════════════════════════════════════════════ */
function TransactionsTab({
  filteredTransactions, allTxTypes, allTxCurrencies,
  txTypeFilter, setTxTypeFilter, txCurrencyFilter, setTxCurrencyFilter,
  walletMap,
}: {
  filteredTransactions: WalletsData['transactions']
  allTxTypes: string[]
  allTxCurrencies: string[]
  txTypeFilter: string
  setTxTypeFilter: (v: string) => void
  txCurrencyFilter: string
  setTxCurrencyFilter: (v: string) => void
  walletMap: Map<string, WalletsData['wallets'][number]>
}) {
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={txTypeFilter} onValueChange={setTxTypeFilter}>
          <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {allTxTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={txCurrencyFilter} onValueChange={setTxCurrencyFilter}>
          <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Currency" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Currencies</SelectItem>
            {allTxCurrencies.map(c => <SelectItem key={c} value={c}>{CURRENCY_EMOJI[c]} {c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-400">
          {filteredTransactions.length} transactions
        </Badge>
      </div>

      {/* Table */}
      <Card className="bg-card border-border">
        <ScrollArea className="max-h-[520px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[10px]">Time</TableHead>
                <TableHead className="text-[10px]">Player</TableHead>
                <TableHead className="text-[10px]">Type</TableHead>
                <TableHead className="text-[10px] text-right">Amount</TableHead>
                <TableHead className="text-[10px]">Currency</TableHead>
                <TableHead className="text-[10px]">Before → After</TableHead>
                <TableHead className="text-[10px]">Game</TableHead>
                <TableHead className="text-[10px]">Status</TableHead>
                <TableHead className="text-[10px]">Ref</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map(tx => {
                const wallet = walletMap.get(tx.walletId)
                const isPositive = tx.amount >= 0
                return (
                  <TableRow key={tx.id}>
                    <TableCell className="text-[10px] text-muted-foreground whitespace-nowrap">{fmtDate(tx.createdAt)}</TableCell>
                    <TableCell className="text-xs font-medium">{wallet?.playerName ?? '—'}</TableCell>
                    <TableCell><TxTypeBadge type={tx.type} /></TableCell>
                    <TableCell className={`text-xs text-right font-mono ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isPositive ? '+' : ''}{fmtCurrency(tx.amount, tx.currency)}
                    </TableCell>
                    <TableCell className="text-xs">
                      <span className="flex items-center gap-1">
                        <span>{CURRENCY_EMOJI[tx.currency]}</span>
                        <span>{tx.currency}</span>
                      </span>
                    </TableCell>
                    <TableCell className="text-[10px] font-mono whitespace-nowrap">
                      <span className="text-muted-foreground">
                        {CRYPTO_CURRENCIES.includes(tx.currency) ? tx.balanceBefore.toFixed(6) : tx.balanceBefore.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-amber-400 mx-1">→</span>
                      <span className="text-foreground">
                        {CRYPTO_CURRENCIES.includes(tx.currency) ? tx.balanceAfter.toFixed(6) : tx.balanceAfter.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </TableCell>
                    <TableCell className="text-[10px] text-muted-foreground">{tx.gameName || '—'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[9px] ${tx.status === 'completed' ? 'border-emerald-500/30 text-emerald-400' : tx.status === 'pending' ? 'border-yellow-500/30 text-yellow-400' : 'border-muted text-muted-foreground'}`}>
                        {tx.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[10px] text-muted-foreground font-mono">{tx.reference}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   PAYMENT METHODS TAB
   ═══════════════════════════════════════════════════ */
function PaymentMethodsTab({
  paymentMethods, currencyRates, toggledMethods, toggleMethod,
}: {
  paymentMethods: WalletsData['paymentMethods']
  currencyRates: WalletsData['currencyRates']
  toggledMethods: Set<string>
  toggleMethod: (id: string) => void
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {paymentMethods.map(pm => {
          const isToggled = toggledMethods.has(pm.id)
          const isActive = isToggled ? !pm.isActive : pm.isActive
          return (
            <Card key={pm.id} className={`bg-card border-border ${!isActive ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <PaymentTypeIcon type={pm.type} />
                    <div>
                      <p className="text-xs font-semibold">{pm.label}</p>
                      <p className="text-[10px] text-muted-foreground">{pm.playerName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {pm.isDefault && (
                      <Badge className="text-[9px] bg-amber-500/20 text-amber-400 border-amber-500/30">Default</Badge>
                    )}
                    <Badge className={`text-[9px] ${isActive ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                      {isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <ProviderBadge provider={pm.provider} />
                    <span className="text-[10px] flex items-center gap-1">
                      <span>{CURRENCY_EMOJI[pm.currency]}</span>
                      <span className="text-muted-foreground">{pm.currency}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground font-mono">{pm.identifier}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[10px] gap-1"
                      onClick={() => toggleMethod(pm.id)}
                    >
                      <RefreshCw className="size-3" />
                      Toggle
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Currency Rates */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="size-4 text-amber-500" />
            Currency Exchange Rates
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <ScrollArea className="max-h-64">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px]">From</TableHead>
                  <TableHead className="text-[10px]">To</TableHead>
                  <TableHead className="text-[10px] text-right">Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currencyRates.map((cr, i) => (
                  <TableRow key={`${cr.from}-${cr.to}-${i}`}>
                    <TableCell className="text-xs">
                      <span className="flex items-center gap-1">
                        <span>{CURRENCY_EMOJI[cr.from]}</span>
                        <span className="font-medium">{cr.from}</span>
                      </span>
                    </TableCell>
                    <TableCell className="text-xs">
                      <span className="flex items-center gap-1">
                        <span>{CURRENCY_EMOJI[cr.to]}</span>
                        <span className="font-medium">{cr.to}</span>
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-right font-mono text-amber-400">
                      {cr.rate < 0.01 ? cr.rate.toFixed(8) : cr.rate < 1 ? cr.rate.toFixed(6) : cr.rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════ */
export function WalletsView() {
  const { data, loading, error, refetch } = useApi(() => api.wallets.get())

  /* All hooks at top level */
  const [walletCurrencyFilter, setWalletCurrencyFilter] = useState('all')
  const [walletStatusFilter, setWalletStatusFilter] = useState('all')
  const [walletSearch, setWalletSearch] = useState('')
  const [walletSort, setWalletSort] = useState<'balance-desc' | 'balance-asc'>('balance-desc')

  const [txTypeFilter, setTxTypeFilter] = useState('all')
  const [txCurrencyFilter, setTxCurrencyFilter] = useState('all')

  const [toggledMethods, setToggledMethods] = useState<Set<string>>(new Set())

  const toggleMethod = (id: string) => {
    setToggledMethods(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const wallets = data?.wallets ?? []
  const transactions = data?.transactions ?? []
  const currencyRates = data?.currencyRates ?? []
  const totals = data?.totals
  const paymentMethods = data?.paymentMethods ?? []

  /* ── Filtered wallets ── */
  const filteredWallets = useMemo(() => {
    let result = [...wallets]
    if (walletCurrencyFilter !== 'all') result = result.filter(w => w.currency === walletCurrencyFilter)
    if (walletStatusFilter !== 'all') result = result.filter(w => w.status === walletStatusFilter)
    if (walletSearch) {
      const q = walletSearch.toLowerCase()
      result = result.filter(w => w.playerName.toLowerCase().includes(q))
    }
    result.sort((a, b) => walletSort === 'balance-desc' ? b.balance - a.balance : a.balance - b.balance)
    return result
  }, [wallets, walletCurrencyFilter, walletStatusFilter, walletSearch, walletSort])

  /* ── Filtered transactions ── */
  const filteredTransactions = useMemo(() => {
    let result = [...transactions]
    if (txTypeFilter !== 'all') result = result.filter(t => t.type === txTypeFilter)
    if (txCurrencyFilter !== 'all') result = result.filter(t => t.currency !== txCurrencyFilter)
    return result
  }, [transactions, txTypeFilter, txCurrencyFilter])

  /* ── Unique values for filters ── */
  const allCurrencies = useMemo(() => [...new Set(wallets.map(w => w.currency))].sort(), [wallets])
  const allStatuses = useMemo(() => [...new Set(wallets.map(w => w.status))].sort(), [wallets])
  const allTxTypes = useMemo(() => [...new Set(transactions.map(t => t.type))].sort(), [transactions])
  const allTxCurrencies = useMemo(() => [...new Set(transactions.map(t => t.currency))].sort(), [transactions])

  /* ── Wallet lookup ── */
  const walletMap = useMemo(() => new Map(wallets.map(w => [w.id, w])), [wallets])

  /* ── Currency breakdown ── */
  const { pieData, barData, currencyEntries, totalBalanceAll } = useMemo(() => {
    if (!totals) return { pieData: [] as { name: string; value: number; emoji: string }[], barData: [] as { currency: string; balance: number }[], currencyEntries: [] as [string, { balance: number; count: number }][], totalBalanceAll: 0 }
    const entries = Object.entries(totals.byCurrency) as [string, { balance: number; count: number }][]
    const totalBal = entries.reduce((sum, [, v]) => sum + v.balance, 0)
    const pie = entries.map(([currency, info]) => ({
      name: currency,
      value: Number(info.balance.toFixed(2)),
      emoji: CURRENCY_EMOJI[currency] ?? currency,
    }))
    const bar = entries.map(([currency, info]) => ({
      currency: `${CURRENCY_EMOJI[currency] ?? ''} ${currency}`,
      balance: Number(info.balance.toFixed(2)),
    }))
    return { pieData: pie, barData: bar, currencyEntries: entries, totalBalanceAll: totalBal }
  }, [totals])

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
          ))}
        </div>
      </div>
    )
  }

  /* ── Error ── */
  if (error) {
    return (
      <Card className="border-destructive/40">
        <CardContent className="p-6 text-center">
          <Lock className="size-8 text-destructive mx-auto mb-2" />
          <p className="text-sm font-medium text-destructive">Failed to load wallet data</p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
          <Button variant="outline" size="sm" className="mt-3 gap-1" onClick={refetch}>
            <RefreshCw className="size-3" /> Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!data || !totals) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="size-5 text-amber-500" />
          <h2 className="text-lg font-bold">Wallet Ecosystem</h2>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={refetch}>
          <RefreshCw className="size-3" /> Refresh
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="h-8 bg-muted/50">
          <TabsTrigger value="overview" className="text-xs data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            Overview
          </TabsTrigger>
          <TabsTrigger value="wallets" className="text-xs data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            All Wallets
          </TabsTrigger>
          <TabsTrigger value="transactions" className="text-xs data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            Transactions
          </TabsTrigger>
          <TabsTrigger value="payments" className="text-xs data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            Payment Methods
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <OverviewTab
            totals={totals}
            currencyEntries={currencyEntries}
            totalBalanceAll={totalBalanceAll}
            pieData={pieData}
            barData={barData}
          />
        </TabsContent>
        <TabsContent value="wallets" className="mt-4">
          <AllWalletsTab
            filteredWallets={filteredWallets}
            allCurrencies={allCurrencies}
            allStatuses={allStatuses}
            walletCurrencyFilter={walletCurrencyFilter}
            setWalletCurrencyFilter={setWalletCurrencyFilter}
            walletStatusFilter={walletStatusFilter}
            setWalletStatusFilter={setWalletStatusFilter}
            walletSearch={walletSearch}
            setWalletSearch={setWalletSearch}
            walletSort={walletSort}
            setWalletSort={setWalletSort}
          />
        </TabsContent>
        <TabsContent value="transactions" className="mt-4">
          <TransactionsTab
            filteredTransactions={filteredTransactions}
            allTxTypes={allTxTypes}
            allTxCurrencies={allTxCurrencies}
            txTypeFilter={txTypeFilter}
            setTxTypeFilter={setTxTypeFilter}
            txCurrencyFilter={txCurrencyFilter}
            setTxCurrencyFilter={setTxCurrencyFilter}
            walletMap={walletMap}
          />
        </TabsContent>
        <TabsContent value="payments" className="mt-4">
          <PaymentMethodsTab
            paymentMethods={paymentMethods}
            currencyRates={currencyRates}
            toggledMethods={toggledMethods}
            toggleMethod={toggleMethod}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
