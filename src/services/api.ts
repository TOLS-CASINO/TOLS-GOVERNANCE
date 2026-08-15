const BASE = ''

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`)
  return res.json()
}

export const api = {
  dashboard: {
    get: () => request<import('@/types').DashboardData>('/api/dashboard'),
  },
  financial: {
    get: () => request<any>('/api/financial'),
  },
  escrow: {
    get: () => request<import('@/types').EscrowAccount>('/api/escrow'),
  },
  waterfall: {
    get: () => request<any>('/api/waterfall'),
  },
  players: {
    get: () => request<import('@/types').PlayerProfile[]>('/api/players'),
  },
  segments: {
    get: () => request<import('@/types').Segment[]>('/api/segments'),
  },
  promotions: {
    get: () => request<import('@/types').Promotion[]>('/api/promotions'),
  },
  affiliates: {
    get: () => request<import('@/types').AffiliateProfile[]>('/api/affiliates'),
  },
  legal: {
    get: () => request<import('@/types').LegalData>('/api/legal'),
  },
  variance: {
    get: () => request<any>('/api/variance'),
  },
  budget: {
    get: () => request<import('@/types').BudgetTarget[]>('/api/budget'),
  },
  jackpots: {
    get: () => request<import('@/types').GlobalJackpot[]>('/api/jackpots'),
  },
  forecast: {
    get: () => request<import('@/types').ForecastData>('/api/forecast'),
  },
  aiTutor: {
    post: (message: string, context: string) =>
      request<import('@/types').AiTutorResponse>('/api/ai-tutor', {
        method: 'POST',
        body: JSON.stringify({ message, context }),
      }),
  },
  liveMap: {
    get: () => request<import('@/types').LiveMapData>('/api/live-map'),
  },
  livePlayers: {
    get: () => request<any>('/api/live-players'),
  },
  payments: {
    get: () => request<any>('/api/payments'),
  },
  wallets: {
    get: () => request<import('@/types').WalletsData>('/api/wallets'),
  },
  apiHub: {
    get: () => request<any>('/api/api-hub'),
  },
  notifications: {
    get: () => request<any>('/api/notifications'),
  },
  vendors: {
    get: () => request<any>('/api/vendors'),
  },
}
