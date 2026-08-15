export interface Wallet {
  id: string
  playerId: string
  playerName: string
  currency: string
  balance: number
  availableBalance: number
  lockedBalance: number
  bonusBalance: number
  isPrimary: boolean
  status: string
  lastDepositAt: string
  lastWithdrawAt: string
}

export interface WalletTransaction {
  id: string
  walletId: string
  type: string
  amount: number
  balanceBefore: number
  balanceAfter: number
  currency: string
  status: string
  reference: string
  gameId: string
  gameName: string
  createdAt: string
}

export interface CurrencyRate {
  from: string
  to: string
  rate: number
}

export interface WalletTotals {
  totalBalance: number
  totalAvailable: number
  totalLocked: number
  totalBonus: number
  byCurrency: Record<string, { balance: number; count: number }>
}

export interface PaymentMethod {
  id: string
  playerId: string
  playerName: string
  type: string
  provider: string
  label: string
  identifier: string
  isDefault: boolean
  isActive: boolean
  currency: string
}

export interface WalletsData {
  wallets: Wallet[]
  transactions: WalletTransaction[]
  currencyRates: CurrencyRate[]
  totals: WalletTotals
  paymentMethods: PaymentMethod[]
}
