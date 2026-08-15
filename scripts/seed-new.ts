import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ─── Helpers ───────────────────────────────────────────────────────────────
function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min
}
function randInt(min: number, max: number): number {
  return Math.floor(rand(min, max + 1))
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}
function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}
function round2(n: number): number {
  return Math.round(n * 100) / 100
}
function round4(n: number): number {
  return Math.round(n * 10000) / 10000
}
function round8(n: number): number {
  return Math.round(n * 1e8) / 1e8
}
function daysAgo(d: number): Date {
  return new Date(Date.now() - d * 24 * 60 * 60 * 1000)
}
function minsAgo(m: number): Date {
  return new Date(Date.now() - m * 60 * 1000)
}
function secsAgo(s: number): Date {
  return new Date(Date.now() - s * 1000)
}
function hoursAgo(h: number): Date {
  return new Date(Date.now() - h * 60 * 60 * 1000)
}

// ─── Constants ─────────────────────────────────────────────────────────────
const GAME_NAMES = [
  'Mega Moolah', 'Starburst', 'Book of Dead', 'Lightning Roulette',
  'Blackjack VIP', 'Gates of Olympus', 'Sweet Bonanza', 'Gonzo\'s Quest',
  'Divine Fortune', 'Cleopatra Gold', 'Roulette Royal', 'Baccarat Squeeze',
]
const GAME_IDS = GAME_NAMES.map(g => g.toLowerCase().replace(/[^a-z0-9]+/g, '_'))

