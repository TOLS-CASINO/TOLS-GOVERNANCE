'use client'

import { useState } from 'react'
import { Rocket, Building2, UserPlus, Puzzle, CheckCircle, ArrowRight, ArrowLeft, Globe, Wallet, Bot, Activity, Server, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useAppStore } from '@/lib/store'

// ─── Types ───────────────────────────────────────────────────────────────────

interface FormData {
  casinoName: string
  brandLogoUrl: string
  primaryCurrency: string
  primaryLanguage: string
  timezone: string
  domain: string
  adminFullName: string
  adminEmail: string
  adminPassword: string
  adminConfirmPassword: string
  adminRole: string
  inviteEmails: string
  providers: Record<string, boolean>
  enableBlockchain: boolean
  enableAiTutor: boolean
  enableLiveTracking: boolean
}

const INITIAL_FORM_DATA: FormData = {
  casinoName: '',
  brandLogoUrl: '',
  primaryCurrency: '',
  primaryLanguage: '',
  timezone: '',
  domain: '',
  adminFullName: '',
  adminEmail: '',
  adminPassword: '',
  adminConfirmPassword: '',
  adminRole: 'Admin',
  inviteEmails: '',
  providers: {
    'Evolution Gaming': false,
    'Pragmatic Play': false,
    'NetEnt': false,
    'Microgaming': false,
    "Play'n GO": false,
  },
  enableBlockchain: false,
  enableAiTutor: false,
  enableLiveTracking: false,
}

const STEP_META = [
  { label: 'Welcome', icon: Rocket },
  { label: 'Casino Setup', icon: Building2 },
  { label: 'User Setup', icon: UserPlus },
  { label: 'Integrations', icon: Puzzle },
  { label: 'Complete', icon: CheckCircle },
] as const

const CURRENCIES = ['USD', 'EUR', 'GBP', 'BTC', 'ETH', 'USDT', 'CAD', 'AUD']
const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Russian', 'Japanese', 'Chinese (Simplified)', 'Chinese (Traditional)', 'Korean', 'Arabic', 'Hindi']
const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Hong_Kong',
  'Asia/Singapore',
  'Australia/Sydney',
  'Pacific/Auckland',
]

const PROVIDER_ICONS: Record<string, typeof Server> = {
  'Evolution Gaming': Server,
  'Pragmatic Play': Globe,
  'NetEnt': Shield,
  'Microgaming': Wallet,
  "Play'n GO": Activity,
}

// ─── Step Validation ─────────────────────────────────────────────────────────

