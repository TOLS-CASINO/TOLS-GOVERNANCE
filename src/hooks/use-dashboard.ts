'use client'
import { useApi } from './use-api'
import { api } from '@/services/api'
import type { DashboardData } from '@/types'

export function useDashboard() {
  return useApi<DashboardData>(() => api.dashboard.get())
}
