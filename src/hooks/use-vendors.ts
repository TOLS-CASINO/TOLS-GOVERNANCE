'use client'
import { useApi } from './use-api'
import { api } from '@/services/api'

export function useVendors() {
  return useApi(() => api.vendors.get())
}
