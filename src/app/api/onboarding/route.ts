import { NextResponse } from 'next/server'

const onboardingStatus = {
  isComplete: true,
  currentStep: 5,
  casinoName: 'TOLS Casino',
  configuredProviders: ['Evolution Gaming', 'Pragmatic Play', 'NetEnt'],
  featuresEnabled: {
    blockchain: true,
    aiTutor: true,
    liveTracking: true,
  },
  adminUser: 'admin@tols-casino.com',
  completedAt: '2024-01-15T10:30:00.000Z',
}

const steps = [
  { id: 1, title: 'Welcome', description: 'Platform introduction and initial setup', isComplete: true },
  { id: 2, title: 'Casino Setup', description: 'Configure your casino brand and preferences', isComplete: true },
  { id: 3, title: 'User Setup', description: 'Create admin account and invite team', isComplete: true },
  { id: 4, title: 'Integrations', description: 'Connect game providers and enable features', isComplete: true },
  { id: 5, title: 'Complete', description: 'Review and finalize configuration', isComplete: true },
]

export async function GET() {
  return NextResponse.json({ onboardingStatus, steps })
}

export async function POST(request: Request) {
  const body = await request.json()
  // In production, this would save the onboarding data to the database
  return NextResponse.json({ success: true, step: body.step ?? 1 })
}
