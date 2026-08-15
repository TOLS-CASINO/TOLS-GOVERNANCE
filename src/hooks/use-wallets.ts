'use client'
import { useApi } from './use-api'
import { api } from '@/services/api'

export function useWallets() {
  return useApi(() => api.wallets.get())
}
