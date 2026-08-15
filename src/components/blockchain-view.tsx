'use client'

import { useState, useCallback } from 'react'
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Link2,
  Shield,
  Globe,
  Copy,
  ExternalLink,
  RefreshCw,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  Settings,
  Flame,
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
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { useApi } from '@/hooks/use-api'
import { api } from '@/services/api'

// ─── Types ───────────────────────────────────────────────────────────────────

interface WalletData {
  id: string
  name: string
  address: string
  balance: number
  symbol: string
  usdValue: number
  network: string
  type: 'hot' | 'cold' | 'multi-sig'
  status: 'active' | 'inactive' | 'syncing'
  lastSync: string
}

interface Transaction {
  id: string
  txHash: string
  type: 'deposit' | 'withdrawal' | 'transfer' | 'swap' | 'staking'
  from: string
  to: string
  amount: number
  currency: string
  gasFee: string
  confirmations: number
  maxConfirmations: number
  status: 'pending' | 'confirming' | 'confirmed' | 'failed'
  time: string
}

interface NetworkData {
  id: string
  name: string
  symbol: string
  chainId: number | null
  rpcUrl: string
  explorerUrl: string
  supported: boolean
  active: boolean
  icon: string
}

interface SmartContract {
  id: string
  name: string
  address: string
  network: string
  type: 'escrow' | 'token' | 'nft' | 'staking' | 'governance'
  verified: boolean
  deployedDate: string
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_WALLETS: WalletData[] = [
  {
    id: 'w1',
    name: 'Main Hot Wallet',
    address: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    balance: 12.5,
    symbol: 'ETH',
    usdValue: 31250,
    network: 'Ethereum',
    type: 'hot',
    status: 'active',
    lastSync: '2 min ago',
  },
  {
    id: 'w2',
    name: 'Cold Storage',
    address: 'bc1qar0srrr7xfkvy5l643lydnw9re59g7ne2pl7fc',
    balance: 2.3,
    symbol: 'BTC',
    usdValue: 142600,
    network: 'Bitcoin',
    type: 'cold',
    status: 'active',
    lastSync: '15 min ago',
  },
  {
    id: 'w3',
    name: 'Player Deposits',
    address: 'TJYeYF5fF2Gz2jQm8sA6h5Bd3Vc9Xw7ZpL',
    balance: 50000,
    symbol: 'TRX',
    usdValue: 4250,
    network: 'Tron',
    type: 'hot',
    status: 'active',
    lastSync: '1 min ago',
  },
  {
    id: 'w4',
    name: 'Staking Wallet',
    address: '0x3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e',
    balance: 5000,
    symbol: 'MATIC',
    usdValue: 3750,
    network: 'Polygon',
    type: 'hot',
    status: 'active',
    lastSync: '5 min ago',
  },
  {
    id: 'w5',
    name: 'Multi-sig Treasury',
    address: '0x9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e',
    balance: 45.2,
    symbol: 'ETH',
    usdValue: 112500,
    network: 'Ethereum',
    type: 'multi-sig',
    status: 'active',
    lastSync: '8 min ago',
  },
]

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    txHash: '0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
    type: 'deposit',
    from: '0xPlayer1...a1b2',
    to: '0xHotWallet...c3d4',
    amount: 2.5,
    currency: 'ETH',
    gasFee: '0.002 ETH',
    confirmations: 12,
    maxConfirmations: 12,
    status: 'confirmed',
    time: '2 min ago',
  },
  {
    id: 't2',
    txHash: '0xb2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3',
    type: 'withdrawal',
    from: '0xHotWallet...c3d4',
    to: '0xPlayer2...e5f6',
    amount: 0.85,
    currency: 'ETH',
    gasFee: '0.003 ETH',
    confirmations: 6,
    maxConfirmations: 12,
    status: 'confirming',
    time: '5 min ago',
  },
  {
    id: 't3',
    txHash: '0xc3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4',
    type: 'transfer',
    from: '0xHotWallet...c3d4',
    to: '0xColdStore...g7h8',
    amount: 5.0,
    currency: 'ETH',
    gasFee: '0.0025 ETH',
    confirmations: 0,
    maxConfirmations: 12,
    status: 'pending',
    time: '8 min ago',
  },
  {
    id: 't4',
    txHash: '0xd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5',
    type: 'deposit',
    from: 'TPlayer3...i9j0',
    to: 'TPlayerDep...k1l2',
    amount: 10000,
    currency: 'TRX',
    gasFee: '15 TRX',
    confirmations: 19,
    maxConfirmations: 20,
    status: 'confirmed',
    time: '12 min ago',
  },
  {
    id: 't5',
    txHash: '0xe5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6',
    type: 'swap',
    from: '0xHotWallet...c3d4',
    to: '0xUniswapV3...m3n4',
    amount: 1000,
    currency: 'MATIC',
    gasFee: '0.01 MATIC',
    confirmations: 12,
    maxConfirmations: 12,
    status: 'confirmed',
    time: '18 min ago',
  },
  {
    id: 't6',
    txHash: '0xf6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7',
    type: 'staking',
    from: '0xHotWallet...c3d4',
    to: '0xStakingCt...o5p6',
    amount: 2000,
    currency: 'MATIC',
    gasFee: '0.008 MATIC',
    confirmations: 12,
    maxConfirmations: 12,
    status: 'confirmed',
    time: '25 min ago',
  },
  {
    id: 't7',
    txHash: '0xa7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8',
    type: 'withdrawal',
    from: '0xHotWallet...c3d4',
    to: '0xPlayer4...q7r8',
    amount: 0.12,
    currency: 'BTC',
    gasFee: '0.0001 BTC',
    confirmations: 0,
    maxConfirmations: 6,
    status: 'failed',
    time: '30 min ago',
  },
  {
    id: 't8',
    txHash: '0xb8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9',
    type: 'deposit',
    from: '0xPlayer5...s9t0',
    to: '0xMultisigT...u1v2',
    amount: 10.0,
    currency: 'ETH',
    gasFee: '0.004 ETH',
    confirmations: 12,
    maxConfirmations: 12,
    status: 'confirmed',
    time: '45 min ago',
  },
  {
    id: 't9',
    txHash: '0xc9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0',
    type: 'transfer',
    from: '0xColdStore...g7h8',
    to: '0xHotWallet...c3d4',
    amount: 1.0,
    currency: 'BTC',
    gasFee: '0.00005 BTC',
    confirmations: 3,
    maxConfirmations: 6,
    status: 'confirming',
    time: '1 hr ago',
  },
  {
    id: 't10',
    txHash: '0xd0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1',
    type: 'deposit',
    from: '0xPlayer6...w3x4',
    to: '0xHotWallet...c3d4',
    amount: 15000,
    currency: 'TRX',
    gasFee: '20 TRX',
    confirmations: 20,
    maxConfirmations: 20,
    status: 'confirmed',
    time: '2 hr ago',
  },
]

