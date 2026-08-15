import { NextResponse } from 'next/server'

const wallets = [
  { id: 'w1', playerId: 'p1', playerName: 'Alex Mercer', currency: 'USD', balance: 12450.50, availableBalance: 10200.00, lockedBalance: 1500.50, bonusBalance: 750.00, isPrimary: true, status: 'active', lastDepositAt: '2025-01-15T10:30:00Z', lastWithdrawAt: '2025-01-14T08:15:00Z' },
  { id: 'w2', playerId: 'p1', playerName: 'Alex Mercer', currency: 'BTC', balance: 0.45210000, availableBalance: 0.40000000, lockedBalance: 0.05210000, bonusBalance: 0, isPrimary: false, status: 'active', lastDepositAt: '2025-01-10T12:00:00Z', lastWithdrawAt: '2025-01-08T09:00:00Z' },
  { id: 'w3', playerId: 'p2', playerName: 'Sofia Reyes', currency: 'EUR', balance: 8750.25, availableBalance: 7200.25, lockedBalance: 1050.00, bonusBalance: 500.00, isPrimary: true, status: 'active', lastDepositAt: '2025-01-15T14:22:00Z', lastWithdrawAt: '2025-01-13T11:45:00Z' },
  { id: 'w4', playerId: 'p2', playerName: 'Sofia Reyes', currency: 'USDT', balance: 5000.00, availableBalance: 5000.00, lockedBalance: 0, bonusBalance: 0, isPrimary: false, status: 'active', lastDepositAt: '2025-01-12T16:30:00Z', lastWithdrawAt: '' },
  { id: 'w5', playerId: 'p3', playerName: 'James Kato', currency: 'GBP', balance: 6320.80, availableBalance: 5800.80, lockedBalance: 520.00, bonusBalance: 0, isPrimary: true, status: 'active', lastDepositAt: '2025-01-14T20:10:00Z', lastWithdrawAt: '2025-01-11T17:30:00Z' },
  { id: 'w6', playerId: 'p3', playerName: 'James Kato', currency: 'ETH', balance: 1.85000000, availableBalance: 1.50000000, lockedBalance: 0.35000000, bonusBalance: 0, isPrimary: false, status: 'active', lastDepositAt: '2025-01-09T06:45:00Z', lastWithdrawAt: '' },
  { id: 'w7', playerId: 'p4', playerName: 'Lena Voss', currency: 'USD', balance: 23100.00, availableBalance: 18500.00, lockedBalance: 3600.00, bonusBalance: 1000.00, isPrimary: true, status: 'active', lastDepositAt: '2025-01-15T09:00:00Z', lastWithdrawAt: '2025-01-15T09:30:00Z' },
  { id: 'w8', playerId: 'p4', playerName: 'Lena Voss', currency: 'LTC', balance: 12.50000000, availableBalance: 10.00000000, lockedBalance: 2.50000000, bonusBalance: 0, isPrimary: false, status: 'active', lastDepositAt: '2025-01-07T13:00:00Z', lastWithdrawAt: '' },
  { id: 'w9', playerId: 'p5', playerName: 'Ravi Sharma', currency: 'USD', balance: 450.75, availableBalance: 300.75, lockedBalance: 100.00, bonusBalance: 50.00, isPrimary: true, status: 'frozen', lastDepositAt: '2025-01-10T08:00:00Z', lastWithdrawAt: '2025-01-09T15:20:00Z' },
  { id: 'w10', playerId: 'p6', playerName: 'Mia Chen', currency: 'USDC', balance: 15000.00, availableBalance: 12000.00, lockedBalance: 2000.00, bonusBalance: 1000.00, isPrimary: true, status: 'active', lastDepositAt: '2025-01-15T11:45:00Z', lastWithdrawAt: '2025-01-14T19:00:00Z' },
  { id: 'w11', playerId: 'p7', playerName: 'Omar Farouk', currency: 'EUR', balance: 3200.00, availableBalance: 3200.00, lockedBalance: 0, bonusBalance: 0, isPrimary: true, status: 'closed', lastDepositAt: '2024-12-20T14:00:00Z', lastWithdrawAt: '2024-12-21T10:00:00Z' },
  { id: 'w12', playerId: 'p8', playerName: 'Yuki Tanaka', currency: 'USD', balance: 9800.30, availableBalance: 8500.30, lockedBalance: 800.00, bonusBalance: 500.00, isPrimary: true, status: 'active', lastDepositAt: '2025-01-15T16:00:00Z', lastWithdrawAt: '2025-01-12T12:30:00Z' },
]

