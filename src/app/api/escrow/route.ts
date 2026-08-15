import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const escrow = await db.escrowAccount.findFirst({ include: { settlements: { orderBy: { settledAt: 'desc' } } } })
    return NextResponse.json(escrow)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch escrow data' }, { status: 500 })
  }
}
