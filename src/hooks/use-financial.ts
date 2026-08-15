'use client'
import { useApi } from './use-api'
import { api } from '@/services/api'

export function useFinancial() {
  return useApi(() => api.financial.get())
}

export function useEscrow() {
  return useApi(() => api.escrow.get())
}

export function useWaterfall() {
  return useApi(() => api.waterfall.get())
}

export function useVariance() {
  return useApi(() => api.variance.get())
}
