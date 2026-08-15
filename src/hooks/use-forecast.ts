'use client'
import { useApi } from './use-api'
import { api } from '@/services/api'
import type { ForecastData } from '@/types'

export function useForecast() {
  return useApi<ForecastData>(() => api.forecast.get())
}
