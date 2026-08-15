import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const billingData = {
      currentPlan: 'professional',
      status: 'active',
      periodStart: '2025-03-01',
      periodEnd: '2025-04-01',
      nextBillingDate: '2025-04-01',
      trialActive: false,
      autoRenew: true,
      usage: {
        players: { used: 4287, limit: 10000 },
        apiCalls: { used: 782400, limit: 1000000 },
        storage: { used: 42, limit: 100 },
      },
    }
    return NextResponse.json(billingData)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch billing data' }, { status: 500 })
  }
}
