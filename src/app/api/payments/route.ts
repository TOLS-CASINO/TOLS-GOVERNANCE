import { NextResponse } from 'next/server'

const now = new Date()
const ts = (minsAgo: number) => new Date(now.getTime() - minsAgo * 60000).toISOString()

const deposits = [
  { id: 'dep-001', playerId: 'p-101', playerName: 'Alex_Morgan', walletId: 'w-201', amount: 500.00, currency: 'USD', method: 'card', provider: 'Stripe', status: 'confirmed', txHash: '0xabc123def456', feeAmount: 14.50, netAmount: 485.50, createdAt: ts(5), confirmedAt: ts(3), expiresAt: ts(55) },
  { id: 'dep-002', playerId: 'p-102', playerName: 'CryptoKing99', walletId: 'w-202', amount: 1.5, currency: 'BTC', method: 'crypto', provider: 'Coinbase', status: 'pending', txHash: '0xbtc789xyz012', feeAmount: 0.015, netAmount: 1.485, createdAt: ts(2), confirmedAt: '', expiresAt: ts(58) },
  { id: 'dep-003', playerId: 'p-103', playerName: 'Sarah_Lee', walletId: 'w-203', amount: 250.00, currency: 'EUR', method: 'e_wallet', provider: 'Skrill', status: 'processing', txHash: '0xew345rf678', feeAmount: 5.00, netAmount: 245.00, createdAt: ts(10), confirmedAt: '', expiresAt: ts(50) },
  { id: 'dep-004', playerId: 'p-104', playerName: 'BigWinner_X', walletId: 'w-204', amount: 5000.00, currency: 'USD', method: 'bank_transfer', provider: 'Neteller', status: 'confirmed', txHash: '0xbnk901ab234', feeAmount: 25.00, netAmount: 4975.00, createdAt: ts(30), confirmedAt: ts(25), expiresAt: ts(30) },
  { id: 'dep-005', playerId: 'p-105', playerName: 'Luna_Star', walletId: 'w-205', amount: 100.00, currency: 'USD', method: 'card', provider: 'Stripe', status: 'failed', txHash: '', feeAmount: 0, netAmount: 0, createdAt: ts(15), confirmedAt: '', expiresAt: ts(45) },
  { id: 'dep-006', playerId: 'p-106', playerName: 'Mike_Chase', walletId: 'w-206', amount: 750.00, currency: 'GBP', method: 'e_wallet', provider: 'PayPal', status: 'confirmed', txHash: '0xpp567cd890', feeAmount: 18.75, netAmount: 731.25, createdAt: ts(60), confirmedAt: ts(55), expiresAt: ts(0) },
  { id: 'dep-007', playerId: 'p-107', playerName: 'Diamond_Hand', walletId: 'w-207', amount: 0.8, currency: 'ETH', method: 'crypto', provider: 'MoonPay', status: 'confirmed', txHash: '0xeth111aaa222', feeAmount: 0.008, netAmount: 0.792, createdAt: ts(45), confirmedAt: ts(40), expiresAt: ts(15) },
  { id: 'dep-008', playerId: 'p-108', playerName: 'Rookie_22', walletId: 'w-208', amount: 50.00, currency: 'USD', method: 'card', provider: 'Stripe', status: 'expired', txHash: '', feeAmount: 0, netAmount: 0, createdAt: ts(120), confirmedAt: '', expiresAt: ts(60) },
  { id: 'dep-009', playerId: 'p-109', playerName: 'Vegas_Vixen', walletId: 'w-209', amount: 1200.00, currency: 'USD', method: 'bank_transfer', provider: 'Neteller', status: 'confirmed', txHash: '0xvg444bbb555', feeAmount: 12.00, netAmount: 1188.00, createdAt: ts(90), confirmedAt: ts(80), expiresAt: ts(0) },
  { id: 'dep-010', playerId: 'p-110', playerName: 'Ace_High', walletId: 'w-210', amount: 300.00, currency: 'EUR', method: 'e_wallet', provider: 'Skrill', status: 'pending', txHash: '', feeAmount: 6.00, netAmount: 294.00, createdAt: ts(1), confirmedAt: '', expiresAt: ts(59) },
]

