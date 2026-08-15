'use client'
import { useApi } from './use-api'
import { api } from '@/services/api'

export function useLiveMap() {
  return useApi(() => api.liveMap.get())
}
