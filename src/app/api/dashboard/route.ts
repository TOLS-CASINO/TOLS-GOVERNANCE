import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const [deposits, withdrawals, houseEarnings, players, escrow, alerts, jackpots] = await Promise.all([
      db.casinoDeposit.findMany({ where: { status: 'confirmed' } }),
      db.totalWithdrawal.findMany({ where: { status: 'completed' } }),
      db.houseEarning.findMany(),
      db.playerProfile.findMany({ where: { status: 'active' } }),
      db.escrowAccount.findFirst(),
      db.varianceAlert.findMany({ where: { isRead: false } }),
      db.globalJackpot.findMany(),
    ])

    const totalDeposits = deposits.reduce((sum, d) => sum + d.amount, 0)
    const totalWithdrawals = withdrawals.reduce((sum, w) => sum + w.amount, 0)
    const netCashFlow = totalDeposits - totalWithdrawals
    const totalHouseEarnings = houseEarnings.reduce((sum, h) => sum + h.netEarning, 0)
    const activePlayers = players.length
    const avgLtv = players.length > 0 ? players.reduce((sum, p) => sum + p.lifetimeValue, 0) / players.length : 0

    return NextResponse.json({
      kpis: {
        totalDeposits: Math.round(totalDeposits),
        totalWithdrawals: Math.round(totalWithdrawals),
        netCashFlow: Math.round(netCashFlow),
        totalHouseEarnings: Math.round(totalHouseEarnings),
        activePlayers,
        avgLtv: Math.round(avgLtv),
        escrowBalance: escrow?.totalBalance || 0,
        pendingSettlement: escrow?.pendingSettlement || 0,
        varianceAlerts: alerts.length,
      },
      recentDeposits: deposits.slice(-10).reverse(),
      houseEarnings,
      jackpots,
      varianceAlerts: alerts,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
