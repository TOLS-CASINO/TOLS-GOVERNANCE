# TOLS Platform Worklog

---
A comprehensive casino management platform has been built from scratch using Next.js 16 with App Router.

## Architecture Overview

### Database (Prisma + SQLite)
- 35 tables across 6 modules: Financial, Player Intelligence, Marketing/CRM, Affiliates, Legal/Security, AI/Analytics
- Full schema with relations, seeded with realistic demo data

### Frontend (React + Next.js)
- Single-page app with sidebar navigation across 8 sections
- Dark casino theme with gold/amber primary, deep navy backgrounds
- All shadcn/ui components used (Card, Tabs, Table, Badge, Dialog, Sheet, etc.)
- Recharts for all data visualizations (AreaChart, BarChart, PieChart)
- Responsive design with mobile-friendly sidebar collapse

### API Routes (14 endpoints)
- /api/dashboard - KPI data aggregation
- /api/financial - Deposits, withdrawals, house earnings, ledger
- /api/escrow - Escrow account with settlement history
- /api/waterfall - 6-tier waterfall distribution engine
- /api/players - Player profiles with segments and notes
- /api/segments - Segment management with rules
- /api/promotions - Promotion builder with stats and codes
- /api/affiliates - Affiliate leaderboard and commissions
- /api/legal - Contract signatures and audit logs
- /api/variance - Variance alerts and budget targets
- /api/budget - Budget tracking
- /api/jackpots - Global jackpot pools
- /api/forecast - 13-week financial forecast
- /api/ai-tutor - AI Tutor chat endpoint

### Modules Built
1. **Dashboard** - KPI cards, cash flow chart, forecast, top games table, global jackpots, variance alerts
2. **Financial** - 5-tab view (Overview, Escrow, Waterfall, Ledger, Variance)
3. **Player Intelligence** - Searchable roster, detail drawer, timeline, responsible gaming
4. **Segmentation** - Segment cards with player counts, filter rules, create dialog
5. **Promotion Builder** - Active promotions, bonus codes, wagering config, cron schedules
6. **Affiliates** - Leaderboard, commission tiers, performance charts
7. **AI Tutor** - Chat interface with context selector and suggested questions
8. **Legal** - Contracts, audit log, DocuSign integration status

### Key Features
- Waterfall Protocol: 6-tier payment distribution (Operational# 15% → Affiliate 25% → Jackpot 10% → Marketing 20% → Reserve 15% → Profit 15%)
- Escrow Account: Centralized balance with settlement scheduling
- Variance Alerts: ±15% threshold monitoring with severity levels
- RBAC: Finance/Controller/Super Admin role switcher
- 13-Week Forecast: Rolling financial projection with seasonal factors
