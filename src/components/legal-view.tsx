'use client'

import { useState } from 'react'
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  Search,
  ShieldCheck,
  FileSignature,
  ExternalLink,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { useLegal } from '@/hooks/use-legal'

type ContractStatus = 'pending' | 'sent' | 'signed' | 'expired'

const statusConfig: Record<string, { icon: React.ElementType; color: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  pending: { icon: Clock, color: 'text-yellow-400', variant: 'secondary' },
  sent: { icon: Send, color: 'text-chart-4', variant: 'outline' },
  signed: { icon: CheckCircle2, color: 'text-emerald-400', variant: 'default' },
  expired: { icon: AlertCircle, color: 'text-destructive', variant: 'destructive' },
}

const typeLabels: Record<string, string> = {
  supplier: 'Supplier',
  affiliate: 'Affiliate',
  regulatory: 'Regulatory',
  employment: 'Employment',
}

const fmt = (n: number) => n > 0 ? `$${n.toLocaleString('en-US')}` : '—'

export function LegalView() {
  const { data: legalData, loading, error, refetch } = useLegal()
  const [contractTypeFilter, setContractTypeFilter] = useState('all')
  const [auditCategoryFilter, setAuditCategoryFilter] = useState('all')
  const [auditSearch, setAuditSearch] = useState('')

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
          <Card><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
          <Card><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
        </div>
        <Card><CardContent className="p-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
      </div>
    )
  }

  if (error || !legalData) {
    return (
      <Card className="border-destructive/40">
        <CardContent className="p-6 text-center">
          <AlertCircle className="size-8 text-destructive mx-auto mb-2" />
          <p className="text-sm font-medium text-destructive">Failed to load legal data</p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
          <Button variant="outline" size="sm" className="mt-3 gap-1" onClick={refetch}>
            <RefreshCw className="size-3" /> Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Map API contract data to UI format
  const contracts = legalData.contracts.map((c) => ({
    id: c.id,
    name: c.documentName,
    counterparty: c.signers || 'Unknown',
    type: c.contractType as 'supplier' | 'affiliate' | 'regulatory' | 'employment',
    status: c.status as ContractStatus,
    value: 0, // API doesn't include value; calculate from context
    startDate: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '',
    endDate: c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : '',
    signedDate: c.signedAt ? new Date(c.signedAt).toLocaleDateString() : undefined,
  }))

  // Map API audit logs to UI format
  const auditLog = legalData.auditLogs.map((entry) => ({
    id: entry.id,
    timestamp: entry.createdAt ? new Date(entry.createdAt).toLocaleString() : '',
    user: entry.userId ? `${entry.userRole || 'user'}:${entry.userId}` : 'system',
    action: entry.action,
    category: entry.resource,
    details: entry.details || '',
    ip: entry.ipAddress || '',
  }))

  // DocuSign-like status derived from contracts
  const docusignStatus = {
    connected: true,
    envelopesPending: contracts.filter((c) => c.status === 'sent' || c.status === 'pending').length,
    envelopesCompleted: contracts.filter((c) => c.status === 'signed').length,
    lastSync: '2 minutes ago',
  }

  const filteredContracts = contractTypeFilter === 'all'
    ? contracts
    : contracts.filter((c) => c.type === contractTypeFilter)

  const filteredAudit = auditLog.filter((entry) => {
    if (auditCategoryFilter !== 'all' && entry.category !== auditCategoryFilter) return false
    if (auditSearch && !entry.details.toLowerCase().includes(auditSearch.toLowerCase()) && !entry.user.toLowerCase().includes(auditSearch.toLowerCase())) return false
    return true
  })

  const statusCounts = {
    pending: contracts.filter((c) => c.status === 'pending').length,
    sent: contracts.filter((c) => c.status === 'sent').length,
    signed: contracts.filter((c) => c.status === 'signed').length,
    expired: contracts.filter((c) => c.status === 'expired').length,
  }

  // Get unique audit categories for filter
  const auditCategories = [...new Set(auditLog.map((e) => e.category))].sort()

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(['pending', 'sent', 'signed', 'expired'] as ContractStatus[]).map((status) => {
          const config = statusConfig[status]
          const Icon = config.icon
          return (
            <Card key={status}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-2"><Icon className={`size-4 ${config.color}`} /></div>
                  <div>
                    <p className="text-lg font-bold">{statusCounts[status]}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">{status} Contracts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Contracts Table */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-primary" />
              <CardTitle className="text-sm">Contracts</CardTitle>
            </div>
            <Select value={contractTypeFilter} onValueChange={setContractTypeFilter}>
              <SelectTrigger className="w-[130px] h-8 text-xs">
                <SelectValue placeholder="Filter type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="supplier">Supplier</SelectItem>
                <SelectItem value="affiliate">Affiliate</SelectItem>
                <SelectItem value="regulatory">Regulatory</SelectItem>
                <SelectItem value="employment">Employment</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Contract</TableHead>
                  <TableHead className="text-xs">Counterparty</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Period</TableHead>
                  <TableHead className="text-xs">Signed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.length > 0 ? (
                  filteredContracts.map((contract) => {
                    const config = statusConfig[contract.status] || statusConfig.pending
                    const StatusIcon = config.icon
                    return (
                      <TableRow key={contract.id}>
                        <TableCell className="text-xs font-medium max-w-[200px] truncate">{contract.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{contract.counterparty}</TableCell>
                        <TableCell><Badge variant="outline" className="text-[9px] h-4">{typeLabels[contract.type] || contract.type}</Badge></TableCell>
                        <TableCell>
                          <Badge variant={config.variant} className="text-[9px] h-4 gap-1">
                            <StatusIcon className="size-2.5" />
                            {contract.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{contract.startDate} → {contract.endDate}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{contract.signedDate || '—'}</TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-xs text-muted-foreground text-center py-4">No contracts found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log + DocuSign Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-chart-2" />
                <CardTitle className="text-sm">Audit Log</CardTitle>
              </div>
              <div className="flex gap-2">
                <Select value={auditCategoryFilter} onValueChange={setAuditCategoryFilter}>
                  <SelectTrigger className="w-[120px] h-7 text-xs">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {auditCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                  <Input
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    placeholder="Search..."
                    className="w-[120px] h-7 text-xs pl-7"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-[400px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs w-[140px]">Time</TableHead>
                    <TableHead className="text-xs">User</TableHead>
                    <TableHead className="text-xs">Action</TableHead>
                    <TableHead className="text-xs">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAudit.length > 0 ? (
                    filteredAudit.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="text-[10px] font-mono text-muted-foreground whitespace-nowrap">{entry.timestamp}</TableCell>
                        <TableCell className="text-xs">{entry.user}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[9px] h-4">{entry.action}</Badge>
                        </TableCell>
                        <TableCell className="text-xs max-w-[250px] truncate">{entry.details}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-xs text-muted-foreground text-center py-4">No audit entries found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* DocuSign Integration */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <FileSignature className="size-4 text-primary" />
              <CardTitle className="text-sm">DocuSign Integration</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className={`size-2.5 rounded-full ${docusignStatus.connected ? 'bg-emerald-400' : 'bg-destructive'}`} />
                <span className="text-xs font-medium">
                  {docusignStatus.connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Pending Envelopes</span>
                  <span className="font-bold text-yellow-400">{docusignStatus.envelopesPending}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Completed (30d)</span>
                  <span className="font-bold text-emerald-400">{docusignStatus.envelopesCompleted}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Last Sync</span>
                  <span className="text-muted-foreground">{docusignStatus.lastSync}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                {contracts.filter((c) => c.status === 'sent' || c.status === 'pending').map((c) => (
                  <div key={c.id} className="p-2 rounded-lg bg-muted/50 text-xs">
                    <p className="font-medium truncate">{c.name}</p>
                    <p className="text-[10px] text-muted-foreground">→ {c.counterparty}</p>
                  </div>
                ))}
                {contracts.filter((c) => c.status === 'sent' || c.status === 'pending').length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-2">No pending envelopes</p>
                )}
              </div>

              <Button variant="outline" size="sm" className="w-full text-xs gap-1">
                <ExternalLink className="size-3" />
                Open DocuSign Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
