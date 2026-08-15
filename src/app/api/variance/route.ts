import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const [alerts, budgets] = await Promise.all([
      db.varianceAlert.findMany({ orderBy: { createdAt: 'desc' } }),
      db.budgetTarget.findMany({ orderBy: { variance: 'desc' } }),
    ])
    return NextResponse.json({ alerts, budgets })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch variance data' }, { status: 500 })
  }
}
