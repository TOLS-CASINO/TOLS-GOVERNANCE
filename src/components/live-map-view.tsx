'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useApi } from '@/hooks/use-api'
import { api } from '@/services/api'
import type { LiveMapData, ActiveSession, ServerNode, LiveEvent } from '@/types/live-map'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Globe, Users, Server, Activity, Wifi, Zap,
  RefreshCw, MapPin, Monitor, Smartphone, Trophy,
} from 'lucide-react'

/* ─── SVG Map Constants ─── */
const MAP_WIDTH = 1000
const MAP_HEIGHT = 500
const GOLD = '#d4a017'
const GOLD_DIM = 'rgba(212,160,23,0.3)'

/* ─── Equirectangular Projection ─── */
function project(lat: number, lng: number): { x: number; y: number } {
  const x = (lng + 180) * (MAP_WIDTH / 360)
  const y = (90 - lat) * (MAP_HEIGHT / 180)
  return { x, y }
}

/* ─── Simplified Continent SVG Path Data ─── */
const CONTINENT_PATHS = [
  { name: 'North America', path: 'M 80 70 L 110 55 L 145 50 L 175 55 L 195 70 L 210 90 L 215 110 L 210 130 L 195 145 L 180 155 L 160 165 L 145 175 L 130 180 L 120 175 L 115 165 L 100 160 L 85 155 L 75 145 L 70 130 L 65 115 L 60 100 L 65 85 Z' },
  { name: 'Greenland', path: 'M 210 30 L 235 25 L 250 30 L 255 45 L 250 60 L 235 65 L 220 60 L 210 50 L 208 40 Z' },
  { name: 'South America', path: 'M 175 185 L 195 180 L 210 185 L 220 200 L 225 220 L 228 240 L 225 260 L 218 280 L 210 295 L 200 310 L 190 320 L 182 325 L 178 315 L 175 300 L 172 280 L 170 260 L 168 240 L 170 220 L 172 200 Z' },
  { name: 'Europe', path: 'M 440 55 L 460 50 L 480 48 L 500 52 L 510 60 L 515 75 L 510 90 L 500 100 L 490 108 L 478 115 L 465 118 L 455 115 L 445 108 L 438 100 L 432 88 L 430 75 L 433 65 Z' },
  { name: 'UK & Ireland', path: 'M 420 65 L 428 60 L 433 68 L 430 80 L 424 85 L 418 78 L 417 70 Z' },
  { name: 'Scandinavia', path: 'M 470 25 L 480 20 L 490 22 L 495 35 L 492 48 L 485 50 L 478 45 L 473 35 Z' },
  { name: 'Africa', path: 'M 460 125 L 480 120 L 500 118 L 520 122 L 535 130 L 545 145 L 550 165 L 548 185 L 542 205 L 532 225 L 518 245 L 505 260 L 492 270 L 480 275 L 470 270 L 462 255 L 455 235 L 450 215 L 448 195 L 447 175 L 450 155 L 455 140 Z' },
  { name: 'Asia', path: 'M 515 55 L 540 48 L 570 42 L 600 40 L 640 38 L 680 40 L 720 45 L 755 52 L 780 60 L 800 72 L 810 88 L 812 105 L 805 120 L 790 132 L 770 140 L 745 145 L 720 148 L 695 150 L 670 152 L 645 155 L 620 158 L 600 162 L 580 165 L 565 160 L 550 150 L 538 138 L 528 125 L 520 110 L 515 95 L 512 78 L 513 65 Z' },
  { name: 'Middle East', path: 'M 530 115 L 548 108 L 565 112 L 575 120 L 580 132 L 575 142 L 565 148 L 552 150 L 540 145 L 532 135 L 528 125 Z' },
  { name: 'India', path: 'M 620 140 L 640 135 L 655 140 L 665 155 L 668 175 L 662 195 L 650 210 L 638 215 L 628 208 L 620 192 L 616 172 L 615 155 Z' },
  { name: 'Southeast Asia', path: 'M 700 145 L 720 140 L 740 145 L 752 155 L 758 170 L 755 185 L 745 195 L 730 200 L 715 198 L 702 190 L 695 178 L 692 165 L 695 155 Z' },
  { name: 'Australia', path: 'M 750 265 L 775 258 L 800 260 L 820 268 L 835 280 L 842 298 L 840 315 L 832 330 L 818 342 L 800 348 L 780 350 L 762 345 L 748 335 L 740 320 L 736 302 L 738 285 L 742 275 Z' },
  { name: 'Japan', path: 'M 790 80 L 798 75 L 804 82 L 802 95 L 796 105 L 790 100 L 787 90 Z' },
  { name: 'Indonesia', path: 'M 720 210 L 750 205 L 775 208 L 795 212 L 810 218 L 800 228 L 780 230 L 755 228 L 735 225 L 720 220 Z' },
]

