'use client'
import { useApi } from './use-api'
import { api } from '@/services/api'
import type { AffiliateProfile } from '@/types'

export function useAffiliates() {
  return useApi<AffiliateProfile[]>(() => api.affiliates.get())
}
