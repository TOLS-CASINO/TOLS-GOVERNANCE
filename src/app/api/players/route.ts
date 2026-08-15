import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const players = await db.playerProfile.findMany({
      include: {
        segments: { include: { segment: true } },
        deposits: { orderBy: { createdAt: 'desc' }, take: 5 },
        notes: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
      orderBy: { lifetimeValue: 'desc' },
    })
    return NextResponse.json(players)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 })
  }
}
