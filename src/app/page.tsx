'use client'

import { useAppStore, type Section } from '@/lib/store'
import { AppSidebar } from '@/components/app-sidebar'
import { DashboardView } from '@/components/dashboard-view'
import { FinancialView } from '@/components/financial-view'
import { LiveMapView } from '@/components/live-map-view'
import { LivePlayersView } from '@/components/live-players-view'
import { PlayersView } from '@/components/players-view'
import { SegmentsView } from '@/components/segments-view'
import { PromotionsView } from '@/components/promotions-view'
import { AffiliatesView } from '@/components/affiliates-view'
import { WalletsView } from '@/components/wallets-view'
import { PaymentsView } from '@/components/payments-view'
import { AiTutorView } from '@/components/ai-tutor-view'
import { ApiHubView } from '@/components/api-hub-view'
import { LegalView } from '@/components/legal-view'
import { NotificationsView } from '@/components/notifications-view'
import { VendorsView } from '@/components/vendors-view'
import { AuthView } from '@/components/auth-view'
import { BillingView } from '@/components/billing-view'
import { OnboardingView } from '@/components/onboarding-view'
import { BlockchainView } from '@/components/blockchain-view'
import { MLPipelineView } from '@/components/ml-pipeline-view'
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  LayoutDashboard,
  DollarSign,
  Globe,
  Activity,
  Users,
  PieChart,
  Gift,
  Link2,
  Wallet,
  CreditCard,
  Bot,
  Scale,
  Settings,
  Zap,
  Bell,
  Server,
  Shield,
  Receipt,
  Rocket,
  Brain,
} from 'lucide-react'
import { NotificationPanel } from '@/components/notification-panel'

const sectionMeta: Record<Section, { title: string; description: string; icon: React.ElementType }> = {
  dashboard: { title: 'Dashboard', description: 'Platform overview and KPIs', icon: LayoutDashboard },
  financial: { title: 'Financial', description: 'Revenue, escrow, waterfall & ledger', icon: DollarSign },
  'live-map': { title: 'Live Map', description: 'Real-time world map & player activity', icon: Globe },
  'live-players': { title: 'Live Players', description: 'Real-time player tracking & activity', icon: Activity },
  players: { title: 'Player Intelligence', description: 'Search, analyze & manage players', icon: Users },
  segments: { title: 'Segments', description: 'Player segmentation & rules', icon: PieChart },
  promotions: { title: 'Promotion Builder', description: 'Bonuses, codes & campaigns', icon: Gift },
  affiliates: { title: 'Affiliates', description: 'Partner management & commissions', icon: Link2 },
  wallets: { title: 'Wallets', description: 'Multi-currency wallets & transactions', icon: Wallet },
  payments: { title: 'Payments', description: 'Deposits, withdrawals & providers', icon: CreditCard },
  vendors: { title: 'Vendors', description: 'Game providers, callbacks & integrations', icon: Server },
  notifications: { title: 'Notifications', description: 'Notification center, preferences & channels', icon: Bell },
  'api-hub': { title: 'API Hub', description: 'Tokens, webhooks, integrations & MCP', icon: Zap },
  'ai-tutor': { title: 'AI Tutor', description: 'Intelligent assistant for operators', icon: Bot },
  legal: { title: 'Legal', description: 'Contracts, audit & compliance', icon: Scale },
  auth: { title: 'Auth & Security', description: 'Users, sessions, roles & permissions', icon: Shield },
  billing: { title: 'Billing', description: 'Plans, subscription & invoices', icon: Receipt },
  onboarding: { title: 'Onboarding', description: 'Setup wizard & initial configuration', icon: Rocket },
  blockchain: { title: 'Blockchain', description: 'Crypto wallets, transactions & smart contracts', icon: Shield },
  'ml-pipeline': { title: 'ML Pipeline', description: 'Models, predictions & training jobs', icon: Brain },
}

function SectionContent({ section }: { section: Section }) {
  switch (section) {
    case 'dashboard': return <DashboardView />
    case 'financial': return <FinancialView />
    case 'live-map': return <LiveMapView />
    case 'live-players': return <LivePlayersView />
    case 'players': return <PlayersView />
    case 'segments': return <SegmentsView />
    case 'promotions': return <PromotionsView />
    case 'affiliates': return <AffiliatesView />
    case 'wallets': return <WalletsView />
    case 'payments': return <PaymentsView />
    case 'vendors': return <VendorsView />
    case 'notifications': return <NotificationsView />
    case 'api-hub': return <ApiHubView />
    case 'ai-tutor': return <AiTutorView />
    case 'legal': return <LegalView />
    case 'auth': return <AuthView />
    case 'billing': return <BillingView />
    case 'onboarding': return <OnboardingView />
    case 'blockchain': return <BlockchainView />
    case 'ml-pipeline': return <MLPipelineView />
  }
}

export default function Home() {
  const { activeSection, activeRole } = useAppStore()
  const meta = sectionMeta[activeSection]
  const Icon = meta.icon

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 !h-4" />
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Icon className="size-4 text-primary shrink-0" />
            <div className="min-w-0">
              <h1 className="text-sm font-semibold truncate">{meta.title}</h1>
              <p className="text-[10px] text-muted-foreground truncate hidden sm:block">{meta.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Badge variant="outline" className="text-[9px] border-primary/30 text-primary h-5">
              {activeRole === 'super_admin' ? 'SUPER ADMIN' : activeRole.toUpperCase()}
            </Badge>
            <NotificationPanel />
            <button className="p-1.5 rounded-md hover:bg-muted transition-colors">
              <Settings className="size-4 text-muted-foreground" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <SectionContent section={activeSection} />
        </main>

        {/* Sticky Footer */}
        <footer className="mt-auto shrink-0 border-t border-border px-4 py-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="font-medium text-primary/80">TOLS Platform</span>
              <span className="hidden sm:inline">v2.0</span>
              <span className="hidden sm:inline">© 2025 TOLS Operations</span>
            </div>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground hidden sm:inline">DB</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground hidden sm:inline">API</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-muted-foreground hidden sm:inline">Live</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-primary" />
                <span className="text-muted-foreground hidden sm:inline">Escrow</span>
              </span>
            </div>
          </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  )
}