const COUNTRY_DATA: Record<string, { lat: number; lng: number; cities: string[] }> = {
  US: { lat: 37.0902, lng: -95.7129, cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami'] },
  UK: { lat: 51.5074, lng: -0.1278, cities: ['London', 'Manchester', 'Birmingham', 'Edinburgh', 'Leeds'] },
  DE: { lat: 51.1657, lng: 10.4515, cities: ['Berlin', 'Munich', 'Frankfurt', 'Hamburg', 'Cologne'] },
  CA: { lat: 56.1304, lng: -106.3468, cities: ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa'] },
  AU: { lat: -25.2744, lng: 133.7751, cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'] },
  JP: { lat: 36.2048, lng: 138.2529, cities: ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama', 'Nagoya'] },
  BR: { lat: -14.2350, lng: -51.9253, cities: ['São Paulo', 'Rio de Janeiro', 'Brasilia', 'Salvador', 'Curitiba'] },
  FR: { lat: 46.2276, lng: 2.2137, cities: ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice'] },
  IT: { lat: 41.8719, lng: 12.5674, cities: ['Rome', 'Milan', 'Naples', 'Florence', 'Venice'] },
  ES: { lat: 40.4637, lng: -3.7492, cities: ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Bilbao'] },
}

const DEVICES = ['desktop', 'mobile', 'tablet']
const BROWSERS = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera']
const OS_LIST = ['Windows 11', 'Windows 10', 'macOS 14', 'macOS 13', 'iOS 17', 'iOS 16', 'Android 14', 'Android 13', 'Linux Ubuntu']
const ENTRY_POINTS = ['homepage', 'direct', 'affiliate', 'promotion']

// ─── Main ──────────────────────────────────────────────────────────────────
async function main() {
  console.log('🎲 Seeding NEW TOLS Platform models with realistic casino data...\n')

  // ── Find existing players ──────────────────────────────────────────────
  const players = await prisma.playerProfile.findMany({
    select: { id: true, username: true, country: true },
    orderBy: { registeredAt: 'asc' },
    take: 20,
  })
  if (players.length < 20) {
    console.error(`❌ Expected 20 players, found ${players.length}. Run the base seed first.`)
    process.exit(1)
  }
  console.log(`✓ Found ${players.length} players\n`)

  // ── Clear existing data ────────────────────────────────────────────────
  console.log('🧹 Clearing existing data from new models...')
  // Delete in dependency order (child → parent)
  await prisma.walletTransaction.deleteMany()
  await prisma.depositRequest.deleteMany()
  await prisma.withdrawalRequest.deleteMany()
  await prisma.paymentMethod.deleteMany()
  await prisma.wallet.deleteMany()
  await prisma.paymentProvider.deleteMany()
  await prisma.currencyRate.deleteMany()
  await prisma.playerSession.deleteMany()
  await prisma.geoLocation.deleteMany()
  await prisma.liveEvent.deleteMany()
  await prisma.serverNode.deleteMany()
  console.log('✓ All new model data cleared\n')

  // ══════════════════════════════════════════════════════════════════════
  // 1. WALLET (2-3 per player)
  // ══════════════════════════════════════════════════════════════════════
  console.log('💰 Creating Wallets...')
  const walletMap: Map<string, string[]> = new Map() // playerId -> walletIds
  const allWallets: { id: string; playerId: string; currency: string; balance: number }[] = []

  for (let i = 0; i < players.length; i++) {
    const p = players[i]
    const walletIds: string[] = []

    // Primary wallet: USD
    const usdBalance = round2(rand(500, 50000))
    const usdLocked = round2(usdBalance * rand(0.05, 0.2))
    const usdBonus = round2(usdBalance * rand(0, 0.15))
    const usdAvailable = round2(usdBalance - usdLocked - usdBonus)

    const usdWallet = await prisma.wallet.create({
      data: {
        playerId: p.id,
        currency: 'USD',
        balance: usdBalance,
        availableBalance: usdAvailable,
        lockedBalance: usdLocked,
        bonusBalance: usdBonus,
        isPrimary: true,
        status: 'active',
        lastDepositAt: daysAgo(rand(0, 7)),
        lastWithdrawAt: daysAgo(rand(1, 7)),
      },
    })
    walletIds.push(usdWallet.id)
    allWallets.push({ id: usdWallet.id, playerId: p.id, currency: 'USD', balance: usdBalance })

    // Secondary wallet: EUR or GBP
    const isEur = i % 2 === 0
    const secondaryCurrency = isEur ? 'EUR' : 'GBP'
    const secondaryRate = isEur ? 0.92 : 0.79
    const secondaryBalance = round2(usdBalance * secondaryRate * rand(0.3, 0.8))
    const secondaryLocked = round2(secondaryBalance * rand(0.02, 0.15))
    const secondaryBonus = round2(secondaryBalance * rand(0, 0.1))
    const secondaryAvailable = round2(secondaryBalance - secondaryLocked - secondaryBonus)

    const secondaryWallet = await prisma.wallet.create({
      data: {
        playerId: p.id,
        currency: secondaryCurrency,
        balance: secondaryBalance,
        availableBalance: secondaryAvailable,
        lockedBalance: secondaryLocked,
        bonusBalance: secondaryBonus,
        isPrimary: false,
        status: 'active',
        lastDepositAt: daysAgo(rand(0, 7)),
        lastWithdrawAt: daysAgo(rand(1, 7)),
      },
    })
    walletIds.push(secondaryWallet.id)
    allWallets.push({ id: secondaryWallet.id, playerId: p.id, currency: secondaryCurrency, balance: secondaryBalance })

    // Some players get crypto wallets (every 3rd player)
    if (i % 3 === 0) {
      const cryptoType = i % 6 === 0 ? 'BTC' : 'ETH'
      let cryptoBalance: number
      if (cryptoType === 'BTC') {
        cryptoBalance = round8(rand(0.01, 2.5))
      } else {
        cryptoBalance = round4(rand(0.5, 10))
      }
      const cryptoLocked = round8(cryptoBalance * rand(0, 0.1))
      const cryptoBonus = 0
      const cryptoAvailable = round8(cryptoBalance - cryptoLocked)

      const cryptoWallet = await prisma.wallet.create({
        data: {
          playerId: p.id,
          currency: cryptoType,
          balance: cryptoBalance,
          availableBalance: cryptoAvailable,
          lockedBalance: cryptoLocked,
          bonusBalance: cryptoBonus,
          isPrimary: false,
          status: 'active',
          lastDepositAt: daysAgo(rand(0, 3)),
          lastWithdrawAt: daysAgo(rand(2, 7)),
        },
      })
      walletIds.push(cryptoWallet.id)
      allWallets.push({ id: cryptoWallet.id, playerId: p.id, currency: cryptoType, balance: cryptoBalance })
    }

    // Some players get USDT wallet (every 5th player)
    if (i % 5 === 0 && i % 3 !== 0) {
      const usdtBalance = round2(rand(100, 10000))
      const usdtWallet = await prisma.wallet.create({
        data: {
          playerId: p.id,
          currency: 'USDT',
          balance: usdtBalance,
          availableBalance: round2(usdtBalance * 0.9),
          lockedBalance: round2(usdtBalance * 0.08),
          bonusBalance: round2(usdtBalance * 0.02),
          isPrimary: false,
          status: 'active',
          lastDepositAt: daysAgo(rand(0, 2)),
        },
      })
      walletIds.push(usdtWallet.id)
      allWallets.push({ id: usdtWallet.id, playerId: p.id, currency: 'USDT', balance: usdtBalance })
    }

    walletMap.set(p.id, walletIds)
  }
  console.log(`✓ Created ${allWallets.length} wallets\n`)

  // ══════════════════════════════════════════════════════════════════════
  // 2. WALLET TRANSACTION (5-10 per wallet)
  // ══════════════════════════════════════════════════════════════════════
  console.log('📊 Creating Wallet Transactions...')
  let txCount = 0
  const TX_TYPES = ['deposit', 'withdrawal', 'bet', 'win', 'bonus', 'cashback']

  for (const wallet of allWallets) {
    const numTx = randInt(5, 10)
    let runningBalance = wallet.balance

    // We'll create transactions going backward from current balance
    // First calculate what the balance was before all transactions
    const txData: { type: string; amount: number; balanceBefore: number; balanceAfter: number }[] = []
    let tempBalance = runningBalance

    for (let t = 0; t < numTx; t++) {
      const type = pick(TX_TYPES)
      let amount: number
      let balanceBefore: number
      let balanceAfter: number

      switch (type) {
        case 'deposit':
          amount = wallet.currency === 'BTC' ? round8(rand(0.001, 0.5)) :
                   wallet.currency === 'ETH' ? round4(rand(0.1, 2)) :
                   round2(rand(50, 5000))
          balanceBefore = tempBalance
          balanceAfter = round2(tempBalance + amount)
          break
        case 'withdrawal':
          amount = wallet.currency === 'BTC' ? round8(rand(0.001, 0.2)) :
                   wallet.currency === 'ETH' ? round4(rand(0.05, 1)) :
                   round2(rand(20, Math.min(2000, tempBalance * 0.5)))
          balanceBefore = tempBalance
          balanceAfter = round2(tempBalance - amount)
          break
        case 'bet':
          amount = wallet.currency === 'BTC' ? round8(rand(0.0001, 0.05)) :
                   wallet.currency === 'ETH' ? round4(rand(0.01, 0.5)) :
                   round2(rand(5, 500))
          balanceBefore = tempBalance
          balanceAfter = round2(tempBalance - amount)
          break
        case 'win':
          amount = wallet.currency === 'BTC' ? round8(rand(0.0002, 0.1)) :
                   wallet.currency === 'ETH' ? round4(rand(0.02, 1.5)) :
                   round2(rand(10, 2000))
          balanceBefore = tempBalance
          balanceAfter = round2(tempBalance + amount)
          break
        case 'bonus':
          amount = wallet.currency === 'BTC' ? 0 :
                   wallet.currency === 'ETH' ? 0 :
                   round2(rand(10, 500))
          if (amount === 0) continue // no BTC/ETH bonuses
          balanceBefore = tempBalance
          balanceAfter = round2(tempBalance + amount)
          break
        case 'cashback':
          amount = wallet.currency === 'BTC' ? 0 :
                   wallet.currency === 'ETH' ? 0 :
                   round2(rand(5, 200))
          if (amount === 0) continue
          balanceBefore = tempBalance
          balanceAfter = round2(tempBalance + amount)
          break
        default:
          continue
      }

      txData.push({ type, amount, balanceBefore, balanceAfter })
      tempBalance = balanceAfter
    }

    // Create transactions (oldest first)
    for (let t = txData.length - 1; t >= 0; t--) {
      const tx = txData[t]
      const isGameTx = tx.type === 'bet' || tx.type === 'win'
      const gameIdx = randInt(0, GAME_NAMES.length - 1)

      await prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: tx.type,
          amount: tx.amount,
          balanceBefore: tx.balanceBefore,
          balanceAfter: tx.balanceAfter,
          currency: wallet.currency,
          status: 'completed',
          reference: `TX-${Date.now().toString(36).toUpperCase()}-${randInt(1000, 9999)}`,
          gameId: isGameTx ? GAME_IDS[gameIdx] : null,
          gameName: isGameTx ? GAME_NAMES[gameIdx] : null,
          createdAt: daysAgo(rand(0, 6) + rand(0, 1)),
        },
      })
      txCount++
    }
  }
  console.log(`✓ Created ${txCount} wallet transactions\n`)

  // ══════════════════════════════════════════════════════════════════════
  // 3. PAYMENT METHOD (2-3 per player)
  // ══════════════════════════════════════════════════════════════════════
  console.log('💳 Creating Payment Methods...')
  let pmCount = 0

  for (let i = 0; i < players.length; i++) {
    const p = players[i]
    const methods: { type: string; provider: string; label: string; identifier: string; isDefault: boolean; currency: string }[] = []

    // Every player gets a Visa or Mastercard
    const cardType = i % 2 === 0 ? 'visa' : 'mastercard'
    const lastFour = String(randInt(1000, 9999))
    methods.push({
      type: cardType,
      provider: 'stripe',
      label: `${cardType === 'visa' ? 'Visa' : 'Mastercard'} ****${lastFour}`,
      identifier: lastFour,
      isDefault: true,
      currency: 'USD',
    })

    // Second method: varies by player
    if (i % 3 === 0) {
      // Crypto wallet
      const cryptoType = i % 6 === 0 ? 'BTC' : 'ETH'
      const addr = cryptoType === 'BTC'
        ? `bc1q${Array.from({length: 34}, () => '0123456789abcdefghijklmnopqrstuvwxyz'[randInt(0,31)]).join('')}`
        : `0x${Array.from({length: 40}, () => '0123456789abcdef'[randInt(0,15)]).join('')}`
      methods.push({
        type: 'crypto_wallet',
        provider: 'coinbase',
        label: `${cryptoType} Wallet`,
        identifier: addr.slice(0, 12) + '...',
        isDefault: false,
        currency: cryptoType,
      })
    } else if (i % 3 === 1) {
      // Bank transfer
      methods.push({
        type: 'bank_transfer',
        provider: 'stripe',
        label: `Bank ****${String(randInt(1000, 9999))}`,
        identifier: String(randInt(1000, 9999)),
        isDefault: false,
        currency: 'USD',
      })
    } else {
      // E-wallet
      const ewallet = i % 2 === 0 ? 'skrill' : 'neteller'
      methods.push({
        type: 'e_wallet',
        provider: ewallet,
        label: `${ewallet === 'skrill' ? 'Skrill' : 'Neteller'} (${p.username.toLowerCase()}@email.com)`,
        identifier: `${p.username.toLowerCase()}@email.com`,
        isDefault: false,
        currency: 'USD',
      })
    }

    // Third method for some players
    if (i % 4 === 0) {
      methods.push({
        type: 'e_wallet',
        provider: 'paypal',
        label: `PayPal (${p.username.toLowerCase()}@paypal.com)`,
        identifier: `${p.username.toLowerCase()}@paypal.com`,
        isDefault: false,
        currency: 'USD',
      })
    }

    for (const m of methods) {
      await prisma.paymentMethod.create({
        data: {
          playerId: p.id,
          type: m.type,
          provider: m.provider,
          label: m.label,
          identifier: m.identifier,
          isDefault: m.isDefault,
          isActive: true,
          currency: m.currency,
        },
      })
      pmCount++
    }
  }
  console.log(`✓ Created ${pmCount} payment methods\n`)

  // ══════════════════════════════════════════════════════════════════════
  // 4. PAYMENT PROVIDER (6 providers)
  // ══════════════════════════════════════════════════════════════════════
  console.log('🏦 Creating Payment Providers...')
  const providerIds: string[] = []

  const providers = [
    {
      name: 'Stripe', type: 'fiat', isActive: true,
      minDeposit: 10, maxDeposit: 50000, minWithdrawal: 20, maxWithdrawal: 100000,
      feePercent: 2.9, feeFixed: 0.30, processingTime: 'instant',
      supportedCurrencies: JSON.stringify(['USD', 'EUR', 'GBP']),
    },
    {
      name: 'Coinbase Commerce', type: 'crypto', isActive: true,
      minDeposit: 5, maxDeposit: 100000, minWithdrawal: 10, maxWithdrawal: 500000,
      feePercent: 1.0, feeFixed: 0, processingTime: 'instant',
      supportedCurrencies: JSON.stringify(['BTC', 'ETH', 'USDT', 'USDC']),
    },
    {
      name: 'MoonPay', type: 'hybrid', isActive: true,
      minDeposit: 20, maxDeposit: 25000, minWithdrawal: 30, maxWithdrawal: 50000,
      feePercent: 3.5, feeFixed: 5.0, processingTime: '1-3_days',
      supportedCurrencies: JSON.stringify(['USD', 'EUR', 'GBP', 'BTC', 'ETH', 'USDT', 'USDC']),
    },
    {
      name: 'Neteller', type: 'fiat', isActive: true,
      minDeposit: 10, maxDeposit: 50000, minWithdrawal: 20, maxWithdrawal: 50000,
      feePercent: 2.5, feeFixed: 0, processingTime: 'instant',
      supportedCurrencies: JSON.stringify(['USD', 'EUR', 'GBP']),
    },
    {
      name: 'Skrill', type: 'fiat', isActive: true,
      minDeposit: 10, maxDeposit: 50000, minWithdrawal: 20, maxWithdrawal: 50000,
      feePercent: 1.9, feeFixed: 0, processingTime: 'instant',
      supportedCurrencies: JSON.stringify(['USD', 'EUR', 'GBP']),
    },
    {
      name: 'PayPal', type: 'fiat', isActive: true,
      minDeposit: 10, maxDeposit: 10000, minWithdrawal: 20, maxWithdrawal: 25000,
      feePercent: 2.9, feeFixed: 0.30, processingTime: '1-3_days',
      supportedCurrencies: JSON.stringify(['USD', 'EUR', 'GBP']),
    },
  ]

  for (const prov of providers) {
    const created = await prisma.paymentProvider.create({ data: prov })
    providerIds.push(created.id)
  }
  console.log(`✓ Created ${providers.length} payment providers\n`)

  // ══════════════════════════════════════════════════════════════════════
  // 5. DEPOSIT REQUEST (15 deposits)
  // ══════════════════════════════════════════════════════════════════════
  console.log('📥 Creating Deposit Requests...')
  const depositStatuses = ['pending', 'pending', 'pending', 'processing', 'processing', 'confirmed', 'confirmed', 'confirmed', 'confirmed', 'confirmed', 'confirmed', 'confirmed', 'confirmed', 'failed', 'expired']
  const depositMethods = ['card', 'crypto', 'bank_transfer', 'e_wallet']
  const depositProviders = ['stripe', 'coinbase', 'moonpay', 'neteller', 'skrill', 'paypal']
  const depositCurrencies = ['USD', 'EUR', 'GBP', 'BTC', 'ETH', 'USDT']

  for (let i = 0; i < 15; i++) {
    const p = pick(players)
    const pWallets = walletMap.get(p.id)!
    const walletId = pick(pWallets)
    const walletInfo = allWallets.find(w => w.id === walletId)!
    const status = depositStatuses[i]
    const method = pick(depositMethods)
    const provider = pick(depositProviders)

    // Amount realistic for currency
    let amount: number
    let currency: string
    if (method === 'crypto') {
      currency = pick(['BTC', 'ETH', 'USDT'])
      amount = currency === 'BTC' ? round8(rand(0.01, 0.5)) :
               currency === 'ETH' ? round4(rand(0.1, 5)) :
               round2(rand(50, 5000))
    } else {
      currency = pick(['USD', 'EUR', 'GBP'])
      amount = round2(rand(50, 10000))
    }

    // Fee calculation
    const provData = providers.find(pr => pr.name.toLowerCase().includes(provider)) || providers[0]
    const feeAmount = round2(amount * provData.feePercent / 100 + provData.feeFixed)
    const netAmount = round2(amount - feeAmount)

    const confirmedAt = status === 'confirmed' ? minsAgo(randInt(1, 120)) : null
    const expiresAt = status === 'pending' ? hoursAgo(-1) : // 1 hour from now
                      status === 'expired' ? minsAgo(30) : null

    await prisma.depositRequest.create({
      data: {
        playerId: p.id,
        walletId: walletId,
        amount,
        currency,
        method,
        provider,
        status,
        txHash: method === 'crypto' ? `0x${Array.from({length: 64}, () => '0123456789abcdef'[randInt(0,15)]).join('')}` : null,
        feeAmount,
        netAmount,
        confirmedAt,
        expiresAt,
        createdAt: minsAgo(randInt(1, 1440)),
      },
    })
  }
  console.log('✓ Created 15 deposit requests\n')

  // ══════════════════════════════════════════════════════════════════════
  // 6. WITHDRAWAL REQUEST (12 withdrawals)
  // ══════════════════════════════════════════════════════════════════════
  console.log('📤 Creating Withdrawal Requests...')
  const withdrawalStatuses: { status: string; approvedBy?: string; rejectionReason?: string }[] = [
    { status: 'pending' },
    { status: 'pending' },
    { status: 'under_review' },
    { status: 'under_review' },
    { status: 'approved', approvedBy: 'Finance Manager' },
    { status: 'processing', approvedBy: 'Senior Controller' },
    { status: 'completed', approvedBy: 'Finance Manager' },
    { status: 'completed', approvedBy: 'Controller' },
    { status: 'completed', approvedBy: 'Finance Manager' },
    { status: 'completed', approvedBy: 'Senior Controller' },
    { status: 'completed', approvedBy: 'Finance Manager' },
    { status: 'rejected', approvedBy: 'Compliance Officer', rejectionReason: 'Failed KYC verification - document expired' },
  ]

  for (let i = 0; i < 12; i++) {
    const p = pick(players)
    const pWallets = walletMap.get(p.id)!
    const walletId = pick(pWallets)
    const ws = withdrawalStatuses[i]
    const method = pick(depositMethods)
    const provider = pick(depositProviders)
    const currency = pick(['USD', 'EUR', 'GBP'])
    const amount = round2(rand(50, 5000))
    const feeAmount = round2(amount * rand(0.01, 0.03))
    const netAmount = round2(amount - feeAmount)

    await prisma.withdrawalRequest.create({
      data: {
        playerId: p.id,
        walletId: walletId,
        amount,
        currency,
        method,
        provider,
        status: ws.status,
        approvedBy: ws.approvedBy || null,
        approvedAt: ws.approvedBy ? minsAgo(randInt(5, 120)) : null,
        txHash: ws.status === 'completed' ? `0x${Array.from({length: 64}, () => '0123456789abcdef'[randInt(0,15)]).join('')}` : null,
        feeAmount,
        netAmount,
        rejectionReason: ws.rejectionReason || null,
        processedAt: ws.status === 'completed' ? minsAgo(randInt(1, 60)) : null,
        createdAt: minsAgo(randInt(10, 1440)),
      },
    })
  }
  console.log('✓ Created 12 withdrawal requests\n')

  // ══════════════════════════════════════════════════════════════════════
  // 7. CURRENCY RATE (15 rates)
  // ══════════════════════════════════════════════════════════════════════
  console.log('💱 Creating Currency Rates...')

  const rates = [
    { fromCurrency: 'USD', toCurrency: 'EUR', rate: 0.9215 },
    { fromCurrency: 'USD', toCurrency: 'GBP', rate: 0.7923 },
    { fromCurrency: 'USD', toCurrency: 'BTC', rate: 0.00000971 },
    { fromCurrency: 'USD', toCurrency: 'ETH', rate: 0.000352 },
    { fromCurrency: 'USD', toCurrency: 'USDT', rate: 1.0001 },
    { fromCurrency: 'USD', toCurrency: 'USDC', rate: 1.0000 },
    { fromCurrency: 'USD', toCurrency: 'LTC', rate: 0.01087 },
    { fromCurrency: 'EUR', toCurrency: 'USD', rate: 1.0852 },
    { fromCurrency: 'EUR', toCurrency: 'GBP', rate: 0.8601 },
    { fromCurrency: 'GBP', toCurrency: 'USD', rate: 1.2622 },
    { fromCurrency: 'BTC', toCurrency: 'USD', rate: 103092.78 },
    { fromCurrency: 'ETH', toCurrency: 'USD', rate: 2841.35 },
    { fromCurrency: 'USDT', toCurrency: 'USD', rate: 0.9999 },
    { fromCurrency: 'USDC', toCurrency: 'USD', rate: 1.0000 },
    { fromCurrency: 'LTC', toCurrency: 'USD', rate: 92.04 },
  ]

  for (const r of rates) {
    await prisma.currencyRate.create({
      data: {
        fromCurrency: r.fromCurrency,
        toCurrency: r.toCurrency,
        rate: r.rate,
        source: 'api',
      },
    })
  }
  console.log(`✓ Created ${rates.length} currency rates\n`)

  // ══════════════════════════════════════════════════════════════════════
  // 8. PLAYER SESSION (30 sessions: 20 active, 5 idle, 5 ended)
  // ══════════════════════════════════════════════════════════════════════
  console.log('🎮 Creating Player Sessions...')
  const sessionCountries = ['US', 'UK', 'DE', 'CA', 'AU', 'JP', 'BR', 'FR', 'IT', 'ES']

  for (let i = 0; i < 30; i++) {
    const p = players[i % 20]
    const country = sessionCountries[i % sessionCountries.length]
    const cd = COUNTRY_DATA[country] || COUNTRY_DATA['US']
    const city = pick(cd.cities)
    const gameIdx = randInt(0, GAME_NAMES.length - 1)
    const device = pick(DEVICES)

    let status: string
    let endedAt: Date | null = null
    let startedAt: Date
    let lastActivityAt: Date

    if (i < 20) {
      status = 'active'
      startedAt = minsAgo(randInt(5, 180))
      lastActivityAt = minsAgo(randInt(0, 5))
    } else if (i < 25) {
      status = 'idle'
      startedAt = minsAgo(randInt(30, 300))
      lastActivityAt = minsAgo(randInt(10, 30))
    } else {
      status = 'ended'
      startedAt = minsAgo(randInt(60, 480))
      lastActivityAt = minsAgo(randInt(5, 60))
      endedAt = lastActivityAt
    }

    const durationMins = Math.round((lastActivityAt.getTime() - startedAt.getTime()) / 60000)
    const spinsPlayed = Math.max(1, Math.round(durationMins * rand(0.5, 3)))
    const wagerAmount = round2(spinsPlayed * rand(0.5, 10))
    const winAmount = round2(wagerAmount * rand(0.2, 1.5))

    await prisma.playerSession.create({
      data: {
        playerId: p.id,
        gameId: GAME_IDS[gameIdx],
        gameName: GAME_NAMES[gameIdx],
        ipAddress: `${randInt(1,255)}.${randInt(1,255)}.${randInt(1,255)}.${randInt(1,255)}`,
        country,
        city,
        latitude: cd.lat + rand(-3, 3),
        longitude: cd.lng + rand(-3, 3),
        deviceType: device,
        browser: pick(BROWSERS),
        os: pick(OS_LIST.filter(o => device === 'mobile' ? o.includes('iOS') || o.includes('Android') : !o.includes('iOS') && !o.includes('Android'))),
        entryPoint: pick(ENTRY_POINTS),
        wagerAmount,
        winAmount,
        spinsPlayed,
        startedAt,
        lastActivityAt,
        endedAt,
        status,
      },
    })
  }
  console.log('✓ Created 30 player sessions\n')

  // ══════════════════════════════════════════════════════════════════════
  // 9. GEO LOCATION (per player - 1 each)
  // ══════════════════════════════════════════════════════════════════════
  console.log('🌍 Creating Geo Locations...')

  const isps = ['Comcast', 'BT Group', 'Deutsche Telekom', 'Bell Canada', 'Telstra', 'NTT Communications', 'Vivo Telecom', 'Orange France', 'Telecom Italia', 'Movistar']
  const timezones = ['America/New_York', 'Europe/London', 'Europe/Berlin', 'America/Toronto', 'Australia/Sydney', 'Asia/Tokyo', 'America/Sao_Paulo', 'Europe/Paris', 'Europe/Rome', 'Europe/Madrid']

  for (let i = 0; i < players.length; i++) {
    const p = players[i]
    const countryCodes = ['US', 'UK', 'DE', 'CA', 'AU', 'JP', 'BR', 'FR', 'IT', 'ES']
    const cc = countryCodes[i % countryCodes.length]
    const cd = COUNTRY_DATA[cc]
    const city = pick(cd.cities)

    await prisma.geoLocation.create({
      data: {
        playerId: p.id,
        country: cd.cities[0] === 'New York' ? 'United States' :
                 cc === 'UK' ? 'United Kingdom' :
                 cc === 'DE' ? 'Germany' :
                 cc === 'CA' ? 'Canada' :
                 cc === 'AU' ? 'Australia' :
                 cc === 'JP' ? 'Japan' :
                 cc === 'BR' ? 'Brazil' :
                 cc === 'FR' ? 'France' :
                 cc === 'IT' ? 'Italy' : 'Spain',
        countryCode: cc,
        city,
        region: cc === 'US' ? pick(['NY', 'CA', 'TX', 'FL', 'IL']) :
                cc === 'UK' ? pick(['England', 'Scotland', 'Wales']) :
                cc === 'DE' ? pick(['Bavaria', 'Hesse', 'Berlin']) :
                cc === 'CA' ? pick(['Ontario', 'British Columbia', 'Quebec']) :
                cc === 'AU' ? pick(['NSW', 'Victoria', 'Queensland']) : null,
        latitude: cd.lat + rand(-2, 2),
        longitude: cd.lng + rand(-2, 2),
        timezone: timezones[i % timezones.length],
        isp: isps[i % isps.length],
        isVpn: i === 3 || i === 14, // 2 players on VPN
        isProxy: i === 7, // 1 player on proxy
        isTor: false,
      },
    })
  }
  console.log('✓ Created 20 geo locations\n')

  // ══════════════════════════════════════════════════════════════════════
  // 10. LIVE EVENT (40 recent events within last hour)
  // ══════════════════════════════════════════════════════════════════════
  console.log('⚡ Creating Live Events...')
  const eventTypes = ['player_login', 'game_start', 'big_win', 'jackpot_win', 'deposit', 'withdrawal', 'bonus_claim', 'level_up']

  for (let i = 0; i < 40; i++) {
    const p = pick(players)
    const eventType = pick(eventTypes)
    const country = pick(Object.keys(COUNTRY_DATA))
    const cd = COUNTRY_DATA[country]
    const gameIdx = randInt(0, GAME_NAMES.length - 1)
    const isGameEvent = ['game_start', 'big_win', 'jackpot_win'].includes(eventType)
    const isAmountEvent = ['big_win', 'jackpot_win', 'deposit', 'withdrawal'].includes(eventType)

    let amount: number | null = null
    let currency: string | null = null
    if (isAmountEvent) {
      if (eventType === 'jackpot_win') {
        amount = round2(rand(50000, 500000))
        currency = 'USD'
      } else if (eventType === 'big_win') {
        amount = round2(rand(500, 25000))
        currency = pick(['USD', 'EUR', 'GBP'])
      } else if (eventType === 'deposit') {
        amount = round2(rand(50, 5000))
        currency = 'USD'
      } else {
        amount = round2(rand(100, 3000))
        currency = 'USD'
      }
    }

    await prisma.liveEvent.create({
      data: {
        eventType,
        playerId: p.id,
        playerName: p.username,
        gameId: isGameEvent ? GAME_IDS[gameIdx] : null,
        gameName: isGameEvent ? GAME_NAMES[gameIdx] : null,
        amount,
        currency,
        country,
        countryCode: country,
        city: pick(cd.cities),
        latitude: cd.lat + rand(-2, 2),
        longitude: cd.lng + rand(-2, 2),
        metadata: isGameEvent ? JSON.stringify({ gameCategory: eventType === 'jackpot_win' ? 'progressive' : 'slots' }) : null,
        createdAt: secsAgo(randInt(0, 3600)), // within last hour
      },
    })
  }
  console.log('✓ Created 40 live events\n')

  // ══════════════════════════════════════════════════════════════════════
  // 11. SERVER NODE (6 nodes)
  // ══════════════════════════════════════════════════════════════════════
  console.log('🖥️  Creating Server Nodes...')

  const serverNodes = [
    {
      name: 'EU-West', region: 'Europe', countryCode: 'IE',
      latitude: 53.1424, longitude: -7.6921, // Ireland
      status: 'online', activePlayers: randInt(1800, 3200), maxPlayers: 10000,
      cpuLoad: round2(rand(35, 65)), memoryLoad: round2(rand(40, 70)),
      latencyMs: round2(rand(8, 25)), uptime: round2(rand(99.85, 99.99)),
    },
    {
      name: 'US-East', region: 'North America', countryCode: 'US',
      latitude: 37.4316, longitude: -78.6569, // Virginia
      status: 'online', activePlayers: randInt(2000, 3500), maxPlayers: 10000,
      cpuLoad: round2(rand(40, 70)), memoryLoad: round2(rand(45, 75)),
      latencyMs: round2(rand(5, 20)), uptime: round2(rand(99.90, 99.99)),
    },
    {
      name: 'US-West', region: 'North America', countryCode: 'US',
      latitude: 44.0682, longitude: -114.7420, // Oregon
      status: 'online', activePlayers: randInt(1200, 2500), maxPlayers: 10000,
      cpuLoad: round2(rand(30, 55)), memoryLoad: round2(rand(35, 60)),
      latencyMs: round2(rand(12, 35)), uptime: round2(rand(99.92, 99.99)),
    },
    {
      name: 'Asia-Pacific', region: 'Asia', countryCode: 'SG',
      latitude: 1.3521, longitude: 103.8198, // Singapore
      status: 'online', activePlayers: randInt(1500, 2800), maxPlayers: 10000,
      cpuLoad: round2(rand(45, 75)), memoryLoad: round2(rand(50, 80)),
      latencyMs: round2(rand(15, 40)), uptime: round2(rand(99.88, 99.98)),
    },
    {
      name: 'South-America', region: 'South America', countryCode: 'BR',
      latitude: -23.5505, longitude: -46.6333, // São Paulo
      status: 'degraded', activePlayers: randInt(600, 1200), maxPlayers: 10000,
      cpuLoad: round2(rand(70, 90)), memoryLoad: round2(rand(75, 95)),
      latencyMs: round2(rand(50, 120)), uptime: round2(rand(98.5, 99.5)),
    },
    {
      name: 'Africa', region: 'Africa', countryCode: 'ZA',
      latitude: -33.9249, longitude: 18.4241, // Cape Town
      status: 'maintenance', activePlayers: 0, maxPlayers: 10000,
      cpuLoad: 0, memoryLoad: round2(rand(10, 30)),
      latencyMs: 0, uptime: round2(rand(97.0, 99.0)),
    },
  ]

  for (const node of serverNodes) {
    await prisma.serverNode.create({ data: node })
  }
  console.log(`✓ Created ${serverNodes.length} server nodes\n`)

  // ── Summary ────────────────────────────────────────────────────────────
  console.log('═══════════════════════════════════════════════════════════')
  console.log('🎲 SEED COMPLETE - New Models Summary')
  console.log('═══════════════════════════════════════════════════════════')

  const counts = {
    wallets: await prisma.wallet.count(),
    walletTransactions: await prisma.walletTransaction.count(),
    paymentMethods: await prisma.paymentMethod.count(),
    paymentProviders: await prisma.paymentProvider.count(),
    depositRequests: await prisma.depositRequest.count(),
    withdrawalRequests: await prisma.withdrawalRequest.count(),
    currencyRates: await prisma.currencyRate.count(),
    playerSessions: await prisma.playerSession.count(),
    geoLocations: await prisma.geoLocation.count(),
    liveEvents: await prisma.liveEvent.count(),
    serverNodes: await prisma.serverNode.count(),
  }

  for (const [model, count] of Object.entries(counts)) {
    console.log(`  ${model}: ${count}`)
  }
  console.log('═══════════════════════════════════════════════════════════')

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error('❌ Seed failed:', e)
  process.exit(1)
})
