import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const budgets = await db.budgetTarget.findMany({ orderBy: { category: 'asc' } })
    return NextResponse.json(budgets)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch budget data' }, { status: 500 })
  }
}
