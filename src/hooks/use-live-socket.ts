'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

interface LiveEvent {
  id: string
  eventType: string
  playerName: string
  gameName?: string
  amount?: number
  currency?: string
  country?: string
  countryCode?: string
  city?: string
  latitude?: number
  longitude?: number
  metadata?: string
  createdAt: string
}

interface SessionUpdate {
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
  status: string
}

interface StatsUpdate {
  totalOnline: number
  byRegion: Record<string, number>
  byGame: Record<string, number>
  byDevice: Record<string, number>
}

interface JackpotUpdate {
  id: string
  name: string
  currentAmount: number
}

interface PlayerDot {
  playerId: string
  playerName: string
  gameName: string
  latitude: number
  longitude: number
  country: string
  countryCode: string
  wagerAmount: number
  winAmount: number
  status: string
}

export function useLiveSocket() {
  const socketRef = useRef<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([])
  const [sessionUpdates, setSessionUpdates] = useState<SessionUpdate[]>([])
  const [playerDots, setPlayerDots] = useState<PlayerDot[]>([])
  const [stats, setStats] = useState<StatsUpdate | null>(null)
  const [jackpots, setJackpots] = useState<JackpotUpdate[]>([])

  useEffect(() => {
    const socket = io('/?XTransformPort=3003', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
    })

    socket.on('disconnect', () => {
      setConnected(false)
    })

    socket.on('initial-state', (data: { sessions: SessionUpdate[]; events: LiveEvent[]; stats: StatsUpdate; jackpots: JackpotUpdate[] }) => {
      setSessionUpdates(data.sessions || [])
      setLiveEvents(data.events || [])
      setStats(data.stats || null)
      setJackpots(data.jackpots || [])
    })

    socket.on('live-event', (event: LiveEvent) => {
      setLiveEvents(prev => [event, ...prev].slice(0, 100))
    })

    socket.on('session-update', (update: SessionUpdate) => {
      setSessionUpdates(prev => {
        const idx = prev.findIndex(s => s.id === update.id)
        if (idx >= 0) {
          const next = [...prev]
          next[idx] = update
          return next
        }
        return [update, ...prev].slice(0, 50)
      })
    })

    socket.on('player-dot', (dot: PlayerDot) => {
      setPlayerDots(prev => {
        const idx = prev.findIndex(d => d.playerId === dot.playerId)
        if (idx >= 0) {
          const next = [...prev]
          next[idx] = dot
          return next
        }
        return [...prev, dot].slice(-60)
      })
    })

    socket.on('stats-update', (update: StatsUpdate) => {
      setStats(update)
    })

    socket.on('jackpot-update', (update: JackpotUpdate) => {
      setJackpots(prev => {
        const idx = prev.findIndex(j => j.id === update.id)
        if (idx >= 0) {
          const next = [...prev]
          next[idx] = update
          return next
        }
        return [...prev, update]
      })
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const clearEvents = useCallback(() => {
    setLiveEvents([])
  }, [])

  return {
    connected,
    liveEvents,
    sessionUpdates,
    playerDots,
    stats,
    jackpots,
    clearEvents,
  }
}
