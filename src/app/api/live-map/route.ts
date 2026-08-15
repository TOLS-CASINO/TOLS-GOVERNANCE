import { NextResponse } from 'next/server'

const activeSessions = [
  { id: 's1', playerId: 'p1', playerName: 'AlexK_99', gameId: 'g1', gameName: 'Mega Moolah', country: 'United Kingdom', countryCode: 'GB', city: 'London', latitude: 51.5074, longitude: -0.1278, deviceType: 'desktop', wagerAmount: 1250, winAmount: 340, spinsPlayed: 45, startedAt: new Date(Date.now() - 120000).toISOString(), status: 'active' },
  { id: 's2', playerId: 'p2', playerName: 'LuckyLucy', gameId: 'g2', gameName: 'Starburst', country: 'Canada', countryCode: 'CA', city: 'Toronto', latitude: 43.6532, longitude: -79.3832, deviceType: 'mobile', wagerAmount: 580, winAmount: 120, spinsPlayed: 22, startedAt: new Date(Date.now() - 300000).toISOString(), status: 'active' },
  { id: 's3', playerId: 'p3', playerName: 'HighRoller_X', gameId: 'g3', gameName: 'Book of Dead', country: 'Germany', countryCode: 'DE', city: 'Berlin', latitude: 52.52, longitude: 13.405, deviceType: 'desktop', wagerAmount: 8500, winAmount: 12300, spinsPlayed: 150, startedAt: new Date(Date.now() - 600000).toISOString(), status: 'active' },
  { id: 's4', playerId: 'p4', playerName: 'SpinQueen', gameId: 'g1', gameName: 'Mega Moolah', country: 'Australia', countryCode: 'AU', city: 'Sydney', latitude: -33.8688, longitude: 151.2093, deviceType: 'tablet', wagerAmount: 2100, winAmount: 5000, spinsPlayed: 80, startedAt: new Date(Date.now() - 240000).toISOString(), status: 'active' },
  { id: 's5', playerId: 'p5', playerName: 'CryptoKing', gameId: 'g4', gameName: 'Gonzo\'s Quest', country: 'Japan', countryCode: 'JP', city: 'Tokyo', latitude: 35.6762, longitude: 139.6503, deviceType: 'desktop', wagerAmount: 3200, winAmount: 800, spinsPlayed: 65, startedAt: new Date(Date.now() - 180000).toISOString(), status: 'active' },
  { id: 's6', playerId: 'p6', playerName: 'VegasBaby', gameId: 'g5', gameName: 'Lightning Roulette', country: 'United States', countryCode: 'US', city: 'Las Vegas', latitude: 36.1699, longitude: -115.1398, deviceType: 'mobile', wagerAmount: 450, winAmount: 90, spinsPlayed: 18, startedAt: new Date(Date.now() - 60000).toISOString(), status: 'active' },
  { id: 's7', playerId: 'p7', playerName: 'MegaJack', gameId: 'g2', gameName: 'Starburst', country: 'Brazil', countryCode: 'BR', city: 'São Paulo', latitude: -23.5505, longitude: -46.6333, deviceType: 'mobile', wagerAmount: 780, winAmount: 150, spinsPlayed: 30, startedAt: new Date(Date.now() - 420000).toISOString(), status: 'active' },
  { id: 's8', playerId: 'p8', playerName: 'Diamond_Dan', gameId: 'g3', gameName: 'Book of Dead', country: 'South Africa', countryCode: 'ZA', city: 'Cape Town', latitude: -33.9249, longitude: 18.4241, deviceType: 'desktop', wagerAmount: 6200, winAmount: 9100, spinsPlayed: 110, startedAt: new Date(Date.now() - 480000).toISOString(), status: 'active' },
  { id: 's9', playerId: 'p9', playerName: 'Lucky7s', gameId: 'g1', gameName: 'Mega Moolah', country: 'India', countryCode: 'IN', city: 'Mumbai', latitude: 19.076, longitude: 72.8777, deviceType: 'mobile', wagerAmount: 350, winAmount: 70, spinsPlayed: 14, startedAt: new Date(Date.now() - 90000).toISOString(), status: 'active' },
  { id: 's10', playerId: 'p10', playerName: 'GoldRush', gameId: 'g4', gameName: 'Gonzo\'s Quest', country: 'New Zealand', countryCode: 'NZ', city: 'Auckland', latitude: -36.8485, longitude: 174.7633, deviceType: 'desktop', wagerAmount: 1900, winAmount: 4300, spinsPlayed: 55, startedAt: new Date(Date.now() - 300000).toISOString(), status: 'active' },
  { id: 's11', playerId: 'p11', playerName: 'AceHigh', gameId: 'g5', gameName: 'Lightning Roulette', country: 'France', countryCode: 'FR', city: 'Paris', latitude: 48.8566, longitude: 2.3522, deviceType: 'desktop', wagerAmount: 7100, winAmount: 2800, spinsPlayed: 95, startedAt: new Date(Date.now() - 540000).toISOString(), status: 'active' },
  { id: 's12', playerId: 'p12', playerName: 'PhantomSpin', gameId: 'g2', gameName: 'Starburst', country: 'Sweden', countryCode: 'SE', city: 'Stockholm', latitude: 59.3293, longitude: 18.0686, deviceType: 'mobile', wagerAmount: 420, winAmount: 680, spinsPlayed: 25, startedAt: new Date(Date.now() - 150000).toISOString(), status: 'active' },
  { id: 's13', playerId: 'p13', playerName: 'NeonNights', gameId: 'g3', gameName: 'Book of Dead', country: 'Norway', countryCode: 'NO', city: 'Oslo', latitude: 59.9139, longitude: 10.7522, deviceType: 'tablet', wagerAmount: 1500, winAmount: 2200, spinsPlayed: 40, startedAt: new Date(Date.now() - 200000).toISOString(), status: 'active' },
  { id: 's14', playerId: 'p14', playerName: 'RioRico', gameId: 'g1', gameName: 'Mega Moolah', country: 'Mexico', countryCode: 'MX', city: 'Mexico City', latitude: 19.4326, longitude: -99.1332, deviceType: 'mobile', wagerAmount: 670, winAmount: 130, spinsPlayed: 28, startedAt: new Date(Date.now() - 350000).toISOString(), status: 'active' },
  { id: 's15', playerId: 'p15', playerName: 'PolarBear', gameId: 'g4', gameName: 'Gonzo\'s Quest', country: 'Finland', countryCode: 'FI', city: 'Helsinki', latitude: 60.1699, longitude: 24.9384, deviceType: 'desktop', wagerAmount: 2800, winAmount: 560, spinsPlayed: 72, startedAt: new Date(Date.now() - 400000).toISOString(), status: 'active' },
  { id: 's16', playerId: 'p16', playerName: 'DragonSpin', gameId: 'g5', gameName: 'Lightning Roulette', country: 'South Korea', countryCode: 'KR', city: 'Seoul', latitude: 37.5665, longitude: 126.978, deviceType: 'mobile', wagerAmount: 950, winAmount: 1800, spinsPlayed: 35, startedAt: new Date(Date.now() - 270000).toISOString(), status: 'active' },
  { id: 's17', playerId: 'p17', playerName: 'Newbie_2024', gameId: 'g2', gameName: 'Starburst', country: 'Spain', countryCode: 'ES', city: 'Madrid', latitude: 40.4168, longitude: -3.7038, deviceType: 'mobile', wagerAmount: 100, winAmount: 25, spinsPlayed: 5, startedAt: new Date(Date.now() - 120000).toISOString(), status: 'active' },
  { id: 's18', playerId: 'p18', playerName: 'SilverStreak', gameId: 'g3', gameName: 'Book of Dead', country: 'Italy', countryCode: 'IT', city: 'Rome', latitude: 41.9028, longitude: 12.4964, deviceType: 'desktop', wagerAmount: 3800, winAmount: 6700, spinsPlayed: 88, startedAt: new Date(Date.now() - 500000).toISOString(), status: 'active' },
]

