import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({ log: ['query'] })

async function seed() {
  console.log('🌱 Seeding new features data...')

  // ─── Auth & Tenancy ───
  const casino1 = await prisma.casino.upsert({
    where: { id: 'casino-001' },
    update: {},
    create: {
      id: 'casino-001',
      name: 'TOLS Casino',
      slug: 'tols-casino',
      domain: 'tols-casino.com',
      status: 'active',
      plan: 'professional',
      config: JSON.stringify({ theme: 'dark', language: 'en' }),
      settings: JSON.stringify({ autoApprove: false }),
      maxPlayers: 10000,
      isActive: true,
    },
  })

  const casino2 = await prisma.casino.upsert({
    where: { id: 'casino-002' },
    update: {},
    create: {
      id: 'casino-002',
      name: 'Partner Casino',
      slug: 'partner-casino',
      domain: 'partner-casino.com',
      status: 'active',
      plan: 'starter',
      maxPlayers: 1000,
      isActive: true,
    },
  })

  const admin = await prisma.user.upsert({
    where: { email: 'admin@tols-casino.com' },
    update: {},
    create: {
      email: 'admin@tols-casino.com',
      name: 'Marco Rossi',
      role: 'admin',
      casinoId: casino1.id,
      isActive: true,
    },
  })

  const financeUser = await prisma.user.upsert({
    where: { email: 'finance@tols-casino.com' },
    update: {},
    create: {
      email: 'finance@tols-casino.com',
      name: 'Sarah Chen',
      role: 'finance',
      casinoId: casino1.id,
      isActive: true,
    },
  })

  const controllerUser = await prisma.user.upsert({
    where: { email: 'controller@tols-casino.com' },
    update: {},
    create: {
      email: 'controller@tols-casino.com',
      name: 'James Wilson',
      role: 'controller',
      casinoId: casino1.id,
      isActive: true,
    },
  })

  // Role permissions
  const roles = ['admin', 'controller', 'finance', 'marketing', 'support', 'viewer']
  const resources = ['players', 'financial', 'wallets', 'promotions', 'settings', 'vendors', 'api']

  for (const role of roles) {
    for (const resource of resources) {
      let actions: string[] = []
      if (role === 'admin') actions = ['read', 'write', 'delete', 'approve']
      else if (role === 'controller') actions = resource === 'financial' || resource === 'wallets' ? ['read', 'write', 'approve'] : ['read']
      else if (role === 'finance') actions = resource === 'financial' || resource === 'wallets' ? ['read', 'write'] : ['read']
      else if (role === 'marketing') actions = resource === 'promotions' ? ['read', 'write'] : ['read']
      else if (role === 'support') actions = resource === 'players' ? ['read', 'write'] : ['read']
      else actions = ['read']

      await prisma.rolePermission.upsert({
        where: { id: `rp-${role}-${resource}` },
        update: {},
        create: {
          id: `rp-${role}-${resource}`,
          role,
          resource,
          actions: JSON.stringify(actions),
        },
      })
    }
  }

  // ─── Billing ───
  const subscription = await prisma.subscription.upsert({
    where: { id: 'sub-001' },
    update: {},
    create: {
      id: 'sub-001',
      casinoId: casino1.id,
      stripeCustomerId: 'cus_tols_001',
      stripeSubscriptionId: 'sub_stripe_001',
      plan: 'professional',
      status: 'active',
      currentPeriodStart: new Date('2025-03-01'),
      currentPeriodEnd: new Date('2025-04-01'),
      trialEndsAt: new Date('2025-01-15'),
    },
  })

  // Invoices
  const invoiceAmounts = [1499, 1499, 1499, 1499, 1499, 1499, 499, 499]
  const invoiceStatuses = ['open', 'paid', 'paid', 'paid', 'paid', 'paid', 'paid', 'paid']
  const months = ['2025-03', '2025-02', '2025-01', '2024-12', '2024-11', '2024-10', '2024-09', '2024-08']

  for (let i = 0; i < months.length; i++) {
    await prisma.invoice.upsert({
      where: { id: `inv-${i + 1}` },
      update: {},
      create: {
        id: `inv-${i + 1}`,
        subscriptionId: subscription.id,
        stripeInvoiceId: `in_stripe_${i + 1}`,
        amount: invoiceAmounts[i],
        currency: 'USD',
        status: invoiceStatuses[i],
        description: `TOLS Professional Plan - ${months[i]}`,
        dueDate: new Date(`${months[i]}-01`),
        paidAt: invoiceStatuses[i] === 'paid' ? new Date(`${months[i]}-05`) : null,
      },
    })
  }

  // Plan features
  const starterFeatures = [
    { feature: 'dashboard', limit: 1 },
    { feature: 'financial', limit: 1 },
    { feature: 'max_players', limit: 1000 },
    { feature: 'api_calls_per_month', limit: 100000 },
    { feature: 'support', limit: null },
  ]
  const proFeatures = [
    { feature: 'dashboard', limit: null },
    { feature: 'financial', limit: null },
    { feature: 'ai_governance', limit: null },
    { feature: 'revenue_optimizer', limit: null },
    { feature: 'player_intelligence', limit: null },
    { feature: 'max_players', limit: 10000 },
    { feature: 'api_calls_per_month', limit: 1000000 },
    { feature: 'priority_support', limit: null },
  ]
  const entFeatures = [
    { feature: 'all_professional_features', limit: null },
    { feature: 'ai_tutor_advanced', limit: null },
    { feature: 'blockchain', limit: null },
    { feature: 'compliance_automation', limit: null },
    { feature: 'max_players', limit: null },
    { feature: 'api_calls_per_month', limit: null },
    { feature: 'dedicated_support_247', limit: null },
  ]

  for (const f of starterFeatures) {
    await prisma.planFeature.upsert({
      where: { id: `pf-starter-${f.feature}` },
      update: {},
      create: { id: `pf-starter-${f.feature}`, plan: 'starter', feature: f.feature, isEnabled: true, limit: f.limit },
    })
  }
  for (const f of proFeatures) {
    await prisma.planFeature.upsert({
      where: { id: `pf-pro-${f.feature}` },
      update: {},
      create: { id: `pf-pro-${f.feature}`, plan: 'professional', feature: f.feature, isEnabled: true, limit: f.limit },
    })
  }
  for (const f of entFeatures) {
    await prisma.planFeature.upsert({
      where: { id: `pf-ent-${f.feature}` },
      update: {},
      create: { id: `pf-ent-${f.feature}`, plan: 'enterprise', feature: f.feature, isEnabled: true, limit: f.limit },
    })
  }

  // ─── Blockchain ───
  const wallets = [
    { id: 'w-001', address: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18', network: 'ethereum', type: 'hot', label: 'Main Hot Wallet', balance: 12.5, balanceUsd: 31250, currency: 'ETH' },
    { id: 'w-002', address: 'bc1qxy2kgdygjrsqtzqkz42z8l9j4h3f7v5c6d7e8', network: 'bitcoin', type: 'cold', label: 'Cold Storage', balance: 2.3, balanceUsd: 142600, currency: 'BTC' },
    { id: 'w-003', address: 'TJYeQxN4pX7kLm9Rg3vB2cW8dF5hJ6sA1', network: 'tron', type: 'hot', label: 'Player Deposits', balance: 50000, balanceUsd: 4250, currency: 'TRX' },
    { id: 'w-004', address: '0x3a8B7c2D9e1F4g6H8i0J2k4L6m8N0o2P', network: 'polygon', type: 'hot', label: 'Staking Wallet', balance: 5000, balanceUsd: 3750, currency: 'MATIC' },
  ]

  for (const w of wallets) {
    await prisma.cryptoWallet.upsert({
      where: { address: w.address },
      update: {},
      create: {
        id: w.id,
        address: w.address,
        network: w.network,
        type: w.type,
        label: w.label,
        balance: w.balance,
        balanceUsd: w.balanceUsd,
        currency: w.currency,
        isActive: true,
        isVerified: true,
      },
    })
  }

  const networks = [
    { name: 'Ethereum Mainnet', symbol: 'ETH', type: 'mainnet', rpcUrl: 'https://eth.mainnet.gateway.tols', explorerUrl: 'https://etherscan.io', chainId: 1 },
    { name: 'Bitcoin', symbol: 'BTC', type: 'mainnet', rpcUrl: 'https://btc.mainnet.gateway.tols', explorerUrl: 'https://blockstream.info' },
    { name: 'Tron', symbol: 'TRX', type: 'mainnet', rpcUrl: 'https://trx.mainnet.gateway.tols', explorerUrl: 'https://tronscan.org' },
    { name: 'Solana', symbol: 'SOL', type: 'mainnet', rpcUrl: 'https://sol.mainnet.gateway.tols', explorerUrl: 'https://solscan.io' },
    { name: 'Polygon', symbol: 'MATIC', type: 'mainnet', rpcUrl: 'https://polygon.mainnet.gateway.tols', explorerUrl: 'https://polygonscan.com', chainId: 137 },
    { name: 'BSC', symbol: 'BNB', type: 'mainnet', rpcUrl: 'https://bsc.mainnet.gateway.tols', explorerUrl: 'https://bscscan.com', chainId: 56 },
  ]

  for (let i = 0; i < networks.length; i++) {
    const n = networks[i]
    await prisma.blockchainNetwork.upsert({
      where: { id: `net-${i + 1}` },
      update: {},
      create: {
        id: `net-${i + 1}`,
        name: n.name,
        symbol: n.symbol,
        type: n.type,
        rpcUrl: n.rpcUrl,
        explorerUrl: n.explorerUrl,
        chainId: n.chainId ?? null,
      },
    })
  }

  // ─── ML Pipeline ───
  const mlModels = [
    { id: 'ml-001', name: 'Churn Predictor', type: 'classification', algorithm: 'xgboost', version: '2.1.0', status: 'deployed', accuracy: 0.942, precision: 0.931, recall: 0.954, f1Score: 0.942, features: JSON.stringify(['days_since_last_login', 'total_deposits', 'avg_session_length', 'loss_ratio']), trainingDataSize: 125000 },
    { id: 'ml-002', name: 'Revenue Forecaster', type: 'regression', algorithm: 'lstm', version: '1.3.0', status: 'deployed', accuracy: 0.897, features: JSON.stringify(['daily_revenue', 'player_count', 'avg_bet_size', 'seasonal_index']), trainingDataSize: 730000 },
    { id: 'ml-003', name: 'Fraud Detector', type: 'anomaly_detection', algorithm: 'random_forest', version: '3.0.0', status: 'deployed', accuracy: 0.978, precision: 0.962, recall: 0.991, f1Score: 0.976, features: JSON.stringify(['transaction_amount', 'velocity_1h', 'geo_distance', 'device_fingerprint']), trainingDataSize: 2500000 },
    { id: 'ml-004', name: 'Player Segmentation', type: 'classification', algorithm: 'neural_network', version: '1.0.0', status: 'trained', accuracy: 0.913, features: JSON.stringify(['ltv', 'deposit_frequency', 'game_diversity', 'churn_risk']), trainingDataSize: 50000 },
  ]

  for (const m of mlModels) {
    await prisma.mLModel.upsert({
      where: { id: m.id },
      update: {},
      create: {
        id: m.id,
        name: m.name,
        type: m.type,
        algorithm: m.algorithm,
        version: m.version,
        status: m.status,
        accuracy: m.accuracy ?? null,
        precision: (m as any).precision ?? null,
        recall: (m as any).recall ?? null,
        f1Score: (m as any).f1Score ?? null,
        features: m.features,
        trainingDataSize: m.trainingDataSize ?? null,
        isActive: true,
        deployedAt: m.status === 'deployed' ? new Date() : null,
        lastTrainedAt: m.status !== 'draft' ? new Date() : null,
      },
    })
  }

  // Feature stores
  const featureStores = [
    { name: 'Player Behavior', description: 'Aggregated player activity and engagement features', schema: JSON.stringify({ features: 47, type: 'aggregated' }), source: 'database', refreshInterval: 15 },
    { name: 'Transaction Patterns', description: 'Real-time transaction velocity and pattern features', schema: JSON.stringify({ features: 23, type: 'streaming' }), source: 'stream', refreshInterval: 5 },
    { name: 'Game Analytics', description: 'Game performance and popularity metrics', schema: JSON.stringify({ features: 31, type: 'aggregated' }), source: 'database', refreshInterval: 30 },
    { name: 'Geo Demographics', description: 'Geographic and demographic segmentation data', schema: JSON.stringify({ features: 18, type: 'external' }), source: 'api', refreshInterval: 60 },
  ]

  for (let i = 0; i < featureStores.length; i++) {
    await prisma.mLFeatureStore.upsert({
      where: { id: `fs-${i + 1}` },
      update: {},
      create: {
        id: `fs-${i + 1}`,
        ...featureStores[i],
        isActive: true,
      },
    })
  }

  console.log('✅ Seeding complete!')
  console.log(`  - Casinos: 2`)
  console.log(`  - Users: 3`)
  console.log(`  - Role Permissions: ${roles.length * resources.length}`)
  console.log(`  - Subscription + Invoices: 1 + ${months.length}`)
  console.log(`  - Plan Features: ${starterFeatures.length + proFeatures.length + entFeatures.length}`)
  console.log(`  - Crypto Wallets: ${wallets.length}`)
  console.log(`  - Blockchain Networks: ${networks.length}`)
  console.log(`  - ML Models: ${mlModels.length}`)
  console.log(`  - Feature Stores: ${featureStores.length}`)

  await prisma.$disconnect()
}

seed().catch((e) => {
  console.error('Seeding failed:', e)
  process.exit(1)
})
