import { createServer } from 'http'
import { Server } from 'socket.io'

const httpServer = createServer()
const io = new Server(httpServer, {
  path: '/',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
})

// ─── Static Data ───────────────────────────────────────────────

const countries = [
  { code: 'US', name: 'United States', lat: 39.8, lng: -98.5, cities: ['New York', 'Los Angeles', 'Chicago', 'Miami', 'Las Vegas'] },
  { code: 'GB', name: 'United Kingdom', lat: 54.0, lng: -2.0, cities: ['London', 'Manchester', 'Birmingham'] },
  { code: 'DE', name: 'Germany', lat: 51.0, lng: 10.0, cities: ['Berlin', 'Munich', 'Hamburg'] },
  { code: 'CA', name: 'Canada', lat: 56.0, lng: -106.0, cities: ['Toronto', 'Vancouver', 'Montreal'] },
  { code: 'AU', name: 'Australia', lat: -25.0, lng: 134.0, cities: ['Sydney', 'Melbourne', 'Brisbane'] },
  { code: 'JP', name: 'Japan', lat: 36.0, lng: 138.0, cities: ['Tokyo', 'Osaka'] },
  { code: 'BR', name: 'Brazil', lat: -14.0, lng: -51.0, cities: ['São Paulo', 'Rio de Janeiro'] },
  { code: 'FR', name: 'France', lat: 46.0, lng: 2.0, cities: ['Paris', 'Lyon', 'Marseille'] },
  { code: 'IT', name: 'Italy', lat: 42.0, lng: 12.0, cities: ['Rome', 'Milan', 'Naples'] },
  { code: 'ES', name: 'Spain', lat: 40.0, lng: -4.0, cities: ['Madrid', 'Barcelona'] },
  { code: 'NL', name: 'Netherlands', lat: 52.0, lng: 5.0, cities: ['Amsterdam'] },
  { code: 'SE', name: 'Sweden', lat: 62.0, lng: 15.0, cities: ['Stockholm'] },
  { code: 'NO', name: 'Norway', lat: 62.0, lng: 10.0, cities: ['Oslo'] },
  { code: 'FI', name: 'Finland', lat: 64.0, lng: 26.0, cities: ['Helsinki'] },
  { code: 'DK', name: 'Denmark', lat: 56.0, lng: 10.0, cities: ['Copenhagen'] },
]

const games = [
  'Mega Moolah',
  'Starburst',
  'Book of Dead',
  'Lightning Roulette',
  'Blackjack VIP',
  'Gates of Olympus',
  'Sweet Bonanza',
  'Wolf Gold',
]

const eventTypes = ['login', 'game_start', 'big_win', 'deposit', 'jackpot_win', 'bonus_claim', 'level_up', 'withdrawal'] as const
type EventType = (typeof eventTypes)[number]

const devices = ['desktop', 'mobile', 'tablet'] as const
type Device = (typeof devices)[number]

const sessionStatuses = ['active', 'idle', 'ended'] as const
type SessionStatus = (typeof sessionStatuses)[number]

// ─── Fake Player Pool ──────────────────────────────────────────

interface FakePlayer {
  id: string
  username: string
  country: typeof countries[number]
  city: string
  vipLevel: number
}

const firstNames = [
  'Alex', 'Jordan', 'Casey', 'Morgan', 'Riley', 'Taylor', 'Sam', 'Chris',
  'Jamie', 'Drew', 'Blake', 'Reese', 'Quinn', 'Avery', 'Harper', 'Finley',
  'Rowan', 'Emery', 'Sage', 'Wren', 'Kai', 'Luna', 'Nova', 'Zara',
  'Leo', 'Max', 'Eli', 'Jax', 'Rex', 'Ace', 'Neo', 'Dax',
  'Mika', 'Yuki', 'Hana', 'Lina', 'Nora', 'Isla', 'Maya', 'Zoe',
  'Omar', 'Ravi', 'Dante', 'Enzo', 'Hugo', 'Lars', 'Sven', 'Otto',
  'Pierre', 'Marco',
]

const lastNames = [
  'Smith', 'Jones', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore',
  'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Garcia',
  'Martinez', 'Robinson', 'Clark', 'Lewis', 'Lee', 'Walker', 'Hall', 'Allen',
  'Young', 'King', 'Wright', 'Lopez', 'Hill', 'Scott', 'Green', 'Adams',
  'Baker', 'Nelson', 'Carter', 'Mitchell', 'Perez', 'Roberts', 'Turner', 'Phillips',
  'Campbell', 'Parker', 'Evans', 'Edwards', 'Collins', 'Stewart', 'Sanchez', 'Morris',
  'Rogers', 'Reed',
]

