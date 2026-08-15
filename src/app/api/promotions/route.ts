import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const promotions = await db.promotion.findMany({
      include: { stats: true, bonusCodes: true, segment: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(promotions)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch promotions' }, { status: 500 })
  }
}
