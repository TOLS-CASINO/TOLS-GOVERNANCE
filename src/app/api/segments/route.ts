import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const segments = await db.segment.findMany({ include: { players: true, promotions: true }, orderBy: { playerCount: 'desc' } })
    return NextResponse.json(segments)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch segments' }, { status: 500 })
  }
}
