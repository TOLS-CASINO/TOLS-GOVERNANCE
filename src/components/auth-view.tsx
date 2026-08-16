'use client'

import { useState, useMemo } from 'react'
import {
  Shield,
  Users,
  Key,
  Lock,
  Smartphone,
  Globe,
  Clock,
  Plus,
  Search,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { useApi } from '@/hooks/use-api'
import { api } from '@/services/api'

/* ─── Types ─── */

interface User {
  id: string
  name: string
  email: string
  role: string
  casino: string
  status: 'active' | 'inactive' | 'suspended'
  lastLogin: string
  avatar?: string
}

interface Session {
  id: string
  user: string
  ipAddress: string
  device: string
  browser: string
  started: string
  expires: string
  isActive: boolean
}

type PermissionAction = 'read' | 'write' | 'delete' | 'approve'

interface PermissionMatrix {
  [role: string]: {
    [resource: string]: PermissionAction[]
  }
}

interface PasswordPolicy {
  minLength: number
  requireUppercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
  expiryDays: number
}

interface SessionSettings {
  maxConcurrent: number
  sessionTimeout: number
  idleTimeout: number
}

interface TwoFactorSettings {
  enabled: boolean
  enforceForAdmins: boolean
  enforceForFinance: boolean
  method: 'totp' | 'sms' | 'email'
}

interface SecurityConfig {
  passwordPolicy: PasswordPolicy
  sessionSettings: SessionSettings
  twoFactor: TwoFactorSettings
  ipWhitelist: string[]
  maxLoginAttempts: number
  lockoutDuration: number
}

/* ─── Mock Data ─── */

const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Marcus Vex', email: 'marcus@tols.io', role: 'Admin', casino: 'All Casinos', status: 'active', lastLogin: '2025-01-15 09:32' },
  { id: 'u2', name: 'Elena Rossi', email: 'elena@tols.io', role: 'Finance Manager', casino: 'Royal Spin', status: 'active', lastLogin: '2025-01-15 08:17' },
  { id: 'u3', name: 'Dmitri Volkov', email: 'dmitri@tols.io', role: 'Controller', casino: 'Golden Reef', status: 'active', lastLogin: '2025-01-14 22:45' },
  { id: 'u4', name: 'Sarah Chen', email: 'sarah@tols.io', role: 'Marketing', casino: 'Luxe Bet', status: 'active', lastLogin: '2025-01-15 07:03' },
  { id: 'u5', name: 'James Okafor', email: 'james@tols.io', role: 'Support Agent', casino: 'Royal Spin', status: 'inactive', lastLogin: '2025-01-10 16:28' },
  { id: 'u6', name: 'Priya Sharma', email: 'priya@tols.io', role: 'Viewer', casino: 'All Casinos', status: 'suspended', lastLogin: '2025-01-08 11:55' },
]

const MOCK_SESSIONS: Session[] = [
  { id: 's1', user: 'Marcus Vex', ipAddress: '203.45.67.89', device: 'Desktop', browser: 'Chrome 121', started: '2025-01-15 09:32', expires: '2025-01-15 21:32', isActive: true },
  { id: 's2', user: 'Elena Rossi', ipAddress: '178.22.11.44', device: 'Laptop', browser: 'Firefox 122', started: '2025-01-15 08:17', expires: '2025-01-15 20:17', isActive: true },
  { id: 's3', user: 'Dmitri Volkov', ipAddress: '91.202.114.3', device: 'Desktop', browser: 'Edge 120', started: '2025-01-14 22:45', expires: '2025-01-15 10:45', isActive: true },
  { id: 's4', user: 'Sarah Chen', ipAddress: '58.163.72.201', device: 'Mobile', browser: 'Safari 17', started: '2025-01-15 07:03', expires: '2025-01-15 19:03', isActive: true },
]

const ROLES = ['Admin', 'Controller', 'Finance', 'Marketing', 'Support', 'Viewer']
const RESOURCES = ['Players', 'Financial', 'Wallets', 'Promotions', 'Settings', 'Vendors', 'API']