/* ─── Region Colors ─── */
const REGION_COLORS: Record<string, string> = {
  'Europe': '#3b82f6',
  'North America': '#10b981',
  'Asia Pacific': '#f59e0b',
  'South America': '#ef4444',
  'Oceania': '#8b5cf6',
  'Africa': '#f97316',
}

/* ─── Session Dot Color Logic ─── */
function getSessionColor(session: ActiveSession, now: number): string {
  const age = now - new Date(session.startedAt).getTime()
  if (session.wagerAmount > 5000) return '#ef4444'
  if (session.winAmount > session.wagerAmount * 2) return '#d4a017'
  if (age < 5 * 60 * 1000) return '#3b82f6'
  return '#10b981'
}

function getSessionLabel(session: ActiveSession, now: number): string {
  const age = now - new Date(session.startedAt).getTime()
  if (session.wagerAmount > 5000) return 'High Value'
  if (session.winAmount > session.wagerAmount * 2) return 'Big Win'
  if (age < 5 * 60 * 1000) return 'New Session'
  return 'Active'
}

/* ─── Server Node Status Color ─── */
function getServerColor(status: string): string {
  if (status === 'online') return '#10b981'
  if (status === 'degraded') return '#f59e0b'
  return '#ef4444'
}

/* ─── Format Helpers ─── */
function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}

function formatCurrency(n: number): string {
  return `$${n.toLocaleString('en-US')}`
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  return `${Math.floor(min / 60)}h ago`
}

/* ─── Animated Counter Hook ─── */
function useAnimatedCounter(target: number, duration = 1000): number {
  const [value, setValue] = useState(0)
  useEffect(() => {
    const start = value
    const diff = target - start
    if (diff === 0) return
    const startTime = performance.now()
    let raf: number
    const step = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(start + diff * eased))
      if (progress < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return value
}

/* ─── Event Ticker ─── */
function EventTicker({ events }: { events: LiveEvent[] }) {
  const [scrollOffset, setScrollOffset] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setScrollOffset(prev => prev + 1)
    }, 30)
    return () => clearInterval(interval)
  }, [])

  const eventTexts = useMemo(() => {
    return events.map(e => {
      const emoji = e.eventType === 'jackpot_hit' ? '🎰' : e.eventType === 'big_win' ? '🏆' : e.eventType === 'deposit' ? '💰' : '🆕'
      const action = e.eventType === 'jackpot_hit' ? 'hit jackpot' : e.eventType === 'big_win' ? 'won' : e.eventType === 'deposit' ? 'deposited' : 'joined'
      const amountStr = e.amount > 0 ? ` ${formatCurrency(e.amount)} on` : ''
      return `${emoji} ${e.playerName} ${action}${amountStr} ${e.gameName} • ${e.city}, ${e.countryCode}`
    })
  }, [events])

  const fullText = eventTexts.join('    ◆    ') + '    ◆    ' + eventTexts.join('    ◆    ')

  return (
    <div className="relative overflow-hidden h-8 bg-gradient-to-r from-[#0a0e1a] via-[#111827] to-[#0a0e1a] border-t border-amber-900/30">
      <div className="absolute inset-0 flex items-center whitespace-nowrap" style={{ transform: `translateX(-${scrollOffset % (fullText.length * 6)}px)` }}>
        <span className="text-xs text-amber-200/80 font-mono tracking-wide px-4">
          {fullText}
        </span>
      </div>
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#0a0e1a] to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#0a0e1a] to-transparent z-10" />
    </div>
  )
}

