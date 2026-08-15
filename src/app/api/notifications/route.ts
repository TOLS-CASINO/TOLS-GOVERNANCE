import { NextResponse } from 'next/server'

const now = new Date()
const ts = (minsAgo: number) => new Date(now.getTime() - minsAgo * 60000).toISOString()

const notifications = [
  // FINANCIAL (7)
  {
    id: 'n-001', userId: 'u-001', type: 'success', category: 'financial', priority: 'normal',
    title: 'Deposit of $5,000 Confirmed',
    message: 'A deposit of $5,000.00 USD from player BigWinner_X has been confirmed via bank transfer. Net amount: $4,975.00',
    metadata: JSON.stringify({ amount: 5000, currency: 'USD', method: 'bank_transfer' }),
    isRead: false, readAt: '', channel: 'in_app', createdAt: ts(3),
  },
  {
    id: 'n-002', userId: 'u-001', type: 'warning', category: 'financial', priority: 'high',
    title: 'Withdrawal Pending Approval',
    message: 'A withdrawal of $15,000.00 USD from player BigWinner_X requires manual approval. This exceeds the auto-approve threshold of $10,000.',
    metadata: JSON.stringify({ amount: 15000, currency: 'USD', method: 'wire' }),
    isRead: false, readAt: '', channel: 'in_app', createdAt: ts(8),
  },
  {
    id: 'n-003', userId: 'u-001', type: 'error', category: 'financial', priority: 'high',
    title: 'Variance Alert: Marketing spend +25%',
    message: 'Marketing expenditure is 25.3% above budget this period. Threshold is ±15%. Immediate review recommended.',
    metadata: JSON.stringify({ variancePercent: 25.3, threshold: 15 }),
    isRead: true, readAt: ts(14), channel: 'in_app', createdAt: ts(15),
  },
  {
    id: 'n-004', userId: 'u-001', type: 'info', category: 'financial', priority: 'normal',
    title: 'Escrow Settlement Completed',
    message: 'Escrow settlement #S-2025-142 completed successfully. $847,500 distributed across 6 waterfall tiers.',
    metadata: JSON.stringify({ settlementId: 'S-2025-142', amount: 847500 }),
    isRead: true, readAt: ts(44), channel: 'email', createdAt: ts(45),
  },
  {
    id: 'n-005', userId: 'u-001', type: 'success', category: 'financial', priority: 'low',
    title: 'Revenue Target Met',
    message: 'Weekly revenue target of $2.1M has been achieved. Current week total: $2,187,450. Performance: +4.2% above target.',
    metadata: JSON.stringify({ target: 2100000, actual: 2187450 }),
    isRead: true, readAt: ts(119), channel: 'in_app', createdAt: ts(120),
  },
  {
    id: 'n-006', userId: 'u-001', type: 'warning', category: 'financial', priority: 'normal',
    title: 'Large Deposit Flagged',
    message: 'Deposit of $25,000 from player HighRoller_X flagged for AML review. Transaction exceeds $10K reporting threshold.',
    metadata: JSON.stringify({ amount: 25000, amlThreshold: 10000 }),
    isRead: true, readAt: ts(59), channel: 'email', createdAt: ts(60),
  },
  {
    id: 'n-007', userId: 'u-001', type: 'info', category: 'financial', priority: 'low',
    title: 'Waterfall Distribution Scheduled',
    message: 'Next waterfall distribution scheduled for 2025-03-16 00:00 UTC. Estimated pool: $1,245,000.',
    metadata: JSON.stringify({ pool: 1245000, date: '2025-03-16' }),
    isRead: true, readAt: ts(179), channel: 'in_app', createdAt: ts(180),
  },

  // PLAYER (6)
  {
    id: 'n-008', userId: 'u-001', type: 'info', category: 'player', priority: 'low',
    title: 'New Player Registration: AlexK_99',
    message: 'New player AlexK_99 registered from Canada. Initial deposit: $100 USD. Source: organic_search.',
    metadata: JSON.stringify({ playerName: 'AlexK_99', country: 'CA', source: 'organic_search' }),
    isRead: true, readAt: ts(4), channel: 'in_app', createdAt: ts(5),
  },
  {
    id: 'n-009', userId: 'u-001', type: 'warning', category: 'player', priority: 'high',
    title: 'High Value Player Login: HighRoller_X',
    message: 'VIP Level 5 player HighRoller_X logged in from new device/location: Toronto, CA. Lifetime value: $142,500.',
    metadata: JSON.stringify({ vipLevel: 5, ltv: 142500, location: 'Toronto, CA' }),
    isRead: false, readAt: '', channel: 'in_app', createdAt: ts(10),
  },
  {
    id: 'n-010', userId: 'u-001', type: 'info', category: 'player', priority: 'normal',
    title: 'Player Level Up: CryptoKing99',
    message: 'Player CryptoKing99 reached VIP Level 3. Qualifying wager total: $15,200. Bonus awarded: 500 USDT.',
    metadata: JSON.stringify({ vipLevel: 3, wagerTotal: 15200, bonus: 500 }),
    isRead: true, readAt: ts(34), channel: 'in_app', createdAt: ts(35),
  },
  {
    id: 'n-011', userId: 'u-001', type: 'success', category: 'player', priority: 'normal',
    title: 'Player Reactivated: SleepBear_42',
    message: 'Dormant player SleepBear_42 (inactive 45 days) returned and deposited $200. Reactivation bonus applied.',
    metadata: JSON.stringify({ dormantDays: 45, deposit: 200 }),
    isRead: true, readAt: ts(89), channel: 'email', createdAt: ts(90),
  },
  {
    id: 'n-012', userId: 'u-001', type: 'warning', category: 'player', priority: 'high',
    title: 'Suspicious Login Attempt',
    message: 'Multiple failed login attempts for player LuckyDraw_77 from IP 185.220.101.42 (known VPN exit node). Account temporarily locked.',
    metadata: JSON.stringify({ ip: '185.220.101.42', isVpn: true }),
    isRead: true, readAt: ts(19), channel: 'in_app', createdAt: ts(20),
  },
  {
    id: 'n-013', userId: 'u-001', type: 'info', category: 'player', priority: 'normal',
    title: 'Player Segment Updated',
    message: 'Segment "High Value - Active" updated: 12 players added, 3 removed. Total segment size: 247.',
    metadata: JSON.stringify({ segment: 'High Value - Active', added: 12, removed: 3, total: 247 }),
    isRead: true, readAt: ts(149), channel: 'in_app', createdAt: ts(150),
  },

  // SYSTEM (4)
  {
    id: 'n-014', userId: 'u-001', type: 'warning', category: 'system', priority: 'high',
    title: 'API Token Expiring in 7 Days',
    message: 'API token "Staging Environment" (tols_b7d4n2p5) expires on 2025-03-20. Generate a new token to avoid service interruption.',
    metadata: JSON.stringify({ tokenPreview: 'tols_b7d4n2p5', expiresAt: '2025-03-20' }),
    isRead: false, readAt: '', channel: 'in_app', createdAt: ts(30),
  },
  {
    id: 'n-015', userId: 'u-001', type: 'info', category: 'system', priority: 'normal',
    title: 'System Maintenance Scheduled',
    message: 'Planned maintenance window: 2025-03-17 02:00-04:00 UTC. Expected downtime: 15 minutes. All services affected.',
    metadata: JSON.stringify({ window: '02:00-04:00 UTC', downtime: '15min' }),
    isRead: true, readAt: ts(239), channel: 'email', createdAt: ts(240),
  },
  {
    id: 'n-016', userId: 'u-001', type: 'success', category: 'system', priority: 'normal',
    title: 'Backup Completed Successfully',
    message: 'Daily database backup completed. Size: 2.4 GB. Duration: 8m 32s. Stored: s3://tols-backups/2025-03-15/',
    metadata: JSON.stringify({ size: '2.4 GB', duration: '8m 32s' }),
    isRead: true, readAt: ts(299), channel: 'in_app', createdAt: ts(300),
  },
  {
    id: 'n-017', userId: 'u-001', type: 'error', category: 'system', priority: 'urgent',
    title: 'Server Node Degraded: US-West',
    message: 'Server node US-West (Oregon) status changed to degraded. CPU: 89%, Memory: 92%. Auto-scaling triggered. Investigate immediately.',
    metadata: JSON.stringify({ node: 'US-West', cpu: 89, memory: 92 }),
    isRead: false, readAt: '', channel: 'push', createdAt: ts(1),
  },

  // WEBHOOK (3)
  {
    id: 'n-018', userId: 'u-001', type: 'error', category: 'webhook', priority: 'high',
    title: 'Webhook Delivery Failed: 3 retries',
    message: 'Webhook "Variance Alerts" delivery failed after 3 retries to https://partner.com/webhooks/variance. Last status: 503 Service Unavailable.',
    metadata: JSON.stringify({ retries: 3, statusCode: 503 }),
    isRead: true, readAt: ts(24), channel: 'webhook', createdAt: ts(25),
  },
  {
    id: 'n-019', userId: 'u-001', type: 'warning', category: 'webhook', priority: 'urgent',
    title: 'Webhook Latency Spike',
    message: 'Webhook "Player Activity" experiencing elevated latency. Average response time: 2.8s (normal: 150ms). 5 timeouts in last hour.',
    metadata: JSON.stringify({ avgLatency: '2.8s', normalLatency: '150ms', timeouts: 5 }),
    isRead: true, readAt: ts(54), channel: 'webhook', createdAt: ts(55),
  },
  {
    id: 'n-020', userId: 'u-001', type: 'success', category: 'webhook', priority: 'high',
    title: 'Webhook Endpoint Verified',
    message: 'Webhook endpoint https://partner.com/webhooks/compliance verified successfully. Challenge response received in 89ms.',
    metadata: JSON.stringify({ responseTime: '89ms' }),
    isRead: true, readAt: ts(179), channel: 'webhook', createdAt: ts(180),
  },

  // INTEGRATION (3)
  {
    id: 'n-021', userId: 'u-001', type: 'critical', category: 'integration', priority: 'urgent',
    title: 'Integration Sync Error: Custom Platform X',
    message: 'Custom Platform X sync failed with 3 consecutive errors: AUTH_FAILED, TIMEOUT, RATE_LIMIT. Sync paused. Manual intervention required.',
    metadata: JSON.stringify({ errors: ['AUTH_FAILED', 'TIMEOUT', 'RATE_LIMIT'] }),
    isRead: false, readAt: '', channel: 'in_app', createdAt: ts(12),
  },
  {
    id: 'n-022', userId: 'u-001', type: 'info', category: 'integration', priority: 'normal',
    title: 'Integration Sync Progress: PokerStars',
    message: 'PokerStars sync in progress: 8,940 / 12,000 records (74.5%). Estimated completion: 12 minutes.',
    metadata: JSON.stringify({ progress: 74.5, records: 8940, total: 12000 }),
    isRead: true, readAt: ts(5), channel: 'in_app', createdAt: ts(6),
  },
  {
    id: 'n-023', userId: 'u-001', type: 'success', category: 'integration', priority: 'normal',
    title: 'Integration Sync Complete: BetMGM',
    message: 'BetMGM Casino sync completed. 15,230 records processed. Duration: 4m 18s. No errors detected.',
    metadata: JSON.stringify({ records: 15230, duration: '4m 18s' }),
    isRead: true, readAt: ts(94), channel: 'in_app', createdAt: ts(95),
  },

  // COMPLIANCE (2)
  {
    id: 'n-024', userId: 'u-001', type: 'critical', category: 'compliance', priority: 'high',
    title: 'KYC Flag: Player requires verification',
    message: 'Player Diamond_Hand flagged for KYC review. Reason: Government ID document expired 7 days ago. Deposit and withdrawal capabilities restricted.',
    metadata: JSON.stringify({ player: 'Diamond_Hand', reason: 'expired_gov_id' }),
    isRead: false, readAt: '', channel: 'in_app', createdAt: ts(18),
  },
  {
    id: 'n-025', userId: 'u-001', type: 'critical', category: 'compliance', priority: 'urgent',
    title: 'Self-Exclusion Request: Player123',
    message: 'Player Player123 submitted a self-exclusion request for 6 months. All active sessions terminated. Account locked effective immediately. Marketing outreach disabled.',
    metadata: JSON.stringify({ player: 'Player123', duration: '6 months' }),
    isRead: false, readAt: '', channel: 'push', createdAt: ts(7),
  },

  // VENDOR (3)
  {
    id: 'n-026', userId: 'u-001', type: 'warning', category: 'integration', priority: 'high',
    title: 'Provider Evolution Gaming: High Error Rate',
    message: 'Evolution Gaming API returning 12.4% error rate (threshold: 5%). Affected games: 340. Last 15 min: 47 errors out of 379 requests.',
    metadata: JSON.stringify({ provider: 'Evolution Gaming', errorRate: 12.4, threshold: 5 }),
    isRead: false, readAt: '', channel: 'in_app', createdAt: ts(2),
  },
  {
    id: 'n-027', userId: 'u-001', type: 'success', category: 'integration', priority: 'normal',
    title: 'Provider Pragmatic Play: 45 New Games Integrated',
    message: 'Pragmatic Play game integration completed. 45 new slots added to the lobby. All games passed RTP verification. Average RTP: 96.2%.',
    metadata: JSON.stringify({ provider: 'Pragmatic Play', newGames: 45, avgRtp: 96.2 }),
    isRead: true, readAt: ts(28), channel: 'in_app', createdAt: ts(30),
  },
  {
    id: 'n-028', userId: 'u-001', type: 'error', category: 'integration', priority: 'urgent',
    title: 'Provider NetEnt: Callback Endpoint Down',
    message: 'NetEnt callback endpoint https://netent.api/callback returning 504 Gateway Timeout. Game sessions may not be tracking correctly. 1,200 active sessions affected.',
    metadata: JSON.stringify({ provider: 'NetEnt', statusCode: 504, activeSessions: 1200 }),
    isRead: false, readAt: '', channel: 'push', createdAt: ts(4),
  },
]

