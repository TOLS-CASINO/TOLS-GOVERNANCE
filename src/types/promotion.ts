export interface Promotion {
  id: string; name: string; type: string; segmentId?: string; bonusPercent?: number; maxAmount?: number; freeSpins?: number; wageringMultiplier: number; minDeposit?: number; isActive: boolean; startsAt: string; endsAt: string; segment?: { id: string; name: string }; stats?: PromotionStat[]; bonusCodes?: BonusCode[]
}
export interface PromotionStat {
  id: string; promotionId: string; claims: number; conversions: number; totalBonusGiven: number; totalWagered: number; revenue: number; periodDate: string
}
export interface BonusCode {
  id: string; promotionId: string; code: string; maxUses?: number; currentUses: number; isActive: boolean; expiresAt?: string
}
export interface CronSchedule {
  id: string; name: string; taskType: string; cronExpression: string; isActive: boolean; lastRunAt?: string; nextRunAt?: string
}
