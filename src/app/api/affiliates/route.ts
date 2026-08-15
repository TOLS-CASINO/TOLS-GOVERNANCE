import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const affiliates = await db.affiliateProfile.findMany({
      include: { performance: true, commissions: true },
      orderBy: { totalEarnings: 'desc' },
    })
    return NextResponse.json(affiliates)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch affiliates' }, { status: 500 })
  }
}
