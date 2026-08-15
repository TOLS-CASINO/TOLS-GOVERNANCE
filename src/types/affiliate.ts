export interface AffiliateProfile {
  id: string; name: string; email: string; website?: string; tier: string; commissionRate: number; totalEarnings: number; activePlayers: number; status: string; performance?: AffiliatePerformance[]; commissions?: AffiliateCommission[]
}
export interface AffiliatePerformance {
  id: string; affiliateId: string; period: string; clicks: number; signups: number; ftd: number; revenue: number
}
export interface AffiliateCommission {
  id: string; affiliateId: string; amount: number; source: string; periodMonth: string; isPaid: boolean; paidAt?: string
}
