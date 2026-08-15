import { NextResponse } from 'next/server'

const now = new Date()
const iso = (minutesAgo: number) => new Date(now.getTime() - minutesAgo * 60000).toISOString()

const tokens = [
  {
    id: 'tok_1', name: 'Production API Key', tokenPrefix: 'tols_a3f2',
    ownerId: 'owner_1', scopes: ['players:read', 'players:write', 'wallets:read', 'financial:read'],
    rateLimit: 1000, isActive: true,
    lastUsedAt: iso(2), expiresAt: iso(-525600), createdAt: iso(1440 * 90),
    usageCount: 48723, last24hCalls: 3421,
  },
  {
    id: 'tok_2', name: 'Analytics Service', tokenPrefix: 'tols_b7c1',
    ownerId: 'owner_2', scopes: ['players:read', 'financial:read'],
    rateLimit: 500, isActive: true,
    lastUsedAt: iso(15), expiresAt: iso(-525600), createdAt: iso(1440 * 60),
    usageCount: 23841, last24hCalls: 1204,
  },
  {
    id: 'tok_3', name: 'Webhook Delivery Service', tokenPrefix: 'tols_c9d4',
    ownerId: 'owner_1', scopes: ['wallets:read', 'wallets:write'],
    rateLimit: 2000, isActive: true,
    lastUsedAt: iso(1), expiresAt: iso(-432000), createdAt: iso(1440 * 30),
    usageCount: 67219, last24hCalls: 5892,
  },
  {
    id: 'tok_4', name: 'Admin CLI Token', tokenPrefix: 'tols_d2e8',
    ownerId: 'owner_3', scopes: ['admin'],
    rateLimit: 100, isActive: true,
    lastUsedAt: iso(120), expiresAt: iso(-259200), createdAt: iso(1440 * 45),
    usageCount: 892, last24hCalls: 47,
  },
  {
    id: 'tok_5', name: 'Partner Integration', tokenPrefix: 'tols_f5g3',
    ownerId: 'owner_4', scopes: ['players:read', 'wallets:read'],
    rateLimit: 300, isActive: false,
    lastUsedAt: iso(4320), expiresAt: iso(-86400), createdAt: iso(1440 * 120),
    usageCount: 12903, last24hCalls: 0,
  },
  {
    id: 'tok_6', name: 'Finance Export Service', tokenPrefix: 'tols_h8j6',
    ownerId: 'owner_2', scopes: ['financial:read', 'financial:write'],
    rateLimit: 250, isActive: true,
    lastUsedAt: iso(45), expiresAt: iso(-525600), createdAt: iso(1440 * 15),
    usageCount: 8412, last24hCalls: 634,
  },
]

const webhooks = [
  {
    id: 'wh_1', name: 'Deposit Notifications', url: 'https://api.partner.com/webhooks/deposits',
    events: ['deposit.confirmed'], isActive: true, retryCount: 3, timeoutMs: 5000,
    lastTriggerAt: iso(3), successRate: 99.2, totalDeliveries: 12453,
    apiTokenName: 'Production API Key', createdAt: iso(1440 * 90),
  },
  {
    id: 'wh_2', name: 'Withdrawal Events', url: 'https://api.partner.com/webhooks/withdrawals',
    events: ['withdrawal.completed', 'withdrawal.failed'], isActive: true, retryCount: 5, timeoutMs: 10000,
    lastTriggerAt: iso(8), successRate: 97.8, totalDeliveries: 8921,
    apiTokenName: 'Production API Key', createdAt: iso(1440 * 85),
  },
  {
    id: 'wh_3', name: 'Player Activity Tracker', url: 'https://analytics.internal.com/hooks/player',
    events: ['player.login', 'player.logout'], isActive: true, retryCount: 2, timeoutMs: 3000,
    lastTriggerAt: iso(1), successRate: 99.9, totalDeliveries: 34521,
    apiTokenName: 'Analytics Service', createdAt: iso(1440 * 60),
  },
  {
    id: 'wh_4', name: 'Jackpot Alert System', url: 'https://alerts.internal.com/jackpot',
    events: ['jackpot.won'], isActive: true, retryCount: 3, timeoutMs: 5000,
    lastTriggerAt: iso(240), successRate: 100, totalDeliveries: 142,
    apiTokenName: 'Production API Key', createdAt: iso(1440 * 120),
  },
  {
    id: 'wh_5', name: 'Variance Monitor', url: 'https://ops.internal.com/variance-hook',
    events: ['variance.alert'], isActive: true, retryCount: 5, timeoutMs: 15000,
    lastTriggerAt: iso(30), successRate: 94.3, totalDeliveries: 2891,
    apiTokenName: 'Finance Export Service', createdAt: iso(1440 * 30),
  },
  {
    id: 'wh_6', name: 'CRM Sync Webhook', url: 'https://crm.external.com/api/sync',
    events: ['deposit.confirmed', 'player.login'], isActive: false, retryCount: 3, timeoutMs: 8000,
    lastTriggerAt: iso(10080), successRate: 82.1, totalDeliveries: 4521,
    apiTokenName: 'Partner Integration', createdAt: iso(1440 * 45),
  },
]

