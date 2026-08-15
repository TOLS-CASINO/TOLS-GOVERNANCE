'use client'
import { useApi } from './use-api'
import { api } from '@/services/api'
import type { PlayerProfile } from '@/types'

export function usePlayers() {
  return useApi<PlayerProfile[]>(() => api.players.get())
}
