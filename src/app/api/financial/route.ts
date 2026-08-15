import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const [deposits, withdrawals, houseEarnings, ledger] = await Promise.all([
      db.casinoDeposit.findMany({ include: { player: { select: { username: true } } }, orderBy: { createdAt: 'desc' }, take: 50 }),
      db.totalWithdrawal.findMany({ include: { player: { select: { username: true } } }, orderBy: { createdAt: 'desc' }, take: 50 }),
      db.houseEarning.findMany({ orderBy: { netEarning: 'desc' } }),
      db.internalLedger.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }),
    ])

    return NextResponse.json({ deposits, withdrawals, houseEarnings, ledger })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch financial data' }, { status: 500 })
  }
}
