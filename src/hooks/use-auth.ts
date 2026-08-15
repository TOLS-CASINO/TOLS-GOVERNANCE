'use client'
import { useApi } from './use-api'
import { api } from '@/services/api'

export function useAuth() {
  return useApi(() => api.auth.get())
}