const serverNodes = [
  { id: 'n1', name: 'EU-West-1', region: 'Europe', countryCode: 'IE', latitude: 53.1424, longitude: -7.6921, status: 'online', activePlayers: 342, maxPlayers: 500, cpuLoad: 67, memoryLoad: 72, latencyMs: 12, uptime: 99.98 },
  { id: 'n2', name: 'EU-Central-1', region: 'Europe', countryCode: 'DE', latitude: 50.11, longitude: 8.68, status: 'online', activePlayers: 289, maxPlayers: 500, cpuLoad: 55, memoryLoad: 61, latencyMs: 8, uptime: 99.99 },
  { id: 'n3', name: 'US-East-1', region: 'North America', countryCode: 'US', latitude: 39.0, longitude: -77.5, status: 'online', activePlayers: 456, maxPlayers: 600, cpuLoad: 78, memoryLoad: 82, latencyMs: 15, uptime: 99.95 },
  { id: 'n4', name: 'US-West-1', region: 'North America', countryCode: 'US', latitude: 37.35, longitude: -121.9, status: 'degraded', activePlayers: 198, maxPlayers: 400, cpuLoad: 89, memoryLoad: 91, latencyMs: 45, uptime: 98.50 },
  { id: 'n5', name: 'APAC-1', region: 'Asia Pacific', countryCode: 'SG', latitude: 1.3521, longitude: 103.8198, status: 'online', activePlayers: 312, maxPlayers: 400, cpuLoad: 62, memoryLoad: 58, latencyMs: 22, uptime: 99.97 },
  { id: 'n6', name: 'APAC-2', region: 'Asia Pacific', countryCode: 'JP', latitude: 35.45, longitude: 139.65, status: 'online', activePlayers: 245, maxPlayers: 400, cpuLoad: 48, memoryLoad: 53, latencyMs: 18, uptime: 99.99 },
  { id: 'n7', name: 'SA-1', region: 'South America', countryCode: 'BR', latitude: -23.55, longitude: -46.63, status: 'online', activePlayers: 134, maxPlayers: 300, cpuLoad: 41, memoryLoad: 45, latencyMs: 35, uptime: 99.90 },
  { id: 'n8', name: 'AF-1', region: 'Africa', countryCode: 'ZA', latitude: -26.2, longitude: 28.04, status: 'online', activePlayers: 67, maxPlayers: 200, cpuLoad: 28, memoryLoad: 33, latencyMs: 52, uptime: 99.85 },
  { id: 'n9', name: 'OCE-1', region: 'Oceania', countryCode: 'AU', latitude: -33.87, longitude: 151.21, status: 'online', activePlayers: 98, maxPlayers: 200, cpuLoad: 35, memoryLoad: 40, latencyMs: 28, uptime: 99.92 },
]

