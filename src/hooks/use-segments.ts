'use client'
import { useApi } from './use-api'
import { api } from '@/services/api'
import type { Segment } from '@/types'

export function useSegments() {
  return useApi<Segment[]>(() => api.segments.get())
}