const DEFAULT_PERMISSIONS: PermissionMatrix = {
  Admin:     { Players: ['read','write','delete','approve'], Financial: ['read','write','delete','approve'], Wallets: ['read','write','delete','approve'], Promotions: ['read','write','delete','approve'], Settings: ['read','write','delete','approve'], Vendors: ['read','write','delete','approve'], API: ['read','write','delete','approve'] },
  Controller:{ Players: ['read','write','approve'], Financial: ['read','write','approve'], Wallets: ['read','write'], Promotions: ['read','approve'], Settings: ['read'], Vendors: ['read','approve'], API: ['read'] },
  Finance:   { Players: ['read'], Financial: ['read','write','approve'], Wallets: ['read','write'], Promotions: ['read'], Settings: ['read'], Vendors: ['read'], API: ['read'] },
  Marketing: { Players: ['read','write'], Financial: ['read'], Wallets: ['read'], Promotions: ['read','write','delete'], Settings: ['read'], Vendors: ['read'], API: ['read'] },
  Support:   { Players: ['read','write'], Financial: ['read'], Wallets: ['read'], Promotions: ['read'], Settings: ['read'], Vendors: ['read'], API: [] },
  Viewer:    { Players: ['read'], Financial: ['read'], Wallets: ['read'], Promotions: ['read'], Settings: ['read'], Vendors: ['read'], API: ['read'] },
}

const DEFAULT_SECURITY: SecurityConfig = {
  passwordPolicy: { minLength: 12, requireUppercase: true, requireNumbers: true, requireSpecialChars: true, expiryDays: 90 },
  sessionSettings: { maxConcurrent: 3, sessionTimeout: 720, idleTimeout: 30 },
  twoFactor: { enabled: true, enforceForAdmins: true, enforceForFinance: true, method: 'totp' },
  ipWhitelist: ['203.45.67.0/24', '178.22.11.0/24', '10.0.0.0/8'],
  maxLoginAttempts: 5,
  lockoutDuration: 30,
}

const ROLE_COLORS: Record<string, string> = {
  Admin: 'text-emerald-400',
  'Finance Manager': 'text-chart-4',
  Controller: 'text-chart-2',
  Marketing: 'text-chart-3',
  'Support Agent': 'text-amber-400',
  Viewer: 'text-muted-foreground',
}

const STATUS_CONFIG: Record<string, { color: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  active: { color: 'text-emerald-400', variant: 'default' },
  inactive: { color: 'text-muted-foreground', variant: 'secondary' },
  suspended: { color: 'text-red-400', variant: 'destructive' },
}

/* ─── Component ─── */

