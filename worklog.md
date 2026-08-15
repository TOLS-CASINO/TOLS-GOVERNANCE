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

---

## Task 3-a: Live World Map Component

### Files Created/Modified
- **NEW** `src/types/live-map.ts` - LiveMapData, ActiveSession, ServerNode, LiveEvent, LiveMapStats type definitions
- **MOD** `src/types/index.ts` - Added live-map type export
- **MOD** `src/services/api.ts` - Added `liveMap.get()` endpoint
- **NEW** `src/app/api/live-map/route.ts` - API route with 18 active sessions, 9 server nodes, 12 live events, stats
- **NEW** `src/components/live-map-view.tsx` - Full live world map component

### Component Features
1. **SVG World Map** - Equirectangular projection with simplified continent outlines (14 landmasses), dark navy background (#0a0e1a), gold/amber borders (#d4a017), radial gradient background, latitude/longitude grid lines
2. **Animated Player Dots** - 18 active sessions as pulsing dots with color coding:
   - Green (#10b981) = Active players
   - Gold (#d4a017) = Big wins (winAmount > 2x wager)
   - Red (#ef4444) = High-value players (> $5,000 wagered)
   - Blue (#3b82f6) = New sessions (< 5 min)
   - SVG pulse animations + glow filters + bright white cores
3. **Server Node Markers** - 9 server nodes as diamond shapes with:
   - Status colors (green=online, yellow=degraded, red=offline)
   - CPU load arc indicator around diamond
   - Pulse ring animation
   - Hover tooltip with CPU, memory, latency, uptime, player count
4. **Live Event Burst Effects** - Expanding ring animations for recent events (< 60s old)
5. **Live Event Ticker** - Scrolling bottom ticker with emoji-prefixed events (🎰🏆💰🆕), auto-scrolling with fade edges
6. **Stats Overlay Cards** - Top-left overlay with animated counters:
   - Total Online Players (animated counter with cubic easing)
   - Active Regions count
   - Peak Concurrent (115% of current)
   - Avg Session Duration
7. **Region Legend** - Top-right color-coded legend sorted by player count
8. **Player Status Legend** - Bottom-left dot color legend
9. **Device Stats** - Bottom-right device breakdown (desktop/mobile/tablet) with progress bars
10. **Interactive Tooltips** - Mouse-over detection on SVG for both server nodes and player sessions
11. **Refresh Button** - With spin animation during refetch
12. **Loading Skeleton** - Shown during initial data fetch
13. **Error State** - With retry button

### API Route Data
- 18 active sessions across 13 countries (GB, CA, DE, AU, JP, US, BR, ZA, IN, NZ, FR, SE, NO, MX, FI, KR, ES, IT)
- 9 server nodes (EU-West, EU-Central, US-East, US-West[degraded], APAC-1, APAC-2, SA-1, AF-1, OCE-1)
- 12 live events (jackpot hits, big wins, deposits, new players)
- Stats: 2,041 total online, 6 regions, 5 games, 3 device types

---

## Task 3-d: Payment Systems View Component

### Files Created/Modified
- **NEW** `src/app/api/payments/route.ts` - API route with 10 deposits, 8 withdrawals, 6 providers, stats
- **NEW** `src/components/payments-view.tsx` - Full payment systems component (4-tab layout)
- **MOD** `src/services/api.ts` - Added `payments.get()` endpoint
- **MOD** `src/lib/store.ts` - Added 'payments' to Section type
- **MOD** `src/components/app-sidebar.tsx` - Added Payments nav item with CreditCard icon
- **MOD** `src/app/page.tsx` - Added PaymentsView import and routing

### Component Features (4-tab layout)

**Tab 1: Overview**
- 8 KPI cards: Total Deposits, Total Withdrawals, Pending Deposits (yellow), Pending Withdrawals (orange), Approval Queue (red), Total Fees, Success Rate %, Avg Processing Time
- Deposit vs Withdrawal trend chart (Recharts AreaChart with green/blue areas)
- Payment method distribution (PieChart with donut style, 4 methods: card, crypto, bank_transfer, e_wallet)
- Provider volume chart (BarChart with amber bars, 6 providers)

**Tab 2: Deposits**
- Full table with columns: Time, Player, Amount, Currency, Method, Provider, Fee, Net, Status, TX Hash, Action
- Status badges: pending (yellow pulse), processing (blue pulse), confirmed (green), failed (red), expired (gray)
- Method icons: card=💳, crypto=₿, bank_transfer=🏦, e_wallet=📱
- Provider icons: Stripe=💳, Coinbase=₿, MoonPay=🌙, Neteller=🟢, Skrill=💜, PayPal=🅿️
- 5 filter dropdowns: Status, Method, Provider, Currency + search input
- Click row to open detail Dialog with all deposit fields
- "Confirm" action button for pending deposits (in table + dialog)

**Tab 3: Withdrawals**
- Full table with columns: Time, Player, Amount, Currency, Method, Fee, Net, Status, Approved By, TX Hash, Actions
- Status badges: pending (yellow), under_review (orange pulse), approved (blue), processing (blue pulse), completed (green), rejected (red), cancelled (gray)
- Approval workflow buttons: "Approve" + "Reject" for pending/under_review items
- Rejection reason display as red badge in table for rejected withdrawals
- 3 filter dropdowns: Status, Method + search input
- Click row to open detail Dialog with all fields + rejection reason callout + approve/reject buttons

**Tab 4: Providers**
- Responsive grid of 6 provider cards (1/2/3 columns)
- Each card shows: Provider name + type badge (fiat=amber, crypto=purple, hybrid=cyan), Active/Inactive status + green dot indicator, Deposit limits (min-max), Withdrawal limits (min-max), Fees (% + fixed) in amber, Processing time, Supported currencies as badges
- Inactive providers rendered with 60% opacity

### API Route Data
- 10 deposits across 4 methods, 5 providers, 5 currencies, 5 statuses
- 8 withdrawals across 4 methods, 4 providers, 4 currencies, 7 statuses
- 6 providers: Stripe (fiat), Coinbase (crypto), MoonPay (crypto), Neteller (fiat), Skrill (fiat), PayPal (hybrid/inactive)
- Stats: $8,251.30 deposits, $17,975.20 withdrawals, 2 pending deposits, 1 pending withdrawal, 2 approval queue, $106.27 fees, 85.7% success rate, 12.4 min avg processing

---

## Task 3-b: Live Players View Component

### Files Created/Modified
- **NEW** `src/app/api/live-players/route.ts` - API route with 45 active sessions, 60 live events, computed stats
- **MOD** `src/services/api.ts` - Added `livePlayers.get()` endpoint
- **NEW** `src/components/live-players-view.tsx` - Full Live Players view component with 4-tab layout

### Component Features

#### Tab 1: Active Sessions
- Full data table with 9 columns: Player, Game, Country, Device, Wager, Win, Spins, Duration, Status
- Status badges: active=green pulse dot + green badge, idle=yellow badge, ended=gray secondary badge
- Row click to expand session details (player ID, city, browser, OS, entry point, start time, last activity, net result)
- 5-column filter bar: search player, game select, country select, device select, status select
- Auto-refresh indicator (spinning RefreshCw icon with "Live" label)

#### Tab 2: Activity Feed
- ScrollArea with 60 events, auto-scroll to bottom
- Event types with distinct colors and icons:
  - player_login: blue, LogIn icon
  - game_start: green, Play icon
  - big_win: gold, Trophy icon with pulse animation
  - jackpot_win: gold pulse, Crown icon with pulse
  - deposit: emerald, ArrowDown icon
  - withdrawal: orange, ArrowUp icon
  - bonus_claim: purple, Gift icon
  - level_up: cyan, ChevronUp icon
- "NEW" badge with pulse animation for events < 30 seconds old
- Country flag emoji on each event
- Relative timestamps (e.g., "5s ago", "3m ago")

#### Tab 3: By Region
- Grid of top 10 country cards with flag emoji, country code, player count, total wagered
- Color intensity based on player count (amber background with proportional opacity)
- Progress bar showing relative player count
- Trophy icon on #1 country
- Sort by player count descending

#### Tab 4: Session Analytics
- 4 KPI cards: Avg Duration, Peak Concurrent, Total Wagered Live, Total Won Live
- Device Distribution PieChart (donut style) with inner/outer radius, desktop=amber, mobile=emerald, tablet=indigo
- Players by Game horizontal BarChart (top 8 games)
- Session Duration Histogram BarChart (6 buckets: 0-5m, 5-15m, 15-30m, 30-60m, 60-120m, 120m+)
- Percentage legend below pie chart

### Integration
- Added 'live-players' to Section type in store
- Added LivePlayersView to page.tsx SectionContent switch
- Added sidebar nav item with Activity icon and "LIVE" badge
- Auto-refresh every 15 seconds with toggle on/off
- Uses `useApi(() => api.livePlayers.get())` pattern

---

## Task 3-c: Wallet Ecosystem View Component

### Files Created/Modified
- **NEW** `src/types/wallet.ts` - Wallet, WalletTransaction, CurrencyRate, WalletTotals, PaymentMethod, WalletsData type definitions
- **MOD** `src/types/index.ts` - Added wallet type export
- **NEW** `src/app/api/wallets/route.ts` - API route with 12 wallets, 18 transactions, 15 currency rates, 12 payment methods, computed totals
- **MOD** `src/services/api.ts` - Added `wallets.get()` endpoint
- **NEW** `src/components/wallets-view.tsx` - Full Wallet Ecosystem component (4-tab layout)
- **MOD** `src/lib/store.ts` - Added 'wallets' to Section type
- **MOD** `src/components/app-sidebar.tsx` - Added Wallets nav item with Wallet icon
- **MOD** `src/app/page.tsx` - Added WalletsView import and routing

### Component Features (4-tab layout)

**Tab 1: Overview**
- 4 KPI cards: Total Balance (amber), Available (emerald), Locked (blue), Bonus Funds (purple) - all in USD equivalents
- Currency breakdown cards: each currency with emoji icon, total balance, wallet count, and % of total with progress bar
- Crypto currency icons: 💵 USD, 💶 EUR, 💷 GBP, ₿ BTC, ⟠ ETH, ₮ USDT, ◎ USDC, Ł LTC
- Pie chart (donut) showing distribution by currency with emoji labels and percentages
- Bar chart showing wallet balances by currency with amber bars

**Tab 2: All Wallets**
- Full table with columns: Player, Currency, Balance, Available, Locked, Bonus, Status, Last Activity
- Primary wallet gold star indicator (⭐)
- Status badges: active=emerald, frozen=blue, closed=gray
- 4 filter controls: Search player, Currency select, Status select, Sort select (Balance ↓/↑)
- Wallet count badge
- Proper currency formatting: fiat with $ symbol and 2 decimals, crypto with 8 decimals

**Tab 3: Transactions**
- Full transaction history table with columns: Time, Player, Type, Amount, Currency, Before → After, Game, Status, Reference
- Type badges with distinct colors:
  - deposit: emerald, withdrawal: orange, bet: red, win: green
  - bonus: purple, cashback: cyan, transfer: blue, fee: gray, exchange: yellow
- Amount formatting: positive=emerald, negative=red with +/- prefix
- Balance before/after with arrow indicator in amber
- Transaction status badges: completed=emerald, pending=yellow
- 2 filter controls: Type select, Currency select
- Transaction count badge

**Tab 4: Payment Methods**
- Responsive grid of payment method cards (1/2/3 columns)
- Type icons: Visa=💳, Mastercard=💳, Bank=🏦, Crypto=₿, E-Wallet=📱, Prepaid=🎫
- Provider badges with distinct colors per provider
- Default badge (amber) and Active/Inactive badge (emerald/red)
- Toggle button to activate/deactivate methods
- Inactive methods rendered at 60% opacity
- Currency Exchange Rates table (compact, scrollable)
  - 15 rates with emoji-prefixed currencies
  - Smart decimal formatting: 8 for very small rates (BTC), 6 for sub-1 rates, 2-4 for normal rates

### API Route Data
- 12 wallets across 8 currencies (USD, EUR, GBP, BTC, ETH, USDT, USDC, LTC) for 8 players
- 18 transactions across 9 types (deposit, bet, win, withdrawal, bonus, cashback, transfer, fee, exchange)
- 15 currency exchange rates (including BTC→USD at 103,092.78)
- 12 payment methods across 6 types (Visa, Mastercard, Bank, Crypto, E-Wallet, Prepaid) and 10 providers
- Computed totals with USD-equivalent values and per-currency breakdown

---

## Task 5: Seed Script for New Database Models

### Files Created
- **NEW** `scripts/seed-new.ts` - Comprehensive seed script for 11 new database models

### Script Features
1. Uses `PrismaClient` directly (not `@/lib/db`) for script compatibility
2. Clears existing data first with `deleteMany()` in correct dependency order (child → parent)
3. Finds existing 20 players from database before seeding
4. Progress logging with emoji indicators throughout
5. Summary table with final counts at completion

### Data Seeded

**1. Wallet (49 wallets)**
- 20 primary USD wallets with balance $500-$50,000
- 10 EUR secondary wallets with proportional balances (0.92x rate)
- 10 GBP secondary wallets with proportional balances (0.79x rate)
- 4 BTC wallets (0.01-2.5 BTC) for every 3rd player where i%6==0
- 3 ETH wallets (0.5-10 ETH) for every 3rd player where i%6!=0
- 2 USDT wallets for every 5th player
- All wallets: balance = availableBalance + lockedBalance + bonusBalance
- lastDepositAt and lastWithdrawAt within last 7 days

**2. WalletTransaction (360 transactions)**
- 5-10 transactions per wallet across all 6 types: deposit, withdrawal, bet, win, bonus, cashback
- Correct balanceBefore → balanceAfter calculations
- gameId/gameName set for bet and win types using 12 realistic game names
- Crypto-appropriate amounts (8 decimals BTC, 4 decimals ETH, 2 decimals fiat)
- Unique transaction references

**3. PaymentMethod (45 methods)**
- Every player: Visa or Mastercard (default) via Stripe
- Every 3rd player: crypto wallet (BTC/ETH via Coinbase) or bank transfer or e-wallet (Skrill/Neteller)
- Every 4th player: PayPal e-wallet as third method
- Proper labels: "Visa ****4242", "BTC Wallet", "Skrill (user@email.com)"

**4. PaymentProvider (6 providers)**
- Stripe: fiat, USD/EUR/GBP, 2.9%+$0.30, instant
- Coinbase Commerce: crypto, BTC/ETH/USDT/USDC, 1%, instant
- MoonPay: hybrid, all currencies, 3.5%+$5, 1-3 days
- Neteller: fiat, USD/EUR/GBP, 2.5%, instant
- Skrill: fiat, USD/EUR/GBP, 1.9%, instant
- PayPal: fiat, USD/EUR/GBP, 2.9%+$0.30, 1-3 days

**5. DepositRequest (15 deposits)**
- Status distribution: pending(3), processing(2), confirmed(8), failed(1), expired(1)
- Various methods (card, crypto, bank_transfer, e_wallet) and providers
- Correct fee calculation: feeAmount = amount × feePercent/100 + feeFixed
- netAmount = amount - feeAmount (verified with query)
- Blockchain txHash for crypto deposits
- confirmedAt and expiresAt set appropriately per status

**6. WithdrawalRequest (12 withdrawals)**
- Status distribution: pending(2), under_review(2), approved(1), processing(1), completed(5), rejected(1)
- approvedBy set for approved/processing/completed/rejected items
- Rejection reason: "Failed KYC verification - document expired"
- processedAt for completed withdrawals
- txHash for completed withdrawals

**7. CurrencyRate (15 rates)**
- USD→EUR (0.9215), USD→GBP (0.7923), USD→BTC (0.00000971), USD→ETH (0.000352)
- USD→USDT (1.0001), USD→USDC (1.0), USD→LTC (0.01087)
- EUR→USD (1.0852), EUR→GBP (0.8601), GBP→USD (1.2622)
- BTC→USD (103,092.78), ETH→USD (2,841.35), USDT→USD (0.9999)
- USDC→USD (1.0), LTC→USD (92.04)

**8. PlayerSession (30 sessions)**
- 20 active, 5 idle, 5 ended
- 10 countries (US, UK, DE, CA, AU, JP, BR, FR, IT, ES) with realistic lat/lng
- Device-appropriate OS (iOS/Android for mobile, Windows/macOS/Linux for desktop)
- Calculated wagerAmount, winAmount, spinsPlayed based on session duration
- Proper startedAt, lastActivityAt, endedAt timestamps

**9. GeoLocation (20 locations)**
- 1 per player across 10 countries
- Realistic city, region, timezone, ISP data
- 2 VPN flags (players 3, 14), 1 Proxy flag (player 7)
- Proper lat/lng with small random variance

**10. LiveEvent (40 events)**
- All 8 event types: player_login, game_start, big_win, jackpot_win, deposit, withdrawal, bonus_claim, level_up
- Amounts appropriate per type (jackpot: $50K-$500K, big_win: $500-$25K, deposit/withdrawal: $50-$5K)
- All timestamps within last hour (0-3600 seconds ago)
- Country, city, coordinates, playerName, gameName populated

**11. ServerNode (6 nodes)**
- EU-West (Ireland): online, ~3000 players, ~56% CPU
- US-East (Virginia): online, ~2000 players, ~59% CPU
- US-West (Oregon): online, ~1600 players, ~39% CPU
- Asia-Pacific (Singapore): online, ~2700 players, ~62% CPU
- South-America (São Paulo): degraded, ~1000 players, ~74% CPU
- Africa (Cape Town): maintenance, 0 players, 0% CPU

### Verification
All data verified with queries - counts, distributions, calculations, and relationships all correct.

---

## Task 6: Live Service WebSocket Mini-Service

### Files Created
- **NEW** `mini-services/live-service/package.json` - Independent bun project with socket.io dependency
- **NEW** `mini-services/live-service/index.ts` - Full WebSocket server with simulated live data
- **NEW** `mini-services/live-service/start.sh` - Detached launcher script for background persistence

### Service Architecture

**WebSocket Server** (socket.io on port 3003, bound to 0.0.0.0):
- CORS enabled for all origins
- Path: `/` (for Caddy gateway compatibility via XTransformPort=3003)
- pingTimeout: 60s, pingInterval: 25s

### Event Types Emitted

| Event | Interval | Description |
|-------|----------|-------------|
| `live-event` | 3s | New player event (login, game_start, big_win, deposit, jackpot_win, bonus_claim, level_up, withdrawal) |
| `session-update` | 5s | Player session status change (active/idle/ended) with updated wager/win/spins |
| `player-dot` | 2s | Player position update on map (lat/lng + metadata) |
| `stats-update` | 10s | Aggregate stats (totalOnline, byRegion, byGame, byDevice, totalWagered, totalWon, avgSessionDurationMin, peakConcurrent, connectedClients) |
| `jackpot-update` | 30s | Jackpot amount change for 4 pools (megaMoolah, wowPot, divineFortune, hallOfGods) |

### Simulated Live Data

**50 Fake Players** - Generated from firstNames × lastNames pools with:
- Distributed across 15 countries with realistic city assignments
- VIP levels 1-5 (random)
- Country-specific coordinate jitter for map placement

**15 Countries with Coordinates:**
US, GB, DE, CA, AU, JP, BR, FR, IT, ES, NL, SE, NO, FI, DK
Each with lat/lng center + city list for realistic positioning

**8 Casino Games:**
Mega Moolah, Starburst, Book of Dead, Lightning Roulette, Blackjack VIP, Gates of Olympus, Sweet Bonanza, Wolf Gold

**8 Event Types:**
login, game_start, big_win, deposit, jackpot_win, bonus_claim, level_up, withdrawal
Each with type-appropriate amounts and metadata (e.g., multiplier for big_win, bonusType for bonus_claim, method for deposit/withdrawal)

### Connection Handling
- On connect: sends `initial-state` with current sessions + last 30 recent events + computed stats + jackpot state
- Logs all connections/disconnections with client count
- Tracks `connectedClients` in stats

### Session Management
- 25 initial active sessions seeded on startup
- Sessions randomly transition: active→idle (15%), idle→active (8%), any→ended (5%)
- Gameplay updates: spins increment, wager accumulates, random wins
- Auto-replenishment: if active sessions drop below 15, creates new login events from idle players
- Max 100 recent events stored (ring buffer)

### Jackpot Simulation
- 4 pools: Mega Moolah ($4.3M), WowPot ($2.1M), Divine Fortune ($891K), Hall of Gods ($1.6M)
- Incremental growth every 30 seconds with random amounts
- Amounts formatted to 2 decimal places

### Startup & Persistence
- Uses double-fork + setsid technique for background process persistence
- Bun --hot mode for auto-restart on file changes
- Graceful shutdown on SIGTERM/SIGINT
- Logs output to /tmp/live-service.log

### Verification
- Service confirmed running on 0.0.0.0:3003
- All 5 event types broadcasting correctly at specified intervals
- Initial state: 25 sessions, 20 recent events
- Stats updates showing online counts, region counts, and client connections

---
Task ID: 8
Agent: Main Agent
Task: Implement Live World Maps, Live Player Features, Wallet Ecosystem, and Payment Systems

Work Log:
- Updated Prisma schema with 11 new models: Wallet, WalletTransaction, PaymentMethod, PaymentProvider, DepositRequest, WithdrawalRequest, CurrencyRate, PlayerSession, GeoLocation, LiveEvent, ServerNode
- Added PlayerProfile relations for wallets, paymentMethods, depositRequests, withdrawalRequests, sessions
- Pushed schema to database successfully (42 total models now)
- Created 4 new view components:
  - live-map-view.tsx (650 lines) - SVG world map with animated player dots, server nodes, event ticker
  - live-players-view.tsx (737 lines) - 4-tab layout: Active Sessions, Activity Feed, By Region, Session Analytics
  - wallets-view.tsx (~800 lines) - 4-tab layout: Overview, All Wallets, Transactions, Payment Methods
  - payments-view.tsx (730 lines) - 4-tab layout: Overview, Deposits, Withdrawals, Providers
- Created 4 new API routes:
  - /api/live-map - Returns 18 active sessions, 9 server nodes, 30+ live events, stats
  - /api/live-players - Returns 45 active sessions, 60 live events, computed stats
  - /api/wallets - Returns 12 wallets, 18 transactions, 15 currency rates, 12 payment methods
  - /api/payments - Returns 10 deposits, 8 withdrawals, 6 providers, stats
- Created 4 new hooks: use-live-map, use-live-players, use-wallets, use-payments
- Created WebSocket hook: use-live-socket.ts with socket.io-client integration
- Created WebSocket mini-service at mini-services/live-service/ on port 3003
  - 5 event channels: live-event (3s), session-update (5s), player-dot (2s), stats-update (10s), jackpot-update (30s)
  - 50 simulated players across 15 countries
  - 8 casino games
  - 25 initial active sessions
- Seeded database with new data via scripts/seed-new.ts:
  - 49 wallets across 6 currencies
  - 360 wallet transactions
  - 45 payment methods
  - 6 payment providers
  - 15 deposit requests, 12 withdrawal requests
  - 15 currency exchange rates
  - 30 player sessions
  - 20 geo locations
  - 40 live events
  - 6 server nodes
- Updated store.ts with 12 sections (added live-map, live-players, wallets, payments)
- Reorganized sidebar with 5 navigation groups: Core, Live & Players, Marketing, Wallet & Payments, System
- Added LIVE badge styling (emerald) for Live Map and Live Players
- Updated page.tsx with all new section routing and metadata
- Updated api.ts service with 4 new endpoints
- Added types: live-map.ts, wallet.ts
- Footer updated to v2.0 with Live status indicator
- Lint passes clean

Stage Summary:
- All 4 new features fully implemented and browser-verified
- Live Map: SVG world map with 18 player dots, 9 server nodes, event ticker, 2,041 online
- Live Players: 38 online players, 4-tab view with sessions, feed, regions, analytics
- Wallets: Multi-currency ecosystem (USD 54.5%, EUR 14.2%, USDC 17.8%, GBP 7.5%, USDT 5.9%)
- Payments: Deposit/withdrawal management with 6 providers, method distribution (crypto 48%, bank 39%, card 6%, ewallet 8%)
- WebSocket service running on port 3003 with real-time event broadcasting
- Database now has 42 models across 8 modules
- Total: 12 sidebar navigation items organized in 5 groups
