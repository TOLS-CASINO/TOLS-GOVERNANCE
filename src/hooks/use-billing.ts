'use client'
import { useApi } from './use-api'
import { api } from '@/services/api'

export function useBilling() {
  return useApi(() => api.billing.get())
}