const transactions = [
  { id: 't1', walletId: 'w1', type: 'deposit', amount: 2000.00, balanceBefore: 10450.50, balanceAfter: 12450.50, currency: 'USD', status: 'completed', reference: 'DEP-001', gameId: '', gameName: '', createdAt: '2025-01-15T10:30:00Z' },
  { id: 't2', walletId: 'w1', type: 'bet', amount: -150.00, balanceBefore: 12600.50, balanceAfter: 12450.50, currency: 'USD', status: 'completed', reference: 'BET-001', gameId: 'g1', gameName: 'Blackjack Pro', createdAt: '2025-01-15T10:35:00Z' },
  { id: 't3', walletId: 'w1', type: 'win', amount: 350.00, balanceBefore: 12100.50, balanceAfter: 12450.50, currency: 'USD', status: 'completed', reference: 'WIN-001', gameId: 'g1', gameName: 'Blackjack Pro', createdAt: '2025-01-15T10:40:00Z' },
  { id: 't4', walletId: 'w7', type: 'deposit', amount: 5000.00, balanceBefore: 18100.00, balanceAfter: 23100.00, currency: 'USD', status: 'completed', reference: 'DEP-002', gameId: '', gameName: '', createdAt: '2025-01-15T09:00:00Z' },
  { id: 't5', walletId: 'w7', type: 'withdrawal', amount: -2500.00, balanceBefore: 25600.00, balanceAfter: 23100.00, currency: 'USD', status: 'completed', reference: 'WDR-001', gameId: '', gameName: '', createdAt: '2025-01-15T09:30:00Z' },
  { id: 't6', walletId: 'w3', type: 'deposit', amount: 1000.00, balanceBefore: 7750.25, balanceAfter: 8750.25, currency: 'EUR', status: 'completed', reference: 'DEP-003', gameId: '', gameName: '', createdAt: '2025-01-15T14:22:00Z' },
  { id: 't7', walletId: 'w3', type: 'bet', amount: -200.00, balanceBefore: 8950.25, balanceAfter: 8750.25, currency: 'EUR', status: 'completed', reference: 'BET-002', gameId: 'g2', gameName: 'Roulette Supreme', createdAt: '2025-01-15T14:30:00Z' },
  { id: 't8', walletId: 'w5', type: 'bonus', amount: 500.00, balanceBefore: 5820.80, balanceAfter: 6320.80, currency: 'GBP', status: 'completed', reference: 'BNS-001', gameId: '', gameName: '', createdAt: '2025-01-14T20:10:00Z' },
  { id: 't9', walletId: 'w10', type: 'deposit', amount: 3000.00, balanceBefore: 12000.00, balanceAfter: 15000.00, currency: 'USDC', status: 'completed', reference: 'DEP-004', gameId: '', gameName: '', createdAt: '2025-01-15T11:45:00Z' },
  { id: 't10', walletId: 'w1', type: 'cashback', amount: 75.00, balanceBefore: 12375.50, balanceAfter: 12450.50, currency: 'USD', status: 'completed', reference: 'CBK-001', gameId: '', gameName: '', createdAt: '2025-01-15T08:00:00Z' },
  { id: 't11', walletId: 'w2', type: 'transfer', amount: 0.10000000, balanceBefore: 0.35210000, balanceAfter: 0.45210000, currency: 'BTC', status: 'completed', reference: 'TRF-001', gameId: '', gameName: '', createdAt: '2025-01-10T12:00:00Z' },
  { id: 't12', walletId: 'w12', type: 'deposit', amount: 1500.00, balanceBefore: 8300.30, balanceAfter: 9800.30, currency: 'USD', status: 'completed', reference: 'DEP-005', gameId: '', gameName: '', createdAt: '2025-01-15T16:00:00Z' },
  { id: 't13', walletId: 'w7', type: 'bet', amount: -500.00, balanceBefore: 23600.00, balanceAfter: 23100.00, currency: 'USD', status: 'completed', reference: 'BET-003', gameId: 'g3', gameName: 'Mega Slots', createdAt: '2025-01-15T10:00:00Z' },
  { id: 't14', walletId: 'w7', type: 'win', amount: 1200.00, balanceBefore: 21900.00, balanceAfter: 23100.00, currency: 'USD', status: 'completed', reference: 'WIN-002', gameId: 'g3', gameName: 'Mega Slots', createdAt: '2025-01-15T10:15:00Z' },
  { id: 't15', walletId: 'w4', type: 'fee', amount: -25.00, balanceBefore: 5025.00, balanceAfter: 5000.00, currency: 'USDT', status: 'completed', reference: 'FEE-001', gameId: '', gameName: '', createdAt: '2025-01-12T16:30:00Z' },
  { id: 't16', walletId: 'w6', type: 'exchange', amount: 0.35000000, balanceBefore: 1.50000000, balanceAfter: 1.85000000, currency: 'ETH', status: 'completed', reference: 'EXC-001', gameId: '', gameName: '', createdAt: '2025-01-09T06:45:00Z' },
  { id: 't17', walletId: 'w9', type: 'deposit', amount: 200.00, balanceBefore: 250.75, balanceAfter: 450.75, currency: 'USD', status: 'pending', reference: 'DEP-006', gameId: '', gameName: '', createdAt: '2025-01-10T08:00:00Z' },
  { id: 't18', walletId: 'w12', type: 'bet', amount: -300.00, balanceBefore: 10100.30, balanceAfter: 9800.30, currency: 'USD', status: 'completed', reference: 'BET-004', gameId: 'g4', gameName: 'Poker Hold\'em', createdAt: '2025-01-15T16:30:00Z' },
]