const liveEvents = [
  { id: 'e1', eventType: 'big_win', playerName: 'HighRoller_X', gameName: 'Book of Dead', amount: 12300, currency: 'USD', country: 'Germany', countryCode: 'DE', city: 'Berlin', latitude: 52.52, longitude: 13.405, createdAt: new Date(Date.now() - 10000).toISOString() },
  { id: 'e2', eventType: 'jackpot_hit', playerName: 'SpinQueen', gameName: 'Mega Moolah', amount: 5000, currency: 'USD', country: 'Australia', countryCode: 'AU', city: 'Sydney', latitude: -33.8688, longitude: 151.2093, createdAt: new Date(Date.now() - 25000).toISOString() },
  { id: 'e3', eventType: 'deposit', playerName: 'CryptoKing', gameName: 'Gonzo\'s Quest', amount: 3200, currency: 'USD', country: 'Japan', countryCode: 'JP', city: 'Tokyo', latitude: 35.6762, longitude: 139.6503, createdAt: new Date(Date.now() - 40000).toISOString() },
  { id: 'e4', eventType: 'big_win', playerName: 'Diamond_Dan', gameName: 'Book of Dead', amount: 9100, currency: 'USD', country: 'South Africa', countryCode: 'ZA', city: 'Cape Town', latitude: -33.9249, longitude: 18.4241, createdAt: new Date(Date.now() - 55000).toISOString() },
  { id: 'e5', eventType: 'new_player', playerName: 'Newbie_2024', gameName: 'Starburst', amount: 0, currency: 'USD', country: 'Spain', countryCode: 'ES', city: 'Madrid', latitude: 40.4168, longitude: -3.7038, createdAt: new Date(Date.now() - 70000).toISOString() },
  { id: 'e6', eventType: 'big_win', playerName: 'GoldRush', gameName: 'Gonzo\'s Quest', amount: 4300, currency: 'USD', country: 'New Zealand', countryCode: 'NZ', city: 'Auckland', latitude: -36.8485, longitude: 174.7633, createdAt: new Date(Date.now() - 85000).toISOString() },
  { id: 'e7', eventType: 'deposit', playerName: 'AceHigh', gameName: 'Lightning Roulette', amount: 7100, currency: 'USD', country: 'France', countryCode: 'FR', city: 'Paris', latitude: 48.8566, longitude: 2.3522, createdAt: new Date(Date.now() - 100000).toISOString() },
  { id: 'e8', eventType: 'jackpot_hit', playerName: 'SilverStreak', gameName: 'Book of Dead', amount: 6700, currency: 'USD', country: 'Italy', countryCode: 'IT', city: 'Rome', latitude: 41.9028, longitude: 12.4964, createdAt: new Date(Date.now() - 115000).toISOString() },
  { id: 'e9', eventType: 'big_win', playerName: 'NeonNights', gameName: 'Book of Dead', amount: 2200, currency: 'USD', country: 'Norway', countryCode: 'NO', city: 'Oslo', latitude: 59.9139, longitude: 10.7522, createdAt: new Date(Date.now() - 130000).toISOString() },
  { id: 'e10', eventType: 'deposit', playerName: 'PolarBear', gameName: 'Gonzo\'s Quest', amount: 2800, currency: 'USD', country: 'Finland', countryCode: 'FI', city: 'Helsinki', latitude: 60.1699, longitude: 24.9384, createdAt: new Date(Date.now() - 145000).toISOString() },
  { id: 'e11', eventType: 'big_win', playerName: 'DragonSpin', gameName: 'Lightning Roulette', amount: 1800, currency: 'USD', country: 'South Korea', countryCode: 'KR', city: 'Seoul', latitude: 37.5665, longitude: 126.978, createdAt: new Date(Date.now() - 160000).toISOString() },
  { id: 'e12', eventType: 'new_player', playerName: 'Lucky7s', gameName: 'Mega Moolah', amount: 0, currency: 'USD', country: 'India', countryCode: 'IN', city: 'Mumbai', latitude: 19.076, longitude: 72.8777, createdAt: new Date(Date.now() - 175000).toISOString() },
]

const stats = {
  totalOnline: 2041,
  byRegion: {
    'Europe': 789,
    'North America': 654,
    'Asia Pacific': 398,
    'South America': 134,
    'Oceania': 98,
    'Africa': 67,
  },
  byGame: {
    'Mega Moolah': 412,
    'Starburst': 380,
    'Book of Dead': 345,
    'Gonzo\'s Quest': 298,
    'Lightning Roulette': 256,
  },
  byDevice: {
    'desktop': 892,
    'mobile': 878,
    'tablet': 271,
  },
  byCountry: {
    'GB': 245,
    'DE': 198,
    'US': 456,
    'CA': 112,
    'AU': 98,
    'JP': 134,
    'BR': 89,
    'FR': 167,
    'SE': 78,
    'IN': 134,
  },
}

export async function GET() {
  return NextResponse.json({
    activeSessions,
    serverNodes,
    liveEvents,
    stats,
  })
}
