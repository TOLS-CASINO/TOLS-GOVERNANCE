import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Generate 13-week forecast based on historical data
    const deposits = await db.casinoDeposit.findMany({ where: { status: 'confirmed' }, orderBy: { createdAt: 'asc' } })
    const houseEarnings = await db.houseEarning.findMany()

    const avgWeeklyDeposit = deposits.length > 0 ? (deposits.reduce((sum, d) => sum + d.amount, 0) / Math.max(deposits.length / 7, 1)) : 50000
    const avgHouseEdge = houseEarnings.length > 0 ? (houseEarnings.reduce((sum, h) => sum + h.houseEdge, 0) / houseEarnings.length) : 5

    const forecast = Array.from({ length: 13 }, (_, i) => {
      const week = i + 1
      const seasonalFactor = 1 + 0.1 * Math.sin((week / 13) * Math.PI * 2)
      const growthFactor = 1 + (i * 0.005)
      return {
        week: `W${week}`,
        projectedDeposits: Math.round(avgWeeklyDeposit * seasonalFactor * growthFactor),
        projectedRevenue: Math.round(avgWeeklyDeposit * seasonalFactor * growthFactor * (avgHouseEdge / 100)),
        projectedExpenses: Math.round(avgWeeklyDeposit * 0.3 * seasonalFactor),
        netCashFlow: Math.round(avgWeeklyDeposit * seasonalFactor * growthFactor * (avgHouseEdge / 100) - avgWeeklyDeposit * 0.3 * seasonalFactor),
      }
    })

    return NextResponse.json({ forecast, avgWeeklyDeposit: Math.round(avgWeeklyDeposit), avgHouseEdge })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch forecast' }, { status: 500 })
  }
}
