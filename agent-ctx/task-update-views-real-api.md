# Task: Update All View Components to Use Real API Data

## Summary
Successfully updated all 7 view components to use real API data from the SQLite database via custom hooks, replacing the mock data generators.

## Changes Made

### 1. Dashboard View (`dashboard-view.tsx`)
- Replaced `generateMockData()` with `useDashboard()` and `useForecast()` hooks
- KPIs mapped from `dashboardData.kpis` (totalDeposits, netCashFlow, totalHouseEarnings, activePlayers)
- Cash flow chart generated from `recentDeposits` grouped by week, padded to 12 weeks
- Top games table from `houseEarnings` sorted by netEarning (top 5)
- Global jackpots from `jackpots` array
- Variance alerts from `varianceAlerts` array
- 13-week forecast from `forecastData.forecast`
- Added error handling with retry button

### 2. Financial View (`financial-view.tsx`)
- Replaced mock data with `useFinancial()`, `useEscrow()`, `useWaterfall()`, `useVariance()` hooks
- Overview tab: Summary cards from deposits/withdrawals/houseEarnings, deposit trend chart by month
- Escrow tab: Real escrow account and settlement data
- Waterfall tab: Real waterfall distribution steps from API
- Ledger tab: Real internal ledger entries with category filtering
- Variance tab: Real budget targets with budget vs actual comparison
- Added error handling with retry button

### 3. Players View (`players-view.tsx`)
- Replaced `generateMockPlayers()` with `usePlayers()` hook
- Real player profiles with segments, deposits, and notes from API
- VIP level mapping from string-based VIP levels to numeric 1-5
- Segment filter dynamically populated from API data
- Player detail drawer shows real deposits and notes
- Added error handling with retry button

### 4. Segments View (`segments-view.tsx`)
- Replaced `generateMockSegments()` with `useSegments()` hook
- Real segment data with playerCount, color, rules (JSON string), isDynamic
- Distribution pie chart from real data
- Create dialog preserved (would need API POST to persist)
- Added error handling with retry button

### 5. Promotions View (`promotions-view.tsx`)
- Replaced `getMockData()` with `usePromotions()` hook
- Real promotion data with stats, bonus codes, and segment info
- Claims/conversions/ROI calculated from promotion stats
- Bonus codes table from API data
- Performance chart from active promotions
- Added error handling with retry button

### 6. Affiliates View (`affiliates-view.tsx`)
- Replaced `getMockData()` with `useAffiliates()` hook
- Real affiliate data with performance and commission data
- Leaderboard sorted by earnings
- Commission tier breakdown calculated from affiliate tiers
- Performance by month chart from affiliate performance data
- Added error handling with retry button

### 7. Legal View (`legal-view.tsx`)
- Replaced `getMockData()` with `useLegal()` hook
- Real contract signatures and audit logs from API
- Audit category filter dynamically populated
- DocuSign status derived from contract statuses
- Contract status cards, table, and audit log all use real data
- Added error handling with retry button

## Verification
- ESLint: All files pass lint with no errors
- TypeScript: No type errors in any updated view components
- Dev server: Compiles and serves successfully
- API endpoints: All return real data from seeded SQLite database
  - Dashboard: 17 active players, $145K deposits, $73K house earnings
  - Players: 20 player profiles
  - Segments: 5 segments (Casual Players, Active Depositors, New Players, Churn Risk, VIP High Rollers)
  - Legal: 3 contracts, 20 audit log entries
