'use client'
import { useApi } from './use-api'
import { api } from '@/services/api'

export function useLivePlayers() {
  return useApi(() => api.livePlayers.get())
}
