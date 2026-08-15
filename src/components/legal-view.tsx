'use client'

import { useState, useEffect } from 'react'
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

type ContractStatus = 'pending' | 'sent' | 'signed' | 'expired'

interface Contract {
  id: number
  name: string
  counterparty: string
  type: 'supplier' | 'affiliate' | 'regulatory' | 'employment'
  status: ContractStatus
  value: number
  startDate: string
  endDate: string
  signedDate?: string
}

interface AuditEntry {
  id: number
  timestamp: string
  user: string
  action: string
  category: string
  details: string
  ip: string
}

function getMockData() {
  const contracts: Contract[] = [
    { id: 1, name: 'Game Content License — Evolution', counterparty: 'Evolution Gaming', type: 'supplier', status: 'signed', value: 250000, startDate: '2024-01-01', endDate: '2025-12-31', signedDate: '2023-12-15' },
    { id: 2, name: 'Affiliate Agreement — CasinoReviewPro', counterparty: 'CasinoReviewPro', type: 'affiliate', status: 'signed', value: 0, startDate: '2023-06-01', endDate: '2024-06-01', signedDate: '2023-05-28' },
    { id: 3, name: 'AML/KYC Compliance Framework', counterparty: 'Regulatory Body', type: 'regulatory', status: 'signed', value: 0, startDate: '2024-01-01', endDate: '2024-12-31', signedDate: '2023-12-01' },
    { id: 4, name: 'Payment Processing — Stripe', counterparty: 'Stripe Inc.', type: 'supplier', status: 'pending', value: 180000, startDate: '2024-02-01', endDate: '2025-01-31' },
    { id: 5, name: 'Game Content License — Pragmatic Play', counterparty: 'Pragmatic Play', type: 'supplier', status: 'sent', value: 200000, startDate: '2024-03-01', endDate: '2025-02-28' },
    { id: 6, name: 'Employment — CFO Contract Renewal', counterparty: 'Internal', type: 'employment', status: 'pending', value: 0, startDate: '2024-04-01', endDate: '2027-03-31' },
    { id: 7, name: 'Data Processing Agreement', counterparty: 'AWS Cloud', type: 'supplier', status: 'signed', value: 120000, startDate: '2023-01-01', endDate: '2024-12-31', signedDate: '2022-12-20' },
    { id: 8, name: 'Gibraltar License Renewal', counterparty: 'Gibraltar Gambling Commissioner', type: 'regulatory', status: 'sent', value: 50000, startDate: '2024-06-01', endDate: '2025-05-31' },
  ]

  const auditLog: AuditEntry[] = [
    { id: 1, timestamp: '2024-01-16 14:32:05', user: 'admin@tols.io', action: 'CREATE', category: 'contract', details: 'Created contract: Payment Processing — Stripe', ip: '192.168.1.45' },
    { id: 2, timestamp: '2024-01-16 13:18:22', user: 'finance@tols.io', action: 'UPDATE', category: 'escrow', details: 'Modified escrow settlement schedule for EUR corridor', ip: '192.168.1.32' },
    { id: 3, timestamp: '2024-01-16 12:05:48', user: 'compliance@tols.io', action: 'REVIEW', category: 'kyc', details: 'Reviewed 15 pending KYC applications', ip: '10.0.0.15' },
    { id: 4, timestamp: '2024-01-16 11:44:10', user: 'admin@tols.io', action: 'SEND', category: 'contract', details: 'Sent contract for e-signature: Gibraltar License Renewal', ip: '192.168.1.45' },
    { id: 5, timestamp: '2024-01-16 10:22:33', user: 'affiliate@tols.io', action: 'UPDATE', category: 'affiliate', details: 'Updated commission tier for CasinoReviewPro to Platinum', ip: '10.0.0.22' },
    { id: 6, timestamp: '2024-01-15 16:58:01', user: 'finance@tols.io', action: 'APPROVE', category: 'waterfall', details: 'Approved weekly waterfall distribution', ip: '192.168.1.32' },
    { id: 7, timestamp: '2024-01-15 15:30:45', user: 'compliance@tols.io', action: 'FLAG', category: 'rg', details: 'Flagged player HighRoller_X for RG review', ip: '10.0.0.15' },
    { id: 8, timestamp: '2024-01-15 14:12:09', user: 'admin@tols.io', action: 'CREATE', category: 'promotion', details: 'Created promotion: Spring Frenzy 200%', ip: '192.168.1.45' },
    { id: 9, timestamp: '2024-01-15 09:45:22', user: 'finance@tols.io', action: 'EXECUTE', category: 'settlement', details: 'Executed escrow settlement: EUR 125,000', ip: '192.168.1.32' },
    { id: 10, timestamp: '2024-01-14 17:20:15', user: 'compliance@tols.io', action: 'ARCHIVE', category: 'audit', details: 'Archived Q4 2023 compliance documents', ip: '10.0.0.15' },
  ]

  const docusignStatus = {
    connected: true,
    envelopesPending: 2,
    envelopesCompleted: 5,
    lastSync: '2 minutes ago',
  }

  return { contracts, auditLog, docusignStatus }
}

