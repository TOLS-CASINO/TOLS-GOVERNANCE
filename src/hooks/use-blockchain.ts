'use client'
import { useApi } from './use-api'
import { api } from '@/services/api'

export function useBlockchain() {
  return useApi(() => api.blockchain.get())
}
