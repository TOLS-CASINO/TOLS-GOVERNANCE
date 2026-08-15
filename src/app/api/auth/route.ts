import { NextResponse } from 'next/server'

const now = new Date()
const ts = (minsAgo: number) => new Date(now.getTime() - minsAgo * 60000).toISOString()

const users = [
  { id: 'u-001', email: 'admin@tols-casino.com', name: 'Marco Rossi', role: 'admin', casinoId: 'casino-001', casinoName: 'TOLS Casino', isActive: true, lastLoginAt: ts(5), createdAt: '2024-01-15T00:00:00.000Z' },
  { id: 'u-002', email: 'finance@tols-casino.com', name: 'Sarah Chen', role: 'finance', casinoId: 'casino-001', casinoName: 'TOLS Casino', isActive: true, lastLoginAt: ts(30), createdAt: '2024-02-20T00:00:00.000Z' },
  { id: 'u-003', email: 'controller@tols-casino.com', name: 'James Wilson', role: 'controller', casinoId: 'casino-001', casinoName: 'TOLS Casino', isActive: true, lastLoginAt: ts(120), createdAt: '2024-03-10T00:00:00.000Z' },
  { id: 'u-004', email: 'marketing@tols-casino.com', name: 'Lisa Park', role: 'marketing', casinoId: 'casino-001', casinoName: 'TOLS Casino', isActive: true, lastLoginAt: ts(45), createdAt: '2024-04-05T00:00:00.000Z' },
  { id: 'u-005', email: 'support@tols-casino.com', name: 'David Kim', role: 'support', casinoId: 'casino-001', casinoName: 'TOLS Casino', isActive: false, lastLoginAt: ts(1440), createdAt: '2024-05-01T00:00:00.000Z' },
  { id: 'u-006', email: 'viewer@tols-casino.com', name: 'Anna Schmidt', role: 'viewer', casinoId: 'casino-002', casinoName: 'Partner Casino', isActive: true, lastLoginAt: ts(240), createdAt: '2024-06-15T00:00:00.000Z' },
]

const sessions = [
  { id: 's-001', userId: 'u-001', userName: 'Marco Rossi', ipAddress: '192.168.1.100', userAgent: 'Chrome 121 / macOS', createdAt: ts(5), expiresAt: ts(-1155) },
  { id: 's-002', userId: 'u-002', userName: 'Sarah Chen', ipAddress: '10.0.0.45', userAgent: 'Firefox 122 / Windows', createdAt: ts(30), expiresAt: ts(-1130) },
  { id: 's-003', userId: 'u-003', userName: 'James Wilson', ipAddress: '172.16.0.22', userAgent: 'Safari 17 / iOS', createdAt: ts(120), expiresAt: ts(-1040) },
  { id: 's-004', userId: 'u-004', userName: 'Lisa Park', ipAddress: '192.168.2.88', userAgent: 'Chrome 121 / Android', createdAt: ts(45), expiresAt: ts(-1115) },
]

const permissions = [
  { id: 'rp-001', role: 'admin', resource: 'players', actions: ['read', 'write', 'delete', 'approve'] },
  { id: 'rp-002', role: 'admin', resource: 'financial', actions: ['read', 'write', 'delete', 'approve'] },
  { id: 'rp-003', role: 'admin', resource: 'wallets', actions: ['read', 'write', 'delete', 'approve'] },
  { id: 'rp-004', role: 'admin', resource: 'promotions', actions: ['read', 'write', 'delete', 'approve'] },
  { id: 'rp-005', role: 'admin', resource: 'settings', actions: ['read', 'write', 'delete', 'approve'] },
  { id: 'rp-006', role: 'admin', resource: 'vendors', actions: ['read', 'write', 'delete', 'approve'] },
  { id: 'rp-007', role: 'admin', resource: 'api', actions: ['read', 'write', 'delete', 'approve'] },
  { id: 'rp-008', role: 'controller', resource: 'players', actions: ['read', 'write'] },
  { id: 'rp-009', role: 'controller', resource: 'financial', actions: ['read', 'write', 'approve'] },
  { id: 'rp-010', role: 'controller', resource: 'wallets', actions: ['read', 'write', 'approve'] },
  { id: 'rp-011', role: 'controller', resource: 'promotions', actions: ['read'] },
  { id: 'rp-012', role: 'controller', resource: 'settings', actions: ['read'] },
  { id: 'rp-013', role: 'controller', resource: 'vendors', actions: ['read'] },
  { id: 'rp-014', role: 'controller', resource: 'api', actions: ['read'] },
  { id: 'rp-015', role: 'finance', resource: 'players', actions: ['read'] },
  { id: 'rp-016', role: 'finance', resource: 'financial', actions: ['read', 'write'] },
  { id: 'rp-017', role: 'finance', resource: 'wallets', actions: ['read', 'write'] },
  { id: 'rp-018', role: 'finance', resource: 'promotions', actions: ['read'] },
  { id: 'rp-019', role: 'finance', resource: 'settings', actions: ['read'] },
  { id: 'rp-020', role: 'finance', resource: 'vendors', actions: ['read'] },
  { id: 'rp-021', role: 'finance', resource: 'api', actions: ['read'] },
  { id: 'rp-022', role: 'marketing', resource: 'players', actions: ['read'] },
  { id: 'rp-023', role: 'marketing', resource: 'financial', actions: ['read'] },
  { id: 'rp-024', role: 'marketing', resource: 'promotions', actions: ['read', 'write'] },
  { id: 'rp-025', role: 'marketing', resource: 'settings', actions: ['read'] },
  { id: 'rp-026', role: 'support', resource: 'players', actions: ['read', 'write'] },
  { id: 'rp-027', role: 'support', resource: 'wallets', actions: ['read'] },
  { id: 'rp-028', role: 'support', resource: 'promotions', actions: ['read'] },
  { id: 'rp-029', role: 'viewer', resource: 'players', actions: ['read'] },
  { id: 'rp-030', role: 'viewer', resource: 'financial', actions: ['read'] },
  { id: 'rp-031', role: 'viewer', resource: 'wallets', actions: ['read'] },
]

const casinos = [
  { id: 'casino-001', name: 'TOLS Casino', slug: 'tols-casino', domain: 'tols-casino.com', status: 'active', plan: 'professional', maxPlayers: 10000, isActive: true },
  { id: 'casino-002', name: 'Partner Casino', slug: 'partner-casino', domain: 'partner-casino.com', status: 'active', plan: 'starter', maxPlayers: 1000, isActive: true },
]

const securitySettings = {
  passwordPolicy: { minLength: 12, requireUppercase: true, requireNumbers: true, requireSpecial: true, expiryDays: 90 },
  sessionSettings: { maxConcurrent: 3, sessionTimeout: 480, idleTimeout: 30 },
  twoFactorAuth: { enabled: true, enforceForAdmins: true, enforceForFinance: true, method: 'totp' },
  rateLimiting: { maxAttempts: 5, lockoutDuration: 15 },
  ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8', '172.16.0.0/12'],
}

export async function GET() {
  return NextResponse.json({ users, sessions, permissions, casinos, securitySettings })
}