const webhookDeliveries = [
  { id: 'del_1', webhookName: 'Deposit Notifications', eventId: 'dep_8291', statusCode: 200, duration: 142, success: true, attempt: 1, createdAt: iso(3) },
  { id: 'del_2', webhookName: 'Player Activity Tracker', eventId: 'login_4412', statusCode: 200, duration: 87, success: true, attempt: 1, createdAt: iso(5) },
  { id: 'del_3', webhookName: 'Withdrawal Events', eventId: 'wd_1192', statusCode: 200, duration: 234, success: true, attempt: 1, createdAt: iso(8) },
  { id: 'del_4', webhookName: 'Variance Monitor', eventId: 'var_8821', statusCode: 500, duration: 5023, success: false, attempt: 1, createdAt: iso(12) },
  { id: 'del_5', webhookName: 'Variance Monitor', eventId: 'var_8821', statusCode: 200, duration: 189, success: true, attempt: 2, createdAt: iso(11) },
  { id: 'del_6', webhookName: 'Deposit Notifications', eventId: 'dep_7312', statusCode: 200, duration: 156, success: true, attempt: 1, createdAt: iso(15) },
  { id: 'del_7', webhookName: 'Jackpot Alert System', eventId: 'jp_0091', statusCode: 200, duration: 98, success: true, attempt: 1, createdAt: iso(30) },
  { id: 'del_8', webhookName: 'Player Activity Tracker', eventId: 'login_9923', statusCode: 200, duration: 112, success: true, attempt: 1, createdAt: iso(45) },
  { id: 'del_9', webhookName: 'Withdrawal Events', eventId: 'wd_5510', statusCode: 408, duration: 10000, success: false, attempt: 1, createdAt: iso(60) },
  { id: 'del_10', webhookName: 'Withdrawal Events', eventId: 'wd_5510', statusCode: 200, duration: 201, success: true, attempt: 2, createdAt: iso(58) },
]

const integrations = [
  {
    id: 'int_1', name: 'MegaJackpot Slots', type: 'casino_slots', status: 'connected',
    lastSyncAt: iso(5), recordsSynced: 128403, errors: 0,
    logo: '🎰', createdAt: iso(1440 * 180),
  },
  {
    id: 'int_2', name: 'RoyalPoker Live', type: 'casino_poker', status: 'connected',
    lastSyncAt: iso(2), recordsSynced: 89231, errors: 0,
    logo: '🃏', createdAt: iso(1440 * 150),
  },
  {
    id: 'int_3', name: 'SportEdge Betting', type: 'sports_betting', status: 'syncing',
    lastSyncAt: iso(0), recordsSynced: 45892, errors: 0,
    logo: '⚽', createdAt: iso(1440 * 90),
  },
  {
    id: 'int_4', name: 'LuckyDraw Lottery', type: 'lottery', status: 'connected',
    lastSyncAt: iso(15), recordsSynced: 23401, errors: 0,
    logo: '🎲', createdAt: iso(1440 * 60),
  },
  {
    id: 'int_5', name: 'CryptoPay Gateway', type: 'payment_gateway', status: 'error',
    lastSyncAt: iso(180), recordsSynced: 67102, errors: 3,
    logo: '💎', createdAt: iso(1440 * 120),
  },
  {
    id: 'int_6', name: 'AffiliateTrack Pro', type: 'affiliate', status: 'connected',
    lastSyncAt: iso(30), recordsSynced: 34219, errors: 0,
    logo: '🤝', createdAt: iso(1440 * 45),
  },
  {
    id: 'int_7', name: 'KYC Verify Plus', type: 'compliance', status: 'connected',
    lastSyncAt: iso(10), recordsSynced: 19823, errors: 0,
    logo: '🛡️', createdAt: iso(1440 * 30),
  },
  {
    id: 'int_8', name: 'GameMath Engine', type: 'custom', status: 'pending',
    lastSyncAt: iso(0), recordsSynced: 0, errors: 0,
    logo: '🔧', createdAt: iso(1440 * 1),
  },
  {
    id: 'int_9', name: 'LiveRoulette VIP', type: 'casino_slots', status: 'disconnected',
    lastSyncAt: iso(4320), recordsSynced: 56712, errors: 12,
    logo: '🎡', createdAt: iso(1440 * 200),
  },
]