const currencyRates = [
  { from: 'USD', to: 'EUR', rate: 0.9231 },
  { from: 'USD', to: 'GBP', rate: 0.7938 },
  { from: 'USD', to: 'BTC', rate: 0.0000097 },
  { from: 'USD', to: 'ETH', rate: 0.000276 },
  { from: 'USD', to: 'USDT', rate: 1.0000 },
  { from: 'USD', to: 'USDC', rate: 1.0000 },
  { from: 'USD', to: 'LTC', rate: 0.01084 },
  { from: 'EUR', to: 'USD', rate: 1.0833 },
  { from: 'EUR', to: 'GBP', rate: 0.8600 },
  { from: 'GBP', to: 'USD', rate: 1.2598 },
  { from: 'BTC', to: 'USD', rate: 103092.78 },
  { from: 'ETH', to: 'USD', rate: 3623.19 },
  { from: 'LTC', to: 'USD', rate: 92.25 },
  { from: 'USDT', to: 'USD', rate: 1.0000 },
  { from: 'USDC', to: 'USD', rate: 1.0000 },
]

const paymentMethods = [
  { id: 'pm1', playerId: 'p1', playerName: 'Alex Mercer', type: 'Visa', provider: 'Visa', label: 'Visa ending 4242', identifier: '****4242', isDefault: true, isActive: true, currency: 'USD' },
  { id: 'pm2', playerId: 'p1', playerName: 'Alex Mercer', type: 'Crypto', provider: 'Coinbase', label: 'BTC Wallet', identifier: 'bc1q...x7kf', isDefault: true, isActive: true, currency: 'BTC' },
  { id: 'pm3', playerId: 'p2', playerName: 'Sofia Reyes', type: 'Mastercard', provider: 'Mastercard', label: 'Mastercard ending 8888', identifier: '****8888', isDefault: true, isActive: true, currency: 'EUR' },
  { id: 'pm4', playerId: 'p2', playerName: 'Sofia Reyes', type: 'E-Wallet', provider: 'Skrill', label: 'Skrill Account', identifier: 'sofia.r@***.com', isDefault: false, isActive: true, currency: 'EUR' },
  { id: 'pm5', playerId: 'p3', playerName: 'James Kato', type: 'Bank', provider: 'HSBC', label: 'HSBC Current', identifier: '****6789', isDefault: true, isActive: true, currency: 'GBP' },
  { id: 'pm6', playerId: 'p3', playerName: 'James Kato', type: 'Crypto', provider: 'MetaMask', label: 'ETH Wallet', identifier: '0x3F...a92C', isDefault: true, isActive: true, currency: 'ETH' },
  { id: 'pm7', playerId: 'p4', playerName: 'Lena Voss', type: 'Visa', provider: 'Visa', label: 'Visa ending 1234', identifier: '****1234', isDefault: true, isActive: true, currency: 'USD' },
  { id: 'pm8', playerId: 'p4', playerName: 'Lena Voss', type: 'Crypto', provider: 'Binance', label: 'LTC Wallet', identifier: 'ltc1...p4mv', isDefault: false, isActive: false, currency: 'LTC' },
  { id: 'pm9', playerId: 'p5', playerName: 'Ravi Sharma', type: 'E-Wallet', provider: 'PayPal', label: 'PayPal Account', identifier: 'ravi.s@***.com', isDefault: true, isActive: true, currency: 'USD' },
  { id: 'pm10', playerId: 'p6', playerName: 'Mia Chen', type: 'Prepaid', provider: 'Paysafecard', label: 'Paysafecard', identifier: '****3321', isDefault: true, isActive: true, currency: 'USDC' },
  { id: 'pm11', playerId: 'p8', playerName: 'Yuki Tanaka', type: 'Bank', provider: 'MUFG', label: 'MUFG Savings', identifier: '****5555', isDefault: true, isActive: true, currency: 'USD' },
  { id: 'pm12', playerId: 'p8', playerName: 'Yuki Tanaka', type: 'Mastercard', provider: 'Mastercard', label: 'Mastercard ending 7777', identifier: '****7777', isDefault: false, isActive: false, currency: 'USD' },
]