const withdrawals = [
  { id: 'wd-001', playerId: 'p-101', playerName: 'Alex_Morgan', walletId: 'w-201', amount: 1200.00, currency: 'USD', method: 'bank_transfer', provider: 'Neteller', status: 'completed', approvedBy: 'admin_01', approvedAt: ts(40), txHash: '0xwd111ccc222', feeAmount: 30.00, netAmount: 1170.00, rejectionReason: '', createdAt: ts(50), processedAt: ts(35) },
  { id: 'wd-002', playerId: 'p-102', playerName: 'CryptoKing99', walletId: 'w-202', amount: 3.2, currency: 'BTC', method: 'crypto', provider: 'Coinbase', status: 'pending', approvedBy: '', approvedAt: '', txHash: '', feeAmount: 0.001, netAmount: 3.199, rejectionReason: '', createdAt: ts(3), processedAt: '' },
  { id: 'wd-003', playerId: 'p-103', playerName: 'Sarah_Lee', walletId: 'w-203', amount: 500.00, currency: 'EUR', method: 'e_wallet', provider: 'Skrill', status: 'under_review', approvedBy: '', approvedAt: '', txHash: '', feeAmount: 10.00, netAmount: 490.00, rejectionReason: '', createdAt: ts(8), processedAt: '' },
  { id: 'wd-004', playerId: 'p-104', playerName: 'BigWinner_X', walletId: 'w-204', amount: 15000.00, currency: 'USD', method: 'bank_transfer', provider: 'Neteller', status: 'approved', approvedBy: 'admin_02', approvedAt: ts(20), txHash: '', feeAmount: 75.00, netAmount: 14925.00, rejectionReason: '', createdAt: ts(25), processedAt: '' },
  { id: 'wd-005', playerId: 'p-105', playerName: 'Luna_Star', walletId: 'w-205', amount: 200.00, currency: 'USD', method: 'card', provider: 'Stripe', status: 'rejected', approvedBy: 'admin_01', approvedAt: ts(18), txHash: '', feeAmount: 0, netAmount: 0, rejectionReason: 'Insufficient wagering requirement not met', createdAt: ts(22), processedAt: '' },
  { id: 'wd-006', playerId: 'p-106', playerName: 'Mike_Chase', walletId: 'w-206', amount: 800.00, currency: 'GBP', method: 'e_wallet', provider: 'PayPal', status: 'processing', approvedBy: 'admin_02', approvedAt: ts(55), txHash: '0xpp333ddd444', feeAmount: 20.00, netAmount: 780.00, rejectionReason: '', createdAt: ts(65), processedAt: '' },
  { id: 'wd-007', playerId: 'p-107', playerName: 'Diamond_Hand', walletId: 'w-207', amount: 2.0, currency: 'ETH', method: 'crypto', provider: 'Coinbase', status: 'completed', approvedBy: 'admin_01', approvedAt: ts(80), txHash: '0xeth555fff666', feeAmount: 0.02, netAmount: 1.98, rejectionReason: '', createdAt: ts(90), processedAt: ts(75) },
  { id: 'wd-008', playerId: 'p-108', playerName: 'Rookie_22', walletId: 'w-208', amount: 75.00, currency: 'USD', method: 'card', provider: 'Stripe', status: 'cancelled', approvedBy: '', approvedAt: '', txHash: '', feeAmount: 0, netAmount: 0, rejectionReason: 'Cancelled by player', createdAt: ts(100), processedAt: '' },
]

const providers = [
  { id: 'prov-001', name: 'Stripe', type: 'fiat', isActive: true, minDeposit: 10, maxDeposit: 50000, minWithdrawal: 20, maxWithdrawal: 25000, feePercent: 2.9, feeFixed: 0.30, processingTime: 'Instant', supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'], logo: '💳' },
  { id: 'prov-002', name: 'Coinbase', type: 'crypto', isActive: true, minDeposit: 0.001, maxDeposit: 100, minWithdrawal: 0.001, maxWithdrawal: 50, feePercent: 1.0, feeFixed: 0, processingTime: '10-30 min', supportedCurrencies: ['BTC', 'ETH', 'USDC', 'USDT'], logo: '₿' },
  { id: 'prov-003', name: 'MoonPay', type: 'crypto', isActive: true, minDeposit: 30, maxDeposit: 25000, minWithdrawal: 50, maxWithdrawal: 10000, feePercent: 3.5, feeFixed: 4.50, processingTime: '5-20 min', supportedCurrencies: ['BTC', 'ETH', 'USD', 'EUR'], logo: '🌙' },
  { id: 'prov-004', name: 'Neteller', type: 'fiat', isActive: true, minDeposit: 20, maxDeposit: 50000, minWithdrawal: 50, maxWithdrawal: 30000, feePercent: 1.5, feeFixed: 0, processingTime: '1-3 hours', supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD'], logo: '🟢' },
  { id: 'prov-005', name: 'Skrill', type: 'fiat', isActive: true, minDeposit: 10, maxDeposit: 30000, minWithdrawal: 20, maxWithdrawal: 20000, feePercent: 1.45, feeFixed: 0, processingTime: 'Instant', supportedCurrencies: ['USD', 'EUR', 'GBP'], logo: '💜' },
  { id: 'prov-006', name: 'PayPal', type: 'hybrid', isActive: false, minDeposit: 10, maxDeposit: 10000, minWithdrawal: 20, maxWithdrawal: 5000, feePercent: 2.9, feeFixed: 0.30, processingTime: '1-2 hours', supportedCurrencies: ['USD', 'EUR', 'GBP', 'AUD'], logo: '🅿️' },
]

const stats = {
  totalDeposits: 8251.30,
  totalWithdrawals: 17975.20,
  pendingDeposits: 2,
  pendingWithdrawals: 1,
  approvalQueue: 2,
  totalFees: 106.27,
  successRate: 85.7,
  avgProcessingTime: 12.4,
  byMethod: {
    card: { count: 4, total: 850.00 },
    crypto: { count: 3, total: 6800.00 },
    bank_transfer: { count: 2, total: 5500.00 },
    e_wallet: { count: 3, total: 1100.00 },
  },
  byProvider: {
    Stripe: { count: 4, total: 850.00 },
    Coinbase: { count: 2, total: 4700.00 },
    MoonPay: { count: 1, total: 2100.00 },
    Neteller: { count: 2, total: 5500.00 },
    Skrill: { count: 2, total: 550.00 },
    PayPal: { count: 1, total: 750.00 },
  },
}

export async function GET() {
  return NextResponse.json({ deposits, withdrawals, providers, stats })
}
