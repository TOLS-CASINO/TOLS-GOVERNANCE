'use client'
import { useApi } from './use-api'
import { api } from '@/services/api'

export function useMLPipeline() {
  return useApi(() => api.mlPipeline.get())
}
