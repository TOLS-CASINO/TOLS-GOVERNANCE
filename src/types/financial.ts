export interface CasinoDeposit {
  id: string; playerId: string; amount: number; currency: string; method: string; txHash?: string; status: string; createdAt: string; player?: { username: string }
}
export interface TotalWithdrawal {
  id: string; playerId: string; amount: number; currency: string; method: string; status: string; createdAt: string; player?: { username: string }
}
export interface HouseEarning {
  id: string; gameId: string; grossRevenue: number; playerPayout: number; houseEdge: number; netEarning: number; periodStart: string; periodEnd: string
}
export interface InternalLedger {
  id: string; category: string; description: string; amount: number; type: string; periodWeek: string; reference?: string; createdAt: string
}
export interface EscrowAccount {
  id: string; totalBalance: number; pendingSettlement: number; lastSettlement?: string; settlementFrequency: string; status: string; settlements?: SettlementLog[]
}
export interface SettlementLog {
  id: string; escrowId: string; amount: number; recipients: string; status: string; settledAt: string
}
export interface BudgetTarget {
  id: string; category: string; targetAmount: number; actualAmount: number; variance: number; periodWeek: string
}
export interface VarianceAlert {
  id: string; category: string; expectedValue: number; actualValue: number; variancePercent: number; threshold: number; severity: string; isRead: boolean; createdAt: string
}
export interface GlobalJackpot {
  id: string; name: string; currentAmount: number; seedAmount: number; contributionRate: number; lastWonAt?: string
}
export interface WaterfallStep {
  name: string; priority: number; rate: number; amount: number
}
export interface DashboardKpis {
  totalDeposits: number; totalWithdrawals: number; netCashFlow: number; totalHouseEarnings: number; activePlayers: number; avgLtv: number; escrowBalance: number; pendingSettlement: number; varianceAlerts: number
}
export interface DashboardData {
  kpis: DashboardKpis; recentDeposits: CasinoDeposit[]; houseEarnings: HouseEarning[]; jackpots: GlobalJackpot[]; varianceAlerts: VarianceAlert[]
}
export interface ForecastPoint {
  week: string; projectedDeposits: number; projectedRevenue: number; projectedExpenses: number; netCashFlow: number
}
export interface ForecastData {
  forecast: ForecastPoint[]; avgWeeklyDeposit: number; avgHouseEdge: number
}