const fakePlayers: FakePlayer[] = Array.from({ length: 50 }, (_, i) => {
  const country = countries[i % countries.length]
  const city = country.cities[Math.floor(Math.random() * country.cities.length)]
  return {
    id: `player-${String(i + 1).padStart(3, '0')}`,
    username: `${firstNames[i]}_${lastNames[i]}`,
    country,
    city,
    vipLevel: Math.floor(Math.random() * 5) + 1,
  }
})

// ─── Session State ─────────────────────────────────────────────

interface Session {
  playerId: string
  username: string
  game: string
  country: typeof countries[number]
  city: string
  device: Device
  status: SessionStatus
  wager: number
  win: number
  spins: number
  startedAt: Date
  lastActivity: Date
  lat: number
  lng: number
}

interface LiveEvent {
  id: string
  type: EventType
  playerId: string
  username: string
  game?: string
  country: typeof countries[number]
  city: string
  amount?: number
  currency: string
  timestamp: Date
  metadata?: Record<string, unknown>
}

interface JackpotState {
  megaMoolah: number
  wowPot: number
  divineFortune: number
  hallOfGods: number
}

const activeSessions = new Map<string, Session>()
const recentEvents: LiveEvent[] = []
const MAX_RECENT_EVENTS = 100

let jackpotState: JackpotState = {
  megaMoolah: 4_287_563.21,
  wowPot: 2_145_890.44,
  divineFortune: 891_234.67,
  hallOfGods: 1_567_890.12,
}

let connectedClients = 0

// ─── Helpers ───────────────────────────────────────────────────

const rand = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]
const randFloat = (min: number, max: number) => Math.random() * (max - min) + min
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
const genId = () => Math.random().toString(36).substring(2, 11)

