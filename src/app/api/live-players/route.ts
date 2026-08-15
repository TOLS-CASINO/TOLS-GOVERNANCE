import { NextResponse } from 'next/server'

const games = ['Mega Moolah', 'Starburst', 'Gonzo\'s Quest', 'Book of Dead', 'Lightning Roulette', 'Blackjack VIP', 'Crazy Time', 'Sweet Bonanza', 'Big Bass Bonanza', 'Gates of Olympus']
const countries = ['US', 'GB', 'DE', 'FR', 'CA', 'AU', 'JP', 'BR', 'IN', 'MX', 'NL', 'SE', 'NO', 'FI', 'DK', 'IT', 'ES', 'PT', 'PL', 'CZ']
const citiesByCountry: Record<string, string[]> = {
  US: ['New York', 'Los Angeles', 'Chicago', 'Miami', 'Las Vegas'],
  GB: ['London', 'Manchester', 'Birmingham', 'Liverpool'],
  DE: ['Berlin', 'Munich', 'Hamburg', 'Frankfurt'],
  FR: ['Paris', 'Lyon', 'Marseille', 'Nice'],
  CA: ['Toronto', 'Vancouver', 'Montreal', 'Ottawa'],
  AU: ['Sydney', 'Melbourne', 'Brisbane', 'Perth'],
  JP: ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama'],
  BR: ['São Paulo', 'Rio de Janeiro', 'Brasilia'],
  IN: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai'],
  MX: ['Mexico City', 'Guadalajara', 'Monterrey'],
  NL: ['Amsterdam', 'Rotterdam', 'The Hague'],
  SE: ['Stockholm', 'Gothenburg', 'Malmö'],
  NO: ['Oslo', 'Bergen', 'Trondheim'],
  FI: ['Helsinki', 'Tampere', 'Oulu'],
  DK: ['Copenhagen', 'Aarhus', 'Odense'],
  IT: ['Rome', 'Milan', 'Naples', 'Florence'],
  ES: ['Madrid', 'Barcelona', 'Valencia', 'Seville'],
  PT: ['Lisbon', 'Porto', 'Faro'],
  PL: ['Warsaw', 'Krakow', 'Wroclaw'],
  CZ: ['Prague', 'Brno', 'Ostrava'],
}
const coordsByCountry: Record<string, [number, number]> = {
  US: [39.8, -98.5], GB: [51.5, -0.1], DE: [51.1, 10.4], FR: [46.2, 2.2],
  CA: [56.1, -106.3], AU: [-25.3, 133.8], JP: [36.2, 138.3], BR: [-14.2, -51.9],
  IN: [20.6, 78.9], MX: [23.6, -102.5], NL: [52.1, 5.3], SE: [60.1, 18.6],
  NO: [60.5, 8.5], FI: [61.9, 25.7], DK: [56.3, 9.5], IT: [41.9, 12.5],
  ES: [40.5, -3.7], PT: [39.4, -8.2], PL: [51.9, 19.1], CZ: [49.8, 15.5],
}
const devices = ['desktop', 'mobile', 'tablet']
const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera']
const osList = ['Windows 11', 'Windows 10', 'macOS 14', 'iOS 17', 'Android 14', 'Linux']
const entryPoints = ['lobby', 'promotion', 'affiliate', 'direct', 'email', 'social']
const statuses = ['active', 'active', 'active', 'active', 'idle', 'idle', 'ended']
const playerNames = ['Alex_K', 'LuckyAce99', 'SpinMaster', 'GoldRush_X', 'NeonViper', 'BetKing42', 'MegaSpin', 'JackpotJane', 'PhantomRoll', 'CryptoAce', 'DiamondDave', 'SilverSpin', 'ThunderBet', 'RoyalFlush', 'VegasVixen', 'StarChaser', 'MoonGambler', 'PixelPot', 'ZeroHero', 'BlazeBet']
const eventTypes = ['player_login', 'game_start', 'big_win', 'jackpot_win', 'deposit', 'withdrawal', 'bonus_claim', 'level_up']

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function randFloat(min: number, max: number): number { return min + Math.random() * (max - min) }
function randInt(min: number, max: number): number { return Math.floor(randFloat(min, max + 1)) }

function generateSessions() {
  const now = Date.now()
  return Array.from({ length: 45 }, (_, i) => {
    const country = rand(countries)
    const [lat, lng] = coordsByCountry[country] || [0, 0]
    const startedAt = new Date(now - randInt(60000, 7200000)).toISOString()
    const lastActivityAt = new Date(now - randInt(0, 300000)).toISOString()
    const status = rand(statuses)
    return {
      id: `sess-${String(i + 1).padStart(3, '0')}`,
      playerId: `plr-${String(randInt(1, 20)).padStart(3, '0')}`,
      playerName: rand(playerNames),
      gameId: `game-${String(randInt(1, 10)).padStart(2, '0')}`,
      gameName: rand(games),
      country,
      city: rand(citiesByCountry[country] || ['Unknown']),
      latitude: lat + randFloat(-2, 2),
      longitude: lng + randFloat(-2, 2),
      deviceType: rand(devices),
      browser: rand(browsers),
      os: rand(osList),
      entryPoint: rand(entryPoints),
      wagerAmount: Math.round(randFloat(5, 2000) * 100) / 100,
      winAmount: Math.round(randFloat(0, 5000) * 100) / 100,
      spinsPlayed: randInt(1, 500),
      startedAt,
      lastActivityAt,
      status,
    }
  })
}

function generateEvents() {
  const now = Date.now()
  return Array.from({ length: 60 }, (_, i) => {
    const type = rand(eventTypes)
    const hasAmount = ['big_win', 'jackpot_win', 'deposit', 'withdrawal'].includes(type)
    return {
      id: `evt-${String(i + 1).padStart(3, '0')}`,
      eventType: type,
      playerName: rand(playerNames),
      gameName: rand(games),
      amount: hasAmount ? Math.round(randFloat(10, 10000) * 100) / 100 : 0,
      currency: 'USD',
      country: rand(countries),
      createdAt: new Date(now - i * randInt(2000, 30000)).toISOString(),
    }
  }).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
}

function generateStats(sessions: ReturnType<typeof generateSessions>) {
  const byDevice = { desktop: 0, mobile: 0, tablet: 0 }
  const byCountryMap: Record<string, number> = {}
  const byGameMap: Record<string, number> = {}

  for (const s of sessions) {
    if (s.deviceType in byDevice) byDevice[s.deviceType as keyof typeof byDevice]++
    byCountryMap[s.country] = (byCountryMap[s.country] || 0) + 1
    byGameMap[s.gameName] = (byGameMap[s.gameName] || 0) + 1
  }

  const byCountry = Object.entries(byCountryMap)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)

  const byGame = Object.entries(byGameMap)
    .map(([game, count]) => ({ game, count }))
    .sort((a, b) => b.count - a.count)

  const totalWagered = sessions.reduce((sum, s) => sum + s.wagerAmount, 0)
  const totalWon = sessions.reduce((sum, s) => sum + s.winAmount, 0)

  return {
    totalOnline: sessions.filter(s => s.status !== 'ended').length,
    activeGames: byGame.length,
    avgSessionDuration: 18.5,
    peakConcurrent: 52,
    totalWageredLive: Math.round(totalWagered * 100) / 100,
    totalWonLive: Math.round(totalWon * 100) / 100,
    byDevice,
    byCountry,
    byGame,
  }
}

export async function GET() {
  const activeSessions = generateSessions()
  const liveEvents = generateEvents()
  const stats = generateStats(activeSessions)

  return NextResponse.json({ activeSessions, liveEvents, stats })
}