const MOCK_NETWORKS: NetworkData[] = [
  {
    id: 'n1',
    name: 'Ethereum Mainnet',
    symbol: 'ETH',
    chainId: 1,
    rpcUrl: 'https://mainnet.infura.io/v3/***',
    explorerUrl: 'https://etherscan.io',
    supported: true,
    active: true,
    icon: '⟠',
  },
  {
    id: 'n2',
    name: 'Bitcoin',
    symbol: 'BTC',
    chainId: null,
    rpcUrl: 'https://blockstream.info/api',
    explorerUrl: 'https://blockstream.info',
    supported: true,
    active: true,
    icon: '₿',
  },
  {
    id: 'n3',
    name: 'Tron',
    symbol: 'TRX',
    chainId: null,
    rpcUrl: 'https://api.trongrid.io',
    explorerUrl: 'https://tronscan.org',
    supported: true,
    active: true,
    icon: '◈',
  },
  {
    id: 'n4',
    name: 'Solana',
    symbol: 'SOL',
    chainId: null,
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    explorerUrl: 'https://solscan.io',
    supported: true,
    active: true,
    icon: '◎',
  },
  {
    id: 'n5',
    name: 'Polygon',
    symbol: 'MATIC',
    chainId: 137,
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    supported: true,
    active: true,
    icon: '⬡',
  },
  {
    id: 'n6',
    name: 'BSC',
    symbol: 'BNB',
    chainId: 56,
    rpcUrl: 'https://bsc-dataseed.binance.org',
    explorerUrl: 'https://bscscan.com',
    supported: true,
    active: true,
    icon: '◆',
  },
]

