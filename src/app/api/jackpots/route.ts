import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const jackpots = await db.globalJackpot.findMany({ orderBy: { currentAmount: 'desc' } })
    return NextResponse.json(jackpots)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch jackpots' }, { status: 500 })
  }
}