// Preferences in the shape the frontend expects: one row per (category, channel) combo
const preferences = [
  // financial
  { id: 'pref-f-inapp', category: 'financial', channel: 'in_app', isEnabled: true, minPriority: 'normal', quietHoursStart: '22:00', quietHoursEnd: '08:00' },
  { id: 'pref-f-email', category: 'financial', channel: 'email', isEnabled: true, minPriority: 'high', quietHoursStart: '22:00', quietHoursEnd: '08:00' },
  { id: 'pref-f-sms', category: 'financial', channel: 'sms', isEnabled: false, minPriority: 'urgent', quietHoursStart: '', quietHoursEnd: '' },
  { id: 'pref-f-webhook', category: 'financial', channel: 'webhook', isEnabled: true, minPriority: 'high', quietHoursStart: '', quietHoursEnd: '' },
  { id: 'pref-f-push', category: 'financial', channel: 'push', isEnabled: false, minPriority: 'urgent', quietHoursStart: '', quietHoursEnd: '' },
  // player
  { id: 'pref-p-inapp', category: 'player', channel: 'in_app', isEnabled: true, minPriority: 'normal', quietHoursStart: '22:00', quietHoursEnd: '08:00' },
  { id: 'pref-p-email', category: 'player', channel: 'email', isEnabled: true, minPriority: 'high', quietHoursStart: '22:00', quietHoursEnd: '08:00' },
  { id: 'pref-p-sms', category: 'player', channel: 'sms', isEnabled: false, minPriority: 'urgent', quietHoursStart: '', quietHoursEnd: '' },
  { id: 'pref-p-webhook', category: 'player', channel: 'webhook', isEnabled: false, minPriority: 'urgent', quietHoursStart: '', quietHoursEnd: '' },
  { id: 'pref-p-push', category: 'player', channel: 'push', isEnabled: false, minPriority: 'urgent', quietHoursStart: '', quietHoursEnd: '' },
  // system
  { id: 'pref-s-inapp', category: 'system', channel: 'in_app', isEnabled: true, minPriority: 'normal', quietHoursStart: '', quietHoursEnd: '' },
  { id: 'pref-s-email', category: 'system', channel: 'email', isEnabled: true, minPriority: 'high', quietHoursStart: '', quietHoursEnd: '' },
  { id: 'pref-s-sms', category: 'system', channel: 'sms', isEnabled: false, minPriority: 'urgent', quietHoursStart: '', quietHoursEnd: '' },
  { id: 'pref-s-webhook', category: 'system', channel: 'webhook', isEnabled: false, minPriority: 'urgent', quietHoursStart: '', quietHoursEnd: '' },
  { id: 'pref-s-push', category: 'system', channel: 'push', isEnabled: true, minPriority: 'high', quietHoursStart: '', quietHoursEnd: '' },
  // webhook
  { id: 'pref-w-inapp', category: 'webhook', channel: 'in_app', isEnabled: true, minPriority: 'normal', quietHoursStart: '', quietHoursEnd: '' },
  { id: 'pref-w-email', category: 'webhook', channel: 'email', isEnabled: false, minPriority: 'high', quietHoursStart: '', quietHoursEnd: '' },
  { id: 'pref-w-sms', category: 'webhook', channel: 'sms', isEnabled: false, minPriority: 'urgent', quietHoursStart: '', quietHoursEnd: '' },
  { id: 'pref-w-webhook', category: 'webhook', channel: 'webhook', isEnabled: false, minPriority: 'urgent', quietHoursStart: '', quietHoursEnd: '' },
  { id: 'pref-w-push', category: 'webhook', channel: 'push', isEnabled: false, minPriority: 'urgent', quietHoursStart: '', quietHoursEnd: '' },
  // integration
  { id: 'pref-i-inapp', category: 'integration', channel: 'in_app', isEnabled: true, minPriority: 'normal', quietHoursStart: '', quietHoursEnd: '' },
  { id: 'pref-i-email', category: 'integration', channel: 'email', isEnabled: true, minPriority: 'high', quietHoursStart: '', quietHoursEnd: '' },
  { id: 'pref-i-sms', category: 'integration', channel: 'sms', isEnabled: false, minPriority: 'urgent', quietHoursStart: '', quietHoursEnd: '' },
  { id: 'pref-i-webhook', category: 'integration', channel: 'webhook', isEnabled: false, minPriority: 'urgent', quietHoursStart: '', quietHoursEnd: '' },
  { id: 'pref-i-push', category: 'integration', channel: 'push', isEnabled: true, minPriority: 'high', quietHoursStart: '', quietHoursEnd: '' },
  // compliance
  { id: 'pref-c-inapp', category: 'compliance', channel: 'in_app', isEnabled: true, minPriority: 'normal', quietHoursStart: '', quietHoursEnd: '' },
  { id: 'pref-c-email', category: 'compliance', channel: 'email', isEnabled: true, minPriority: 'high', quietHoursStart: '', quietHoursEnd: '' },
  { id: 'pref-c-sms', category: 'compliance', channel: 'sms', isEnabled: true, minPriority: 'high', quietHoursStart: '', quietHoursEnd: '' },
  { id: 'pref-c-webhook', category: 'compliance', channel: 'webhook', isEnabled: true, minPriority: 'high', quietHoursStart: '', quietHoursEnd: '' },
  { id: 'pref-c-push', category: 'compliance', channel: 'push', isEnabled: true, minPriority: 'normal', quietHoursStart: '', quietHoursEnd: '' },
]