function isStepValid(step: number, data: FormData): boolean {
  switch (step) {
    case 0:
      return data.casinoName.trim().length >= 2
    case 1:
      return (
        data.casinoName.trim().length >= 2 &&
        data.primaryCurrency !== '' &&
        data.primaryLanguage !== '' &&
        data.timezone !== ''
      )
    case 2:
      return (
        data.adminFullName.trim().length >= 2 &&
        data.adminEmail.trim().length >= 5 &&
        data.adminEmail.includes('@') &&
        data.adminPassword.length >= 6 &&
        data.adminPassword === data.adminConfirmPassword
      )
    case 3:
      return true // integrations are optional
    case 4:
      return true
    default:
      return false
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export function OnboardingView() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA)
  const { setOnboardingComplete, setActiveSection } = useAppStore()

  const totalSteps = STEP_META.length
  const progressPercent = ((currentStep + 1) / totalSteps) * 100
  const canProceed = isStepValid(currentStep, formData)

  // ── Helpers ──────────────────────────────────────────────────────────────

  function updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  function toggleProvider(name: string) {
    setFormData((prev) => ({
      ...prev,
      providers: { ...prev.providers, [name]: !prev.providers[name] },
    }))
  }

  function goNext() {
    if (canProceed && currentStep < totalSteps - 1) {
      setCurrentStep((s) => s + 1)
    }
  }

  function goBack() {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1)
    }
  }

  function handleFinish() {
    setOnboardingComplete(true)
    setActiveSection('dashboard')
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-background p-4 sm:p-6 md:p-8">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="w-full max-w-2xl mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Rocket className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">TOLS Platform</h1>
            <p className="text-xs text-muted-foreground">iGaming Operations & Intelligence Suite</p>
          </div>
        </div>
      </div>

      {/* ── Step Indicators ───────────────────────────────────────────────── */}
      <div className="w-full max-w-2xl mb-6">
        <div className="flex items-center justify-between mb-3">
          {STEP_META.map((step, idx) => {
            const Icon = step.icon
            const isCompleted = idx < currentStep
            const isActive = idx === currentStep
            return (
              <div key={idx} className="flex flex-col items-center gap-1.5 flex-1">
                <div
                  className={`
                    h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center transition-all duration-300 border-2
                    ${isCompleted ? 'border-emerald-400 bg-emerald-400/10' : ''}
                    ${isActive ? 'border-primary bg-primary/10' : ''}
                    ${!isCompleted && !isActive ? 'border-muted-foreground/30 bg-muted/50' : ''}
                  `}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
                  ) : (
                    <Icon
                      className={`h-4 w-4 sm:h-5 sm:w-5 ${
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    />
                  )}
                </div>
                <span
                  className={`text-[9px] sm:text-[11px] font-medium text-center leading-tight ${
                    isCompleted
                      ? 'text-emerald-400'
                      : isActive
                        ? 'text-primary'
                        : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>

        {/* Connecting lines */}
        <div className="flex items-center gap-1 px-3 sm:px-5 -mt-6 sm:-mt-8 mb-5">
          {STEP_META.map((_, idx) => {
            if (idx === STEP_META.length - 1) return null
            const isCompleted = idx < currentStep
            return (
              <div
                key={idx}
                className={`flex-1 h-0.5 rounded-full transition-colors duration-300 ${
                  isCompleted ? 'bg-emerald-400' : 'bg-muted-foreground/20'
                }`}
              />
            )
          })}
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <Progress value={progressPercent} className="flex-1 h-2" />
          <span className="text-xs font-medium text-muted-foreground tabular-nums">
            {Math.round(progressPercent)}%
          </span>
        </div>
      </div>

      {/* ── Step Content ──────────────────────────────────────────────────── */}
      <Card className="w-full max-w-2xl bg-card/80 backdrop-blur-sm border-border/50">
        <CardContent className="p-3 sm:p-6">
          {currentStep === 0 && renderWelcomeStep()}
          {currentStep === 1 && renderCasinoSetupStep()}
          {currentStep === 2 && renderUserSetupStep()}
          {currentStep === 3 && renderIntegrationsStep()}
          {currentStep === 4 && renderCompleteStep()}
        </CardContent>
      </Card>

      {/* ── Navigation ────────────────────────────────────────────────────── */}
      {currentStep < 4 && (
        <div className="w-full max-w-2xl flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={goBack}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            {STEP_META.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentStep
                    ? 'w-6 bg-primary'
                    : idx < currentStep
                      ? 'w-2 bg-emerald-400'
                      : 'w-2 bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>

          <Button
            onClick={goNext}
            disabled={!canProceed}
            className="gap-2"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )

  // ── Step Renderers ───────────────────────────────────────────────────────

  function renderWelcomeStep() {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-flex h-16 w-16 rounded-2xl bg-primary/10 items-center justify-center mb-2">
            <Rocket className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Welcome to TOLS Platform</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Your all-in-one command center for iGaming operations. Let&apos;s get you set up in just a few steps.
          </p>
        </div>

        <Separator />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: Wallet, title: 'Financial Governance', desc: 'Complete control over transactions, wallets, and treasury operations' },
            { icon: Activity, title: 'Player Intelligence', desc: 'Deep analytics, segmentation, and real-time player monitoring' },
            { icon: Server, title: 'Vendor Integration', desc: 'Seamless game provider connections and vendor management' },
            { icon: Bot, title: 'AI Assistance', desc: 'Intelligent tutor, anomaly detection, and automated insights' },
            { icon: Globe, title: 'Real-time Monitoring', desc: 'Live dashboards, global player maps, and instant alerts' },
            { icon: Shield, title: 'Compliance & Security', desc: 'KYC/AML, regulatory compliance, and blockchain audit trails' },
          ].map((item) => (
            <div
              key={item.title}
              className="flex gap-3 p-3 rounded-lg bg-muted/30 border border-border/30"
            >
              <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                <item.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="welcome-casino-name" className="text-sm font-medium">
            Casino Name <span className="text-red-400">*</span>
          </Label>
          <Input
            id="welcome-casino-name"
            placeholder="e.g. Royal Flush Casino"
            value={formData.casinoName}
            onChange={(e) => updateField('casinoName', e.target.value)}
            className="bg-muted/30"
          />
          <p className="text-xs text-muted-foreground">
            This will be your platform identifier. You can change it later.
          </p>
        </div>
      </div>
    )
  }

  function renderCasinoSetupStep() {
    return (
      <div className="space-y-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5 text-primary" />
            Casino Configuration
          </CardTitle>
        </CardHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Casino Name */}
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="casino-name">
              Casino Name <span className="text-red-400">*</span>
            </Label>
            <Input
              id="casino-name"
              placeholder="Royal Flush Casino"
              value={formData.casinoName}
              onChange={(e) => updateField('casinoName', e.target.value)}
              className="bg-muted/30"
            />
          </div>

          {/* Brand/Logo URL */}
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="brand-logo">Brand / Logo URL</Label>
            <Input
              id="brand-logo"
              placeholder="https://cdn.example.com/logo.png"
              value={formData.brandLogoUrl}
              onChange={(e) => updateField('brandLogoUrl', e.target.value)}
              className="bg-muted/30"
            />
          </div>

          {/* Primary Currency */}
          <div className="space-y-2">
            <Label>
              Primary Currency <span className="text-red-400">*</span>
            </Label>
            <Select
              value={formData.primaryCurrency}
              onValueChange={(v) => updateField('primaryCurrency', v)}
            >
              <SelectTrigger className="w-full bg-muted/30">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Primary Language */}
          <div className="space-y-2">
            <Label>
              Primary Language <span className="text-red-400">*</span>
            </Label>
            <Select
              value={formData.primaryLanguage}
              onValueChange={(v) => updateField('primaryLanguage', v)}
            >
              <SelectTrigger className="w-full bg-muted/30">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Timezone */}
          <div className="space-y-2">
            <Label>
              Timezone <span className="text-red-400">*</span>
            </Label>
            <Select
              value={formData.timezone}
              onValueChange={(v) => updateField('timezone', v)}
            >
              <SelectTrigger className="w-full bg-muted/30">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Domain */}
          <div className="space-y-2">
            <Label htmlFor="domain">Domain <span className="text-xs text-muted-foreground">(optional)</span></Label>
            <Input
              id="domain"
              placeholder="play.royalflushcasino.com"
              value={formData.domain}
              onChange={(e) => updateField('domain', e.target.value)}
              className="bg-muted/30"
            />
          </div>
        </div>
      </div>
    )
  }

  function renderUserSetupStep() {
    const passwordMismatch =
      formData.adminConfirmPassword.length > 0 &&
      formData.adminPassword !== formData.adminConfirmPassword

    return (
      <div className="space-y-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserPlus className="h-5 w-5 text-primary" />
            Admin User Setup
          </CardTitle>
        </CardHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Full Name */}
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="admin-name">
              Full Name <span className="text-red-400">*</span>
            </Label>
            <Input
              id="admin-name"
              placeholder="John Doe"
              value={formData.adminFullName}
              onChange={(e) => updateField('adminFullName', e.target.value)}
              className="bg-muted/30"
            />
          </div>

          {/* Email */}
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="admin-email">
              Email <span className="text-red-400">*</span>
            </Label>
            <Input
              id="admin-email"
              type="email"
              placeholder="admin@royalflushcasino.com"
              value={formData.adminEmail}
              onChange={(e) => updateField('adminEmail', e.target.value)}
              className="bg-muted/30"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="admin-password">
              Password <span className="text-red-400">*</span>
            </Label>
            <Input
              id="admin-password"
              type="password"
              placeholder="Min. 6 characters"
              value={formData.adminPassword}
              onChange={(e) => updateField('adminPassword', e.target.value)}
              className="bg-muted/30"
            />
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="admin-confirm">
              Confirm Password <span className="text-red-400">*</span>
            </Label>
            <Input
              id="admin-confirm"
              type="password"
              placeholder="Re-enter password"
              value={formData.adminConfirmPassword}
              onChange={(e) => updateField('adminConfirmPassword', e.target.value)}
              className={`bg-muted/30 ${passwordMismatch ? 'border-red-500 focus-visible:ring-red-500/30' : ''}`}
            />
            {passwordMismatch && (
              <p className="text-xs text-red-400">Passwords do not match</p>
            )}
          </div>

          {/* Role */}
          <div className="space-y-2 sm:col-span-2">
            <Label>Role</Label>
            <Select
              value={formData.adminRole}
              onValueChange={(v) => updateField('adminRole', v)}
            >
              <SelectTrigger className="w-full bg-muted/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Super Admin">Super Admin</SelectItem>
                <SelectItem value="Finance Manager">Finance Manager</SelectItem>
                <SelectItem value="Controller">Controller</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Invite Team Members */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            <Label className="text-sm font-medium">Invite Team Members</Label>
            <Badge variant="secondary" className="text-[10px]">Optional</Badge>
          </div>
          <Textarea
            placeholder="Enter email addresses separated by commas or new lines&#10;e.g. sarah@casino.com, mike@casino.com"
            value={formData.inviteEmails}
            onChange={(e) => updateField('inviteEmails', e.target.value)}
            className="bg-muted/30 min-h-[80px] resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Invited members will receive an email to join your platform.
          </p>
        </div>
      </div>
    )
  }

  function renderIntegrationsStep() {
    const providerNames = Object.keys(formData.providers)
    const selectedCount = providerNames.filter((p) => formData.providers[p]).length

    return (
      <div className="space-y-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Puzzle className="h-5 w-5 text-primary" />
            Integrations & Features
          </CardTitle>
        </CardHeader>

        {/* Game Providers */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Game Providers</Label>
            <Badge variant="outline" className="text-xs">
              {selectedCount} selected
            </Badge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {providerNames.map((name) => {
              const ProviderIcon = PROVIDER_ICONS[name] || Server
              const isChecked = formData.providers[name]
              return (
                <label
                  key={name}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200
                    ${isChecked
                      ? 'bg-primary/5 border-primary/40'
                      : 'bg-muted/20 border-border/30 hover:bg-muted/30 hover:border-border/50'
                    }
                  `}
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => toggleProvider(name)}
                  />
                  <div className="h-8 w-8 rounded-md bg-muted/50 flex items-center justify-center shrink-0">
                    <ProviderIcon className={`h-4 w-4 ${isChecked ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <span className={`text-sm font-medium ${isChecked ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {name}
                  </span>
                </label>
              )
            })}
          </div>
        </div>

        <Separator />

        {/* Feature Toggles */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Platform Features</Label>

          {[
            {
              key: 'enableBlockchain' as const,
              icon: Wallet,
              title: 'Enable Blockchain',
              desc: 'On-chain transaction audit trails, crypto wallet support, and decentralized verification',
            },
            {
              key: 'enableAiTutor' as const,
              icon: Bot,
              title: 'Enable AI Tutor',
              desc: 'Intelligent assistant for platform guidance, anomaly detection, and predictive analytics',
            },
            {
              key: 'enableLiveTracking' as const,
              icon: Activity,
              title: 'Enable Live Tracking',
              desc: 'Real-time player activity monitoring, geo-mapping, and instant event streaming',
            },
          ].map((feature) => (
            <div
              key={feature.key}
              className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-muted/20 border border-border/30"
            >
              <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <feature.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-foreground">{feature.title}</p>
                  <Switch
                    checked={formData[feature.key]}
                    onCheckedChange={(v) => updateField(feature.key, v)}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  function renderCompleteStep() {
    const enabledProviders = Object.entries(formData.providers)
      .filter(([, v]) => v)
      .map(([k]) => k)
    const enabledFeatures: string[] = []
    if (formData.enableBlockchain) enabledFeatures.push('Blockchain')
    if (formData.enableAiTutor) enabledFeatures.push('AI Tutor')
    if (formData.enableLiveTracking) enabledFeatures.push('Live Tracking')

    return (
      <div className="space-y-6">
        {/* Success banner */}
        <div className="text-center space-y-3 py-4">
          <div className="inline-flex h-16 w-16 rounded-full bg-emerald-400/10 items-center justify-center mb-2">
            <CheckCircle className="h-8 w-8 text-emerald-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Setup Complete!</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Your TOLS Platform is configured and ready to go. Here&apos;s a summary of your setup.
          </p>
        </div>

        <Separator />

        {/* Summary */}
        <div className="space-y-4">
          {/* Casino Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Casino Configuration</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 pl-6 text-sm">
              <span className="text-muted-foreground">Name</span>
              <span className="text-foreground font-medium">{formData.casinoName}</span>
              <span className="text-muted-foreground">Currency</span>
              <span className="text-foreground font-medium">{formData.primaryCurrency}</span>
              <span className="text-muted-foreground">Language</span>
              <span className="text-foreground font-medium">{formData.primaryLanguage}</span>
              <span className="text-muted-foreground">Timezone</span>
              <span className="text-foreground font-medium">{formData.timezone}</span>
              {formData.domain && (
                <>
                  <span className="text-muted-foreground">Domain</span>
                  <span className="text-foreground font-medium">{formData.domain}</span>
                </>
              )}
            </div>
          </div>

          <Separator />

          {/* Admin Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Admin User</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 pl-6 text-sm">
              <span className="text-muted-foreground">Name</span>
              <span className="text-foreground font-medium">{formData.adminFullName}</span>
              <span className="text-muted-foreground">Email</span>
              <span className="text-foreground font-medium">{formData.adminEmail}</span>
              <span className="text-muted-foreground">Role</span>
              <span className="text-foreground font-medium">{formData.adminRole}</span>
            </div>
          </div>

          <Separator />

          {/* Integrations */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Puzzle className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Integrations & Features</h3>
            </div>
            <div className="pl-6 space-y-2">
              {enabledProviders.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {enabledProviders.map((p) => (
                    <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No game providers selected</p>
              )}
              {enabledFeatures.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {enabledFeatures.map((f) => (
                    <Badge key={f} variant="outline" className="text-xs text-emerald-400 border-emerald-400/30">{f}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No extra features enabled</p>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Go to Dashboard */}
        <div className="flex flex-col items-center gap-3 pt-2">
          <Button
            onClick={handleFinish}
            size="lg"
            className="w-full max-w-xs gap-2 text-base font-semibold"
          >
            <Rocket className="h-4 w-4" />
            Go to Dashboard
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            You can always modify these settings from the platform configuration panel.
          </p>
        </div>
      </div>
    )
  }
}
