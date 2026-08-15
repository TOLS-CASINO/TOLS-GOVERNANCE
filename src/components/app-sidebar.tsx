'use client'

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
  Shield,
  TrendingUp,
  Zap,
  Bell,
  Server,
} from 'lucide-react'
import { useAppStore, type Section } from '@/lib/store'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface NavItem {
  section: Section
  label: string
  icon: React.ElementType
  badge?: string
}

const coreItems: NavItem[] = [
  { section: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { section: 'financial', label: 'Financial', icon: DollarSign, badge: 'PRO' },
]

const liveItems: NavItem[] = [
  { section: 'live-map', label: 'Live Map', icon: Globe, badge: 'LIVE' },
  { section: 'live-players', label: 'Live Players', icon: Activity, badge: 'LIVE' },
  { section: 'players', label: 'Players', icon: Users },
]

const marketingItems: NavItem[] = [
  { section: 'segments', label: 'Segments', icon: PieChart },
  { section: 'promotions', label: 'Promotions', icon: Gift },
  { section: 'affiliates', label: 'Affiliates', icon: Link2 },
]

const financeItems: NavItem[] = [
  { section: 'wallets', label: 'Wallets', icon: Wallet },
  { section: 'payments', label: 'Payments', icon: CreditCard },
  { section: 'vendors', label: 'Vendors', icon: Server },
]

const systemItems: NavItem[] = [
  { section: 'notifications', label: 'Notifications', icon: Bell },
  { section: 'api-hub', label: 'API Hub', icon: Zap, badge: 'API' },
  { section: 'ai-tutor', label: 'AI Tutor', icon: Bot, badge: 'AI' },
  { section: 'legal', label: 'Legal', icon: Scale },
]

const navGroups: { label: string; items: NavItem[] }[] = [
  { label: 'Core', items: coreItems },
  { label: 'Live & Players', items: liveItems },
  { label: 'Marketing', items: marketingItems },
  { label: 'Wallet & Payments', items: financeItems },
  { label: 'System', items: systemItems },
]

export function AppSidebar() {
  const { activeSection, setActiveSection, activeRole, setActiveRole } = useAppStore()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm shrink-0">
            T
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold text-primary tracking-wider">TOLS</span>
            <span className="text-[10px] text-muted-foreground leading-none">Casino Platform</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.section}>
                    <SidebarMenuButton
                      isActive={activeSection === item.section}
                      onClick={() => setActiveSection(item.section)}
                      tooltip={item.label}
                      className="gap-3"
                    >
                      <item.icon className="size-4 shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <Badge
                          variant="secondary"
                          className={`h-4 px-1 text-[9px] font-bold group-data-[collapsible=icon]:hidden ${
                            item.badge === 'LIVE' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : ''
                          }`}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        <div className="flex flex-col gap-3 p-2 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:p-0">
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
            <Shield className="size-4 text-muted-foreground" />
            <Label className="text-xs text-muted-foreground">Role</Label>
          </div>
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
            <Switch
              id="role-switch"
              checked={activeRole === 'controller'}
              onCheckedChange={(checked) => setActiveRole(checked ? 'controller' : 'finance')}
            />
            <Label htmlFor="role-switch" className="text-xs font-medium">
              {activeRole === 'controller' ? (
                <span className="flex items-center gap-1">
                  <TrendingUp className="size-3 text-emerald-400" />
                  Controller
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <DollarSign className="size-3 text-primary" />
                  Finance
                </span>
              )}
            </Label>
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <Badge variant="outline" className="text-[9px] border-primary/30 text-primary">
              {activeRole === 'super_admin' ? 'SUPER ADMIN' : activeRole.toUpperCase()}
            </Badge>
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
