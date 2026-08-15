'use client'
import { useApi } from './use-api'
import { api } from '@/services/api'

export function useOnboarding() {
  return useApi(() => api.onboarding.get())
}
