export interface PlayerProfile {
  id: string; username: string; email?: string; vipLevel: string; totalDeposits: number; totalWagers: number; totalWins: number; lifetimeValue: number; churnRisk: number; status: string; country?: string; registeredAt: string; lastActivityAt: string; segments?: PlayerSegmentAssignment[]; deposits?: CasinoDepositMini[]; notes?: PlayerNote[]
}
export interface PlayerSegmentAssignment {
  id: string; segmentId: string; assignedAt: string; segment?: { id: string; name: string; color: string }
}
export interface CasinoDepositMini {
  id: string; amount: number; method: string; status: string; createdAt: string
}
export interface PlayerNote {
  id: string; authorRole: string; content: string; isInternal: boolean; createdAt: string
}
export interface PlayerTimeline {
  id: string; eventType: string; description: string; metadata?: string; createdAt: string
}
export interface PlayerHeatmap {
  id: string; gameId: string; dayOfWeek: number; hourOfDay: number; intensity: number
}
export interface PlayerBonusHistory {
  id: string; promotionId?: string; bonusCode?: string; amount: number; wageringRequired: number; wageringCompleted: number; status: string; claimedAt: string; expiresAt?: string
}