export function AuthView() {
  // Data fetching (mocked — no backend endpoint yet)
  const { data: _apiData, loading, error, refetch } = useApi(() => Promise.resolve({ users: MOCK_USERS, sessions: MOCK_SESSIONS }), [])

  // Users tab state
  const [users, setUsers] = useState<User[]>(MOCK_USERS)
  const [userSearch, setUserSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [addUserOpen, setAddUserOpen] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Viewer', casino: 'All Casinos' })

  // Sessions tab state
  const [sessions, setSessions] = useState<Session[]>(MOCK_SESSIONS)

  // Permissions tab state
  const [permissions, setPermissions] = useState<PermissionMatrix>(DEFAULT_PERMISSIONS)

  // Security tab state
  const [security, setSecurity] = useState<SecurityConfig>(DEFAULT_SECURITY)
  const [newIp, setNewIp] = useState('')

  // ─── Derived data ───

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch = !userSearch ||
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase())
      const matchesRole = roleFilter === 'all' || u.role === roleFilter
      return matchesSearch && matchesRole
    })
  }, [users, userSearch, roleFilter])

  const allRoles = useMemo(() => [...new Set(users.map((u) => u.role))].sort(), [users])

  // ─── Handlers ───

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) return
    const user: User = {
      id: `u${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      casino: newUser.casino,
      status: 'active',
      lastLogin: '—',
    }
    setUsers((prev) => [...prev, user])
    setNewUser({ name: '', email: '', role: 'Viewer', casino: 'All Casinos' })
    setAddUserOpen(false)
  }

  const handleDeleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id))
  }

  const handleToggleUserStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' }
          : u
      )
    )
  }

  const handleRevokeSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id))
  }

  const handleTogglePermission = (role: string, resource: string, action: PermissionAction) => {
    setPermissions((prev) => {
      const current = prev[role]?.[resource] || []
      const updated = current.includes(action)
        ? current.filter((a) => a !== action)
        : [...current, action]
      return {
        ...prev,
        [role]: {
          ...prev[role],
          [resource]: updated,
        },
      }
    })
  }

  const handleAddIp = () => {
    if (!newIp.trim()) return
    setSecurity((prev) => ({
      ...prev,
      ipWhitelist: [...prev.ipWhitelist, newIp.trim()],
    }))
    setNewIp('')
  }

  const handleRemoveIp = (ip: string) => {
    setSecurity((prev) => ({
      ...prev,
      ipWhitelist: prev.ipWhitelist.filter((i) => i !== ip),
    }))
  }

  const updateSecurity = <K extends keyof SecurityConfig>(key: K, value: SecurityConfig[K]) => {
    setSecurity((prev) => ({ ...prev, [key]: value }))
  }

  // ─── Loading / Error ───

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}><CardContent className="p-4 sm:p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
          ))}
        </div>
        <Card><CardContent className="p-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive/40">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="size-8 text-destructive mx-auto mb-2" />
          <p className="text-sm font-medium text-destructive">Failed to load auth data</p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
          <Button variant="outline" size="sm" className="mt-3 gap-1" onClick={refetch}>
            <RefreshCw className="size-3" /> Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  // ─── Render ───

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-muted p-2"><Users className="size-4 text-primary" /></div>
              <div>
                <p className="text-base sm:text-lg font-bold">{users.length}</p>
                <p className="text-[10px] text-muted-foreground uppercase">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-muted p-2"><Shield className="size-4 text-emerald-400" /></div>
              <div>
                <p className="text-base sm:text-lg font-bold">{users.filter((u) => u.status === 'active').length}</p>
                <p className="text-[10px] text-muted-foreground uppercase">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-muted p-2"><Globe className="size-4 text-chart-4" /></div>
              <div>
                <p className="text-base sm:text-lg font-bold">{sessions.length}</p>
                <p className="text-[10px] text-muted-foreground uppercase">Active Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-muted p-2"><Lock className="size-4 text-amber-400" /></div>
              <div>
                <p className="text-base sm:text-lg font-bold">{security.twoFactor.enabled ? 'ON' : 'OFF'}</p>
                <p className="text-[10px] text-muted-foreground uppercase">2FA Status</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="users" className="text-xs gap-1">
            <Users className="size-3" /> Users
          </TabsTrigger>
          <TabsTrigger value="sessions" className="text-xs gap-1">
            <Globe className="size-3" /> Sessions
          </TabsTrigger>
          <TabsTrigger value="permissions" className="text-xs gap-1">
            <Shield className="size-3" /> Permissions
          </TabsTrigger>
          <TabsTrigger value="security" className="text-xs gap-1">
            <Lock className="size-3" /> Security
          </TabsTrigger>
        </TabsList>

        {/* ──────── Tab 1: Users ──────── */}
        <TabsContent value="users">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Users className="size-4 text-primary" />
                  <CardTitle className="text-sm">User Management</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                    <Input
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Search users..."
                      className="w-full sm:w-[160px] h-7 text-xs pl-7"
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-full sm:w-[130px] h-7 text-xs">
                      <SelectValue placeholder="Filter role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      {allRoles.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="text-xs gap-1 h-7">
                        <Plus className="size-3" /> Add User
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Plus className="size-4 text-primary" /> Add New User
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                          <Label className="text-xs">Full Name</Label>
                          <Input
                            value={newUser.name}
                            onChange={(e) => setNewUser((p) => ({ ...p, name: e.target.value }))}
                            placeholder="Enter full name"
                            className="text-xs"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">Email</Label>
                          <Input
                            value={newUser.email}
                            onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))}
                            placeholder="Enter email address"
                            className="text-xs"
                            type="email"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">Role</Label>
                          <Select value={newUser.role} onValueChange={(v) => setNewUser((p) => ({ ...p, role: v }))}>
                            <SelectTrigger className="text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ROLES.map((r) => (
                                <SelectItem key={r} value={r}>{r}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">Casino</Label>
                          <Select value={newUser.casino} onValueChange={(v) => setNewUser((p) => ({ ...p, casino: v }))}>
                            <SelectTrigger className="text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="All Casinos">All Casinos</SelectItem>
                              <SelectItem value="Royal Spin">Royal Spin</SelectItem>
                              <SelectItem value="Golden Reef">Golden Reef</SelectItem>
                              <SelectItem value="Luxe Bet">Luxe Bet</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button onClick={handleAddUser} className="w-full text-xs gap-1" disabled={!newUser.name || !newUser.email}>
                          <Plus className="size-3" /> Create User
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Name</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Email</TableHead>
                      <TableHead className="text-xs">Role</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Casino</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Last Login</TableHead>
                      <TableHead className="text-xs">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => {
                        const statusCfg = STATUS_CONFIG[user.status] || STATUS_CONFIG.inactive
                        return (
                          <TableRow key={user.id}>
                            <TableCell className="text-xs font-medium">{user.name}</TableCell>
                            <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{user.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-[9px] h-4 gap-1">
                                <Shield className="size-2.5" />
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{user.casino}</TableCell>
                            <TableCell>
                              <Badge variant={statusCfg.variant} className="text-[9px] h-4 gap-1">
                                {user.status === 'active' ? <CheckCircle className="size-2.5" /> : user.status === 'suspended' ? <XCircle className="size-2.5" /> : <Clock className="size-2.5" />}
                                {user.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap hidden sm:table-cell">{user.lastLogin}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="size-6 p-0"
                                  onClick={() => handleToggleUserStatus(user.id)}
                                  title={user.status === 'active' ? 'Suspend' : 'Activate'}
                                >
                                  {user.status === 'active' ? <XCircle className="size-3 text-amber-400" /> : <CheckCircle className="size-3 text-emerald-400" />}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="size-6 p-0"
                                  onClick={() => handleDeleteUser(user.id)}
                                  title="Delete"
                                >
                                  <Trash2 className="size-3 text-red-400" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-xs text-muted-foreground text-center py-4">No users found</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ──────── Tab 2: Sessions ──────── */}
        <TabsContent value="sessions">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Globe className="size-4 text-chart-4" />
                <CardTitle className="text-sm">Active Sessions</CardTitle>
                <Badge variant="outline" className="text-[9px] h-4 ml-2">{sessions.length} active</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">User</TableHead>
                      <TableHead className="text-xs">IP Address</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Device / Browser</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Started</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Expires</TableHead>
                      <TableHead className="text-xs">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.length > 0 ? (
                      sessions.map((session) => (
                        <TableRow key={session.id}>
                          <TableCell className="text-xs font-medium">{session.user}</TableCell>
                          <TableCell className="text-xs font-mono text-muted-foreground">{session.ipAddress}</TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <div className="flex items-center gap-1.5">
                              <Smartphone className="size-3 text-muted-foreground" />
                              <span className="text-xs">{session.device}</span>
                              <Separator orientation="vertical" className="h-3" />
                              <span className="text-xs text-muted-foreground">{session.browser}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap hidden sm:table-cell">{session.started}</TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap hidden sm:table-cell">{session.expires}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs gap-1 h-6 text-red-400 hover:text-red-300"
                              onClick={() => handleRevokeSession(session.id)}
                            >
                              <XCircle className="size-3" /> Revoke
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-xs text-muted-foreground text-center py-4">No active sessions</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ──────── Tab 3: Roles & Permissions ──────── */}
        <TabsContent value="permissions">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Shield className="size-4 text-primary" />
                <CardTitle className="text-sm">Roles & Permissions Matrix</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="w-full">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs w-[100px]">Resource</TableHead>
                        {ROLES.map((role) => (
                          <TableHead key={role} className="text-xs text-center min-w-[120px]">
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="text-[10px] font-medium">{role}</span>
                            </div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {RESOURCES.map((resource) => (
                        <TableRow key={resource}>
                          <TableCell className="text-xs font-medium">{resource}</TableCell>
                          {ROLES.map((role) => {
                            const perms = permissions[role]?.[resource] || []
                            return (
                              <TableCell key={role} className="text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  {(['read', 'write', 'delete', 'approve'] as PermissionAction[]).map((action) => {
                                    const isActive = perms.includes(action)
                                    const actionColors: Record<PermissionAction, string> = {
                                      read: isActive ? 'text-emerald-400' : 'text-muted-foreground/40',
                                      write: isActive ? 'text-chart-4' : 'text-muted-foreground/40',
                                      delete: isActive ? 'text-red-400' : 'text-muted-foreground/40',
                                      approve: isActive ? 'text-amber-400' : 'text-muted-foreground/40',
                                    }
                                    const actionLabels: Record<PermissionAction, string> = {
                                      read: 'R',
                                      write: 'W',
                                      delete: 'D',
                                      approve: 'A',
                                    }
                                    return (
                                      <button
                                        key={action}
                                        onClick={() => handleTogglePermission(role, resource, action)}
                                        className={`flex items-center justify-center size-5 rounded text-[9px] font-bold border transition-colors ${
                                          isActive
                                            ? 'border-current bg-current/10 ' + actionColors[action]
                                            : 'border-border text-muted-foreground/30 hover:border-muted-foreground/50'
                                        }`}
                                        title={`${action} ${resource} (${role})`}
                                      >
                                        {actionLabels[action]}
                                      </button>
                                    )
                                  })}
                                </div>
                              </TableCell>
                            )
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>

              {/* Permission Legend */}
              <div className="mt-4 flex flex-wrap items-center gap-3 pt-3 border-t border-border">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Legend:</span>
                <div className="flex items-center gap-1.5"><span className="size-3 rounded bg-emerald-400/20 text-emerald-400 text-[8px] font-bold flex items-center justify-center">R</span><span className="text-[10px] text-muted-foreground">Read</span></div>
                <div className="flex items-center gap-1.5"><span className="size-3 rounded bg-chart-4/20 text-chart-4 text-[8px] font-bold flex items-center justify-center">W</span><span className="text-[10px] text-muted-foreground">Write</span></div>
                <div className="flex items-center gap-1.5"><span className="size-3 rounded bg-red-400/20 text-red-400 text-[8px] font-bold flex items-center justify-center">D</span><span className="text-[10px] text-muted-foreground">Delete</span></div>
                <div className="flex items-center gap-1.5"><span className="size-3 rounded bg-amber-400/20 text-amber-400 text-[8px] font-bold flex items-center justify-center">A</span><span className="text-[10px] text-muted-foreground">Approve</span></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ──────── Tab 4: Security Settings ──────── */}
        <TabsContent value="security">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Password Policy */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Key className="size-4 text-primary" />
                  <CardTitle className="text-sm">Password Policy</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">Minimum Length</Label>
                  <Input
                    type="number"
                    value={security.passwordPolicy.minLength}
                    onChange={(e) => updateSecurity('passwordPolicy', { ...security.passwordPolicy, minLength: parseInt(e.target.value) || 0 })}
                    className="text-xs h-8 w-24"
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Require Uppercase</Label>
                  <Switch
                    checked={security.passwordPolicy.requireUppercase}
                    onCheckedChange={(v) => updateSecurity('passwordPolicy', { ...security.passwordPolicy, requireUppercase: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Require Numbers</Label>
                  <Switch
                    checked={security.passwordPolicy.requireNumbers}
                    onCheckedChange={(v) => updateSecurity('passwordPolicy', { ...security.passwordPolicy, requireNumbers: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Require Special Characters</Label>
                  <Switch
                    checked={security.passwordPolicy.requireSpecialChars}
                    onCheckedChange={(v) => updateSecurity('passwordPolicy', { ...security.passwordPolicy, requireSpecialChars: v })}
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-xs">Password Expiry (days)</Label>
                  <Input
                    type="number"
                    value={security.passwordPolicy.expiryDays}
                    onChange={(e) => updateSecurity('passwordPolicy', { ...security.passwordPolicy, expiryDays: parseInt(e.target.value) || 0 })}
                    className="text-xs h-8 w-24"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Session Settings */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-chart-4" />
                  <CardTitle className="text-sm">Session Settings</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">Max Concurrent Sessions</Label>
                  <Input
                    type="number"
                    value={security.sessionSettings.maxConcurrent}
                    onChange={(e) => updateSecurity('sessionSettings', { ...security.sessionSettings, maxConcurrent: parseInt(e.target.value) || 1 })}
                    className="text-xs h-8 w-24"
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-xs">Session Timeout (minutes)</Label>
                  <Input
                    type="number"
                    value={security.sessionSettings.sessionTimeout}
                    onChange={(e) => updateSecurity('sessionSettings', { ...security.sessionSettings, sessionTimeout: parseInt(e.target.value) || 0 })}
                    className="text-xs h-8 w-24"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Idle Timeout (minutes)</Label>
                  <Input
                    type="number"
                    value={security.sessionSettings.idleTimeout}
                    onChange={(e) => updateSecurity('sessionSettings', { ...security.sessionSettings, idleTimeout: parseInt(e.target.value) || 0 })}
                    className="text-xs h-8 w-24"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Two-Factor Auth */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Smartphone className="size-4 text-emerald-400" />
                  <CardTitle className="text-sm">Two-Factor Authentication</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Enable 2FA</Label>
                    <Badge variant={security.twoFactor.enabled ? 'default' : 'secondary'} className="text-[9px] h-4">
                      {security.twoFactor.enabled ? 'Active' : 'Disabled'}
                    </Badge>
                  </div>
                  <Switch
                    checked={security.twoFactor.enabled}
                    onCheckedChange={(v) => updateSecurity('twoFactor', { ...security.twoFactor, enabled: v })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Enforce for Admins</Label>
                  <Switch
                    checked={security.twoFactor.enforceForAdmins}
                    onCheckedChange={(v) => updateSecurity('twoFactor', { ...security.twoFactor, enforceForAdmins: v })}
                    disabled={!security.twoFactor.enabled}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Enforce for Finance</Label>
                  <Switch
                    checked={security.twoFactor.enforceForFinance}
                    onCheckedChange={(v) => updateSecurity('twoFactor', { ...security.twoFactor, enforceForFinance: v })}
                    disabled={!security.twoFactor.enabled}
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-xs">Default Method</Label>
                  <Select
                    value={security.twoFactor.method}
                    onValueChange={(v) => updateSecurity('twoFactor', { ...security.twoFactor, method: v as 'totp' | 'sms' | 'email' })}
                    disabled={!security.twoFactor.enabled}
                  >
                    <SelectTrigger className="text-xs h-8 w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="totp">TOTP App</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Login Rate Limiting */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="size-4 text-amber-400" />
                  <CardTitle className="text-sm">Login Rate Limiting</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">Max Login Attempts</Label>
                  <Input
                    type="number"
                    value={security.maxLoginAttempts}
                    onChange={(e) => setSecurity((p) => ({ ...p, maxLoginAttempts: parseInt(e.target.value) || 1 }))}
                    className="text-xs h-8 w-24"
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-xs">Lockout Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={security.lockoutDuration}
                    onChange={(e) => setSecurity((p) => ({ ...p, lockoutDuration: parseInt(e.target.value) || 0 }))}
                    className="text-xs h-8 w-24"
                  />
                </div>
                <Separator />
                <div className="p-3 rounded-lg bg-amber-400/5 border border-amber-400/20">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="size-3.5 text-amber-400 mt-0.5 shrink-0" />
                    <div className="text-[10px] text-muted-foreground">
                      After <span className="font-bold text-amber-400">{security.maxLoginAttempts}</span> failed attempts,
                      accounts will be locked for{' '}
                      <span className="font-bold text-amber-400">{security.lockoutDuration}</span> minutes.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* IP Whitelist — Full Width */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Globe className="size-4 text-chart-2" />
                  <CardTitle className="text-sm">IP Whitelist</CardTitle>
                  <Badge variant="outline" className="text-[9px] h-4 ml-2">{security.ipWhitelist.length} entries</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 max-w-sm">
                    <Globe className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                    <Input
                      value={newIp}
                      onChange={(e) => setNewIp(e.target.value)}
                      placeholder="e.g. 192.168.1.0/24"
                      className="text-xs h-8 pl-7"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddIp()}
                    />
                  </div>
                  <Button size="sm" className="text-xs gap-1 h-8" onClick={handleAddIp} disabled={!newIp.trim()}>
                    <Plus className="size-3" /> Add
                  </Button>
                </div>
                <div className="space-y-1.5">
                  {security.ipWhitelist.length > 0 ? (
                    security.ipWhitelist.map((ip) => (
                      <div key={ip} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                          <Globe className="size-3 text-muted-foreground" />
                          <span className="text-xs font-mono">{ip}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="size-6 p-0 text-red-400 hover:text-red-300"
                          onClick={() => handleRemoveIp(ip)}
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-3">No IP whitelist entries</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
