'use client'

import { useState, useMemo } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip as ReTooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'
import {
  Key, Webhook, Plug, Bot, Copy, RefreshCw, Plus, Trash2,
  Shield, Activity, Clock, CheckCircle, XCircle, AlertCircle,
  ExternalLink, Code, Zap, Globe, Link2, Settings, Eye, EyeOff,
  Search,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip'
import { useApi } from '@/hooks/use-api'
import { api } from '@/services/api'

/* ─── Types ─── */

interface ApiToken {
  id: string; name: string; tokenPrefix: string; ownerId: string
  scopes: string[]; rateLimit: number; isActive: boolean
  lastUsedAt: string; expiresAt: string; createdAt: string
  usageCount: number; last24hCalls: number
}

interface WebhookItem {
  id: string; name: string; url: string; events: string[]
  isActive: boolean; retryCount: number; timeoutMs: number
  lastTriggerAt: string; successRate: number; totalDeliveries: number
  apiTokenName: string; createdAt: string
}

interface WebhookDelivery {
  id: string; webhookName: string; eventId: string
  statusCode: number; duration: number; success: boolean
  attempt: number; createdAt: string
}

interface Integration {
  id: string; name: string; type: string; status: string
  lastSyncAt: string; recordsSynced: number; errors: number
  logo: string; createdAt: string
}

interface McpEndpoint {
  id: string; name: string; description: string; version: string
  baseUrl: string; tools: Array<{ name: string; description: string }>
  isActive: boolean; requiresAuth: boolean; createdAt: string
}

interface ApiHubData {
  tokens: ApiToken[]
  webhooks: WebhookItem[]
  webhookDeliveries: WebhookDelivery[]
  integrations: Integration[]
  mcpEndpoints: McpEndpoint[]
  stats: {
    totalTokens: number; activeTokens: number; totalWebhooks: number
    totalDeliveries: number; deliverySuccessRate: number
    totalIntegrations: number; activeIntegrations: number
    totalApiCalls24h: number; avgLatencyMs: number
  }
  usageData: Array<{ hour: string; calls: number }>
}

/* ─── Helpers ─── */

function timeAgo(iso: string): string {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function fmtDate(iso: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function fmtNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}

function maskToken(prefix: string): string {
  return `${prefix}...****`
}

function generateFakeToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let token = 'tols_'
  for (let i = 0; i < 28; i++) token += chars[Math.floor(Math.random() * chars.length)]
  return token
}

/* ─── Scope Badge Colors ─── */

function ScopeBadge({ scope }: { scope: string }) {
  const colorMap: Record<string, string> = {
    'players:read': 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    'players:write': 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    'wallets:read': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    'wallets:write': 'bg-green-500/15 text-green-400 border-green-500/30',
    'financial:read': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    'financial:write': 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    'admin': 'bg-red-500/15 text-red-400 border-red-500/30',
  }
  return (
    <Badge variant="outline" className={`text-[9px] font-mono ${colorMap[scope] ?? 'bg-muted text-muted-foreground'}`}>
      {scope}
    </Badge>
  )
}

/* ─── Event Badge Colors ─── */

function EventBadge({ event }: { event: string }) {
  const colorMap: Record<string, string> = {
    'deposit.confirmed': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    'withdrawal.completed': 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    'withdrawal.failed': 'bg-red-500/15 text-red-400 border-red-500/30',
    'player.login': 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    'player.logout': 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    'jackpot.won': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    'variance.alert': 'bg-red-500/15 text-red-400 border-red-500/30',
  }
  return (
    <Badge variant="outline" className={`text-[9px] ${colorMap[event] ?? 'bg-muted text-muted-foreground'}`}>
      {event}
    </Badge>
  )
}

/* ─── Integration Status Dot ─── */

function StatusDot({ status }: { status: string }) {
  const map: Record<string, { color: string; pulse: boolean }> = {
    connected: { color: 'bg-emerald-500', pulse: false },
    syncing: { color: 'bg-blue-500', pulse: true },
    error: { color: 'bg-red-500', pulse: false },
    disconnected: { color: 'bg-gray-500', pulse: false },
    pending: { color: 'bg-yellow-500', pulse: true },
  }
  const cfg = map[status] ?? { color: 'bg-gray-500', pulse: false }
  return (
    <span className={`size-2.5 rounded-full ${cfg.color} ${cfg.pulse ? 'animate-pulse' : ''}`} />
  )
}

/* ─── Integration Type Badge ─── */

function IntegrationTypeBadge({ type }: { type: string }) {
  const map: Record<string, { label: string; className: string }> = {
    casino_slots: { label: 'Casino Slots', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    casino_poker: { label: 'Casino Poker', className: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
    sports_betting: { label: 'Sports Betting', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    lottery: { label: 'Lottery', className: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' },
    payment_gateway: { label: 'Payment', className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
    affiliate: { label: 'Affiliate', className: 'bg-pink-500/15 text-pink-400 border-pink-500/30' },
    compliance: { label: 'Compliance', className: 'bg-sky-500/15 text-sky-400 border-sky-500/30' },
    custom: { label: 'Custom', className: 'bg-gray-500/15 text-gray-400 border-gray-500/30' },
  }
  const cfg = map[type] ?? { label: type, className: 'bg-muted text-muted-foreground' }
  return (
    <Badge variant="outline" className={`text-[9px] ${cfg.className}`}>{cfg.label}</Badge>
  )
}

/* ─── Success Rate Bar ─── */

function SuccessRateBar({ rate }: { rate: number }) {
  const color = rate >= 99 ? 'bg-emerald-500' : rate >= 95 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden min-w-[60px]">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${rate}%` }} />
      </div>
      <span className={`text-[10px] font-mono ${rate >= 99 ? 'text-emerald-400' : rate >= 95 ? 'text-amber-400' : 'text-red-400'}`}>
        {rate.toFixed(1)}%
      </span>
    </div>
  )
}

/* ─── Main Component ─── */

export function ApiHubView() {
  const { data, loading, error, refetch } = useApi(() => api.apiHub.get())

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorState error={error} onRetry={refetch} />
  if (!data) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="size-5 text-primary" />
          <h2 className="text-lg font-bold">API Hub</h2>
          <Badge variant="outline" className="text-[9px] border-primary/30 text-primary">SaaS</Badge>
        </div>
        <Button variant="outline" size="sm" onClick={refetch} className="gap-1.5">
          <RefreshCw className="size-3.5" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-9">
          <TabsTrigger value="overview" className="text-xs gap-1">
            <Activity className="size-3" /> Overview
          </TabsTrigger>
          <TabsTrigger value="tokens" className="text-xs gap-1">
            <Key className="size-3" /> Tokens
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="text-xs gap-1">
            <Webhook className="size-3" /> Webhooks
          </TabsTrigger>
          <TabsTrigger value="integrations" className="text-xs gap-1">
            <Plug className="size-3" /> Integrations
          </TabsTrigger>
          <TabsTrigger value="mcp" className="text-xs gap-1">
            <Bot className="size-3" /> MCP
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab data={data} />
        </TabsContent>
        <TabsContent value="tokens">
          <TokensTab tokens={data.tokens} />
        </TabsContent>
        <TabsContent value="webhooks">
          <WebhooksTab webhooks={data.webhooks} deliveries={data.webhookDeliveries} />
        </TabsContent>
        <TabsContent value="integrations">
          <IntegrationsTab integrations={data.integrations} />
        </TabsContent>
        <TabsContent value="mcp">
          <McpTab endpoints={data.mcpEndpoints} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

/* ─── Tab 1: Overview ─── */

function OverviewTab({ data }: { data: ApiHubData }) {
  const kpis = [
    { label: 'Active API Tokens', value: data.stats.activeTokens, icon: Key, color: 'text-primary' },
    { label: 'Total Webhooks', value: data.stats.totalWebhooks, icon: Webhook, color: 'text-blue-400' },
    { label: 'Integrations Connected', value: data.stats.activeIntegrations, icon: Plug, color: 'text-emerald-400' },
    { label: 'API Calls (24h)', value: fmtNumber(data.stats.totalApiCalls24h), icon: Activity, color: 'text-amber-400' },
    { label: 'Avg Latency', value: `${data.stats.avgLatencyMs}ms`, icon: Clock, color: 'text-cyan-400' },
    { label: 'Delivery Success', value: `${data.stats.deliverySuccessRate}%`, icon: CheckCircle, color: 'text-emerald-400' },
  ]

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="bg-card/50">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <kpi.icon className={`size-4 ${kpi.color}`} />
                <span className="text-[10px] text-muted-foreground truncate">{kpi.label}</span>
              </div>
              <p className="text-xl font-bold">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* API Usage Chart */}
      <Card className="bg-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">API Usage (Last 24h)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.usageData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="usageGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d4a017" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#d4a017" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#888' }} />
                <YAxis tick={{ fontSize: 10, fill: '#888' }} />
                <ReTooltip
                  contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(212,160,23,0.3)', borderRadius: 6, fontSize: 11 }}
                  labelStyle={{ color: '#d4a017' }}
                />
                <Area type="monotone" dataKey="calls" stroke="#d4a017" fill="url(#usageGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Integration Status Grid */}
      <Card className="bg-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Integration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {data.integrations.map((intg) => (
              <div key={intg.id} className="flex items-center gap-2 p-2.5 rounded-lg border border-border/50 bg-muted/20">
                <StatusDot status={intg.status} />
                <span className="text-lg">{intg.logo}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate">{intg.name}</p>
                  <p className="text-[9px] text-muted-foreground capitalize">{intg.status}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* ─── Tab 2: API Tokens ─── */

function TokensTab({ tokens }: { tokens: ApiToken[] }) {
  const [tokenList, setTokenList] = useState(tokens)
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [showRevokeDialog, setShowRevokeDialog] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [newTokenName, setNewTokenName] = useState('')
  const [newTokenScopes, setNewTokenScopes] = useState<string[]>([])
  const [newTokenRateLimit, setNewTokenRateLimit] = useState('1000')
  const [generatedToken, setGeneratedToken] = useState<string | null>(null)

  const scopeGroups = [
    { module: 'Players', scopes: ['players:read', 'players:write'] },
    { module: 'Wallets', scopes: ['wallets:read', 'wallets:write'] },
    { module: 'Financial', scopes: ['financial:read', 'financial:write'] },
    { module: 'Admin', scopes: ['admin'] },
  ]

  const allScopes = scopeGroups.flatMap(g => g.scopes)

  const filteredTokens = useMemo(() => {
    if (!searchQuery) return tokenList
    const q = searchQuery.toLowerCase()
    return tokenList.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.tokenPrefix.toLowerCase().includes(q) ||
      t.scopes.some(s => s.toLowerCase().includes(q))
    )
  }, [tokenList, searchQuery])

  function handleToggleActive(id: string) {
    setTokenList(prev => prev.map(t => t.id === id ? { ...t, isActive: !t.isActive } : t))
  }

  function handleCopyToken(id: string, prefix: string) {
    navigator.clipboard.writeText(`${prefix}_masked_full_token`).catch(() => {})
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  function handleRevokeToken(id: string) {
    setTokenList(prev => prev.filter(t => t.id !== id))
    setShowRevokeDialog(null)
  }

  function handleGenerateToken() {
    const token = generateFakeToken()
    setGeneratedToken(token)
  }

  function handleCopyGenerated() {
    if (generatedToken) {
      navigator.clipboard.writeText(generatedToken).catch(() => {})
    }
  }

  function handleAddToken() {
    if (!newTokenName || newTokenScopes.length === 0) return
    const prefix = `tols_${Math.random().toString(36).substring(2, 6)}`
    const newToken: ApiToken = {
      id: `tok_${Date.now()}`,
      name: newTokenName,
      tokenPrefix: prefix,
      ownerId: 'owner_1',
      scopes: newTokenScopes,
      rateLimit: parseInt(newTokenRateLimit) || 1000,
      isActive: true,
      lastUsedAt: '',
      expiresAt: new Date(Date.now() + 365 * 86400000).toISOString(),
      createdAt: new Date().toISOString(),
      usageCount: 0,
      last24hCalls: 0,
    }
    setTokenList(prev => [newToken, ...prev])
    resetNewDialog()
  }

  function resetNewDialog() {
    setShowNewDialog(false)
    setNewTokenName('')
    setNewTokenScopes([])
    setNewTokenRateLimit('1000')
    setGeneratedToken(null)
  }

  function toggleScope(scope: string) {
    setNewTokenScopes(prev =>
      prev.includes(scope) ? prev.filter(s => s !== scope) : [...prev, scope]
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="relative flex-1 max-w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search tokens..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
          <Badge variant="secondary" className="text-[10px]">{tokenList.length} tokens</Badge>
        </div>

        <Dialog open={showNewDialog} onOpenChange={(open) => { if (!open) resetNewDialog(); setShowNewDialog(open) }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="size-3.5" />
              Generate New Token
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="size-4 text-primary" />
                Generate New API Token
              </DialogTitle>
              <DialogDescription>Create a new API token with specific scopes and rate limits.</DialogDescription>
            </DialogHeader>

            {!generatedToken ? (
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Token Name</Label>
                  <Input
                    placeholder="e.g. Production API Key"
                    value={newTokenName}
                    onChange={e => setNewTokenName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Scopes</Label>
                  <div className="space-y-3">
                    {scopeGroups.map(group => (
                      <div key={group.module}>
                        <p className="text-[10px] text-muted-foreground mb-1 font-medium uppercase tracking-wider">{group.module}</p>
                        <div className="flex flex-wrap gap-3">
                          {group.scopes.map(scope => (
                            <div key={scope} className="flex items-center gap-1.5">
                              <Checkbox
                                id={`scope-${scope}`}
                                checked={newTokenScopes.includes(scope)}
                                onCheckedChange={() => toggleScope(scope)}
                              />
                              <Label htmlFor={`scope-${scope}`} className="text-xs cursor-pointer">
                                <ScopeBadge scope={scope} />
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Rate Limit (requests/min)</Label>
                  <Input
                    type="number"
                    value={newTokenRateLimit}
                    onChange={e => setNewTokenRateLimit(e.target.value)}
                  />
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowNewDialog(false)}>Cancel</Button>
                  <Button
                    onClick={handleGenerateToken}
                    disabled={!newTokenName || newTokenScopes.length === 0}
                    className="gap-1.5"
                  >
                    <Shield className="size-3.5" />
                    Generate Token
                  </Button>
                </DialogFooter>
              </div>
            ) : (
              <div className="space-y-4 py-2">
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <p className="text-[10px] text-emerald-400 mb-1 font-medium">⚠ Copy this token now. You won&apos;t be able to see it again.</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs font-mono text-emerald-300 break-all">{generatedToken}</code>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-7 shrink-0" onClick={handleCopyGenerated}>
                            <Copy className="size-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Copy token</p></TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setGeneratedToken(null) }}>Back</Button>
                  <Button onClick={handleAddToken} className="gap-1.5">
                    <CheckCircle className="size-3.5" />
                    Add Token
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Tokens Table */}
      <Card className="bg-card/50">
        <CardContent className="p-0">
          <ScrollArea className="max-h-[520px]">
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px]">Name</TableHead>
                  <TableHead className="text-[10px]">Token</TableHead>
                  <TableHead className="text-[10px]">Scopes</TableHead>
                  <TableHead className="text-[10px]">Rate Limit</TableHead>
                  <TableHead className="text-[10px]">Status</TableHead>
                  <TableHead className="text-[10px]">Last Used</TableHead>
                  <TableHead className="text-[10px]">Created</TableHead>
                  <TableHead className="text-[10px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTokens.map(token => (
                  <TableRow key={token.id}>
                    <TableCell className="text-xs font-medium">{token.name}</TableCell>
                    <TableCell>
                      <code className="text-[10px] font-mono text-muted-foreground truncate block max-w-[80px] sm:max-w-none">{maskToken(token.tokenPrefix)}</code>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {token.scopes.map(scope => (
                          <ScopeBadge key={scope} scope={scope} />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-mono">{token.rateLimit}/min</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={token.isActive}
                          onCheckedChange={() => handleToggleActive(token.id)}
                          className="scale-75"
                        />
                        <Badge
                          variant="outline"
                          className={`text-[9px] ${
                            token.isActive
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : 'bg-gray-500/15 text-gray-400 border-gray-500/30'
                          }`}
                        >
                          {token.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-[10px] text-muted-foreground">{timeAgo(token.lastUsedAt)}</TableCell>
                    <TableCell className="text-[10px] text-muted-foreground">{fmtDate(token.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 justify-end">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7"
                                onClick={() => handleCopyToken(token.id, token.tokenPrefix)}
                              >
                                <Copy className={`size-3 ${copiedId === token.id ? 'text-emerald-400' : ''}`} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>{copiedId === token.id ? 'Copied!' : 'Copy token'}</p></TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7 text-red-400 hover:text-red-300"
                                onClick={() => setShowRevokeDialog(token.id)}
                              >
                                <Trash2 className="size-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Revoke token</p></TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Revoke Confirmation Dialog */}
      <Dialog open={!!showRevokeDialog} onOpenChange={() => setShowRevokeDialog(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertCircle className="size-4" />
              Revoke API Token
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. Any applications using this token will immediately lose API access.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRevokeDialog(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => showRevokeDialog && handleRevokeToken(showRevokeDialog)}
              className="gap-1.5"
            >
              <Trash2 className="size-3.5" />
              Revoke Token
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ─── Tab 3: Webhooks ─── */

function WebhooksTab({ webhooks, deliveries }: { webhooks: WebhookItem[]; deliveries: WebhookDelivery[] }) {
  const [webhookList, setWebhookList] = useState(webhooks)
  const [expandedWebhook, setExpandedWebhook] = useState<string | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newName, setNewName] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [newEvents, setNewEvents] = useState<string[]>([])
  const [testingId, setTestingId] = useState<string | null>(null)

  const availableEvents = [
    'deposit.confirmed', 'withdrawal.completed', 'withdrawal.failed',
    'player.login', 'player.logout', 'jackpot.won', 'variance.alert',
  ]

  function toggleEvent(event: string) {
    setNewEvents(prev => prev.includes(event) ? prev.filter(e => e !== event) : [...prev, event])
  }

  function handleAddWebhook() {
    if (!newName || !newUrl || newEvents.length === 0) return
    const wh: WebhookItem = {
      id: `wh_${Date.now()}`,
      name: newName,
      url: newUrl,
      events: newEvents,
      isActive: true,
      retryCount: 3,
      timeoutMs: 5000,
      lastTriggerAt: '',
      successRate: 0,
      totalDeliveries: 0,
      apiTokenName: 'Production API Key',
      createdAt: new Date().toISOString(),
    }
    setWebhookList(prev => [wh, ...prev])
    setShowAddDialog(false)
    setNewName('')
    setNewUrl('')
    setNewEvents([])
  }

  function handleTestWebhook(id: string) {
    setTestingId(id)
    setTimeout(() => setTestingId(null), 2000)
  }

  function handleToggleActive(id: string) {
    setWebhookList(prev => prev.map(w => w.id === id ? { ...w, isActive: !w.isActive } : w))
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Badge variant="secondary" className="text-[10px]">{webhookList.length} webhooks</Badge>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="size-3.5" />
              Add Webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Webhook className="size-4 text-primary" />
                Add Webhook Endpoint
              </DialogTitle>
              <DialogDescription>Configure a new webhook to receive real-time event notifications.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Webhook Name</Label>
                <Input placeholder="e.g. Deposit Notifications" value={newName} onChange={e => setNewName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Endpoint URL</Label>
                <Input placeholder="https://api.example.com/webhooks" value={newUrl} onChange={e => setNewUrl(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Events</Label>
                <div className="flex flex-wrap gap-2">
                  {availableEvents.map(event => (
                    <div key={event} className="flex items-center gap-1.5">
                      <Checkbox
                        id={`evt-${event}`}
                        checked={newEvents.includes(event)}
                        onCheckedChange={() => toggleEvent(event)}
                      />
                      <Label htmlFor={`evt-${event}`} className="text-xs cursor-pointer">
                        <EventBadge event={event} />
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-2.5 rounded-md bg-muted/50 border border-border/50">
                <p className="text-[10px] text-muted-foreground mb-1">Signing Secret (auto-generated)</p>
                <code className="text-[10px] font-mono text-primary">whsec_{Math.random().toString(36).substring(2, 18)}...</code>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                <Button onClick={handleAddWebhook} disabled={!newName || !newUrl || newEvents.length === 0} className="gap-1.5">
                  <Webhook className="size-3.5" />
                  Add Webhook
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Webhooks Table */}
      <Card className="bg-card/50">
        <CardContent className="p-0">
          <ScrollArea className="max-h-[520px]">
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px]">Name</TableHead>
                  <TableHead className="text-[10px]">URL</TableHead>
                  <TableHead className="text-[10px]">Events</TableHead>
                  <TableHead className="text-[10px]">Success Rate</TableHead>
                  <TableHead className="text-[10px]">Last Trigger</TableHead>
                  <TableHead className="text-[10px]">Status</TableHead>
                  <TableHead className="text-[10px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {webhookList.map(wh => (
                  <>
                    <TableRow key={wh.id} className="cursor-pointer" onClick={() => setExpandedWebhook(expandedWebhook === wh.id ? null : wh.id)}>
                      <TableCell className="text-xs font-medium">{wh.name}</TableCell>
                      <TableCell>
                        <code className="text-[10px] font-mono text-muted-foreground max-w-[120px] sm:max-w-[200px] truncate block">{wh.url}</code>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {wh.events.map(evt => <EventBadge key={evt} event={evt} />)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <SuccessRateBar rate={wh.successRate} />
                      </TableCell>
                      <TableCell className="text-[10px] text-muted-foreground">{timeAgo(wh.lastTriggerAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch checked={wh.isActive} onCheckedChange={() => handleToggleActive(wh.id)} className="scale-75" />
                          <Badge
                            variant="outline"
                            className={`text-[9px] ${
                              wh.isActive
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                : 'bg-gray-500/15 text-gray-400 border-gray-500/30'
                            }`}
                          >
                            {wh.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-[10px] gap-1"
                            onClick={(e) => { e.stopPropagation(); handleTestWebhook(wh.id) }}
                            disabled={testingId === wh.id}
                          >
                            {testingId === wh.id ? (
                              <RefreshCw className="size-3 animate-spin" />
                            ) : (
                              <Zap className="size-3" />
                            )}
                            Test
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {/* Delivery Log Expansion */}
                    {expandedWebhook === wh.id && (
                      <TableRow key={`${wh.id}-deliveries`}>
                        <TableCell colSpan={7} className="bg-muted/20 p-3">
                          <div className="space-y-2">
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                              Recent Deliveries for {wh.name}
                            </p>
                            <div className="space-y-1">
                              {deliveries
                                .filter(d => d.webhookName === wh.name)
                                .map(del => (
                                  <div key={del.id} className="flex items-center gap-3 text-[10px]">
                                    <span className="text-muted-foreground">{timeAgo(del.createdAt)}</span>
                                    <Badge
                                      variant="outline"
                                      className={`text-[9px] h-4 ${
                                        del.success
                                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                          : 'bg-red-500/15 text-red-400 border-red-500/30'
                                      }`}
                                    >
                                      {del.statusCode}
                                    </Badge>
                                    <span className="text-muted-foreground">{del.duration}ms</span>
                                    {del.attempt > 1 && (
                                      <Badge variant="outline" className="text-[9px] h-4 bg-amber-500/15 text-amber-400 border-amber-500/30">
                                        attempt {del.attempt}
                                      </Badge>
                                    )}
                                    <code className="text-muted-foreground font-mono">{del.eventId}</code>
                                  </div>
                                ))}
                              {deliveries.filter(d => d.webhookName === wh.name).length === 0 && (
                                <p className="text-[10px] text-muted-foreground italic">No recent deliveries</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

/* ─── Tab 4: Integrations ─── */

function IntegrationsTab({ integrations }: { integrations: Integration[] }) {
  const [integrationList, setIntegrationList] = useState(integrations)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [syncingId, setSyncingId] = useState<string | null>(null)

  const platformOptions = [
    { name: 'MegaJackpot Slots', type: 'casino_slots', logo: '🎰' },
    { name: 'RoyalPoker Live', type: 'casino_poker', logo: '🃏' },
    { name: 'SportEdge Betting', type: 'sports_betting', logo: '⚽' },
    { name: 'LuckyDraw Lottery', type: 'lottery', logo: '🎲' },
    { name: 'Custom Integration', type: 'custom', logo: '🔧' },
  ]

  function handleSync(id: string) {
    setSyncingId(id)
    setTimeout(() => {
      setIntegrationList(prev => prev.map(i =>
        i.id === id ? { ...i, status: 'connected', lastSyncAt: new Date().toISOString(), errors: 0 } : i
      ))
      setSyncingId(null)
    }, 2000)
  }

  function handleAddPlatform(platform: typeof platformOptions[0]) {
    const newIntg: Integration = {
      id: `int_${Date.now()}`,
      name: platform.name,
      type: platform.type,
      status: 'pending',
      lastSyncAt: '',
      recordsSynced: 0,
      errors: 0,
      logo: platform.logo,
      createdAt: new Date().toISOString(),
    }
    setIntegrationList(prev => [newIntg, ...prev])
    setShowAddDialog(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="text-[10px]">{integrationList.length} integrations</Badge>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="size-3.5" />
              Add Integration
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plug className="size-4 text-primary" />
                Add Integration
              </DialogTitle>
              <DialogDescription>Select a platform to connect with your TOLS instance.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-2 py-2">
              {platformOptions.map(p => (
                <button
                  key={p.name}
                  onClick={() => handleAddPlatform(p)}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-muted/30 transition-colors text-left"
                >
                  <span className="text-xl">{p.logo}</span>
                  <div>
                    <p className="text-xs font-medium">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">{p.type.replace('_', ' ')}</p>
                  </div>
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrationList.map(intg => (
          <Card key={intg.id} className={`bg-card/50 ${intg.status === 'disconnected' ? 'opacity-60' : ''}`}>
            <CardContent className="p-3 sm:p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{intg.logo}</span>
                  <div>
                    <p className="text-sm font-medium">{intg.name}</p>
                    <IntegrationTypeBadge type={intg.type} />
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <StatusDot status={intg.status} />
                  <span className="text-[10px] text-muted-foreground capitalize">{intg.status}</span>
                </div>
              </div>

              <Separator className="opacity-50" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                <div>
                  <p className="text-muted-foreground">Last Sync</p>
                  <p className="font-medium">{timeAgo(intg.lastSyncAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Records Synced</p>
                  <p className="font-medium">{fmtNumber(intg.recordsSynced)}</p>
                </div>
                {intg.errors > 0 && (
                  <div className="col-span-2">
                    <Badge variant="outline" className="text-[9px] bg-red-500/15 text-red-400 border-red-500/30">
                      <AlertCircle className="size-2.5 mr-1" />
                      {intg.errors} errors
                    </Badge>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="flex-1 h-7 text-[10px] gap-1">
                  <Settings className="size-3" />
                  Configure
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-7 text-[10px] gap-1"
                  onClick={() => handleSync(intg.id)}
                  disabled={syncingId === intg.id || intg.status === 'disconnected'}
                >
                  {syncingId === intg.id ? (
                    <RefreshCw className="size-3 animate-spin" />
                  ) : (
                    <RefreshCw className="size-3" />
                  )}
                  Sync Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

/* ─── Tab 5: MCP Endpoints ─── */

function McpTab({ endpoints }: { endpoints: McpEndpoint[] }) {
  const [endpointList, setEndpointList] = useState(endpoints)
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set())
  const [viewSchemaId, setViewSchemaId] = useState<string | null>(null)

  function toggleTools(id: string) {
    setExpandedTools(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleToggleActive(id: string) {
    setEndpointList(prev => prev.map(e => e.id === id ? { ...e, isActive: !e.isActive } : e))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px]">{endpointList.length} endpoints</Badge>
          <Badge variant="outline" className="text-[9px] border-cyan-500/30 text-cyan-400">MCP Protocol</Badge>
        </div>
      </div>

      <div className="space-y-3">
        {endpointList.map(endpoint => (
          <Card key={endpoint.id} className={`bg-card/50 ${!endpoint.isActive ? 'opacity-60' : ''}`}>
            <CardContent className="p-3 sm:p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Bot className="size-4 text-primary shrink-0" />
                    <h3 className="text-sm font-semibold">{endpoint.name}</h3>
                    <Badge variant="outline" className="text-[9px] bg-primary/10 text-primary border-primary/30">
                      v{endpoint.version}
                    </Badge>
                    {endpoint.requiresAuth && (
                      <Badge variant="outline" className="text-[9px] bg-amber-500/15 text-amber-400 border-amber-500/30">
                        <Shield className="size-2.5 mr-0.5" />
                        Auth Required
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{endpoint.description}</p>
                  <div className="flex items-center gap-1.5">
                    <Code className="size-3 text-muted-foreground" />
                    <code className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded truncate block max-w-[200px] sm:max-w-none">
                      {endpoint.baseUrl}
                    </code>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Switch
                    checked={endpoint.isActive}
                    onCheckedChange={() => handleToggleActive(endpoint.id)}
                  />
                </div>
              </div>

              <Separator className="opacity-50" />

              {/* Tools Section */}
              <div>
                <button
                  onClick={() => toggleTools(endpoint.id)}
                  className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {expandedTools.has(endpoint.id) ? (
                    <EyeOff className="size-3" />
                  ) : (
                    <Eye className="size-3" />
                  )}
                  {endpoint.tools.length} Tools
                </button>

                {expandedTools.has(endpoint.id) && (
                  <div className="mt-2 space-y-1.5">
                    {endpoint.tools.map(tool => (
                      <div key={tool.name} className="flex items-start gap-2 p-2 rounded-md bg-muted/20 border border-border/30">
                        <Zap className="size-3 text-amber-400 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <code className="text-[10px] font-mono text-amber-400">{tool.name}</code>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{tool.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-[10px] gap-1"
                  onClick={() => setViewSchemaId(viewSchemaId === endpoint.id ? null : endpoint.id)}
                >
                  <Code className="size-3" />
                  View Schema
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1">
                  <ExternalLink className="size-3" />
                  OpenAPI Docs
                </Button>
              </div>

              {/* Schema Preview */}
              {viewSchemaId === endpoint.id && (
                <div className="p-3 rounded-md bg-muted/30 border border-border/50">
                  <p className="text-[10px] font-medium text-muted-foreground mb-2 uppercase tracking-wider">OpenAPI Schema</p>
                  <pre className="text-[9px] font-mono text-foreground/80 overflow-x-auto whitespace-pre-wrap">
{`{
  "openapi": "3.1.0",
  "info": {
    "title": "${endpoint.name}",
    "version": "${endpoint.version}"
  },
  "servers": [{ "url": "${endpoint.baseUrl}" }],
  "paths": {
${endpoint.tools.map(t => `    "/${t.name}": {
      "post": {
        "summary": "${t.description}",
        "security": [{ "bearerAuth": [] }]
      }
    }`).join(',\n')}
  }
}`}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

/* ─── Loading Skeleton ─── */

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton className="size-5 rounded" />
        <Skeleton className="h-5 w-24" />
      </div>
      <Skeleton className="h-9 w-full" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-lg" />
      <Skeleton className="h-32 rounded-lg" />
    </div>
  )
}

/* ─── Error State ─── */

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <Card className="bg-red-500/5 border-red-500/20">
      <CardContent className="p-3 sm:p-6 text-center space-y-3">
        <AlertCircle className="size-8 text-red-400 mx-auto" />
        <p className="text-sm text-red-400">Failed to load API Hub data</p>
        <p className="text-xs text-muted-foreground">{error}</p>
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5">
          <RefreshCw className="size-3.5" />
          Retry
        </Button>
      </CardContent>
    </Card>
  )
}
