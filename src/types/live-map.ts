export interface ActiveSession {
  id: string
  playerId: string
  playerName: string
  gameId: string
  gameName: string
  country: string
  countryCode: string
  city: string
  latitude: number
  longitude: number
  deviceType: string
  wagerAmount: number
  winAmount: number
  spinsPlayed: number
  startedAt: string
  status: string
}

export interface ServerNode {
  id: string
  name: string
  region: string
  countryCode: string
  latitude: number
  longitude: number
  status: string
  activePlayers: number
  maxPlayers: number
  cpuLoad: number
  memoryLoad: number
  latencyMs: number
  uptime: number
}

export interface LiveEvent {
  id: string
  eventType: string
  playerName: string
  gameName: string
  amount: number
  currency: string
  country: string
  countryCode: string
  city: string
  latitude: number
  longitude: number
  createdAt: string
}

export interface LiveMapStats {
  totalOnline: number
  byRegion: Record<string, number>
  byGame: Record<string, number>
  byDevice: Record<string, number>
  byCountry: Record<string, number>
}

export interface LiveMapData {
  activeSessions: ActiveSession[]
  serverNodes: ServerNode[]
  liveEvents: LiveEvent[]
  stats: LiveMapStats
}
