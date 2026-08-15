import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const ledger = await db.internalLedger.findMany({ orderBy: { createdAt: 'desc' } })
    const escrow = await db.escrowAccount.findFirst()

    // Waterfall distribution: priority order of payments
    const totalPool = escrow?.totalBalance || 0
    const waterfallSteps = [
      { name: 'Operational Costs', priority: 1, rate: 0.15, amount: totalPool * 0.15 },
      { name: 'Affiliate Commissions', priority: 2, rate: 0.25, amount: totalPool * 0.25 },
      { name: 'Jackpot Reserve', priority: 3, rate: 0.10, amount: totalPool * 0.10 },
      { name: 'Marketing Budget', priority: 4, rate: 0.20, amount: totalPool * 0.20 },
      { name: 'Platform Reserve', priority: 5, rate: 0.15, amount: totalPool * 0.15 },
      { name: 'Profit Distribution', priority: 6, rate: 0.15, amount: totalPool * 0.15 },
    ]

    return NextResponse.json({ totalPool, waterfallSteps, ledger, escrow })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch waterfall data' }, { status: 500 })
  }
}