const templates = [
  {
    id: 'tmpl-001', name: 'Deposit Confirmed', category: 'financial',
    titleTemplate: 'Deposit of {{amount}} {{currency}} Confirmed',
    bodyTemplate: 'A deposit of {{amount}} {{currency}} from player {{playerName}} ({{playerId}}) has been confirmed via {{method}}. Net amount: {{netAmount}} {{currency}}. Transaction ID: {{txId}}.',
    channel: 'in_app', isActive: true,
  },
  {
    id: 'tmpl-002', name: 'Withdrawal Pending Approval', category: 'financial',
    titleTemplate: 'Withdrawal of {{amount}} {{currency}} Requires Approval',
    bodyTemplate: 'A withdrawal of {{amount}} {{currency}} from player {{playerName}} ({{playerId}}) is pending approval. Method: {{method}}. Requested at: {{requestedAt}}.',
    channel: 'email', isActive: true,
  },
  {
    id: 'tmpl-003', name: 'Variance Alert', category: 'financial',
    titleTemplate: 'Variance Alert: {{category}} {{direction}}{{percentage}}%',
    bodyTemplate: 'Variance threshold exceeded for {{category}}. Current variance: {{direction}}{{percentage}}% (threshold: ±{{threshold}}%). Period: {{period}}. Review recommended.',
    channel: 'in_app', isActive: true,
  },
  {
    id: 'tmpl-004', name: 'Player Registration', category: 'player',
    titleTemplate: 'New Player Registration: {{playerName}}',
    bodyTemplate: 'New player {{playerName}} ({{playerId}}) registered from {{country}}. Initial deposit: {{initialDeposit}} {{currency}}. Source: {{source}}.',
    channel: 'in_app', isActive: true,
  },
  {
    id: 'tmpl-005', name: 'High Value Player Login', category: 'player',
    titleTemplate: 'High Value Player Login: {{playerName}}',
    bodyTemplate: 'VIP Level {{vipLevel}} player {{playerName}} ({{playerId}}) logged in from {{location}}. Lifetime value: {{lifetimeValue}} {{currency}}. {{deviceInfo}}.',
    channel: 'in_app', isActive: true,
  },
  {
    id: 'tmpl-006', name: 'API Token Expiring', category: 'system',
    titleTemplate: 'API Token "{{tokenName}}" Expiring in {{daysRemaining}} Days',
    bodyTemplate: 'API token "{{tokenName}}" ({{tokenPreview}}) expires on {{expiresAt}}. Generate a new token at the API Hub to avoid service interruption. Affected scopes: {{scopes}}.',
    channel: 'email', isActive: true,
  },
  {
    id: 'tmpl-007', name: 'Webhook Delivery Failed', category: 'webhook',
    titleTemplate: 'Webhook "{{webhookName}}" Delivery Failed',
    bodyTemplate: 'Webhook "{{webhookName}}" delivery to {{url}} failed after {{retryCount}} retries. Last HTTP status: {{statusCode}}. Event: {{event}}. Error: {{errorMessage}}.',
    channel: 'webhook', isActive: true,
  },
  {
    id: 'tmpl-008', name: 'KYC Verification Flag', category: 'compliance',
    titleTemplate: 'KYC Flag: Player {{playerName}} Requires Verification',
    bodyTemplate: 'Player {{playerName}} ({{playerId}}) flagged for KYC review. Reason: {{flagReason}}. Account capabilities restricted until verification is complete. Flagged at: {{flaggedAt}}.',
    channel: 'email', isActive: true,
  },
]

