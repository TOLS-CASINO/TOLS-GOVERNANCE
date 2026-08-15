'use client'
import { useApi } from './use-api'
import { api } from '@/services/api'

export function usePayments() {
  return useApi(() => api.payments.get())
}
