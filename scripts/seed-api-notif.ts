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
function hoursAgo(h: number): Date {
  return new Date(Date.now() - h * 60 * 60 * 1000)
}
function minsAgo(m: number): Date {
  return new Date(Date.now() - m * 60 * 1000)
}
function daysAgo(d: number): Date {
  return new Date(Date.now() - d * 24 * 60 * 60 * 1000)
}

// ─── Main ─────────────────────────────────────────────────────────────────
async function main() {
  console.log('🧹 Clearing existing data...')

  // Delete in dependency order (children first)
  await prisma.webhookDelivery.deleteMany()
  await prisma.webhookEndpoint.deleteMany()
  await prisma.apiUsageLog.deleteMany()
  await prisma.apiToken.deleteMany()
  await prisma.integration.deleteMany()
  await prisma.mcpEndpoint.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.notificationPreference.deleteMany()
  await prisma.notificationTemplate.deleteMany()
  await prisma.notificationChannel.deleteMany()

  console.log('✅ All existing data cleared.\n')

  // ═══════════════════════════════════════════════════════════════════════
  // 1. ApiToken (5 tokens)
  // ═══════════════════════════════════════════════════════════════════════
  console.log('🔑 Seeding ApiToken (5)...')

  const apiTokens = await prisma.$transaction([
    prisma.apiToken.create({
      data: {
        name: 'Production API',
        token: 'tols_a3f2k9m1x7y4z8r0w5q2v6n3b9j1h4g',
        tokenPrefix: 'tols_a3f2',
        ownerId: 'admin-001',
        scopes: JSON.stringify(['players:read', 'wallets:read', 'wallets:write', 'financial:read']),
        rateLimit: 1000,
        isActive: true,
        lastUsedAt: minsAgo(12),
        expiresAt: new Date('2026-12-31T23:59:59Z'),
      },
    }),
    prisma.apiToken.create({
      data: {
        name: 'Staging Environment',
        token: 'tols_b7d4n2p5k9m3f8j1r6w0q4v7x2z5h9c',
        tokenPrefix: 'tols_b7d4',
        ownerId: 'dev-team',
        scopes: JSON.stringify(['players:read', 'wallets:read']),
        rateLimit: 500,
        isActive: true,
        lastUsedAt: hoursAgo(2),
        expiresAt: new Date('2026-06-30T23:59:59Z'),
      },
    }),
    prisma.apiToken.create({
      data: {
        name: 'Partner Integration',
        token: 'tols_c1e8r6t3m9k2f5j8w4q7v1z4n7h3b6g',
        tokenPrefix: 'tols_c1e8',
        ownerId: 'partner-betmgm',
        scopes: JSON.stringify(['players:read', 'financial:read']),
        rateLimit: 200,
        isActive: true,
        lastUsedAt: hoursAgo(6),
        expiresAt: new Date('2025-12-31T23:59:59Z'),
      },
    }),
    prisma.apiToken.create({
      data: {
        name: 'Analytics Service',
        token: 'tols_d9f3h5v7q2w8j4k1m6n3r9b7z1c5x8g',
        tokenPrefix: 'tols_d9f3',
        ownerId: 'analytics-svc',
        scopes: JSON.stringify(['players:read', 'financial:read']),
        rateLimit: 100,
        isActive: true,
        lastUsedAt: daysAgo(1),
        expiresAt: new Date('2026-03-31T23:59:59Z'),
      },
    }),
    prisma.apiToken.create({
      data: {
        name: 'Deprecated Token',
        token: 'tols_e2g6j9w4n7k3m8r1v5q2h6b9z4c7x1f',
        tokenPrefix: 'tols_e2g6',
        ownerId: 'legacy-system',
        scopes: JSON.stringify(['admin']),
        rateLimit: 50,
        isActive: false,
        lastUsedAt: daysAgo(45),
        expiresAt: new Date('2025-01-01T00:00:00Z'),
      },
    }),
  ])

  console.log(`   ✅ Created ${apiTokens.length} ApiToken records\n`)

  // ═══════════════════════════════════════════════════════════════════════
  // 2. WebhookEndpoint (6 webhooks) — linked to first token
  // ═══════════════════════════════════════════════════════════════════════
  console.log('🪝 Seeding WebhookEndpoint (6)...')

  const firstToken = apiTokens[0]

  const webhookEndpoints = await prisma.$transaction([
    prisma.webhookEndpoint.create({
      data: {
        apiTokenId: firstToken.id,
        name: 'Deposit Notifications',
        url: 'https://partners.tols.io/webhooks/deposits',
        events: JSON.stringify(['deposit.confirmed', 'deposit.failed']),
        secret: 'whsec_d3p0s1t_a8f2k6m9r3v7',
        isActive: true,
        retryCount: 3,
        timeoutMs: 5000,
        lastTriggerAt: minsAgo(8),
      },
    }),
    prisma.webhookEndpoint.create({
      data: {
        apiTokenId: firstToken.id,
        name: 'Withdrawal Alerts',
        url: 'https://partners.tols.io/webhooks/withdrawals',
        events: JSON.stringify(['withdrawal.completed', 'withdrawal.rejected']),
        secret: 'whsec_w1thdr4w_b2e5n8p1q4',
        isActive: true,
        retryCount: 3,
        timeoutMs: 5000,
        lastTriggerAt: hoursAgo(1),
      },
    }),
    prisma.webhookEndpoint.create({
      data: {
        apiTokenId: firstToken.id,
        name: 'Player Activity',
        url: 'https://partners.tols.io/webhooks/player-activity',
        events: JSON.stringify(['player.login', 'player.logout', 'player.registration']),
        secret: 'whsec_pl4y3r_c7f1h4j6m9',
        isActive: true,
        retryCount: 3,
        timeoutMs: 5000,
        lastTriggerAt: minsAgo(3),
      },
    }),
    prisma.webhookEndpoint.create({
      data: {
        apiTokenId: firstToken.id,
        name: 'Jackpot Events',
        url: 'https://partners.tols.io/webhooks/jackpots',
        events: JSON.stringify(['jackpot.won', 'jackpot.progression']),
        secret: 'whsec_j4ckp0t_d3e6g9k2n5',
        isActive: true,
        retryCount: 5,
        timeoutMs: 8000,
        lastTriggerAt: hoursAgo(4),
      },
    }),
    prisma.webhookEndpoint.create({
      data: {
        apiTokenId: firstToken.id,
        name: 'Variance Alerts',
        url: 'https://partners.tols.io/webhooks/variance',
        events: JSON.stringify(['variance.threshold_exceeded']),
        secret: 'whsec_v4r14nc_f7h2j5m8p1',
        isActive: true,
        retryCount: 3,
        timeoutMs: 5000,
        lastTriggerAt: daysAgo(2),
      },
    }),
    prisma.webhookEndpoint.create({
      data: {
        apiTokenId: firstToken.id,
        name: 'Compliance Events',
        url: 'https://partners.tols.io/webhooks/compliance',
        events: JSON.stringify(['compliance.kyc_flag', 'compliance.self_exclusion']),
        secret: 'whsec_c0mpl1_q4r7t0v3w6',
        isActive: true,
        retryCount: 5,
        timeoutMs: 10000,
        lastTriggerAt: hoursAgo(12),
      },
    }),
  ])

  console.log(`   ✅ Created ${webhookEndpoints.length} WebhookEndpoint records\n`)

  // ═══════════════════════════════════════════════════════════════════════
  // 3. WebhookDelivery (15 deliveries) — various status codes
  // ═══════════════════════════════════════════════════════════════════════
  console.log('📦 Seeding WebhookDelivery (15)...')

  const deliveryDefs = [
    { webhookIdx: 0, eventId: 'deposit.confirmed', statusCode: 200, duration: 145, success: true, attempt: 1 },
    { webhookIdx: 0, eventId: 'deposit.confirmed', statusCode: 200, duration: 98, success: true, attempt: 1 },
    { webhookIdx: 0, eventId: 'deposit.failed', statusCode: 200, duration: 167, success: true, attempt: 1 },
    { webhookIdx: 1, eventId: 'withdrawal.completed', statusCode: 200, duration: 210, success: true, attempt: 1 },
    { webhookIdx: 1, eventId: 'withdrawal.rejected', statusCode: 500, duration: 3200, success: false, attempt: 1 },
    { webhookIdx: 1, eventId: 'withdrawal.rejected', statusCode: 200, duration: 180, success: true, attempt: 2 },
    { webhookIdx: 2, eventId: 'player.login', statusCode: 200, duration: 55, success: true, attempt: 1 },
    { webhookIdx: 2, eventId: 'player.registration', statusCode: 201, duration: 120, success: true, attempt: 1 },
    { webhookIdx: 2, eventId: 'player.logout', statusCode: 200, duration: 42, success: true, attempt: 1 },
    { webhookIdx: 3, eventId: 'jackpot.won', statusCode: 200, duration: 380, success: true, attempt: 1 },
    { webhookIdx: 3, eventId: 'jackpot.progression', statusCode: 503, duration: 5000, success: false, attempt: 1 },
    { webhookIdx: 3, eventId: 'jackpot.progression', statusCode: 200, duration: 290, success: true, attempt: 2 },
    { webhookIdx: 4, eventId: 'variance.threshold_exceeded', statusCode: 200, duration: 72, success: true, attempt: 1 },
    { webhookIdx: 5, eventId: 'compliance.kyc_flag', statusCode: 200, duration: 155, success: true, attempt: 1 },
    { webhookIdx: 5, eventId: 'compliance.self_exclusion', statusCode: 408, duration: 10000, success: false, attempt: 3 },
  ]

  const webhookDeliveries: Awaited<ReturnType<typeof prisma.webhookDelivery.create>>[] = []
  for (const d of deliveryDefs) {
    const payload = JSON.stringify({
      event: d.eventId,
      timestamp: new Date().toISOString(),
      data: { playerId: `player_${randInt(1000, 9999)}`, amount: randInt(50, 5000) },
    })

    const delivery = await prisma.webhookDelivery.create({
      data: {
        webhookId: webhookEndpoints[d.webhookIdx].id,
        eventId: d.eventId,
        payload,
        statusCode: d.statusCode,
        response: d.success ? 'OK' : `Error ${d.statusCode}`,
        duration: d.duration,
        success: d.success,
        attempt: d.attempt,
        nextRetryAt: d.success ? null : minsAgo(-5),
        createdAt: minsAgo(randInt(1, 120)),
      },
    })
    webhookDeliveries.push(delivery)
  }

  console.log(`   ✅ Created ${webhookDeliveries.length} WebhookDelivery records\n`)

  // ═══════════════════════════════════════════════════════════════════════
  // 4. Integration (4)
  // ═══════════════════════════════════════════════════════════════════════
  console.log('🔌 Seeding Integration (4)...')

  const integrations = await prisma.$transaction([
    prisma.integration.create({
      data: {
        name: 'BetMGM Casino',
        type: 'casino_slots',
        status: 'connected',
        apiTokenId: apiTokens[2].id,
        config: JSON.stringify({
          baseUrl: 'https://api.betmgm.com/v2',
          authType: 'oauth2',
          syncInterval: '5m',
          region: 'US-NJ',
        }),
        syncStats: JSON.stringify({
          lastSync: new Date().toISOString(),
          recordsSynced: 12847,
          errors: 0,
          avgLatencyMs: 42,
        }),
        logo: 'https://logos.tols.io/betmgm.png',
        lastSyncAt: minsAgo(5),
      },
    }),
    prisma.integration.create({
      data: {
        name: 'PokerStars',
        type: 'casino_poker',
        status: 'syncing',
        apiTokenId: apiTokens[2].id,
        config: JSON.stringify({
          baseUrl: 'https://api.pokerstars.com/v1',
          authType: 'api_key',
          syncInterval: '10m',
          region: 'GLOBAL',
        }),
        syncStats: JSON.stringify({
          lastSync: new Date().toISOString(),
          recordsSynced: 5230,
          errors: 2,
          avgLatencyMs: 78,
        }),
        logo: 'https://logos.tols.io/pokerstars.png',
        lastSyncAt: minsAgo(10),
      },
    }),
    prisma.integration.create({
      data: {
        name: 'DraftKings Sports',
        type: 'sports_betting',
        status: 'connected',
        apiTokenId: apiTokens[1].id,
        config: JSON.stringify({
          baseUrl: 'https://api.draftkings.com/v3',
          authType: 'oauth2',
          syncInterval: '1m',
          region: 'US',
        }),
        syncStats: JSON.stringify({
          lastSync: new Date().toISOString(),
          recordsSynced: 45891,
          errors: 0,
          avgLatencyMs: 23,
        }),
        logo: 'https://logos.tols.io/draftkings.png',
        lastSyncAt: minsAgo(1),
      },
    }),
    prisma.integration.create({
      data: {
        name: 'Custom Platform X',
        type: 'custom',
        status: 'error',
        apiTokenId: null,
        config: JSON.stringify({
          baseUrl: 'https://custom.platform-x.io/api',
          authType: 'basic',
          syncInterval: '30m',
          region: 'EU',
        }),
        syncStats: JSON.stringify({
          lastSync: daysAgo(3).toISOString(),
          recordsSynced: 0,
          errors: 47,
          lastError: 'Connection refused: ECONNREFUSED',
        }),
        logo: 'https://logos.tols.io/platformx.png',
        lastSyncAt: daysAgo(3),
      },
    }),
  ])

  console.log(`   ✅ Created ${integrations.length} Integration records\n`)

  // ═══════════════════════════════════════════════════════════════════════
  // 5. McpEndpoint (4)
  // ═══════════════════════════════════════════════════════════════════════
  console.log('🛠️  Seeding McpEndpoint (4)...')

  const mcpEndpoints = await prisma.$transaction([
    prisma.mcpEndpoint.create({
      data: {
        name: 'Player Intelligence',
        description: 'MCP server for player data queries, segmentation, and behavioral analysis',
        version: '1.2.0',
        baseUrl: '/api/mcp/players',
        tools: JSON.stringify([
          { name: 'get_player', description: 'Fetch player profile by ID' },
          { name: 'search_players', description: 'Search players with filters' },
          { name: 'get_player_activity', description: 'Retrieve player activity timeline' },
          { name: 'segment_players', description: 'Dynamic player segmentation' },
        ]),
        resources: JSON.stringify([
          { uri: '/mcp/players/{id}', name: 'Player Profile', mimeType: 'application/json' },
          { uri: '/mcp/players/activity', name: 'Activity Feed', mimeType: 'application/json' },
        ]),
        isActive: true,
        requiresAuth: true,
      },
    }),
    prisma.mcpEndpoint.create({
      data: {
        name: 'Financial API',
        description: 'MCP server for deposits, withdrawals, house earnings, and commission data',
        version: '1.1.0',
        baseUrl: '/api/mcp/financial',
        tools: JSON.stringify([
          { name: 'get_deposits', description: 'Query deposit records' },
          { name: 'get_withdrawals', description: 'Query withdrawal records' },
          { name: 'get_house_earnings', description: 'House earnings summary' },
          { name: 'get_commission_log', description: 'Commission tracking data' },
        ]),
        resources: JSON.stringify([
          { uri: '/mcp/financial/summary', name: 'Financial Summary', mimeType: 'application/json' },
        ]),
        isActive: true,
        requiresAuth: true,
      },
    }),
    prisma.mcpEndpoint.create({
      data: {
        name: 'Wallet API',
        description: 'MCP server for wallet balances, transactions, and escrow management',
        version: '2.0.0',
        baseUrl: '/api/mcp/wallets',
        tools: JSON.stringify([
          { name: 'get_wallet', description: 'Fetch wallet by player ID' },
          { name: 'get_transactions', description: 'Transaction history' },
          { name: 'adjust_balance', description: 'Manual balance adjustment' },
          { name: 'escrow_status', description: 'Check escrow status' },
        ]),
        resources: JSON.stringify([
          { uri: '/mcp/wallets/{playerId}', name: 'Wallet Detail', mimeType: 'application/json' },
        ]),
        isActive: true,
        requiresAuth: true,
      },
    }),
    prisma.mcpEndpoint.create({
      data: {
        name: 'Promotion Engine',
        description: 'MCP server for bonus management, free spins, and promotion campaign rules',
        version: '1.0.0',
        baseUrl: '/api/mcp/promotions',
        tools: JSON.stringify([
          { name: 'list_promotions', description: 'List active promotions' },
          { name: 'apply_bonus', description: 'Apply bonus to player' },
          { name: 'grant_free_spins', description: 'Issue free spins' },
          { name: 'check_eligibility', description: 'Check player eligibility' },
        ]),
        resources: JSON.stringify([
          { uri: '/mcp/promotions/active', name: 'Active Promotions', mimeType: 'application/json' },
        ]),
        isActive: true,
        requiresAuth: false,
      },
    }),
  ])

  console.log(`   ✅ Created ${mcpEndpoints.length} McpEndpoint records\n`)

  // ═══════════════════════════════════════════════════════════════════════
  // 6. ApiUsageLog (20 recent entries)
  // ═══════════════════════════════════════════════════════════════════════
  console.log('📊 Seeding ApiUsageLog (20)...')

  const endpointPaths = [
    '/api/players', '/api/wallets', '/api/financial/deposits',
    '/api/financial/withdrawals', '/api/jackpots', '/api/promotions',
    '/api/segments', '/api/dashboard', '/api/variance', '/api/affiliates',
  ]
  const methods = ['GET', 'POST', 'PUT', 'DELETE']
  const ipAddresses = [
    '203.0.113.42', '198.51.100.18', '192.0.2.77', '172.16.0.50',
    '10.0.1.200', '203.0.113.99',
  ]
  const userAgents = [
    'TOLS-SDK/1.4.2', 'axios/1.6.0', 'node-fetch/3.3.1',
    'python-requests/2.31.0', 'TOLS-Dashboard/2.1.0',
  ]

  for (let i = 0; i < 20; i++) {
    const tokenIdx = i < 12 ? 0 : i < 16 ? 1 : i < 18 ? 2 : 3  // weight toward first token
    const statusCodes = [200, 200, 200, 200, 201, 400, 404, 429, 500]
    const chosenStatus = pick(statusCodes)

    await prisma.apiUsageLog.create({
      data: {
        apiTokenId: apiTokens[tokenIdx].id,
        endpoint: pick(endpointPaths),
        method: pick(methods),
        statusCode: chosenStatus,
        durationMs: randInt(12, 850),
        ipAddress: pick(ipAddresses),
        userAgent: pick(userAgents),
        error: chosenStatus >= 400 ? `HTTP ${chosenStatus}` : null,
        createdAt: minsAgo(i * 3 + randInt(0, 2)),
      },
    })
  }

  console.log('   ✅ Created 20 ApiUsageLog records\n')

  // ═══════════════════════════════════════════════════════════════════════
  // 7. Notification (25) — mix of types, categories, priorities; 8 unread
  // ═══════════════════════════════════════════════════════════════════════
  console.log('🔔 Seeding Notification (25)...')

  const notificationDefs = [
    // UNREAD (8)
    { type: 'critical', category: 'financial', title: 'Large Withdrawal Pending Review', message: 'Player #4821 requested withdrawal of $25,000. Exceeds auto-approval threshold.', channel: 'in_app', priority: 'urgent', isRead: false },
    { type: 'warning', category: 'compliance', title: 'KYC Flag Raised', message: 'Player #7234 failed enhanced KYC verification. Account temporarily restricted.', channel: 'in_app', priority: 'high', isRead: false },
    { type: 'error', category: 'integration', title: 'Custom Platform X Sync Failed', message: 'Connection refused for 47th consecutive attempt. Integration marked as error state.', channel: 'in_app', priority: 'high', isRead: false },
    { type: 'warning', category: 'webhook', title: 'Webhook Delivery Failed', message: 'Compliance Events webhook returned 408 timeout after 3 retries.', channel: 'in_app', priority: 'normal', isRead: false },
    { type: 'info', category: 'player', title: 'New VIP Registration', message: 'Player #9102 registered with initial deposit of $5,000. Auto-assigned to VIP tier.', channel: 'in_app', priority: 'normal', isRead: false },
    { type: 'critical', category: 'financial', title: 'Variance Threshold Exceeded', message: 'Mega Moolah RTP variance at 12.4% — exceeds 10% threshold. Investigation required.', channel: 'in_app', priority: 'urgent', isRead: false },
    { type: 'warning', category: 'system', title: 'Rate Limit Approaching', message: 'Production API token at 92% rate limit (920/1000 RPM). Consider increasing limits.', channel: 'in_app', priority: 'normal', isRead: false },
    { type: 'info', category: 'player', title: 'Self-Exclusion Request', message: 'Player #3356 activated 6-month self-exclusion per responsible gambling policy.', channel: 'in_app', priority: 'high', isRead: false },

    // READ (17)
    { type: 'success', category: 'financial', title: 'Deposit Confirmed', message: 'Player #2847 deposit of $500 via credit card confirmed.', channel: 'in_app', priority: 'normal', isRead: true, readAt: minsAgo(45) },
    { type: 'success', category: 'financial', title: 'Withdrawal Completed', message: 'Player #1563 withdrawal of $1,200 processed to bank account.', channel: 'in_app', priority: 'normal', isRead: true, readAt: hoursAgo(1) },
    { type: 'info', category: 'system', title: 'API Token Rotated', message: 'Staging Environment token successfully rotated. Old token revoked.', channel: 'in_app', priority: 'low', isRead: true, readAt: hoursAgo(3) },
    { type: 'success', category: 'integration', title: 'BetMGM Sync Complete', message: 'Full data sync completed: 12,847 records, 0 errors, 42ms avg latency.', channel: 'in_app', priority: 'normal', isRead: true, readAt: minsAgo(30) },
    { type: 'info', category: 'webhook', title: 'Webhook Endpoint Created', message: 'New "Variance Alerts" webhook registered for Production API token.', channel: 'in_app', priority: 'low', isRead: true, readAt: daysAgo(1) },
    { type: 'success', category: 'financial', title: 'Jackpot Awarded', message: 'Mega Moolah progressive jackpot of $1,247,500 awarded to Player #6789.', channel: 'in_app', priority: 'high', isRead: true, readAt: hoursAgo(5) },
    { type: 'warning', category: 'compliance', title: 'AML Alert Triggered', message: 'Player #4123 flagged for unusual deposit pattern: 5 deposits totaling $15,000 in 30 min.', channel: 'in_app', priority: 'high', isRead: true, readAt: hoursAgo(8) },
    { type: 'info', category: 'system', title: 'Scheduled Maintenance Window', message: 'Platform maintenance scheduled for 02:00-04:00 UTC Sunday. Expect brief API interruptions.', channel: 'in_app', priority: 'normal', isRead: true, readAt: daysAgo(2) },
    { type: 'success', category: 'integration', title: 'DraftKings Connection Established', message: 'Sports betting integration successfully connected with OAuth2 authentication.', channel: 'in_app', priority: 'normal', isRead: true, readAt: daysAgo(1) },
    { type: 'info', category: 'player', title: 'Player Segment Updated', message: '"High Rollers" segment now includes 342 players. Average deposit: $2,850/month.', channel: 'in_app', priority: 'low', isRead: true, readAt: hoursAgo(12) },
    { type: 'warning', category: 'financial', title: 'Commission Discrepancy', message: 'Affiliate #A109 commission calculation mismatch: $340 difference detected.', channel: 'in_app', priority: 'normal', isRead: true, readAt: daysAgo(1) },
    { type: 'error', category: 'system', title: 'Database Connection Pool Exhausted', message: 'SQLite connection pool reached 100% capacity. Connections queued. Auto-scaled to 150.', channel: 'in_app', priority: 'high', isRead: true, readAt: daysAgo(2) },
    { type: 'success', category: 'compliance', title: 'KYC Verification Passed', message: 'Player #8901 completed enhanced KYC. Identity verified via document + selfie.', channel: 'in_app', priority: 'normal', isRead: true, readAt: hoursAgo(16) },
    { type: 'info', category: 'webhook', title: 'Webhook Retry Succeeded', message: 'Withdrawal Alerts webhook delivery succeeded on attempt 2 after initial 500 error.', channel: 'in_app', priority: 'low', isRead: true, readAt: hoursAgo(6) },
    { type: 'success', category: 'player', title: 'Promotion Claimed', message: 'Player #2210 claimed "Weekend Reload Bonus" — 100% match up to $500 applied.', channel: 'in_app', priority: 'normal', isRead: true, readAt: hoursAgo(20) },
    { type: 'info', category: 'financial', title: 'Daily House Report Available', message: 'Daily house earnings report for March 4 generated. Net: $47,832. GGR: $189,240.', channel: 'in_app', priority: 'normal', isRead: true, readAt: hoursAgo(24) },
    { type: 'warning', category: 'integration', title: 'PokerStars Sync Delayed', message: 'Sync taking longer than expected. 2 errors encountered during batch processing.', channel: 'in_app', priority: 'normal', isRead: true, readAt: hoursAgo(2) },
  ]

  for (const n of notificationDefs) {
    await prisma.notification.create({
      data: {
        userId: n.isRead ? 'admin-001' : null, // unread = broadcast, read = specific user
        type: n.type,
        category: n.category,
        title: n.title,
        message: n.message,
        metadata: JSON.stringify({
          actionUrl: `/dashboard/${n.category}`,
          entityType: n.category,
        }),
        isRead: n.isRead,
        readAt: n.readAt ?? null,
        channel: n.channel,
        priority: n.priority,
        expiresAt: daysAgo(-30), // expires in 30 days
        createdAt: minsAgo(randInt(1, 2880)),
      },
    })
  }

  console.log(`   ✅ Created ${notificationDefs.length} Notification records (8 unread)\n`)

  // ═══════════════════════════════════════════════════════════════════════
  // 8. NotificationPreference (6) — one per category
  // ═══════════════════════════════════════════════════════════════════════
  console.log('⚙️  Seeding NotificationPreference (6)...')

  const categories = ['financial', 'player', 'system', 'webhook', 'integration', 'compliance']
  const prefData: Record<string, { channel: string; minPriority: string; quietStart?: string; quietEnd?: string }> = {
    financial:   { channel: 'in_app', minPriority: 'normal' },
    player:      { channel: 'in_app', minPriority: 'low' },
    system:      { channel: 'in_app', minPriority: 'normal', quietStart: '22:00', quietEnd: '08:00' },
    webhook:     { channel: 'in_app', minPriority: 'normal' },
    integration: { channel: 'in_app', minPriority: 'high' },
    compliance:  { channel: 'in_app', minPriority: 'low' },
  }

  for (const cat of categories) {
    const pref = prefData[cat]
    await prisma.notificationPreference.create({
      data: {
        userId: 'admin-001',
        category: cat,
        channel: pref.channel,
        isEnabled: true,
        minPriority: pref.minPriority,
        quietHoursStart: pref.quietStart ?? null,
        quietHoursEnd: pref.quietEnd ?? null,
      },
    })
  }

  console.log(`   ✅ Created ${categories.length} NotificationPreference records\n`)

  // ═══════════════════════════════════════════════════════════════════════
  // 9. NotificationTemplate (8) — with {{variable}} templates
  // ═══════════════════════════════════════════════════════════════════════
  console.log('📝 Seeding NotificationTemplate (8)...')

  const templates = await prisma.$transaction([
    prisma.notificationTemplate.create({
      data: {
        name: 'deposit_confirmed',
        category: 'financial',
        titleTemplate: 'Deposit of {{amount}} {{currency}} Confirmed',
        bodyTemplate: 'Player {{playerName}} (ID: {{playerId}}) deposit of {{amount}} {{currency}} via {{method}} has been confirmed. Transaction hash: {{txHash}}.',
        channel: 'in_app',
        isActive: true,
      },
    }),
    prisma.notificationTemplate.create({
      data: {
        name: 'withdrawal_pending',
        category: 'financial',
        titleTemplate: 'Withdrawal of {{amount}} {{currency}} Pending Approval',
        bodyTemplate: 'Player {{playerName}} requested withdrawal of {{amount}} {{currency}} to {{destination}}. Requires manual review — exceeds auto-approval limit of {{threshold}} {{currency}}.',
        channel: 'in_app',
        isActive: true,
      },
    }),
    prisma.notificationTemplate.create({
      data: {
        name: 'variance_alert',
        category: 'financial',
        titleTemplate: '⚠️ Variance Threshold Exceeded: {{gameName}}',
        bodyTemplate: 'Game {{gameName}} RTP variance at {{variancePercent}}% — exceeds {{thresholdPercent}}% threshold. Current RTP: {{currentRtp}}%, Expected: {{expectedRtp}}%. Investigation required.',
        channel: 'in_app',
        isActive: true,
      },
    }),
    prisma.notificationTemplate.create({
      data: {
        name: 'kyc_flag',
        category: 'compliance',
        titleTemplate: 'KYC Verification Flag: {{playerName}}',
        bodyTemplate: 'Player {{playerName}} (ID: {{playerId}}) failed {{verificationType}} verification. Reason: {{flagReason}}. Account status changed to {{accountStatus}}.',
        channel: 'in_app',
        isActive: true,
      },
    }),
    prisma.notificationTemplate.create({
      data: {
        name: 'self_exclusion',
        category: 'compliance',
        titleTemplate: 'Self-Exclusion Activated: {{playerName}}',
        bodyTemplate: 'Player {{playerName}} (ID: {{playerId}}) activated {{duration}} self-exclusion effective {{startDate}}. Account restricted until {{endDate}}. All active sessions terminated.',
        channel: 'in_app',
        isActive: true,
      },
    }),
    prisma.notificationTemplate.create({
      data: {
        name: 'webhook_failed',
        category: 'webhook',
        titleTemplate: 'Webhook Delivery Failed: {{webhookName}}',
        bodyTemplate: 'Webhook "{{webhookName}}" delivery to {{targetUrl}} failed with status {{statusCode}} after {{attemptCount}} attempts. Last error: {{errorMessage}}. Next retry: {{nextRetryAt}}.',
        channel: 'in_app',
        isActive: true,
      },
    }),
    prisma.notificationTemplate.create({
      data: {
        name: 'integration_error',
        category: 'integration',
        titleTemplate: 'Integration Error: {{integrationName}}',
        bodyTemplate: 'Integration "{{integrationName}}" encountered error: {{errorMessage}}. Status changed to {{status}}. Consecutive failures: {{failureCount}}. Last successful sync: {{lastSuccessAt}}.',
        channel: 'in_app',
        isActive: true,
      },
    }),
    prisma.notificationTemplate.create({
      data: {
        name: 'jackpot_won',
        category: 'financial',
        titleTemplate: '🎉 Jackpot Won: {{jackpotName}} — {{amount}} {{currency}}',
        bodyTemplate: 'Player {{playerName}} (ID: {{playerId}}) won the {{jackpotName}} progressive jackpot of {{amount}} {{currency}} on game {{gameName}}. Payout processing initiated.',
        channel: 'in_app',
        isActive: true,
      },
    }),
  ])

  console.log(`   ✅ Created ${templates.length} NotificationTemplate records\n`)

  // ═══════════════════════════════════════════════════════════════════════
  // 10. NotificationChannel (5) — Email, SMS, Webhook, Slack, Discord
  // ═══════════════════════════════════════════════════════════════════════
  console.log('📡 Seeding NotificationChannel (5)...')

  const channels = await prisma.$transaction([
    prisma.notificationChannel.create({
      data: {
        userId: 'admin-001',
        type: 'email',
        config: JSON.stringify({
          email: 'ops@tols-platform.io',
          format: 'html',
          includeTimestamps: true,
        }),
        isVerified: true,
        isActive: true,
      },
    }),
    prisma.notificationChannel.create({
      data: {
        userId: 'admin-001',
        type: 'sms',
        config: JSON.stringify({
          phone: '+1-555-0142',
          provider: 'twilio',
          maxPerHour: 10,
        }),
        isVerified: true,
        isActive: true,
      },
    }),
    prisma.notificationChannel.create({
      data: {
        userId: 'admin-001',
        type: 'webhook',
        config: JSON.stringify({
          url: 'https://ops.internal.tols.io/notifications',
          method: 'POST',
          headers: { 'X-Notification-Secret': 'ntf_secret_a1b2c3' },
        }),
        isVerified: true,
        isActive: true,
      },
    }),
    prisma.notificationChannel.create({
      data: {
        userId: 'admin-001',
        type: 'slack',
        config: JSON.stringify({
          workspace: 'tols-platform',
          channel: '#ops-alerts',
          webhookUrl: 'https://hooks.slack.com/services/T0X/B0X/xxx',
        }),
        isVerified: true,
        isActive: true,
      },
    }),
    prisma.notificationChannel.create({
      data: {
        userId: 'admin-001',
        type: 'discord',
        config: JSON.stringify({
          guildId: '1092384756',
          channelId: '2093847561',
          webhookUrl: 'https://discord.com/api/webhooks/1092384756/xxx',
          mentionRoles: ['&OnCallOps'],
        }),
        isVerified: false,
        isActive: false,
      },
    }),
  ])

  console.log(`   ✅ Created ${channels.length} NotificationChannel records\n`)

  // ═══════════════════════════════════════════════════════════════════════
  // Summary
  // ═══════════════════════════════════════════════════════════════════════
  console.log('═══════════════════════════════════════════════════════')
  console.log('  🎰 TOLS Platform — API & Notifications Seed Complete')
  console.log('═══════════════════════════════════════════════════════')
  console.log(`  ApiToken              : ${apiTokens.length}`)
  console.log(`  WebhookEndpoint       : ${webhookEndpoints.length}`)
  console.log(`  WebhookDelivery       : ${webhookDeliveries.length}`)
  console.log(`  Integration           : ${integrations.length}`)
  console.log(`  McpEndpoint           : ${mcpEndpoints.length}`)
  console.log(`  ApiUsageLog           : 20`)
  console.log(`  Notification          : ${notificationDefs.length} (8 unread)`)
  console.log(`  NotificationPreference: ${categories.length}`)
  console.log(`  NotificationTemplate  : ${templates.length}`)
  console.log(`  NotificationChannel   : ${channels.length}`)
  console.log('═══════════════════════════════════════════════════════\n')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
