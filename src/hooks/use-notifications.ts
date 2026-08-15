'use client'
import { useApi } from './use-api'
import { api } from '@/services/api'

export function useNotifications() {
  return useApi(() => api.notifications.get())
}