function computeTotals() {
  const byCurrency: Record<string, { balance: number; count: number }> = {}
  let totalBalance = 0
  let totalAvailable = 0
  let totalLocked = 0
  let totalBonus = 0

  for (const w of wallets) {
    const fiatCurrencies = ['USD', 'EUR', 'GBP', 'USDT', 'USDC']
    const usdRate: Record<string, number> = {
      USD: 1, EUR: 1.0833, GBP: 1.2598, BTC: 103092.78,
      ETH: 3623.19, USDT: 1, USDC: 1, LTC: 92.25,
    }

    if (!byCurrency[w.currency]) {
      byCurrency[w.currency] = { balance: 0, count: 0 }
    }
    byCurrency[w.currency].balance += w.balance
    byCurrency[w.currency].count += 1

    const rate = fiatCurrencies.includes(w.currency) ? usdRate[w.currency] : usdRate[w.currency]
    totalBalance += w.balance * rate
    totalAvailable += w.availableBalance * rate
    totalLocked += w.lockedBalance * rate
    totalBonus += w.bonusBalance * rate
  }

  return { totalBalance, totalAvailable, totalLocked, totalBonus, byCurrency }
}

export async function GET() {
  try {
    const totals = computeTotals()
    return NextResponse.json({ wallets, transactions, currencyRates, totals, paymentMethods })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch wallet data' }, { status: 500 })
  }
}