const channels = [
  { id: 'ch-001', type: 'email', config: JSON.stringify({ address: 'ops@tols-casino.com', smtpHost: 'smtp.sendgrid.net', smtpPort: 587 }), isVerified: true, isActive: true },
  { id: 'ch-002', type: 'sms', config: JSON.stringify({ phone: '+1-555-0142', provider: 'twilio', fromNumber: '+1-555-0100' }), isVerified: true, isActive: true },
  { id: 'ch-003', type: 'webhook', config: JSON.stringify({ url: 'https://internal.tols/notify', secret: 'whsec_***', method: 'POST' }), isVerified: true, isActive: true },
  { id: 'ch-004', type: 'slack', config: JSON.stringify({ webhookUrl: 'https://hooks.slack.com/***', channel: '#tols-alerts' }), isVerified: true, isActive: true },
  { id: 'ch-005', type: 'discord', config: JSON.stringify({ webhookUrl: 'https://discord.com/api/webhooks/***', channelId: '1098765432' }), isVerified: false, isActive: false },
  { id: 'ch-006', type: 'telegram', config: JSON.stringify({ botToken: 'bot***', chatId: '-1001234567890' }), isVerified: true, isActive: false },
]

const stats = {
  total: 28,
  unread: 9,
  byCategory: {
    financial: 7,
    player: 6,
    system: 4,
    webhook: 3,
    integration: 6,
    compliance: 2,
  },
  byPriority: {
    low: 3,
    normal: 11,
    high: 9,
    urgent: 5,
  },
  byType: {
    info: 7,
    warning: 7,
    success: 7,
    error: 4,
    critical: 3,
  },
}

export async function GET() {
  return NextResponse.json({
    notifications,
    preferences,
    templates,
    channels,
    stats,
  })
}
