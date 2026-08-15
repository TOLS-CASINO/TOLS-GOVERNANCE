import { create } from 'zustand'

export type Section = 
  | 'dashboard'
  | 'financial'
  | 'live-map'
  | 'live-players'
  | 'players'
  | 'segments'
  | 'promotions'
  | 'affiliates'
  | 'wallets'
  | 'payments'
  | 'ai-tutor'
  | 'legal'

export type UserRole = 'finance' | 'controller' | 'super_admin'

interface AppState {
  activeSection: Section
  setActiveSection: (section: Section) => void
  activeRole: UserRole
  setActiveRole: (role: UserRole) => void
  sidebarCollapsed: boolean
  toggleSidebar: () => void
}

export const useAppStore = create<AppState>((set) => ({
  activeSection: 'dashboard',
  setActiveSection: (section) => set({ activeSection: section }),
  activeRole: 'finance',
  setActiveRole: (role) => set({ activeRole: role }),
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}))
