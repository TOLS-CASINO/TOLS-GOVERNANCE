import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { message, context } = await request.json()

    // For now, return a contextual response based on keywords
    // This will be enhanced with the LLM skill later
    let response = ''
    const msg = message.toLowerCase()

    if (msg.includes('deposit') || msg.includes('deposits')) {
      response = 'Based on current data, total confirmed deposits are trending upward this week. The average deposit amount is $1,250 with crypto being the most popular method (42% of transactions). Consider targeting the "Active Depositors" segment with a reload bonus to boost mid-week activity.'
    } else if (msg.includes('churn') || msg.includes('retention')) {
      response = 'Currently 89 players are flagged as high churn risk (score > 0.7). Key indicators: decreased session frequency, lower average bet size, and no deposit in 7+ days. Recommended action: Deploy a personalized cashback offer to the "Churn Risk" segment with 10% weekly cashback and reduced wagering requirements.'
    } else if (msg.includes('bonus') || msg.includes('promotion')) {
      response = 'The Welcome Bonus 200% has the highest conversion rate at 34.7%, but the Bonus Burn ratio is 2.3x — meaning players are wagering 2.3x the bonus amount on average. The VIP Cashback 15% shows the best ROI with a 4.2x revenue multiplier. Consider reducing the welcome bonus max to $1,000 and increasing VIP cashback to 20%.'
    } else if (msg.includes('waterfall') || msg.includes('distribution')) {
      response = 'The current waterfall distribution from the $487,250 escrow pool follows the 6-tier priority protocol. Operational costs (15%) and affiliate commissions (25%) take the first priority. This week\'s settlement of $125,000 is in processing. The variance on the marketing allocation is +25% — exceeding the ±15% threshold and flagged as high severity.'
    } else if (msg.includes('affiliate')) {
      response = 'Top performing affiliate is "TopGaming Partners" with 142 active players and $87,500 revenue this month. The platinum-tier affiliate "VIP Referrals" has the highest FTD conversion rate at 38%. Commission payouts are tracking 12% under budget — consider increasing the silver tier rate from 30% to 32% to incentivize mid-tier performance.'
    } else if (msg.includes('jackpot')) {
      response = 'Three active global jackpots: Mega Fortune ($1.25M), Major Millions ($890K), and Divine Fortune ($340K). The Mega Fortune pool is 2.5x its seed amount and historically hits between 1.5-3x. Current contribution rate is 3% of house edge. The jackpot reserve is adequately funded at $48,725 (10% of escrow).'
    } else {
      response = 'I\'m the TOLS TUTOR AI Agent. I can help you analyze financial flows, player behavior, promotion performance, waterfall distributions, affiliate metrics, and jackpot reserves. What specific area would you like me to focus on? Try asking about deposits, churn risk, bonus optimization, or waterfall distribution.'
    }

    return NextResponse.json({ response, context })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process AI tutor request' }, { status: 500 })
  }
}
