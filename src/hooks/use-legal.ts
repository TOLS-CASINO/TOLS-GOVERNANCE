'use client'
import { useApi } from './use-api'
import { api } from '@/services/api'
import type { LegalData } from '@/types'

export function useLegal() {
  return useApi<LegalData>(() => api.legal.get())
}