const mcpEndpoints = [
  {
    id: 'mcp_1', name: 'TOLS Player Intelligence', description: 'Access player profiles, sessions, segments, and behavior analytics',
    version: '2.1.0', baseUrl: '/api/mcp/players',
    tools: [
      { name: 'search_players', description: 'Search players by name, email, VIP level, or segment' },
      { name: 'get_player_profile', description: 'Get detailed player profile with balances and stats' },
      { name: 'get_player_sessions', description: 'Retrieve player session history with game details' },
    ],
    isActive: true, requiresAuth: true, createdAt: iso(1440 * 90),
  },
  {
    id: 'mcp_2', name: 'TOLS Financial API', description: 'Revenue tracking, escrow management, and waterfall distribution',
    version: '1.8.0', baseUrl: '/api/mcp/financial',
    tools: [
      { name: 'get_revenue', description: 'Get revenue breakdown by period, game, or region' },
      { name: 'get_escrow', description: 'View escrow balance and settlement history' },
      { name: 'trigger_waterfall', description: 'Execute waterfall distribution for a settlement period' },
    ],
    isActive: true, requiresAuth: true, createdAt: iso(1440 * 60),
  },
  {
    id: 'mcp_3', name: 'TOLS Wallet API', description: 'Multi-currency wallet operations, deposits, and withdrawals',
    version: '3.0.0', baseUrl: '/api/mcp/wallets',
    tools: [
      { name: 'get_balances', description: 'Get wallet balances across all currencies' },
      { name: 'process_deposit', description: 'Process a deposit request with fee calculation' },
      { name: 'process_withdrawal', description: 'Initiate and track withdrawal requests' },
    ],
    isActive: true, requiresAuth: true, createdAt: iso(1440 * 45),
  },
  {
    id: 'mcp_4', name: 'TOLS Promotion Engine', description: 'Manage promotions, bonus codes, and wagering requirements',
    version: '1.5.0', baseUrl: '/api/mcp/promotions',
    tools: [
      { name: 'list_promotions', description: 'List active and scheduled promotions with stats' },
      { name: 'create_bonus_code', description: 'Generate bonus codes with wagering requirements' },
      { name: 'check_wagering', description: 'Check wagering requirement progress for a player' },
    ],
    isActive: true, requiresAuth: true, createdAt: iso(1440 * 30),
  },
  {
    id: 'mcp_5', name: 'TOLS Risk Monitor', description: 'Variance alerts, budget tracking, and risk assessment',
    version: '1.2.0', baseUrl: '/api/mcp/risk',
    tools: [
      { name: 'get_variance_alerts', description: 'Get active variance alerts with severity levels' },
      { name: 'get_budget_status', description: 'View budget targets and current spending' },
      { name: 'assess_player_risk', description: 'Run risk assessment for a specific player' },
    ],
    isActive: false, requiresAuth: true, createdAt: iso(1440 * 7),
  },
]

const stats = {
  totalTokens: tokens.length,
  activeTokens: tokens.filter(t => t.isActive).length,
  totalWebhooks: webhooks.length,
  totalDeliveries: webhooks.reduce((s, w) => s + w.totalDeliveries, 0),
  deliverySuccessRate: 97.4,
  totalIntegrations: integrations.length,
  activeIntegrations: integrations.filter(i => i.status === 'connected').length,
  totalApiCalls24h: tokens.reduce((s, t) => s + t.last24hCalls, 0),
  avgLatencyMs: 168,
}

const usageData = Array.from({ length: 24 }, (_, i) => {
  const hour = (now.getHours() - 23 + i + 24) % 24
  const base = 400
  const peak = (hour >= 18 && hour <= 22) ? 300 : (hour >= 10 && hour <= 14) ? 200 : 0
  const noise = Math.floor(Math.random() * 100)
  return {
    hour: `${hour.toString().padStart(2, '0')}:00`,
    calls: base + peak + noise,
  }
})

export async function GET() {
  return NextResponse.json({
    tokens,
    webhooks,
    webhookDeliveries,
    integrations,
    mcpEndpoints,
    stats,
    usageData,
  })
}
