import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const [contracts, auditLogs] = await Promise.all([
      db.contractSignature.findMany({ orderBy: { createdAt: 'desc' } }),
      db.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }),
    ])
    return NextResponse.json({ contracts, auditLogs })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch legal data' }, { status: 500 })
  }
}