/* ─── Stats Overlay ─── */
function StatsOverlay({ stats }: { stats: LiveMapData['stats'] }) {
  const totalOnline = useAnimatedCounter(stats.totalOnline, 800)
  const regionCount = Object.keys(stats.byRegion).length
  const peakConcurrent = Math.round(stats.totalOnline * 1.15)
  const peakAnimated = useAnimatedCounter(peakConcurrent, 1000)
  const avgSession = 23

  return (
    <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
      <Card className="bg-[#0a0e1a]/90 backdrop-blur-md border-amber-900/40 shadow-lg shadow-amber-900/10">
        <CardContent className="p-3 flex flex-col gap-2 min-w-0 sm:min-w-[180px]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Online Now</p>
              <p className="text-lg font-bold text-emerald-400 tabular-nums">{totalOnline.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Globe className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Active Regions</p>
              <p className="text-lg font-bold text-blue-400">{regionCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Peak Today</p>
              <p className="text-lg font-bold text-amber-400 tabular-nums">{peakAnimated.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
              <Activity className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Avg Session</p>
              <p className="text-lg font-bold text-violet-400">{avgSession}m</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* ─── Region Legend ─── */
function RegionLegend({ byRegion }: { byRegion: Record<string, number> }) {
  return (
    <div className="absolute top-3 right-3 z-20 hidden sm:block">
      <Card className="bg-[#0a0e1a]/90 backdrop-blur-md border-amber-900/40 shadow-lg shadow-amber-900/10">
        <CardContent className="p-3">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Regions</p>
          <div className="flex flex-col gap-1.5">
            {Object.entries(byRegion).sort((a, b) => b[1] - a[1]).map(([region, count]) => (
              <div key={region} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: REGION_COLORS[region] || '#64748b' }} />
                <span className="text-slate-300 w-24 truncate">{region}</span>
                <span className="text-slate-500 tabular-nums">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* ─── Device Stats Mini ─── */
function DeviceStats({ byDevice }: { byDevice: Record<string, number> }) {
  const total = Object.values(byDevice).reduce((a, b) => a + b, 0)
  return (
    <div className="absolute bottom-12 right-3 z-20 hidden sm:block">
      <Card className="bg-[#0a0e1a]/90 backdrop-blur-md border-amber-900/40 shadow-lg shadow-amber-900/10">
        <CardContent className="p-3">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Devices</p>
          <div className="flex flex-col gap-1.5">
            {Object.entries(byDevice).sort((a, b) => b[1] - a[1]).map(([device, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0
              const Icon = device === 'desktop' ? Monitor : device === 'mobile' ? Smartphone : MapPin
              return (
                <div key={device} className="flex items-center gap-2 text-xs">
                  <Icon className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-300 w-16 capitalize">{device}</span>
                  <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500/70 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-slate-500 tabular-nums w-7 text-right">{pct}%</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* ─── Dot Legend ─── */
function DotLegend() {
  const items = [
    { color: '#10b981', label: 'Active' },
    { color: '#d4a017', label: 'Big Win' },
    { color: '#ef4444', label: 'High Value' },
    { color: '#3b82f6', label: 'New Session' },
  ]
  return (
    <div className="absolute bottom-12 left-3 z-20 hidden sm:block">
      <Card className="bg-[#0a0e1a]/90 backdrop-blur-md border-amber-900/40 shadow-lg shadow-amber-900/10">
        <CardContent className="p-3">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Player Status</p>
          <div className="flex flex-col gap-1.5">
            {items.map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }} />
                <span className="text-slate-300">{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* ─── Server Tooltip ─── */
function ServerTooltip({ node, visible, x, y }: { node: ServerNode | null; visible: boolean; x: number; y: number }) {
  if (!visible || !node) return null
  const statusColor = getServerColor(node.status)
  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{ left: x + 12, top: y - 10 }}
    >
      <Card className="bg-[#0a0e1a]/95 backdrop-blur-md border-amber-900/40 shadow-xl shadow-amber-900/20 min-w-0 sm:min-w-[200px]">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <Server className="w-3.5 h-3.5" style={{ color: statusColor }} />
            <span className="text-xs font-semibold text-amber-200">{node.name}</span>
            <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-current" style={{ color: statusColor }}>
              {node.status}
            </Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
            <span className="text-slate-400">Players</span>
            <span className="text-slate-200 tabular-nums">{node.activePlayers}/{node.maxPlayers}</span>
            <span className="text-slate-400">CPU</span>
            <span className="tabular-nums" style={{ color: node.cpuLoad > 80 ? '#ef4444' : node.cpuLoad > 60 ? '#f59e0b' : '#10b981' }}>{node.cpuLoad}%</span>
            <span className="text-slate-400">Memory</span>
            <span className="tabular-nums" style={{ color: node.memoryLoad > 80 ? '#ef4444' : node.memoryLoad > 60 ? '#f59e0b' : '#10b981' }}>{node.memoryLoad}%</span>
            <span className="text-slate-400">Latency</span>
            <span className="text-slate-200 tabular-nums">{node.latencyMs}ms</span>
            <span className="text-slate-400">Uptime</span>
            <span className="text-emerald-400 tabular-nums">{node.uptime}%</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* ─── Session Tooltip ─── */
function SessionTooltip({ session, visible, x, y }: { session: ActiveSession | null; visible: boolean; x: number; y: number }) {
  if (!visible || !session) return null
  const color = getSessionColor(session, Date.now())
  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{ left: x + 12, top: y - 10 }}
    >
      <Card className="bg-[#0a0e1a]/95 backdrop-blur-md border-amber-900/40 shadow-xl shadow-amber-900/20 min-w-0 sm:min-w-[180px]">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }} />
            <span className="text-xs font-semibold text-amber-200">{session.playerName}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
            <span className="text-slate-400">Game</span>
            <span className="text-slate-200">{session.gameName}</span>
            <span className="text-slate-400">Wagered</span>
            <span className="text-amber-300 tabular-nums">{formatCurrency(session.wagerAmount)}</span>
            <span className="text-slate-400">Won</span>
            <span className="text-emerald-400 tabular-nums">{formatCurrency(session.winAmount)}</span>
            <span className="text-slate-400">Spins</span>
            <span className="text-slate-200 tabular-nums">{session.spinsPlayed}</span>
            <span className="text-slate-400">Device</span>
            <span className="text-slate-200 capitalize">{session.deviceType}</span>
            <span className="text-slate-400">Location</span>
            <span className="text-slate-200">{session.city}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════ */
export function LiveMapView() {
  const { data, loading, error, refetch } = useApi(() => api.liveMap.get())
  const [now, setNow] = useState(Date.now())
  const [hoveredServer, setHoveredServer] = useState<ServerNode | null>(null)
  const [hoveredSession, setHoveredSession] = useState<ActiveSession | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await refetch()
    setTimeout(() => setRefreshing(false), 600)
  }, [refetch])

  /* ─── Map viewBox calculations ─── */
  const viewBox = `0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`

  /* ─── Gridded background lines ─── */
  const gridLines = useMemo(() => {
    const lines: Array<{ x1: number; y1: number; x2: number; y2: number }> = []
    for (let lng = -180; lng <= 180; lng += 30) {
      const x = (lng + 180) * (MAP_WIDTH / 360)
      lines.push({ x1: x, y1: 0, x2: x, y2: MAP_HEIGHT })
    }
    for (let lat = -90; lat <= 90; lat += 30) {
      const y = (90 - lat) * (MAP_HEIGHT / 180)
      lines.push({ x1: 0, y1: y, x2: MAP_WIDTH, y2: y })
    }
    return lines
  }, [])

  if (loading) {
    return (
      <div className="w-full h-full min-h-[400px] sm:min-h-[600px] bg-[#0a0e1a] rounded-xl border border-amber-900/30 p-4">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-8 w-48 bg-slate-800" />
          <Skeleton className="h-[300px] sm:h-[400px] w-full bg-slate-800/50" />
          <Skeleton className="h-8 w-full bg-slate-800" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full min-h-[600px] bg-[#0a0e1a] rounded-xl border border-red-900/30 p-6 flex flex-col items-center justify-center gap-4">
        <Wifi className="w-10 h-10 text-red-400" />
        <p className="text-red-400 text-sm">Failed to load live map data</p>
        <p className="text-slate-500 text-xs">{error}</p>
        <Button variant="outline" size="sm" onClick={handleRefresh} className="border-amber-900/40 text-amber-300 hover:bg-amber-900/20">
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Retry
        </Button>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="relative w-full h-full min-h-[400px] sm:min-h-[600px] bg-[#0a0e1a] rounded-xl border border-amber-900/30 overflow-hidden">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 border-b border-amber-900/30 bg-[#0a0e1a]/80">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Globe className="w-5 h-5 text-amber-400" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          </div>
          <h2 className="text-sm font-semibold text-amber-200 tracking-wide">Live World Map</h2>
          <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-emerald-600 text-emerald-400 bg-emerald-950/40">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1 animate-pulse" />
            LIVE
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-slate-400 mr-2">
            <Server className="w-3 h-3" />
            <span>{data.serverNodes.length} servers</span>
            <span className="text-slate-600">•</span>
            <Users className="w-3 h-3" />
            <span>{data.stats.totalOnline.toLocaleString()} online</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="h-7 w-7 p-0 text-amber-400 hover:text-amber-300 hover:bg-amber-900/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* ─── SVG Map ─── */}
      <div className="relative flex-1" style={{ minHeight: 300 }}>
        <svg
          viewBox={viewBox}
          className="w-full h-full"
          style={{ background: '#0a0e1a' }}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Defs for filters and gradients */}
          <defs>
            <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="glow-gold" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="glow-blue" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <radialGradient id="map-bg-grad" cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor="#0f1729" />
              <stop offset="100%" stopColor="#0a0e1a" />
            </radialGradient>
          </defs>

          {/* Background */}
          <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#map-bg-grad)" />

          {/* Grid lines */}
          {gridLines.map((l, i) => (
            <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="rgba(212,160,23,0.06)" strokeWidth="0.5" />
          ))}

          {/* Continent outlines */}
          {CONTINENT_PATHS.map((c) => (
            <path
              key={c.name}
              d={c.path}
              fill="rgba(212,160,23,0.06)"
              stroke={GOLD_DIM}
              strokeWidth="1"
              strokeLinejoin="round"
            />
          ))}

          {/* Server nodes (diamond markers) */}
          {data.serverNodes.map((node) => {
            const { x, y } = project(node.latitude, node.longitude)
            const color = getServerColor(node.status)
            const size = 8
            const loadPct = node.cpuLoad / 100
            return (
              <g key={node.id}>
                {/* Outer pulse ring */}
                <circle cx={x} cy={y} r={size + 4} fill="none" stroke={color} strokeWidth="0.5" opacity="0.3">
                  <animate attributeName="r" from={size + 2} to={size + 10} dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite" />
                </circle>
                {/* Load arc */}
                <circle cx={x} cy={y} r={size + 1} fill="none" stroke={color} strokeWidth="1.5"
                  strokeDasharray={`${loadPct * 2 * Math.PI * (size + 1)} ${(1 - loadPct) * 2 * Math.PI * (size + 1)}`}
                  strokeLinecap="round" opacity="0.5"
                  transform={`rotate(-90 ${x} ${y})`}
                />
                {/* Diamond shape */}
                <polygon
                  points={`${x},${y - size} ${x + size},${y} ${x},${y + size} ${x - size},${y}`}
                  fill={`${color}22`}
                  stroke={color}
                  strokeWidth="1.2"
                />
                {/* Center dot */}
                <circle cx={x} cy={y} r="2" fill={color} />
              </g>
            )
          })}

          {/* Player session dots */}
          {data.activeSessions.map((session) => {
            const { x, y } = project(session.latitude, session.longitude)
            const color = getSessionColor(session, now)
            const filterId = color === '#d4a017' ? 'glow-gold' : color === '#ef4444' ? 'glow-red' : color === '#3b82f6' ? 'glow-blue' : 'glow-green'
            const dotSize = session.wagerAmount > 5000 ? 4.5 : session.winAmount > session.wagerAmount * 2 ? 4 : 3
            return (
              <g key={session.id} filter={`url(#${filterId})`}>
                {/* Pulse ring */}
                <circle cx={x} cy={y} r={dotSize + 3} fill="none" stroke={color} strokeWidth="0.6" opacity="0.4">
                  <animate attributeName="r" from={dotSize} to={dotSize + 8} dur="2.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.6" to="0" dur="2.5s" repeatCount="indefinite" />
                </circle>
                {/* Main dot */}
                <circle cx={x} cy={y} r={dotSize} fill={color} opacity="0.9">
                  <animate attributeName="r" values={`${dotSize};${dotSize + 1};${dotSize}`} dur="1.5s" repeatCount="indefinite" />
                </circle>
                {/* Bright core */}
                <circle cx={x} cy={y} r={dotSize * 0.4} fill="#ffffff" opacity="0.6" />
              </g>
            )
          })}

          {/* Live event burst effects (recent events) */}
          {data.liveEvents.filter(e => Date.now() - new Date(e.createdAt).getTime() < 60000).map((event) => {
            const { x, y } = project(event.latitude, event.longitude)
            const burstColor = event.eventType === 'jackpot_hit' ? '#d4a017' : event.eventType === 'big_win' ? '#10b981' : '#3b82f6'
            return (
              <g key={event.id}>
                <circle cx={x} cy={y} r="2" fill="none" stroke={burstColor} strokeWidth="1.5" opacity="0">
                  <animate attributeName="r" from="2" to="20" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.8" to="0" dur="1.5s" repeatCount="indefinite" />
                </circle>
                <circle cx={x} cy={y} r="2" fill="none" stroke={burstColor} strokeWidth="1" opacity="0">
                  <animate attributeName="r" from="5" to="25" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite" />
                </circle>
              </g>
            )
          })}
        </svg>

        {/* ─── Interactive Overlay (captures mouse for tooltips) ─── */}
        <div
          className="absolute inset-0 z-10"
          onMouseMove={(e) => {
            setTooltipPos({ x: e.clientX, y: e.clientY })
            if (!data) return

            const svgEl = e.currentTarget.previousElementSibling as SVGSVGElement
            if (!svgEl) return
            const rect = svgEl.getBoundingClientRect()
            const scaleX = MAP_WIDTH / rect.width
            const scaleY = MAP_HEIGHT / rect.height
            const svgX = (e.clientX - rect.left) * scaleX
            const svgY = (e.clientY - rect.top) * scaleY

            let found: ServerNode | null = null
            for (const node of data.serverNodes) {
              const p = project(node.latitude, node.longitude)
              if (Math.abs(p.x - svgX) < 12 && Math.abs(p.y - svgY) < 12) {
                found = node
                break
              }
            }
            setHoveredServer(found)
            if (found) { setHoveredSession(null); return }

            let foundSession: ActiveSession | null = null
            for (const session of data.activeSessions) {
              const p = project(session.latitude, session.longitude)
              if (Math.abs(p.x - svgX) < 10 && Math.abs(p.y - svgY) < 10) {
                foundSession = session
                break
              }
            }
            setHoveredSession(foundSession)
          }}
          onMouseLeave={() => { setHoveredServer(null); setHoveredSession(null) }}
        />

        {/* ─── Tooltips ─── */}
        <ServerTooltip node={hoveredServer} visible={!!hoveredServer} x={tooltipPos.x} y={tooltipPos.y} />
        <SessionTooltip session={hoveredSession} visible={!!hoveredSession} x={tooltipPos.x} y={tooltipPos.y} />

        {/* ─── Stats Overlay ─── */}
        <StatsOverlay stats={data.stats} />

        {/* ─── Region Legend ─── */}
        <RegionLegend byRegion={data.stats.byRegion} />

        {/* ─── Dot Legend ─── */}
        <DotLegend />

        {/* ─── Device Stats ─── */}
        <DeviceStats byDevice={data.stats.byDevice} />
      </div>

      {/* ─── Live Event Ticker ─── */}
      <EventTicker events={data.liveEvents} />
    </div>
  )
}