const statusConfig: Record<ContractStatus, { icon: React.ElementType; color: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
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
  const [data, setData] = useState<ReturnType<typeof getMockData> | null>(null)
  const [loading, setLoading] = useState(true)
  const [contractTypeFilter, setContractTypeFilter] = useState('all')
  const [auditCategoryFilter, setAuditCategoryFilter] = useState('all')
  const [auditSearch, setAuditSearch] = useState('')

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
          <Card><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
          <Card><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
        </div>
        <Card><CardContent className="p-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
      </div>
    )
  }

  const { contracts, auditLog, docusignStatus } = data

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
                  <TableHead className="text-xs text-right">Value</TableHead>
                  <TableHead className="text-xs">Period</TableHead>
                  <TableHead className="text-xs">Signed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.map((contract) => {
                  const config = statusConfig[contract.status]
                  const StatusIcon = config.icon
                  return (
                    <TableRow key={contract.id}>
                      <TableCell className="text-xs font-medium max-w-[200px] truncate">{contract.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{contract.counterparty}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[9px] h-4">{typeLabels[contract.type]}</Badge></TableCell>
                      <TableCell>
                        <Badge variant={config.variant} className="text-[9px] h-4 gap-1">
                          <StatusIcon className="size-2.5" />
                          {contract.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-right font-mono">{fmt(contract.value)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{contract.startDate} → {contract.endDate}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{contract.signedDate || '—'}</TableCell>
                    </TableRow>
                  )
                })}
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
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="escrow">Escrow</SelectItem>
                    <SelectItem value="kyc">KYC</SelectItem>
                    <SelectItem value="affiliate">Affiliate</SelectItem>
                    <SelectItem value="waterfall">Waterfall</SelectItem>
                    <SelectItem value="rg">RG</SelectItem>
                    <SelectItem value="promotion">Promotion</SelectItem>
                    <SelectItem value="settlement">Settlement</SelectItem>
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
            <div className="max-h-[400px] overflow-y-auto">
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
                  {filteredAudit.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="text-[10px] font-mono text-muted-foreground whitespace-nowrap">{entry.timestamp}</TableCell>
                      <TableCell className="text-xs">{entry.user}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[9px] h-4">{entry.action}</Badge>
                      </TableCell>
                      <TableCell className="text-xs max-w-[250px] truncate">{entry.details}</TableCell>
                    </TableRow>
                  ))}
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
                {contracts.filter((c) => c.status === 'sent').map((c) => (
                  <div key={c.id} className="p-2 rounded-lg bg-muted/50 text-xs">
                    <p className="font-medium truncate">{c.name}</p>
                    <p className="text-[10px] text-muted-foreground">→ {c.counterparty}</p>
                  </div>
                ))}
                {contracts.filter((c) => c.status === 'sent').length === 0 && (
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
