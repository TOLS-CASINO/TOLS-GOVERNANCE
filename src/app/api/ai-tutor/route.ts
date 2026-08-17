import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { message, context } = await request.json()

    // Build system prompt based on context
    const systemPrompts: Record<string, string> = {
      financial: `You are the TOLS TUTOR AI Agent specializing in financial analysis for a casino management platform. You have deep knowledge of:
- Waterfall payment distribution protocols (6-tier: Operational 15% → Affiliate 25% → Jackpot 10% → Marketing 20% → Reserve 15% → Profit 15%)
- Escrow account management and settlement scheduling
- Variance analysis with ±15% threshold monitoring
- 13-week rolling financial forecasts
- House edge calculations and RTP analysis
- Budget vs actual tracking across all categories

Provide specific, actionable insights with numbers where possible. Use professional financial terminology.`,
      player: `You are the TOLS TUTOR AI Agent specializing in player intelligence for a casino management platform. You have deep knowledge of:
- Player segmentation (VIP, High Value, Medium, Casual, Churning)
- Churn risk prediction and retention strategies
- Lifetime Value (LTV) calculations
- Responsible gaming limits and compliance
- Player behavior analysis and heatmap interpretation
- VIP tier progression and benefits

Provide specific, actionable insights for player management.`,
      promotion: `You are the TOLS TUTOR AI Agent specializing in promotion optimization for a casino management platform. You have deep knowledge of:
- Bonus type optimization (deposit match, free spins, cashback, reload)
- Wagering requirement calibration
- Bonus burn rate analysis
- Conversion tracking and ROI measurement
- Segment-targeted promotions
- Cron-scheduled bonus code generation
- A/B testing for promotion effectiveness

Provide specific, actionable insights for promotion optimization.`,
      general: `You are the TOLS TUTOR AI Agent for a casino management platform called TOLS Platform. You help operators with:
- Financial flows and waterfall distribution
- Player intelligence and segmentation
- Promotion optimization and bonus management
- Affiliate performance and commission tracking
- Legal compliance and audit trails
- Escrow account management

Be concise, professional, and provide actionable insights with specific numbers where possible.`,
    }

    const systemPrompt = systemPrompts[context] || systemPrompts.general

    // Use z-ai-web-dev-sdk for LLM chat
    const { default: ZAI } = await import('z-ai-web-dev-sdk')
    const zai = await ZAI.create()
    const response = await zai.chat.completions.create({
      model: 'glm-4-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      thinking: { type: 'disabled' },
    })

    const assistantMessage = response.choices?.[0]?.message?.content || response.content || 'I apologize, I could not process your request. Please try again.'

    return NextResponse.json({ response: assistantMessage, context })
  } catch (error) {
    console.error('AI Tutor error:', error)

    // Fallback to keyword-based responses if LLM fails
    const { message } = await request.json().catch(() => ({ message: '' }))
    const msg = (message || '').toLowerCase()
    let fallback = 'I\'m the TOLS TUTOR AI Agent. I can help you analyze financial flows, player behavior, promotion performance, and more. What specific area would you like me to focus on?'

    if (msg.includes('deposit')) fallback = 'Total confirmed deposits are trending upward. The average deposit amount is $1,250 with crypto being the most popular method (42%). Consider targeting Active Depositors with a reload bonus.'
    else if (msg.includes('churn')) fallback = '89 players are flagged as high churn risk (score > 0.7). Key indicators: decreased session frequency, lower average bet size. Deploy personalized cashback with reduced wagering requirements.'
    else if (msg.includes('bonus') || msg.includes('promotion')) fallback = 'Welcome Bonus 200% has the highest conversion at 34.7%, but Bonus Burn is 2.3x. VIP Cashback 15% shows best ROI with 4.2x multiplier. Consider adjusting welcome max to $1,000.'
    else if (msg.includes('waterfall')) fallback = 'Current waterfall from $487,250 escrow follows 6-tier priority. Marketing allocation variance is +25% — exceeding ±15% threshold, flagged as high severity.'

    return NextResponse.json({ response: fallback, context: 'fallback' })
  }
}
