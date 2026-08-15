import { db } from '@/lib/db'

async function seed() {
  console.log('🌱 Seeding TOLS Platform database...')

  // Create Affiliate Tiers
  await db.affiliateTier.create({ data: { name: 'bronze', minFtd: 0, minRevenue: 0, commissionRate: 25, bonusRate: 0 } })
  await db.affiliateTier.create({ data: { name: 'silver', minFtd: 10, minRevenue: 5000, commissionRate: 30, bonusRate: 2 } })
  await db.affiliateTier.create({ data: { name: 'gold', minFtd: 50, minRevenue: 25000, commissionRate: 35, bonusRate: 5 } })
  await db.affiliateTier.create({ data: { name: 'platinum', minFtd: 100, minRevenue: 100000, commissionRate: 40, bonusRate: 10 } })

  // Create Segments
  const vipSegment = await db.segment.create({ data: { name: 'VIP High Rollers', description: 'Players with LTV > $10,000', rules: JSON.stringify({ ltv: { min: 10000 } }), playerCount: 47, color: '#f59e0b' } })
  const activeSegment = await db.segment.create({ data: { name: 'Active Depositors', description: 'Deposited in last 7 days', rules: JSON.stringify({ lastDeposit: { within: '7d' } }), playerCount: 312, color: '#10b981' } })
  const churnRiskSegment = await db.segment.create({ data: { name: 'Churn Risk', description: 'High probability of leaving', rules: JSON.stringify({ churnRisk: { min: 0.7 } }), playerCount: 89, color: '#ef4444' } })
  const newPlayersSegment = await db.segment.create({ data: { name: 'New Players', description: 'Registered in last 30 days', rules: JSON.stringify({ registeredAt: { within: '30d' } }), playerCount: 156, color: '#8b5cf6' } })
  const casualSegment = await db.segment.create({ data: { name: 'Casual Players', description: 'Low wager, occasional play', rules: JSON.stringify({ totalWagers: { max: 500 } }), playerCount: 523, color: '#06b6d4' } })

  // Create Player Profiles
  const players: string[] = []
  const playerNames = ['Alex_Morgan', 'Sarah_Chen', 'Mike_Rossi', 'Emma_Wilson', 'James_Kumar', 'Lina_Petrov', 'David_Okafor', 'Maria_Silva', 'Tom_Baker', 'Yuki_Tanaka', 'Chris_Jones', 'Ana_Garcia', 'Raj_Patel', 'Sofia_Lee', 'Omar_Hassan', 'Julia_Nova', 'Ben_Walker', 'Aria_Chung', 'Leo_Martinez', 'Zoe_Blake']
  const vipLevels = ['bronze', 'silver', 'gold', 'platinum', 'diamond']
  const countries = ['US', 'UK', 'CA', 'AU', 'DE', 'JP', 'BR', 'IN', 'NG', 'KR']

  for (let i = 0; i < playerNames.length; i++) {
    const totalDeposits = Math.round(Math.random() * 50000 + 500)
    const totalWagers = Math.round(totalDeposits * (1.5 + Math.random() * 3))
    const totalWins = Math.round(totalWagers * (0.3 + Math.random() * 0.4))
    const ltv = Math.round(totalDeposits * 0.15)
    
    const player = await db.playerProfile.create({
      data: {
        username: playerNames[i],
        email: `${playerNames[i].toLowerCase()}@email.com`,
        vipLevel: vipLevels[Math.min(Math.floor(i / 4), 4)],
        totalDeposits,
        totalWagers,
        totalWins,
        lifetimeValue: ltv,
        churnRisk: Math.random(),
        status: i < 17 ? 'active' : (i < 19 ? 'inactive' : 'self_excluded'),
        country: countries[i % countries.length],
        lastActivityAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      }
    })
    players.push(player.id)

    const segId = [vipSegment.id, activeSegment.id, churnRiskSegment.id, newPlayersSegment.id, casualSegment.id][Math.floor(Math.random() * 5)]
    await db.playerSegmentAssignment.create({ data: { playerId: player.id, segmentId: segId } })

    const numDeposits = Math.floor(Math.random() * 5) + 1
    for (let j = 0; j < numDeposits; j++) {
      await db.casinoDeposit.create({
        data: {
          playerId: player.id,
          amount: Math.round(Math.random() * 5000 + 50),
          method: ['crypto', 'card', 'bank_transfer'][Math.floor(Math.random() * 3)],
          status: 'confirmed',
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        }
      })
    }
  }

  // Create House Earnings
  const games = ['Mega Moolah', 'Blackjack Pro', 'Roulette Royal', 'Starburst', 'Gonzo Quest', 'Book of Dead', 'Cleopatra Gold', 'Baccarat Squeeze']
  for (const game of games) {
    const gross = Math.round(Math.random() * 100000 + 10000)
    const payout = Math.round(gross * (0.6 + Math.random() * 0.3))
    await db.houseEarning.create({
      data: {
        gameId: game.toLowerCase().replace(/ /g, '_'),
        grossRevenue: gross,
        playerPayout: payout,
        houseEdge: Math.round((1 - payout / gross) * 1000) / 10,
        netEarning: gross - payout,
        periodStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        periodEnd: new Date(),
      }
    })
  }

  // Create Escrow Account
  const escrow = await db.escrowAccount.create({
    data: { totalBalance: 487250.00, pendingSettlement: 125000.00, lastSettlement: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), settlementFrequency: 'weekly', status: 'active' }
  })

  await db.settlementLog.createMany({
    data: [
      { escrowId: escrow.id, amount: 85000, recipients: JSON.stringify(['affiliate_pool', 'jackpot_reserve', 'operational']), status: 'completed' },
      { escrowId: escrow.id, amount: 92000, recipients: JSON.stringify(['affiliate_pool', 'jackpot_reserve', 'operational']), status: 'completed' },
      { escrowId: escrow.id, amount: 125000, recipients: JSON.stringify(['affiliate_pool', 'jackpot_reserve', 'operational']), status: 'processing' },
    ]
  })

  // Create Ledger Entries
  const ledgerCategories = ['operational', 'marketing', 'affiliate', 'jackpot', 'reserve']
  for (const cat of ledgerCategories) {
    for (let w = 0; w < 4; w++) {
      await db.internalLedger.create({
        data: {
          category: cat,
          description: `${cat} allocation - Week ${w + 1}`,
          amount: Math.round(Math.random() * 50000 + 5000),
          type: Math.random() > 0.3 ? 'credit' : 'debit',
          periodWeek: `2025-W${w + 1}`,
        }
      })
    }
  }

  // Create Budget Targets
  for (const cat of ledgerCategories) {
    const target = Math.round(Math.random() * 50000 + 10000)
    const actual = Math.round(target * (0.7 + Math.random() * 0.6))
    await db.budgetTarget.create({
      data: {
        category: cat,
        targetAmount: target,
        actualAmount: actual,
        variance: Math.round((actual - target) / target * 1000) / 10,
        periodWeek: '2025-W4',
      }
    })
  }

  // Create Variance Alerts
  await db.varianceAlert.createMany({
    data: [
      { category: 'marketing', expectedValue: 25000, actualValue: 31250, variancePercent: 25, threshold: 15, severity: 'high', isRead: false },
      { category: 'affiliate', expectedValue: 18000, actualValue: 15300, variancePercent: -15, threshold: 15, severity: 'medium', isRead: false },
      { category: 'operational', expectedValue: 30000, actualValue: 28500, variancePercent: -5, threshold: 15, severity: 'low', isRead: true },
      { category: 'jackpot', expectedValue: 12000, actualValue: 15800, variancePercent: 31.7, threshold: 15, severity: 'critical', isRead: false },
    ]
  })

  // Create Global Jackpot
  await db.globalJackpot.createMany({
    data: [
      { name: 'Mega Fortune', currentAmount: 1250000, seedAmount: 500000, contributionRate: 0.03 },
      { name: 'Divine Fortune', currentAmount: 340000, seedAmount: 100000, contributionRate: 0.02 },
      { name: 'Major Millions', currentAmount: 890000, seedAmount: 250000, contributionRate: 0.025 },
    ]
  })

  // Create Affiliates
  const affiliateNames = ['TopGaming Partners', 'Lucky Leads Co', 'Casino Traffic Pro', 'VIP Referrals', 'Digital Play Hub']
  for (let i = 0; i < affiliateNames.length; i++) {
    const aff = await db.affiliateProfile.create({
      data: {
        name: affiliateNames[i],
        email: `contact@${affiliateNames[i].toLowerCase().replace(/ /g, '')}.com`,
        tier: ['bronze', 'silver', 'gold', 'platinum', 'gold'][i],
        commissionRate: [25, 30, 35, 40, 35][i],
        totalEarnings: Math.round(Math.random() * 100000 + 10000),
        activePlayers: Math.floor(Math.random() * 200 + 10),
      }
    })
    await db.affiliatePerformance.create({
      data: {
        affiliateId: aff.id,
        period: '2025-01',
        clicks: Math.floor(Math.random() * 5000 + 500),
        signups: Math.floor(Math.random() * 200 + 20),
        ftd: Math.floor(Math.random() * 100 + 10),
        revenue: Math.round(Math.random() * 50000 + 5000),
      }
    })
  }

  // Create Promotions
  const promo1 = await db.promotion.create({
    data: { name: 'Welcome Bonus 200%', type: 'deposit_match', segmentId: newPlayersSegment.id, bonusPercent: 200, maxAmount: 2000, wageringMultiplier: 35, minDeposit: 20, isActive: true, startsAt: new Date(), endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
  })
  const promo2 = await db.promotion.create({
    data: { name: 'VIP Cashback 15%', type: 'cashback', segmentId: vipSegment.id, bonusPercent: 15, maxAmount: 5000, wageringMultiplier: 5, isActive: true, startsAt: new Date(), endsAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) }
  })
  const promo3 = await db.promotion.create({
    data: { name: 'Free Spins Friday', type: 'free_spins', segmentId: activeSegment.id, freeSpins: 50, wageringMultiplier: 25, isActive: true, startsAt: new Date(), endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
  })

  await db.bonusCode.createMany({
    data: [
      { promotionId: promo1.id, code: 'WELCOME200', maxUses: 1000, currentUses: 347, isActive: true },
      { promotionId: promo2.id, code: 'VIPCB15', maxUses: null, currentUses: 23, isActive: true },
      { promotionId: promo3.id, code: 'FREESPIN50', maxUses: 500, currentUses: 189, isActive: true },
    ]
  })

  for (const promo of [promo1, promo2, promo3]) {
    await db.promotionStat.create({
      data: {
        promotionId: promo.id,
        claims: Math.floor(Math.random() * 300 + 50),
        conversions: Math.floor(Math.random() * 100 + 10),
        totalBonusGiven: Math.round(Math.random() * 50000 + 5000),
        totalWagered: Math.round(Math.random() * 200000 + 50000),
        revenue: Math.round(Math.random() * 80000 + 20000),
      }
    })
  }

  // Create Contracts
  await db.contractSignature.createMany({
    data: [
      { contractType: 'operator_agreement', documentName: 'Operator License Agreement 2025', status: 'signed', signedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), signers: JSON.stringify(['TOLS Operations', 'Gaming Authority']) },
      { contractType: 'affiliate_terms', documentName: 'Affiliate Program Terms v3.2', status: 'pending', signers: JSON.stringify(['TOLS Legal', 'Partner Co']), docusignId: 'ds-abc123' },
      { contractType: 'nda', documentName: 'NDA - Data Processing', status: 'sent', signers: JSON.stringify(['TOLS CTO', 'DataVendor Inc']), docusignId: 'ds-def456' },
    ]
  })

  // Create Audit Logs
  const auditActions = ['login', 'deposit_approved', 'withdrawal_processed', 'promotion_created', 'segment_updated', 'player_note_added', 'bonus_issued', 'report_exported']
  for (let i = 0; i < 20; i++) {
    await db.auditLog.create({
      data: {
        userId: `user_${Math.floor(Math.random() * 5) + 1}`,
        userRole: ['finance', 'controller', 'super_admin'][Math.floor(Math.random() * 3)],
        action: auditActions[Math.floor(Math.random() * auditActions.length)],
        resource: 'platform',
        details: JSON.stringify({ ip: '192.168.1.' + Math.floor(Math.random() * 255) }),
      }
    })
  }

  // Create Cron Schedules
  await db.cronSchedule.createMany({
    data: [
      { name: 'Weekly Bonus Code Generation', taskType: 'bonus_code_generation', cronExpression: '0 9 * * 1', isActive: true, nextRunAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
      { name: 'Daily Segment Refresh', taskType: 'segment_refresh', cronExpression: '0 2 * * *', isActive: true, nextRunAt: new Date(Date.now() + 12 * 60 * 60 * 1000) },
      { name: 'Weekly Financial Report', taskType: 'report_generation', cronExpression: '0 8 * * 5', isActive: true, nextRunAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
    ]
  })

  console.log('✅ Seed completed successfully!')
}

seed().catch(console.error)
