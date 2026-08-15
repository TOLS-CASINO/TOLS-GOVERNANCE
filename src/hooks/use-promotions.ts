'use client'
import { useApi } from './use-api'
import { api } from '@/services/api'
import type { Promotion } from '@/types'

export function usePromotions() {
  return useApi<Promotion[]>(() => api.promotions.get())
}