const MOCK_CONTRACTS: SmartContract[] = [
  {
    id: 'c1',
    name: 'PlatformEscrow',
    address: '0xEscrow1234567890abcdef1234567890abcdef12',
    network: 'Ethereum',
    type: 'escrow',
    verified: true,
    deployedDate: '2024-01-15',
  },
  {
    id: 'c2',
    name: 'TOLS Token',
    address: '0xToken1234567890abcdef1234567890abcdef1234',
    network: 'Polygon',
    type: 'token',
    verified: true,
    deployedDate: '2024-02-20',
  },
  {
    id: 'c3',
    name: 'CasinoNFT Collection',
    address: '0xNFT1234567890abcdef1234567890abcdef123456',
    network: 'Ethereum',
    type: 'nft',
    verified: true,
    deployedDate: '2024-03-10',
  },
  {
    id: 'c4',
    name: 'StakingVault',
    address: '0xStake1234567890abcdef1234567890abcdef1234',
    network: 'Polygon',
    type: 'staking',
    verified: false,
    deployedDate: '2024-04-05',
  },
  {
    id: 'c5',
    name: 'TOLS Governor',
    address: '0xGov1234567890abcdef1234567890abcdef123456',
    network: 'Ethereum',
    type: 'governance',
    verified: true,
    deployedDate: '2024-05-22',
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function truncateAddress(addr: string, chars: number = 8): string {
  if (addr.length <= chars * 2 + 3) return addr
  return `${addr.slice(0, chars + 2)}...${addr.slice(-chars)}`
}

function formatUsd(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatBalance(value: number): string {
  if (value >= 1000) return new Intl.NumberFormat('en-US').format(value)
  return value.toString()
}

// ─── Status Badge Helpers ────────────────────────────────────────────────────

function WalletTypeBadge({ type }: { type: WalletData['type'] }) {
  const config = {
    hot: { label: 'Hot', className: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    cold: { label: 'Cold', className: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
    'multi-sig': { label: 'Multi-sig', className: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  }
  const c = config[type]
  return <Badge variant="outline" className={c.className}>{c.label}</Badge>
}

function WalletStatusBadge({ status }: { status: WalletData['status'] }) {
  const config = {
    active: { label: 'Active', className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    inactive: { label: 'Inactive', className: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
    syncing: { label: 'Syncing', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  }
  const c = config[status]
  return <Badge variant="outline" className={c.className}>{c.label}</Badge>
}

function TxStatusBadge({ status }: { status: Transaction['status'] }) {
  const config = {
    pending: { label: 'Pending', icon: <Clock className="size-3" />, className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    confirming: { label: 'Confirming', icon: <RefreshCw className="size-3 animate-spin" />, className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    confirmed: { label: 'Confirmed', icon: <CheckCircle className="size-3" />, className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    failed: { label: 'Failed', icon: <XCircle className="size-3" />, className: 'bg-red-500/20 text-red-400 border-red-500/30' },
  }
  const c = config[status]
  return (
    <Badge variant="outline" className={c.className}>
      {c.icon} {c.label}
    </Badge>
  )
}

function ContractTypeBadge({ type }: { type: SmartContract['type'] }) {
  const config = {
    escrow: { label: 'Escrow', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    token: { label: 'Token', className: 'bg-sky-500/20 text-sky-400 border-sky-500/30' },
    nft: { label: 'NFT', className: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
    staking: { label: 'Staking', className: 'bg-violet-500/20 text-violet-400 border-violet-500/30' },
    governance: { label: 'Governance', className: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
  }
  const c = config[type]
  return <Badge variant="outline" className={c.className}>{c.label}</Badge>
}

function NetworkBadge({ network }: { network: string }) {
  const colorMap: Record<string, string> = {
    Ethereum: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    Bitcoin: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    Tron: 'bg-red-500/20 text-red-400 border-red-500/30',
    Polygon: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    Solana: 'bg-green-500/20 text-green-400 border-green-500/30',
    BSC: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  }
  return (
    <Badge variant="outline" className={colorMap[network] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}>
      {network}
    </Badge>
  )
}

function TxTypeBadge({ type }: { type: Transaction['type'] }) {
  const config = {
    deposit: { label: 'Deposit', icon: <ArrowDownLeft className="size-3" />, className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    withdrawal: { label: 'Withdrawal', icon: <ArrowUpRight className="size-3" />, className: 'bg-red-500/20 text-red-400 border-red-500/30' },
    transfer: { label: 'Transfer', icon: <ArrowUpRight className="size-3" />, className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    swap: { label: 'Swap', icon: <RefreshCw className="size-3" />, className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    staking: { label: 'Staking', icon: <Flame className="size-3" />, className: 'bg-violet-500/20 text-violet-400 border-violet-500/30' },
  }
  const c = config[type]
  return (
    <Badge variant="outline" className={c.className}>
      {c.icon} {c.label}
    </Badge>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function BlockchainView() {
  // State for wallets
  const [wallets, setWallets] = useState<WalletData[]>(MOCK_WALLETS)
  const [syncingWallets, setSyncingWallets] = useState<Set<string>>(new Set())
  const [addWalletOpen, setAddWalletOpen] = useState(false)
  const [newWalletName, setNewWalletName] = useState('')
  const [newWalletAddress, setNewWalletAddress] = useState('')
  const [newWalletNetwork, setNewWalletNetwork] = useState('')
  const [newWalletType, setNewWalletType] = useState('')

  // State for transactions
  const [txTypeFilter, setTxTypeFilter] = useState<string>('all')
  const [txStatusFilter, setTxStatusFilter] = useState<string>('all')
  const [txSearch, setTxSearch] = useState('')

  // State for networks
  const [networks, setNetworks] = useState<NetworkData[]>(MOCK_NETWORKS)

  // State for contracts
  const [contracts] = useState<SmartContract[]>(MOCK_CONTRACTS)
  const [viewContractId, setViewContractId] = useState<string | null>(null)

  // API integration (for future backend connection)
  const { data: apiWallets, loading: walletsLoading } = useApi(
    useCallback(() => api.wallets.get(), []),
    []
  )

  // ── Handlers ──

  const handleSync = (walletId: string) => {
    setSyncingWallets((prev) => new Set(prev).add(walletId))
    setTimeout(() => {
      setSyncingWallets((prev) => {
        const next = new Set(prev)
        next.delete(walletId)
        return next
      })
      setWallets((prev) =>
        prev.map((w) =>
          w.id === walletId ? { ...w, lastSync: 'Just now' } : w
        )
      )
    }, 2000)
  }

  const handleAddWallet = () => {
    if (!newWalletName || !newWalletAddress || !newWalletNetwork || !newWalletType) return
    const newWallet: WalletData = {
      id: `w${Date.now()}`,
      name: newWalletName,
      address: newWalletAddress,
      balance: 0,
      symbol: newWalletNetwork,
      usdValue: 0,
      network: newWalletNetwork,
      type: newWalletType as WalletData['type'],
      status: 'active',
      lastSync: 'Never',
    }
    setWallets((prev) => [...prev, newWallet])
    setNewWalletName('')
    setNewWalletAddress('')
    setNewWalletNetwork('')
    setNewWalletType('')
    setAddWalletOpen(false)
  }

  const handleToggleNetwork = (networkId: string) => {
    setNetworks((prev) =>
      prev.map((n) =>
        n.id === networkId ? { ...n, active: !n.active } : n
      )
    )
  }

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
  }

  // ── Filtered Transactions ──

  const filteredTransactions = MOCK_TRANSACTIONS.filter((tx) => {
    if (txTypeFilter !== 'all' && tx.type !== txTypeFilter) return false
    if (txStatusFilter !== 'all' && tx.status !== txStatusFilter) return false
    if (txSearch && !tx.txHash.toLowerCase().includes(txSearch.toLowerCase()) && !tx.from.toLowerCase().includes(txSearch.toLowerCase()) && !tx.to.toLowerCase().includes(txSearch.toLowerCase())) return false
    return true
  })

  // ── Total Stats ──

  const totalUsd = wallets.reduce((sum, w) => sum + w.usdValue, 0)
  const activeWallets = wallets.filter((w) => w.status === 'active').length
  const pendingTx = MOCK_TRANSACTIONS.filter((t) => t.status === 'pending' || t.status === 'confirming').length

  // ── Render ──

  return (
    <div className="min-h-screen bg-[#0d0f14] text-gray-100">
      {/* Header */}
      <div className="border-b border-gray-800/60 bg-[#12141a] px-6 py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20">
              <Wallet className="size-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Blockchain & Crypto Wallets</h1>
              <p className="text-sm text-gray-400">Manage wallets, transactions, and smart contracts</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <CheckCircle className="mr-1 size-3" /> {activeWallets} Active
            </Badge>
            {pendingTx > 0 && (
              <Badge variant="outline" className="border-yellow-500/30 bg-yellow-500/10 text-yellow-400">
                <Clock className="mr-1 size-3" /> {pendingTx} Pending
              </Badge>
            )}
            <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-400">
              Total: {formatUsd(totalUsd)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="p-6">
        <Tabs defaultValue="wallets" className="w-full">
          <TabsList className="mb-6 bg-[#1a1d25] p-1">
            <TabsTrigger value="wallets" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
              <Wallet className="mr-1.5 size-4" /> Wallets
            </TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
              <ArrowUpRight className="mr-1.5 size-4" /> Transactions
            </TabsTrigger>
            <TabsTrigger value="networks" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
              <Globe className="mr-1.5 size-4" /> Networks
            </TabsTrigger>
            <TabsTrigger value="contracts" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
              <Shield className="mr-1.5 size-4" /> Smart Contracts
            </TabsTrigger>
          </TabsList>

          {/* ═══ Tab 1: Wallets ═══ */}
          <TabsContent value="wallets">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Wallets ({wallets.length})</h2>
              <Dialog open={addWalletOpen} onOpenChange={setAddWalletOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20 hover:from-amber-600 hover:to-orange-700">
                    <Plus className="mr-1.5 size-4" /> Add Wallet
                  </Button>
                </DialogTrigger>
                <DialogContent className="border-gray-700 bg-[#1a1d25] text-gray-100 sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-white">Add New Wallet</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Wallet Name</Label>
                      <Input
                        placeholder="e.g., Revenue Wallet"
                        value={newWalletName}
                        onChange={(e) => setNewWalletName(e.target.value)}
                        className="border-gray-700 bg-[#12141a] text-white placeholder:text-gray-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Wallet Address</Label>
                      <Textarea
                        placeholder="0x... or bc1... or T..."
                        value={newWalletAddress}
                        onChange={(e) => setNewWalletAddress(e.target.value)}
                        className="border-gray-700 bg-[#12141a] text-white placeholder:text-gray-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-gray-300">Network</Label>
                        <Select value={newWalletNetwork} onValueChange={setNewWalletNetwork}>
                          <SelectTrigger className="border-gray-700 bg-[#12141a] text-white">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent className="border-gray-700 bg-[#1a1d25] text-white">
                            <SelectItem value="Ethereum">Ethereum</SelectItem>
                            <SelectItem value="Bitcoin">Bitcoin</SelectItem>
                            <SelectItem value="Tron">Tron</SelectItem>
                            <SelectItem value="Polygon">Polygon</SelectItem>
                            <SelectItem value="Solana">Solana</SelectItem>
                            <SelectItem value="BSC">BSC</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-300">Type</Label>
                        <Select value={newWalletType} onValueChange={setNewWalletType}>
                          <SelectTrigger className="border-gray-700 bg-[#12141a] text-white">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent className="border-gray-700 bg-[#1a1d25] text-white">
                            <SelectItem value="hot">Hot</SelectItem>
                            <SelectItem value="cold">Cold</SelectItem>
                            <SelectItem value="multi-sig">Multi-sig</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button
                      onClick={handleAddWallet}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20 hover:from-amber-600 hover:to-orange-700"
                    >
                      Add Wallet
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {walletsLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i} className="border-gray-800/60 bg-[#12141a]">
                    <CardHeader className="pb-2">
                      <Skeleton className="h-5 w-32" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="mb-2 h-4 w-48" />
                      <Skeleton className="h-8 w-24" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {wallets.map((wallet) => (
                  <Card
                    key={wallet.id}
                    className="border-gray-800/60 bg-[#12141a] transition-all hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`flex size-8 items-center justify-center rounded-md ${
                            wallet.type === 'hot'
                              ? 'bg-orange-500/20'
                              : wallet.type === 'cold'
                              ? 'bg-cyan-500/20'
                              : 'bg-purple-500/20'
                          }`}>
                            {wallet.type === 'hot' && <Flame className="size-4 text-orange-400" />}
                            {wallet.type === 'cold' && <Shield className="size-4 text-cyan-400" />}
                            {wallet.type === 'multi-sig' && <Wallet className="size-4 text-purple-400" />}
                          </div>
                          <div>
                            <CardTitle className="text-sm font-semibold text-white">{wallet.name}</CardTitle>
                            <p className="mt-0.5 font-mono text-xs text-gray-500">{truncateAddress(wallet.address, 10)}</p>
                          </div>
                        </div>
                        <WalletTypeBadge type={wallet.type} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <WalletStatusBadge status={wallet.status} />
                          <NetworkBadge network={wallet.network} />
                        </div>
                        <Separator className="bg-gray-800/60" />
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-2xl font-bold text-white">
                              {formatBalance(wallet.balance)} <span className="text-sm font-medium text-gray-400">{wallet.symbol}</span>
                            </p>
                            <p className="text-sm text-emerald-400">{formatUsd(wallet.usdValue)}</p>
                          </div>
                        </div>
                        <Separator className="bg-gray-800/60" />
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">
                            <Clock className="mr-1 inline size-3" />
                            Last sync: {syncingWallets.has(wallet.id) ? 'Syncing...' : wallet.lastSync}
                          </p>
                          <div className="flex gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1 text-xs text-gray-400 hover:text-amber-400"
                              onClick={() => handleCopyAddress(wallet.address)}
                            >
                              <Copy className="size-3" /> Copy
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1 text-xs text-gray-400 hover:text-amber-400"
                              onClick={() => handleSync(wallet.id)}
                              disabled={syncingWallets.has(wallet.id)}
                            >
                              <RefreshCw className={`size-3 ${syncingWallets.has(wallet.id) ? 'animate-spin' : ''}`} /> Sync
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1 text-xs text-gray-400 hover:text-amber-400"
                            >
                              <Eye className="size-3" /> View
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ═══ Tab 2: Transactions ═══ */}
          <TabsContent value="transactions">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-white">Recent Transactions</h2>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 size-4 text-gray-500" />
                  <Input
                    placeholder="Search hash, address..."
                    value={txSearch}
                    onChange={(e) => setTxSearch(e.target.value)}
                    className="h-9 w-48 border-gray-700 bg-[#12141a] pl-8 text-sm text-white placeholder:text-gray-500"
                  />
                </div>
                <Select value={txTypeFilter} onValueChange={setTxTypeFilter}>
                  <SelectTrigger className="h-9 w-32 border-gray-700 bg-[#12141a] text-sm text-white">
                    <Filter className="mr-1 size-3 text-gray-500" />
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent className="border-gray-700 bg-[#1a1d25] text-white">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="deposit">Deposit</SelectItem>
                    <SelectItem value="withdrawal">Withdrawal</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                    <SelectItem value="swap">Swap</SelectItem>
                    <SelectItem value="staking">Staking</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={txStatusFilter} onValueChange={setTxStatusFilter}>
                  <SelectTrigger className="h-9 w-36 border-gray-700 bg-[#12141a] text-sm text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="border-gray-700 bg-[#1a1d25] text-white">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirming">Confirming</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card className="border-gray-800/60 bg-[#12141a]">
              <CardContent className="p-0">
                <ScrollArea className="max-h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-800/60 hover:bg-transparent">
                        <TableHead className="text-gray-400">TX Hash</TableHead>
                        <TableHead className="text-gray-400">Type</TableHead>
                        <TableHead className="text-gray-400">From</TableHead>
                        <TableHead className="text-gray-400">To</TableHead>
                        <TableHead className="text-right text-gray-400">Amount</TableHead>
                        <TableHead className="text-gray-400">Currency</TableHead>
                        <TableHead className="text-gray-400">Gas Fee</TableHead>
                        <TableHead className="text-gray-400">Confirms</TableHead>
                        <TableHead className="text-gray-400">Status</TableHead>
                        <TableHead className="text-gray-400">Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.length === 0 ? (
                        <TableRow className="border-gray-800/60 hover:bg-transparent">
                          <TableCell colSpan={10} className="h-24 text-center text-gray-500">
                            No transactions match your filters
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredTransactions.map((tx) => (
                          <TableRow key={tx.id} className="border-gray-800/60 hover:bg-amber-500/5">
                            <TableCell className="font-mono text-xs text-amber-400/80">
                              <div className="flex items-center gap-1.5">
                                {truncateAddress(tx.txHash, 6)}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="size-5 p-0 text-gray-500 hover:text-amber-400"
                                  onClick={() => handleCopyAddress(tx.txHash)}
                                >
                                  <Copy className="size-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              <TxTypeBadge type={tx.type} />
                            </TableCell>
                            <TableCell className="font-mono text-xs text-gray-400">{tx.from}</TableCell>
                            <TableCell className="font-mono text-xs text-gray-400">{tx.to}</TableCell>
                            <TableCell className="text-right font-medium text-white">
                              {tx.amount.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-xs text-gray-300">{tx.currency}</TableCell>
                            <TableCell className="text-xs text-gray-400">{tx.gasFee}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                <Progress
                                  value={(tx.confirmations / tx.maxConfirmations) * 100}
                                  className="h-1.5 w-12 bg-gray-800 [&>[data-slot=progress-indicator]]:bg-amber-500"
                                />
                                <span className="text-xs text-gray-500">
                                  {tx.confirmations}/{tx.maxConfirmations}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <TxStatusBadge status={tx.status} />
                            </TableCell>
                            <TableCell className="text-xs text-gray-500">{tx.time}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ Tab 3: Networks ═══ */}
          <TabsContent value="networks">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Supported Networks ({networks.length})</h2>
              <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:border-amber-500/30 hover:text-amber-400">
                <Settings className="mr-1.5 size-4" /> Configure RPC
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {networks.map((network) => (
                <Card
                  key={network.id}
                  className={`border-gray-800/60 bg-[#12141a] transition-all ${
                    network.active
                      ? 'hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5'
                      : 'opacity-60'
                  }`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 text-xl">
                          {network.icon}
                        </div>
                        <div>
                          <CardTitle className="text-sm font-semibold text-white">{network.name}</CardTitle>
                          <div className="mt-0.5 flex items-center gap-2">
                            <Badge variant="outline" className="border-gray-700 bg-gray-800 text-xs text-gray-400">
                              {network.symbol}
                            </Badge>
                            {network.chainId !== null && (
                              <Badge variant="outline" className="border-gray-700 bg-gray-800 text-xs text-gray-400">
                                Chain {network.chainId}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`net-${network.id}`} className="text-xs text-gray-500">
                          {network.active ? 'On' : 'Off'}
                        </Label>
                        <Switch
                          id={`net-${network.id}`}
                          checked={network.active}
                          onCheckedChange={() => handleToggleNetwork(network.id)}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="mb-1 text-xs font-medium text-gray-500">RPC URL</p>
                        <div className="flex items-center gap-1.5">
                          <Link2 className="size-3 text-gray-600" />
                          <p className="truncate font-mono text-xs text-gray-400">{network.rpcUrl}</p>
                        </div>
                      </div>
                      <div>
                        <p className="mb-1 text-xs font-medium text-gray-500">Explorer</p>
                        <div className="flex items-center gap-1.5">
                          <ExternalLink className="size-3 text-gray-600" />
                          <p className="truncate font-mono text-xs text-gray-400">{network.explorerUrl}</p>
                        </div>
                      </div>
                      <Separator className="bg-gray-800/60" />
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="outline"
                          className={
                            network.supported && network.active
                              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                              : network.supported
                              ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400'
                              : 'border-red-500/30 bg-red-500/10 text-red-400'
                          }
                        >
                          {network.supported && network.active && <CheckCircle className="mr-1 size-3" />}
                          {network.supported && !network.active && <AlertTriangle className="mr-1 size-3" />}
                          {!network.supported && <XCircle className="mr-1 size-3" />}
                          {network.supported && network.active
                            ? 'Active'
                            : network.supported
                            ? 'Inactive'
                            : 'Unsupported'}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 gap-1 text-xs text-gray-400 hover:text-amber-400"
                        >
                          <Settings className="size-3" /> Config
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ═══ Tab 4: Smart Contracts ═══ */}
          <TabsContent value="contracts">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Smart Contracts ({contracts.length})</h2>
              <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:border-amber-500/30 hover:text-amber-400">
                <Plus className="mr-1.5 size-4" /> Deploy New
              </Button>
            </div>

            <Card className="border-gray-800/60 bg-[#12141a]">
              <CardContent className="p-0">
                <ScrollArea className="max-h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-800/60 hover:bg-transparent">
                        <TableHead className="text-gray-400">Name</TableHead>
                        <TableHead className="text-gray-400">Address</TableHead>
                        <TableHead className="text-gray-400">Network</TableHead>
                        <TableHead className="text-gray-400">Type</TableHead>
                        <TableHead className="text-gray-400">Verified</TableHead>
                        <TableHead className="text-gray-400">Deployed</TableHead>
                        <TableHead className="text-gray-400">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contracts.map((contract) => (
                        <TableRow key={contract.id} className="border-gray-800/60 hover:bg-amber-500/5">
                          <TableCell className="font-medium text-white">{contract.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs text-amber-400/80">
                                {truncateAddress(contract.address, 8)}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="size-5 p-0 text-gray-500 hover:text-amber-400"
                                onClick={() => handleCopyAddress(contract.address)}
                              >
                                <Copy className="size-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <NetworkBadge network={contract.network} />
                          </TableCell>
                          <TableCell>
                            <ContractTypeBadge type={contract.type} />
                          </TableCell>
                          <TableCell>
                            {contract.verified ? (
                              <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                                <CheckCircle className="mr-1 size-3" /> Verified
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-red-500/30 bg-red-500/10 text-red-400">
                                <XCircle className="mr-1 size-3" /> Unverified
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-gray-400">{contract.deployedDate}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 gap-1 text-xs text-gray-400 hover:text-amber-400"
                                onClick={() => setViewContractId(contract.id)}
                              >
                                <Eye className="size-3" /> View
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 gap-1 text-xs text-gray-400 hover:text-amber-400"
                              >
                                <ExternalLink className="size-3" /> Explorer
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Contract Detail Dialog */}
            <Dialog open={viewContractId !== null} onOpenChange={(open) => !open && setViewContractId(null)}>
              <DialogContent className="border-gray-700 bg-[#1a1d25] text-gray-100 sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-white">Contract Details</DialogTitle>
                </DialogHeader>
                {viewContractId && (() => {
                  const contract = contracts.find((c) => c.id === viewContractId)
                  if (!contract) return null
                  return (
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/20">
                          <Shield className="size-5 text-amber-400" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-white">{contract.name}</p>
                          <ContractTypeBadge type={contract.type} />
                        </div>
                      </div>
                      <Separator className="bg-gray-800/60" />
                      <div className="space-y-3">
                        <div>
                          <p className="mb-1 text-xs font-medium text-gray-500">Contract Address</p>
                          <div className="flex items-center gap-2">
                            <code className="rounded bg-[#12141a] px-2 py-1 font-mono text-xs text-amber-400/80">
                              {contract.address}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="size-6 p-0 text-gray-500 hover:text-amber-400"
                              onClick={() => handleCopyAddress(contract.address)}
                            >
                              <Copy className="size-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="mb-1 text-xs font-medium text-gray-500">Network</p>
                            <NetworkBadge network={contract.network} />
                          </div>
                          <div>
                            <p className="mb-1 text-xs font-medium text-gray-500">Verification</p>
                            {contract.verified ? (
                              <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                                <CheckCircle className="mr-1 size-3" /> Verified on Explorer
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-red-500/30 bg-red-500/10 text-red-400">
                                <XCircle className="mr-1 size-3" /> Not Verified
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="mb-1 text-xs font-medium text-gray-500">Deployed Date</p>
                          <p className="text-sm text-gray-300">{contract.deployedDate}</p>
                        </div>
                      </div>
                      <Separator className="bg-gray-800/60" />
                      <div className="flex gap-2">
                        <Button className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20 hover:from-amber-600 hover:to-orange-700">
                          <ExternalLink className="mr-1.5 size-4" /> View on Explorer
                        </Button>
                        <Button variant="outline" className="flex-1 border-gray-700 text-gray-300 hover:border-amber-500/30 hover:text-amber-400">
                          <RefreshCw className="mr-1.5 size-4" /> Verify Contract
                        </Button>
                      </div>
                    </div>
                  )
                })()}
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
