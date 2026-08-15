'use client'

import { useAppStore, type Section } from '@/lib/store'
import { AppSidebar } from '@/components/app-sidebar'
import { DashboardView } from '@/components/dashboard-view'
import { FinancialView } from '@/components/financial-view'
import { PlayersView } from '@/components/players-view'
import { SegmentsView } from '@/components/segments-view'
import { PromotionsView } from '@/components/promotions-view'
import { AffiliatesView } from '@/components/affiliates-view'
import { AiTutorView } from '@/components/ai-tutor-view'
import { LegalView } from '@/components/legal-view'
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
  Users,
  PieChart,
  Gift,
  Link2,
  Bot,
  Scale,
  Bell,
  Settings,
} from 'lucide-react'

const sectionMeta: Record<Section, { title: string; description: string; icon: React.ElementType }> = {
  dashboard: { title: 'Dashboard', description: 'Platform overview and KPIs', icon: LayoutDashboard },
  financial: { title: 'Financial', description: 'Revenue, escrow, waterfall & ledger', icon: DollarSign },
  players: { title: 'Player Intelligence', description: 'Search, analyze & manage players', icon: Users },
  segments: { title: 'Segments', description: 'Player segmentation & rules', icon: PieChart },
  promotions: { title: 'Promotion Builder', description: 'Bonuses, codes & campaigns', icon: Gift },
  affiliates: { title: 'Affiliates', description: 'Partner management & commissions', icon: Link2 },
  'ai-tutor': { title: 'AI Tutor', description: 'Intelligent assistant for operators', icon: Bot },
  legal: { title: 'Legal', description: 'Contracts, audit & compliance', icon: Scale },
}

function SectionContent({ section }: { section: Section }) {
  switch (section) {
    case 'dashboard': return <DashboardView />
    case 'financial': return <FinancialView />
    case 'players': return <PlayersView />
    case 'segments': return <SegmentsView />
    case 'promotions': return <PromotionsView />
    case 'affiliates': return <AffiliatesView />
    case 'ai-tutor': return <AiTutorView />
    case 'legal': return <LegalView />
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
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Badge variant="outline" className="text-[9px] border-primary/30 text-primary h-5">
              {activeRole === 'super_admin' ? 'SUPER ADMIN' : activeRole.toUpperCase()}
            </Badge>
            <button className="relative p-1.5 rounded-md hover:bg-muted transition-colors">
              <Bell className="size-4 text-muted-foreground" />
              <span className="absolute top-0.5 right-0.5 size-1.5 rounded-full bg-destructive" />
            </button>
            <button className="p-1.5 rounded-md hover:bg-muted transition-colors">
              <Settings className="size-4 text-muted-foreground" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <SectionContent section={activeSection} />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
