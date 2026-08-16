'use client'

import { useState } from 'react'
import {
  Settings,
  Palette,
  Globe2,
  Bell,
  Shield,
  Monitor,
  Clock,
  Database,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAppStore } from '@/lib/store'

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { activeRole, setActiveRole } = useAppStore()

  // General
  const [theme, setTheme] = useState('system')
  const [language, setLanguage] = useState('en')
  const [timezone, setTimezone] = useState('UTC')
  const [dateFormat, setDateFormat] = useState('YYYY-MM-DD')

  // Platform
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState('15')
  const [compactMode, setCompactMode] = useState(false)
  const [showDecimals, setShowDecimals] = useState(true)
  const [defaultCurrency, setDefaultCurrency] = useState('USD')

  // Notifications
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [pushNotifs, setPushNotifs] = useState(false)
  const [soundNotifs, setSoundNotifs] = useState(false)
  const [criticalOnly, setCriticalOnly] = useState(false)
  const [varianceAlerts, setVarianceAlerts] = useState(true)

  // Security
  const [twoFactor, setTwoFactor] = useState(true)
  const [sessionTimeout, setSessionTimeout] = useState('30')
  const [ipWhitelist, setIpWhitelist] = useState(false)
  const [auditLog, setAuditLog] = useState(true)

  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Settings className="size-5 text-primary" />
            Platform Settings
          </DialogTitle>
          <DialogDescription>
            Configure platform appearance, behavior, and preferences
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <div className="px-6 border-b border-border">
            <TabsList className="grid grid-cols-4 w-full h-9">
              <TabsTrigger value="general" className="text-xs gap-1">
                <Palette className="size-3.5" />
                <span className="hidden sm:inline">General</span>
              </TabsTrigger>
              <TabsTrigger value="platform" className="text-xs gap-1">
                <Monitor className="size-3.5" />
                <span className="hidden sm:inline">Platform</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="text-xs gap-1">
                <Bell className="size-3.5" />
                <span className="hidden sm:inline">Alerts</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="text-xs gap-1">
                <Shield className="size-3.5" />
                <span className="hidden sm:inline">Security</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[55vh]">
            {/* ─── General ─── */}
            <TabsContent value="general" className="px-6 py-4 space-y-5">
              {/* Theme */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Palette className="size-4 text-muted-foreground" />
                  <h4 className="text-sm font-semibold">Appearance</h4>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'light', label: 'Light', icon: Sun },
                    { value: 'dark', label: 'Dark', icon: Moon },
                    { value: 'system', label: 'System', icon: Laptop },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-colors ${
                        theme === opt.value
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border hover:border-muted-foreground/30'
                      }`}
                      onClick={() => setTheme(opt.value)}
                    >
                      <opt.icon className="size-5" />
                      <span className="text-xs font-medium">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Language & Region */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Globe2 className="size-4 text-muted-foreground" />
                  <h4 className="text-sm font-semibold">Language & Region</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="it">Italiano</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="pt">Português</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Timezone</Label>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="Europe/Rome">Europe/Rome</SelectItem>
                        <SelectItem value="Europe/Berlin">Europe/Berlin</SelectItem>
                        <SelectItem value="Europe/London">Europe/London</SelectItem>
                        <SelectItem value="America/New_York">America/New_York</SelectItem>
                        <SelectItem value="America/Los_Angeles">America/Los_Angeles</SelectItem>
                        <SelectItem value="Asia/Dubai">Asia/Dubai</SelectItem>
                        <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Date Format</Label>
                    <Select value={dateFormat} onValueChange={setDateFormat}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD.MM.YYYY">DD.MM.YYYY</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Default Currency</Label>
                    <Select value={defaultCurrency} onValueChange={setDefaultCurrency}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="BTC">BTC (₿)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Role */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="size-4 text-muted-foreground" />
                  <h4 className="text-sm font-semibold">Active Role</h4>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'finance', label: 'Finance', color: 'text-primary' },
                    { value: 'controller', label: 'Controller', color: 'text-emerald-400' },
                    { value: 'super_admin', label: 'Super Admin', color: 'text-amber-400' },
                  ].map((role) => (
                    <button
                      key={role.value}
                      className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border transition-colors text-xs ${
                        activeRole === role.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-muted-foreground/30'
                      }`}
                      onClick={() => setActiveRole(role.value as any)}
                    >
                      <span className={`font-semibold ${role.color}`}>{role.label}</span>
                      {activeRole === role.value && (
                        <Badge variant="secondary" className="text-[8px] h-3 px-1">Active</Badge>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* ─── Platform ─── */}
            <TabsContent value="platform" className="px-6 py-4 space-y-5">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <RefreshCw className="size-4 text-muted-foreground" />
                  <h4 className="text-sm font-semibold">Auto-Refresh</h4>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-medium">Enable Auto-Refresh</Label>
                    <p className="text-[10px] text-muted-foreground">Automatically refresh live data</p>
                  </div>
                  <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
                </div>
                {autoRefresh && (
                  <div className="space-y-1.5">
                    <Label className="text-xs">Refresh Interval</Label>
                    <Select value={refreshInterval} onValueChange={setRefreshInterval}>
                      <SelectTrigger className="h-9 text-xs w-full sm:w-[200px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">Every 5 seconds</SelectItem>
                        <SelectItem value="15">Every 15 seconds</SelectItem>
                        <SelectItem value="30">Every 30 seconds</SelectItem>
                        <SelectItem value="60">Every 60 seconds</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Monitor className="size-4 text-muted-foreground" />
                  <h4 className="text-sm font-semibold">Display</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="space-y-0.5">
                      <Label className="text-xs font-medium">Compact Mode</Label>
                      <p className="text-[10px] text-muted-foreground">Reduce padding and spacing</p>
                    </div>
                    <Switch checked={compactMode} onCheckedChange={setCompactMode} />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="space-y-0.5">
                      <Label className="text-xs font-medium">Show Decimals</Label>
                      <p className="text-[10px] text-muted-foreground">Display full decimal precision in amounts</p>
                    </div>
                    <Switch checked={showDecimals} onCheckedChange={setShowDecimals} />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Database className="size-4 text-muted-foreground" />
                  <h4 className="text-sm font-semibold">Data</h4>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Rows per page (tables)</Label>
                  <Select defaultValue="25">
                    <SelectTrigger className="h-9 text-xs w-full sm:w-[200px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 rows</SelectItem>
                      <SelectItem value="25">25 rows</SelectItem>
                      <SelectItem value="50">50 rows</SelectItem>
                      <SelectItem value="100">100 rows</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* ─── Notifications ─── */}
            <TabsContent value="notifications" className="px-6 py-4 space-y-5">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Bell className="size-4 text-muted-foreground" />
                  <h4 className="text-sm font-semibold">Notification Channels</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="space-y-0.5">
                      <Label className="text-xs font-medium">Email Notifications</Label>
                      <p className="text-[10px] text-muted-foreground">Receive alerts via email</p>
                    </div>
                    <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="space-y-0.5">
                      <Label className="text-xs font-medium">Push Notifications</Label>
                      <p className="text-[10px] text-muted-foreground">Browser push notifications</p>
                    </div>
                    <Switch checked={pushNotifs} onCheckedChange={setPushNotifs} />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="space-y-0.5">
                      <Label className="text-xs font-medium">Sound Alerts</Label>
                      <p className="text-[10px] text-muted-foreground">Play sound on critical events</p>
                    </div>
                    <Switch checked={soundNotifs} onCheckedChange={setSoundNotifs} />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="size-4 text-muted-foreground" />
                  <h4 className="text-sm font-semibold">Alert Filtering</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="space-y-0.5">
                      <Label className="text-xs font-medium">Critical Only</Label>
                      <p className="text-[10px] text-muted-foreground">Only show critical and urgent alerts</p>
                    </div>
                    <Switch checked={criticalOnly} onCheckedChange={setCriticalOnly} />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="space-y-0.5">
                      <Label className="text-xs font-medium">Variance Alerts</Label>
                      <p className="text-[10px] text-muted-foreground">Alert on RTP/variance anomalies</p>
                    </div>
                    <Switch checked={varianceAlerts} onCheckedChange={setVarianceAlerts} />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ─── Security ─── */}
            <TabsContent value="security" className="px-6 py-4 space-y-5">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="size-4 text-muted-foreground" />
                  <h4 className="text-sm font-semibold">Authentication</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="space-y-0.5">
                      <Label className="text-xs font-medium">Two-Factor Authentication</Label>
                      <p className="text-[10px] text-muted-foreground">Require 2FA for login</p>
                    </div>
                    <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="space-y-0.5">
                      <Label className="text-xs font-medium">IP Whitelist</Label>
                      <p className="text-[10px] text-muted-foreground">Only allow access from whitelisted IPs</p>
                    </div>
                    <Switch checked={ipWhitelist} onCheckedChange={setIpWhitelist} />
                  </div>
                  {ipWhitelist && (
                    <div className="space-y-1.5">
                      <Label className="text-xs">Whitelisted IPs (comma separated)</Label>
                      <Input placeholder="e.g., 192.168.1.0/24, 10.0.0.1" className="h-9 text-xs" />
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-muted-foreground" />
                  <h4 className="text-sm font-semibold">Session</h4>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Session Timeout</Label>
                  <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                    <SelectTrigger className="h-9 text-xs w-full sm:w-[200px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                      <SelectItem value="480">8 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Database className="size-4 text-muted-foreground" />
                  <h4 className="text-sm font-semibold">Audit</h4>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-medium">Audit Logging</Label>
                    <p className="text-[10px] text-muted-foreground">Log all operator actions for compliance</p>
                  </div>
                  <Switch checked={auditLog} onCheckedChange={setAuditLog} />
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="px-6 pb-6 pt-2">
          <div className="flex items-center gap-2 w-full">
            {saved && (
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <CheckCircle2 className="size-3.5" /> Settings saved
              </span>
            )}
            <div className="flex-1" />
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button size="sm" className="h-8 text-xs gap-1.5" onClick={handleSave}>
              <CheckCircle2 className="size-3.5" /> Save Settings
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