function jitteredCoord(base: number, spread: number): number {
  return base + randFloat(-spread, spread)
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function createSession(player: FakePlayer): Session {
  const game = rand(games)
  const device: Device = rand(devices)
  const now = new Date()
  const wager = parseFloat(randFloat(0.5, 50).toFixed(2))
  const isBigWin = Math.random() < 0.15
  const win = isBigWin
    ? parseFloat((wager * randFloat(5, 100)).toFixed(2))
    : parseFloat((wager * randFloat(0, 3)).toFixed(2))

  const session: Session = {
    playerId: player.id,
    username: player.username,
    game,
    country: player.country,
    city: player.city,
    device,
    status: 'active',
    wager,
    win,
    spins: randInt(1, 120),
    startedAt: new Date(now.getTime() - randInt(60_000, 3_600_000)),
    lastActivity: now,
    lat: jitteredCoord(player.country.lat, 2),
    lng: jitteredCoord(player.country.lng, 2),
  }
  return session
}

function createLiveEvent(type: EventType, player: FakePlayer, extra?: Partial<LiveEvent>): LiveEvent {
  const now = new Date()
  const evt: LiveEvent = {
    id: genId(),
    type,
    playerId: player.id,
    username: player.username,
    game: rand(games),
    country: player.country,
    city: player.city,
    amount: undefined,
    currency: 'USD',
    timestamp: now,
    metadata: {},
    ...extra,
  }

  // Add amounts based on event type
  switch (type) {
    case 'big_win':
      evt.amount = parseFloat(randFloat(500, 50_000).toFixed(2))
      evt.metadata = { multiplier: parseFloat(randFloat(5, 200).toFixed(1)) }
      break
    case 'jackpot_win':
      evt.amount = parseFloat(randFloat(10_000, 1_000_000).toFixed(2))
      evt.metadata = { jackpotPool: rand(['Mega Moolah', 'WowPot', 'Divine Fortune', 'Hall of Gods']) }
      break
    case 'deposit':
      evt.amount = parseFloat(randFloat(20, 5_000).toFixed(2))
      evt.metadata = { method: rand(['card', 'crypto', 'bank_transfer', 'e_wallet']) }
      break
    case 'withdrawal':
      evt.amount = parseFloat(randFloat(50, 2_000).toFixed(2))
      evt.metadata = { method: rand(['card', 'crypto', 'bank_transfer']) }
      break
    case 'bonus_claim':
      evt.amount = parseFloat(randFloat(10, 500).toFixed(2))
      evt.metadata = { bonusType: rand(['welcome', 'reload', 'free_spins', 'cashback']) }
      break
    case 'level_up':
      evt.metadata = { newLevel: randInt(2, 50) }
      break
    case 'game_start':
      evt.game = rand(games)
      break
    case 'login':
      evt.game = undefined
      break
  }

  return evt
}

function addEvent(evt: LiveEvent) {
  recentEvents.unshift(evt)
  if (recentEvents.length > MAX_RECENT_EVENTS) {
    recentEvents.pop()
  }
}

// ─── Seed Initial Sessions ─────────────────────────────────────

for (let i = 0; i < 25; i++) {
  const player = fakePlayers[i]
  const session = createSession(player)
  activeSessions.set(player.id, session)
}

// Seed some initial events
for (let i = 0; i < 20; i++) {
  const player = rand(fakePlayers)
  const type = rand([...eventTypes])
  const evt = createLiveEvent(type, player)
  evt.timestamp = new Date(Date.now() - randInt(1_000, 300_000))
  addEvent(evt)
}

// ─── Compute Stats ─────────────────────────────────────────────

function computeStats() {
  const sessions = Array.from(activeSessions.values())
  const totalOnline = sessions.filter((s) => s.status !== 'ended').length
  const byRegion: Record<string, number> = {}
  for (const s of sessions) {
    if (s.status === 'ended') continue
    byRegion[s.country.code] = (byRegion[s.country.code] || 0) + 1
  }
  const byGame: Record<string, number> = {}
  for (const s of sessions) {
    if (s.status === 'ended') continue
    byGame[s.game] = (byGame[s.game] || 0) + 1
  }
  const byDevice: Record<string, number> = {}
  for (const s of sessions) {
    if (s.status === 'ended') continue
    byDevice[s.device] = (byDevice[s.device] || 0) + 1
  }
  const totalWagered = sessions.reduce((sum, s) => sum + s.wager * s.spins, 0)
  const totalWon = sessions.reduce((sum, s) => sum + s.win, 0)
  const avgDuration =
    sessions.length > 0
      ? sessions.reduce((sum, s) => sum + (Date.now() - s.startedAt.getTime()), 0) / sessions.length / 60_000
      : 0

  return {
    totalOnline,
    activeRegions: Object.keys(byRegion).length,
    byRegion,
    byGame,
    byDevice,
    totalWagered: parseFloat(totalWagered.toFixed(2)),
    totalWon: parseFloat(totalWon.toFixed(2)),
    avgSessionDurationMin: parseFloat(avgDuration.toFixed(1)),
    peakConcurrent: Math.ceil(totalOnline * 1.15),
    connectedClients,
  }
}

// ─── Connection Handling ───────────────────────────────────────

io.on('connection', (socket) => {
  connectedClients++
  console.log(`[LIVE] Client connected: ${socket.id} (total: ${connectedClients})`)

  // Send initial state
  const initialSessions = Array.from(activeSessions.values()).filter((s) => s.status !== 'ended')
  socket.emit('initial-state', {
    sessions: initialSessions,
    recentEvents: recentEvents.slice(0, 30),
    stats: computeStats(),
    jackpots: jackpotState,
  })

  socket.on('disconnect', () => {
    connectedClients--
    console.log(`[LIVE] Client disconnected: ${socket.id} (total: ${connectedClients})`)
  })

  socket.on('error', (error) => {
    console.error(`[LIVE] Socket error (${socket.id}):`, error)
  })
})

// ─── Periodic Broadcasts ───────────────────────────────────────

// Every 3 seconds: emit a new live-event
setInterval(() => {
  const player = rand(fakePlayers)
  const type = rand([...eventTypes])
  const evt = createLiveEvent(type, player)
  addEvent(evt)

  // If it's a game_start, also create/update a session
  if (type === 'game_start' && !activeSessions.has(player.id)) {
    const session = createSession(player)
    activeSessions.set(player.id, session)
  }

  // If it's a login, ensure a session exists
  if (type === 'login') {
    if (!activeSessions.has(player.id)) {
      const session = createSession(player)
      activeSessions.set(player.id, session)
    }
  }

  io.emit('live-event', evt)
  console.log(`[LIVE] Event: ${type} by ${player.username} from ${player.country.code}`)
}, 3_000)

// Every 5 seconds: emit session-update for a random session
setInterval(() => {
  const sessionKeys = Array.from(activeSessions.keys())
  if (sessionKeys.length === 0) return

  const key = rand(sessionKeys)
  const session = activeSessions.get(key)!

  // Randomly update the session
  const roll = Math.random()
  if (roll < 0.15 && session.status === 'active') {
    // 15% chance to go idle
    session.status = 'idle'
  } else if (roll < 0.08 && session.status === 'idle') {
    // 8% chance to resume active
    session.status = 'active'
  } else if (roll < 0.05) {
    // 5% chance to end
    session.status = 'ended'
    activeSessions.delete(key)
  } else {
    // Update gameplay data
    session.spins += randInt(1, 5)
    const addWager = parseFloat(randFloat(0.5, 10).toFixed(2))
    session.wager = parseFloat((session.wager + addWager).toFixed(2))
    if (Math.random() < 0.3) {
      const addWin = parseFloat(randFloat(1, session.wager * 5).toFixed(2))
      session.win = parseFloat((session.win + addWin).toFixed(2))
    }
    session.lastActivity = new Date()
  }

  const sessionUpdate = {
    playerId: session.playerId,
    username: session.username,
    game: session.game,
    country: session.country,
    city: session.city,
    device: session.device,
    status: session.status,
    wager: session.wager,
    win: session.win,
    spins: session.spins,
    duration: Math.round((Date.now() - session.startedAt.getTime()) / 60_000),
    lat: session.lat,
    lng: session.lng,
  }

  io.emit('session-update', sessionUpdate)
}, 5_000)

// Every 10 seconds: emit stats-update
setInterval(() => {
  const stats = computeStats()
  io.emit('stats-update', stats)
  console.log(`[LIVE] Stats: ${stats.totalOnline} online, ${stats.activeRegions} regions, ${stats.connectedClients} clients`)
}, 10_000)

// Every 30 seconds: emit jackpot-update with incremented amounts
setInterval(() => {
  // Jackpots slowly increment
  jackpotState.megaMoolah += randFloat(50, 500)
  jackpotState.wowPot += randFloat(20, 200)
  jackpotState.divineFortune += randFloat(10, 100)
  jackpotState.hallOfGods += randFloat(15, 150)

  // Round to 2 decimals
  jackpotState.megaMoolah = parseFloat(jackpotState.megaMoolah.toFixed(2))
  jackpotState.wowPot = parseFloat(jackpotState.wowPot.toFixed(2))
  jackpotState.divineFortune = parseFloat(jackpotState.divineFortune.toFixed(2))
  jackpotState.hallOfGods = parseFloat(jackpotState.hallOfGods.toFixed(2))

  const jackpotUpdate = {
    ...jackpotState,
    timestamp: new Date().toISOString(),
  }

  io.emit('jackpot-update', jackpotUpdate)
  console.log(`[LIVE] Jackpots: Mega Moolah $${formatCurrency(jackpotState.megaMoolah)}, WowPot $${formatCurrency(jackpotState.wowPot)}`)
}, 30_000)

// Every 2 seconds: emit player-dot for a random active player (position update)
setInterval(() => {
  const sessions = Array.from(activeSessions.values()).filter((s) => s.status !== 'ended')
  if (sessions.length === 0) return

  const session = rand(sessions)
  // Slight position jitter to simulate movement
  session.lat = jitteredCoord(session.lat, 0.01)
  session.lng = jitteredCoord(session.lng, 0.01)

  const playerDot = {
    playerId: session.playerId,
    username: session.username,
    lat: parseFloat(session.lat.toFixed(4)),
    lng: parseFloat(session.lng.toFixed(4)),
    game: session.game,
    country: session.country.code,
    city: session.city,
    device: session.device,
    vipLevel: fakePlayers.find((p) => p.id === session.playerId)?.vipLevel || 1,
    isBigWin: session.win > session.wager * 2,
    isHighValue: session.wager * session.spins > 5000,
    isNewSession: Date.now() - session.startedAt.getTime() < 300_000,
  }

  io.emit('player-dot', playerDot)
}, 2_000)

// ─── Ensure minimum active sessions ────────────────────────────
// If sessions drop too low, add new ones from idle players
setInterval(() => {
  const activeCount = Array.from(activeSessions.values()).filter((s) => s.status !== 'ended').length
  if (activeCount < 15) {
    const inactivePlayers = fakePlayers.filter((p) => !activeSessions.has(p.id))
    if (inactivePlayers.length > 0) {
      const player = rand(inactivePlayers)
      const session = createSession(player)
      activeSessions.set(player.id, session)

      const evt = createLiveEvent('login', player)
      addEvent(evt)
      io.emit('live-event', evt)
    }
  }
}, 8_000)

// ─── Start Server ──────────────────────────────────────────────

const PORT = 3003
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`[LIVE] ✦ TOLS Live Service running on 0.0.0.0:${PORT}`)
  console.log(`[LIVE] ✦ Events: live-event | session-update | player-dot | stats-update | jackpot-update`)
  console.log(`[LIVE] ✦ Initial sessions: ${activeSessions.size}, Recent events: ${recentEvents.length}`)
})

// ─── Graceful Shutdown ─────────────────────────────────────────

process.on('SIGTERM', () => {
  console.log('[LIVE] Received SIGTERM, shutting down...')
  httpServer.close(() => {
    console.log('[LIVE] Server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('[LIVE] Received SIGINT, shutting down...')
  httpServer.close(() => {
    console.log('[LIVE] Server closed')
    process.exit(0)
  })
})
