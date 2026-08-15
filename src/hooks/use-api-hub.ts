'use client'
import { useApi } from './use-api'
import { api } from '@/services/api'

export function useApiHub() {
  return useApi(() => api.apiHub.get())
}
