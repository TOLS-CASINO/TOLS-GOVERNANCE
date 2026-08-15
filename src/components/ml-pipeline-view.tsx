'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Brain,
  TrendingUp,
  Cpu,
  Database,
  Play,
  Square,
  RefreshCw,
  Plus,
  Search,
  Filter,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  Activity,
  Zap,
  Settings,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { Progress } from '@/components/ui/progress'
import { useApi } from '@/hooks/use-api'
import { api } from '@/services/api'

/* ─── Types ─── */

type ModelStatus = 'deployed' | 'trained' | 'training' | 'draft'
type ModelType = 'classification' | 'regression' | 'anomaly_detection' | 'nlp'
type JobStatus = 'queued' | 'running' | 'completed' | 'failed'
type FeatureSource = 'database' | 'stream' | 'api'

interface MLModel {
  id: string
  name: string
  type: ModelType
  algorithm: string
  version: string
  status: ModelStatus
  accuracy: number | null
  precision: number | null
  recall: number | null
  featuresCount: number
  lastTrained: string
  trainingProgress?: number
}

interface Prediction {
  id: string
  time: string
  model: string
  entity: string
  input: string
  output: string
  confidence: number
  duration: number
}

interface TrainingJob {
  id: string
  model: string
  status: JobStatus
  progress: number
  started: string
  duration: string
}

interface FeatureStoreItem {
  id: string
  name: string
  featuresCount: number
  source: FeatureSource
  refreshInterval: string
  lastRefresh: string
  active: boolean
}

/* ─── Mock Data ─── */

const MOCK_MODELS: MLModel[] = [
  {
    id: 'm1',
    name: 'Churn Predictor',
    type: 'classification',
    algorithm: 'XGBoost',
    version: 'v2.1.0',
    status: 'deployed',
    accuracy: 94.2,
    precision: 93.1,
    recall: 95.4,
    featuresCount: 42,
    lastTrained: '2025-01-15 08:30',
  },
  {
    id: 'm2',
    name: 'Revenue Forecaster',
    type: 'regression',
    algorithm: 'LSTM',
    version: 'v1.3.0',
    status: 'deployed',
    accuracy: 89.7,
    precision: null,
    recall: null,
    featuresCount: 28,
    lastTrained: '2025-01-14 22:15',
  },
  {
    id: 'm3',
    name: 'Fraud Detector',
    type: 'anomaly_detection',
    algorithm: 'Random Forest',
    version: 'v3.0.0',
    status: 'deployed',
    accuracy: 97.8,
    precision: 96.2,
    recall: null,
    featuresCount: 35,
    lastTrained: '2025-01-15 04:00',
  },
  {
    id: 'm4',
    name: 'Player Segmentation',
    type: 'classification',
    algorithm: 'Neural Network',
    version: 'v1.0.0',
    status: 'trained',
    accuracy: 91.3,
    precision: null,
    recall: null,
    featuresCount: 19,
    lastTrained: '2025-01-13 16:45',
  },
  {
    id: 'm5',
    name: 'AML Risk Scorer',
    type: 'classification',
    algorithm: 'XGBoost',
    version: 'v2.0.0',
    status: 'training',
    accuracy: null,
    precision: null,
    recall: null,
    featuresCount: 51,
    lastTrained: '2025-01-15 10:00',
    trainingProgress: 67,
  },
  {
    id: 'm6',
    name: 'Game Recommender',
    type: 'nlp',
    algorithm: 'Neural Network',
    version: 'v1.1.0',
    status: 'draft',
    accuracy: null,
    precision: null,
    recall: null,
    featuresCount: 15,
    lastTrained: '—',
  },
]

const MOCK_PREDICTIONS: Prediction[] = [
  { id: 'p1', time: '10:42:18', model: 'Churn Predictor', entity: 'player_8921', input: '{"sessions":45,"avg_bet":23.5,"days_active":12}', output: '{"churn_prob":0.87}', confidence: 0.87, duration: 12 },
  { id: 'p2', time: '10:42:15', model: 'Fraud Detector', entity: 'txn_45291', input: '{"amount":5200,"currency":"USD","ip":"192.168.1.1"}', output: '{"fraud_score":0.93,"flag":true}', confidence: 0.93, duration: 8 },
  { id: 'p3', time: '10:42:12', model: 'Revenue Forecaster', entity: 'game_slots_21', input: '{"hour":10,"day":"tue","players":342}', output: '{"forecast":15820.5}', confidence: 0.82, duration: 45 },
  { id: 'p4', time: '10:42:09', model: 'Churn Predictor', entity: 'player_3347', input: '{"sessions":120,"avg_bet":8.2,"days_active":89}', output: '{"churn_prob":0.12}', confidence: 0.12, duration: 11 },
  { id: 'p5', time: '10:42:06', model: 'Fraud Detector', entity: 'txn_45295', input: '{"amount":50,"currency":"EUR","ip":"10.0.0.5"}', output: '{"fraud_score":0.04,"flag":false}', confidence: 0.96, duration: 6 },
  { id: 'p6', time: '10:42:03', model: 'Revenue Forecaster', entity: 'game_live_05', input: '{"hour":10,"day":"tue","players":87}', output: '{"forecast":4320.0}', confidence: 0.78, duration: 42 },
  { id: 'p7', time: '10:42:00', model: 'Churn Predictor', entity: 'player_7812', input: '{"sessions":8,"avg_bet":55.0,"days_active":3}', output: '{"churn_prob":0.94}', confidence: 0.94, duration: 13 },
  { id: 'p8', time: '10:41:57', model: 'Fraud Detector', entity: 'txn_45300', input: '{"amount":12000,"currency":"BTC","ip":"172.16.0.1"}', output: '{"fraud_score":0.99,"flag":true}', confidence: 0.99, duration: 9 },
  { id: 'p9', time: '10:41:54', model: 'Player Segmentation', entity: 'player_5590', input: '{"ltv":3200,"freq":15,"recency":2}', output: '{"segment":"whale"}', confidence: 0.76, duration: 18 },
  { id: 'p10', time: '10:41:51', model: 'Churn Predictor', entity: 'player_2214', input: '{"sessions":67,"avg_bet":12.8,"days_active":45}', output: '{"churn_prob":0.31}', confidence: 0.31, duration: 10 },
  { id: 'p11', time: '10:41:48', model: 'Revenue Forecaster', entity: 'game_table_03', input: '{"hour":10,"day":"tue","players":156}', output: '{"forecast":8750.0}', confidence: 0.85, duration: 38 },
  { id: 'p12', time: '10:41:45', model: 'Fraud Detector', entity: 'txn_45312', input: '{"amount":250,"currency":"USD","ip":"10.0.1.22"}', output: '{"fraud_score":0.08,"flag":false}', confidence: 0.92, duration: 7 },
]

const MOCK_TRAINING_JOBS: TrainingJob[] = [
  { id: 'job-2847', model: 'AML Risk Scorer', status: 'running', progress: 67, started: '10:15:00', duration: '27m 18s' },
  { id: 'job-2846', model: 'Churn Predictor', status: 'running', progress: 34, started: '10:28:00', duration: '14m 18s' },
  { id: 'job-2845', model: 'Fraud Detector', status: 'queued', progress: 0, started: '—', duration: '—' },
  { id: 'job-2844', model: 'Revenue Forecaster', status: 'completed', progress: 100, started: '09:00:00', duration: '1h 22m' },
  { id: 'job-2843', model: 'Player Segmentation', status: 'completed', progress: 100, started: '08:30:00', duration: '45m' },
  { id: 'job-2842', model: 'Game Recommender', status: 'failed', progress: 58, started: '07:15:00', duration: '23m (failed)' },
]

const MOCK_FEATURE_STORES: FeatureStoreItem[] = [
  { id: 'fs1', name: 'Player Behavior', featuresCount: 47, source: 'database', refreshInterval: '15min', lastRefresh: '10:37:00', active: true },
  { id: 'fs2', name: 'Transaction Patterns', featuresCount: 23, source: 'stream', refreshInterval: '5min', lastRefresh: '10:42:00', active: true },
  { id: 'fs3', name: 'Game Analytics', featuresCount: 31, source: 'database', refreshInterval: '30min', lastRefresh: '10:12:00', active: true },
  { id: 'fs4', name: 'Geo Demographics', featuresCount: 18, source: 'api', refreshInterval: '60min', lastRefresh: '09:42:00', active: false },
]

/* ─── Helpers ─── */

const statusColor: Record<ModelStatus, string> = {
  deployed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  trained: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  training: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  draft: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
}

const statusIcon: Record<ModelStatus, React.ReactNode> = {
  deployed: <CheckCircle className="size-3" />,
  trained: <Clock className="size-3" />,
  training: <Loader2 className="size-3 animate-spin" />,
  draft: <Square className="size-3" />,
}

const typeBadgeColor: Record<ModelType, string> = {
  classification: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  regression: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  anomaly_detection: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  nlp: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
}

const jobStatusColor: Record<JobStatus, string> = {
  queued: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
  running: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  failed: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
}

const jobStatusIcon: Record<JobStatus, React.ReactNode> = {
  queued: <Clock className="size-3" />,
  running: <Loader2 className="size-3 animate-spin" />,
  completed: <CheckCircle className="size-3" />,
  failed: <XCircle className="size-3" />,
}

const sourceIcon: Record<FeatureSource, React.ReactNode> = {
  database: <Database className="size-4 text-violet-400" />,
  stream: <Activity className="size-4 text-cyan-400" />,
  api: <Zap className="size-4 text-amber-400" />,
}

const sourceBadgeColor: Record<FeatureSource, string> = {
  database: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  stream: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  api: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
}

function confidenceColor(confidence: number): string {
  if (confidence >= 0.9) return 'text-emerald-400'
  if (confidence >= 0.7) return 'text-amber-400'
  if (confidence >= 0.5) return 'text-orange-400'
  return 'text-rose-400'
}

function confidenceBg(confidence: number): string {
  if (confidence >= 0.9) return 'bg-emerald-500/20'
  if (confidence >= 0.7) return 'bg-amber-500/20'
  if (confidence >= 0.5) return 'bg-orange-500/20'
  return 'bg-rose-500/20'
}

function truncate(str: string, max: number): string {
  if (str.length <= max) return str
  return str.slice(0, max) + '…'
}

const MODEL_TYPE_LABELS: Record<ModelType, string> = {
  classification: 'Classification',
  regression: 'Regression',
  anomaly_detection: 'Anomaly Detection',
  nlp: 'NLP',
}

/* ─── Main Component ─── */

export function MLPipelineView() {
  /* State */
  const [models, setModels] = useState<MLModel[]>(MOCK_MODELS)
  const [predictions] = useState<Prediction[]>(MOCK_PREDICTIONS)
  const [trainingJobs, setTrainingJobs] = useState<TrainingJob[]>(MOCK_TRAINING_JOBS)
  const [featureStores, setFeatureStores] = useState<FeatureStoreItem[]>(MOCK_FEATURE_STORES)

  const [modelFilter, setModelFilter] = useState<string>('all')
  const [confidenceThreshold, setConfidenceThreshold] = useState<string>('0')
  const [addModelOpen, setAddModelOpen] = useState(false)
  const [newModel, setNewModel] = useState({ name: '', type: 'classification' as ModelType, algorithm: '', description: '' })
  const [searchQuery, setSearchQuery] = useState('')

  /* useApi for data fetching */
  const { data: pipelineData, loading, error, refetch } = useApi(
    useCallback(() => api.dashboard.get().then(() => 'loaded'), []),
    []
  )

  /* Simulate progress for running training jobs */
  const [runningProgress, setRunningProgress] = useState<Record<string, number>>({
    'job-2847': 67,
    'job-2846': 34,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setRunningProgress((prev) => {
        const next = { ...prev }
        for (const key of Object.keys(next)) {
          if (next[key] < 100) {
            next[key] = Math.min(100, next[key] + Math.random() * 2)
          }
        }
        return next
      })
    }, 1500)
    return () => clearInterval(interval)
  }, [])

  /* Filtered predictions */
  const filteredPredictions = predictions.filter((p) => {
    if (modelFilter !== 'all' && p.model !== modelFilter) return false
    if (Number(confidenceThreshold) > 0 && p.confidence < Number(confidenceThreshold)) return false
    return true
  })

  /* Handle model action */
  const handleModelAction = (modelId: string, action: 'deploy' | 'train' | 'view') => {
    if (action === 'deploy') {
      setModels((prev) =>
        prev.map((m) => (m.id === modelId ? { ...m, status: 'deployed' as ModelStatus } : m))
      )
    } else if (action === 'train') {
      setModels((prev) =>
        prev.map((m) =>
          m.id === modelId ? { ...m, status: 'training' as ModelStatus, trainingProgress: 0 } : m
        )
      )
    }
  }

  /* Handle feature store toggle */
  const handleFeatureToggle = (storeId: string, active: boolean) => {
    setFeatureStores((prev) =>
      prev.map((fs) => (fs.id === storeId ? { ...fs, active } : fs))
    )
  }

  /* Handle cancel job */
  const handleCancelJob = (jobId: string) => {
    setTrainingJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: 'failed' as JobStatus } : j))
    )
    setRunningProgress((prev) => {
      const next = { ...prev }
      delete next[jobId]
      return next
    })
  }

  /* Loading state */
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Brain className="size-5 text-amber-400" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-zinc-800 bg-zinc-950/80">
              <CardContent className="p-6">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-rose-500/20 border border-amber-500/20">
            <Brain className="size-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">ML Pipeline & Predictions</h2>
            <p className="text-xs text-zinc-500">
              {models.filter((m) => m.status === 'deployed').length} deployed ·{' '}
              {models.filter((m) => m.status === 'training').length} training ·{' '}
              {predictions.length} predictions/min
            </p>
          </div>
        </div>
        <Dialog open={addModelOpen} onOpenChange={setAddModelOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="gap-1.5 text-xs bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-zinc-950 font-semibold border-0"
            >
              <Plus className="size-3.5" /> Add Model
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-950 border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-zinc-100">Add New ML Model</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label className="text-xs text-zinc-400 mb-1.5 block">Model Name</Label>
                <Input
                  value={newModel.name}
                  onChange={(e) => setNewModel((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Bonus Abuse Detector"
                  className="h-9 text-xs bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600"
                />
              </div>
              <div>
                <Label className="text-xs text-zinc-400 mb-1.5 block">Model Type</Label>
                <Select
                  value={newModel.type}
                  onValueChange={(v) => setNewModel((p) => ({ ...p, type: v as ModelType }))}
                >
                  <SelectTrigger className="h-9 text-xs bg-zinc-900 border-zinc-800 text-zinc-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    <SelectItem value="classification">Classification</SelectItem>
                    <SelectItem value="regression">Regression</SelectItem>
                    <SelectItem value="anomaly_detection">Anomaly Detection</SelectItem>
                    <SelectItem value="nlp">NLP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-zinc-400 mb-1.5 block">Algorithm</Label>
                <Input
                  value={newModel.algorithm}
                  onChange={(e) => setNewModel((p) => ({ ...p, algorithm: e.target.value }))}
                  placeholder="e.g. XGBoost, LSTM, Random Forest"
                  className="h-9 text-xs bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600"
                />
              </div>
              <div>
                <Label className="text-xs text-zinc-400 mb-1.5 block">Description</Label>
                <Textarea
                  value={newModel.description}
                  onChange={(e) => setNewModel((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Describe the model purpose and target..."
                  className="text-xs min-h-[60px] bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-zinc-400"
                onClick={() => setAddModelOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="text-xs bg-amber-600 hover:bg-amber-500 text-zinc-950 font-semibold"
                onClick={() => {
                  if (!newModel.name.trim()) return
                  setModels((prev) => [
                    ...prev,
                    {
                      id: `m${Date.now()}`,
                      name: newModel.name,
                      type: newModel.type,
                      algorithm: newModel.algorithm || 'Custom',
                      version: 'v0.1.0',
                      status: 'draft',
                      accuracy: null,
                      precision: null,
                      recall: null,
                      featuresCount: 0,
                      lastTrained: '—',
                    },
                  ])
                  setNewModel({ name: '', type: 'classification', algorithm: '', description: '' })
                  setAddModelOpen(false)
                }}
              >
                Add Model
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="models" className="w-full">
        <TabsList className="bg-zinc-900/80 border border-zinc-800 p-0.5 h-9">
          <TabsTrigger
            value="models"
            className="text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-amber-400 text-zinc-500 px-3"
          >
            <Brain className="size-3.5 mr-1.5" /> Models
          </TabsTrigger>
          <TabsTrigger
            value="predictions"
            className="text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-amber-400 text-zinc-500 px-3"
          >
            <TrendingUp className="size-3.5 mr-1.5" /> Predictions
          </TabsTrigger>
          <TabsTrigger
            value="training"
            className="text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-amber-400 text-zinc-500 px-3"
          >
            <Cpu className="size-3.5 mr-1.5" /> Training Jobs
          </TabsTrigger>
          <TabsTrigger
            value="features"
            className="text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-amber-400 text-zinc-500 px-3"
          >
            <Database className="size-3.5 mr-1.5" /> Feature Store
          </TabsTrigger>
        </TabsList>

        {/* ────── Tab 1: Models ────── */}
        <TabsContent value="models" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {models.map((model) => (
              <Card
                key={model.id}
                className="border-zinc-800 bg-zinc-950/80 hover:border-zinc-700 transition-colors relative overflow-hidden"
              >
                {/* Top accent bar */}
                <div
                  className={`absolute top-0 left-0 right-0 h-0.5 ${
                    model.status === 'deployed'
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                      : model.status === 'training'
                        ? 'bg-gradient-to-r from-sky-500 to-sky-400'
                        : model.status === 'trained'
                          ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                          : 'bg-gradient-to-r from-zinc-600 to-zinc-500'
                  }`}
                />

                <CardContent className="p-5 pt-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-zinc-100 truncate">{model.name}</h3>
                      <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">{model.version}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[9px] px-1.5 py-0 gap-1 ${statusColor[model.status]} shrink-0 ml-2`}
                    >
                      {statusIcon[model.status]}
                      {model.status.charAt(0).toUpperCase() + model.status.slice(1)}
                    </Badge>
                  </div>

                  {/* Type & Algorithm Badges */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <Badge
                      variant="outline"
                      className={`text-[9px] px-1.5 py-0 ${typeBadgeColor[model.type]}`}
                    >
                      {MODEL_TYPE_LABELS[model.type]}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-[9px] px-1.5 py-0 bg-zinc-800/50 text-zinc-400 border-zinc-700"
                    >
                      {model.algorithm}
                    </Badge>
                  </div>

                  {/* Accuracy Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                    {model.accuracy !== null && (
                      <div className="p-2 rounded-lg bg-zinc-900/60 text-center">
                        <p className="text-base font-bold text-emerald-400">{model.accuracy}%</p>
                        <p className="text-[9px] text-zinc-500 uppercase tracking-wider">Accuracy</p>
                      </div>
                    )}
                    {model.precision !== null && (
                      <div className="p-2 rounded-lg bg-zinc-900/60 text-center">
                        <p className="text-base font-bold text-cyan-400">{model.precision}%</p>
                        <p className="text-[9px] text-zinc-500 uppercase tracking-wider">Precision</p>
                      </div>
                    )}
                    {model.recall !== null && (
                      <div className="p-2 rounded-lg bg-zinc-900/60 text-center">
                        <p className="text-base font-bold text-amber-400">{model.recall}%</p>
                        <p className="text-[9px] text-zinc-500 uppercase tracking-wider">Recall</p>
                      </div>
                    )}
                    {model.trainingProgress !== undefined && model.status === 'training' && (
                      <div className="col-span-2">
                        <div className="flex items-center justify-between text-[9px] text-zinc-500 mb-1">
                          <span>Training Progress</span>
                          <span className="text-sky-400 font-mono">{Math.round(model.trainingProgress)}%</span>
                        </div>
                        <Progress
                          value={model.trainingProgress}
                          className="h-1.5 bg-zinc-800 [&>div]:bg-sky-500"
                        />
                      </div>
                    )}
                    {model.accuracy === null && model.status === 'draft' && (
                      <div className="col-span-2 p-2 rounded-lg bg-zinc-900/60 text-center">
                        <p className="text-[10px] text-zinc-500 italic">Not yet trained</p>
                      </div>
                    )}
                  </div>

                  <Separator className="bg-zinc-800 mb-3" />

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Database className="size-3" /> {model.featuresCount} features
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" /> {model.lastTrained}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    {model.status === 'trained' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-[10px] gap-1 flex-1 border-emerald-600/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                        onClick={() => handleModelAction(model.id, 'deploy')}
                      >
                        <Play className="size-3" /> Deploy
                      </Button>
                    )}
                    {(model.status === 'draft' || model.status === 'trained') && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-[10px] gap-1 flex-1 border-sky-600/30 text-sky-400 hover:bg-sky-500/10 hover:text-sky-300"
                        onClick={() => handleModelAction(model.id, 'train')}
                      >
                        <RefreshCw className="size-3" /> Train
                      </Button>
                    )}
                    {model.status === 'deployed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-[10px] gap-1 flex-1 border-rose-600/30 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                        onClick={() =>
                          setModels((prev) =>
                            prev.map((m) =>
                              m.id === model.id ? { ...m, status: 'trained' as ModelStatus } : m
                            )
                          )
                        }
                      >
                        <Square className="size-3" /> Undeploy
                      </Button>
                    )}
                    {model.status === 'training' && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled
                        className="h-7 text-[10px] gap-1 flex-1 border-zinc-700 text-zinc-600"
                      >
                        <Loader2 className="size-3 animate-spin" /> Training…
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-[10px] gap-1 text-zinc-500 hover:text-zinc-300"
                      onClick={() => handleModelAction(model.id, 'view')}
                    >
                      <Eye className="size-3" /> View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ────── Tab 2: Predictions ────── */}
        <TabsContent value="predictions" className="mt-4">
          <Card className="border-zinc-800 bg-zinc-950/80">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <CardTitle className="text-sm text-zinc-100 flex items-center gap-2">
                  <Activity className="size-4 text-amber-400" /> Recent Predictions
                </CardTitle>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Select value={modelFilter} onValueChange={setModelFilter}>
                    <SelectTrigger className="h-8 text-[10px] w-full sm:w-[160px] bg-zinc-900 border-zinc-800 text-zinc-300">
                      <Filter className="size-3 mr-1 text-zinc-500" />
                      <SelectValue placeholder="All Models" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                      <SelectItem value="all">All Models</SelectItem>
                      <SelectItem value="Churn Predictor">Churn Predictor</SelectItem>
                      <SelectItem value="Fraud Detector">Fraud Detector</SelectItem>
                      <SelectItem value="Revenue Forecaster">Revenue Forecaster</SelectItem>
                      <SelectItem value="Player Segmentation">Player Segmentation</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={confidenceThreshold} onValueChange={setConfidenceThreshold}>
                    <SelectTrigger className="h-8 text-[10px] w-full sm:w-[140px] bg-zinc-900 border-zinc-800 text-zinc-300">
                      <SelectValue placeholder="Confidence ≥" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                      <SelectItem value="0">All Confidence</SelectItem>
                      <SelectItem value="0.5">≥ 50%</SelectItem>
                      <SelectItem value="0.7">≥ 70%</SelectItem>
                      <SelectItem value="0.9">≥ 90%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[480px]">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800 hover:bg-transparent">
                      <TableHead className="text-[9px] text-zinc-500 uppercase tracking-wider h-8">Time</TableHead>
                      <TableHead className="text-[9px] text-zinc-500 uppercase tracking-wider">Model</TableHead>
                      <TableHead className="text-[9px] text-zinc-500 uppercase tracking-wider">Entity</TableHead>
                      <TableHead className="text-[9px] text-zinc-500 uppercase tracking-wider">Input</TableHead>
                      <TableHead className="text-[9px] text-zinc-500 uppercase tracking-wider">Output</TableHead>
                      <TableHead className="text-[9px] text-zinc-500 uppercase tracking-wider text-right">Confidence</TableHead>
                      <TableHead className="text-[9px] text-zinc-500 uppercase tracking-wider text-right">Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPredictions.map((pred) => (
                      <TableRow
                        key={pred.id}
                        className="border-zinc-800/50 hover:bg-zinc-900/40 transition-colors"
                      >
                        <TableCell className="text-[10px] text-zinc-400 font-mono whitespace-nowrap">
                          {pred.time}
                        </TableCell>
                        <TableCell className="text-[10px] text-zinc-300 whitespace-nowrap">
                          {pred.model}
                        </TableCell>
                        <TableCell className="text-[10px] text-zinc-400 font-mono whitespace-nowrap">
                          {pred.entity}
                        </TableCell>
                        <TableCell className="text-[10px] text-zinc-500 font-mono max-w-[180px]">
                          <span className="truncate block">{truncate(pred.input, 35)}</span>
                        </TableCell>
                        <TableCell className="text-[10px] text-zinc-500 font-mono max-w-[160px]">
                          <span className="truncate block">{truncate(pred.output, 30)}</span>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${confidenceBg(pred.confidence)} ${confidenceColor(pred.confidence)}`}
                          >
                            {(pred.confidence * 100).toFixed(0)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-[10px] text-zinc-500 font-mono text-right whitespace-nowrap">
                          {pred.duration}ms
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredPredictions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-xs text-zinc-500 py-8">
                          No predictions match the current filters
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ────── Tab 3: Training Jobs ────── */}
        <TabsContent value="training" className="mt-4">
          <Card className="border-zinc-800 bg-zinc-950/80">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-zinc-100 flex items-center gap-2">
                  <Cpu className="size-4 text-amber-400" /> Training Jobs
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[9px] bg-sky-500/10 text-sky-400 border-sky-500/30">
                    {trainingJobs.filter((j) => j.status === 'running').length} running
                  </Badge>
                  <Badge variant="outline" className="text-[9px] bg-zinc-800 text-zinc-400 border-zinc-700">
                    {trainingJobs.filter((j) => j.status === 'queued').length} queued
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800 hover:bg-transparent">
                      <TableHead className="text-[9px] text-zinc-500 uppercase tracking-wider h-8">Job ID</TableHead>
                      <TableHead className="text-[9px] text-zinc-500 uppercase tracking-wider">Model</TableHead>
                      <TableHead className="text-[9px] text-zinc-500 uppercase tracking-wider">Status</TableHead>
                      <TableHead className="text-[9px] text-zinc-500 uppercase tracking-wider">Progress</TableHead>
                      <TableHead className="text-[9px] text-zinc-500 uppercase tracking-wider">Started</TableHead>
                      <TableHead className="text-[9px] text-zinc-500 uppercase tracking-wider">Duration</TableHead>
                      <TableHead className="text-[9px] text-zinc-500 uppercase tracking-wider text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trainingJobs.map((job) => {
                      const isRunning = job.status === 'running'
                      const currentProgress = isRunning
                        ? runningProgress[job.id] ?? job.progress
                        : job.progress

                      return (
                        <TableRow
                          key={job.id}
                          className={`border-zinc-800/50 hover:bg-zinc-900/40 transition-colors ${isRunning ? 'animate-pulse' : ''}`}
                        >
                          <TableCell className="text-[10px] text-zinc-400 font-mono whitespace-nowrap">
                            {job.id}
                          </TableCell>
                          <TableCell className="text-[10px] text-zinc-300 whitespace-nowrap">
                            {job.model}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-[9px] px-1.5 py-0 gap-1 ${jobStatusColor[job.status]}`}
                            >
                              {jobStatusIcon[job.status]}
                              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 min-w-[140px]">
                              <Progress
                                value={currentProgress}
                                className={`h-1.5 flex-1 bg-zinc-800 ${
                                  job.status === 'failed'
                                    ? '[&>div]:bg-rose-500'
                                    : job.status === 'completed'
                                      ? '[&>div]:bg-emerald-500'
                                      : '[&>div]:bg-sky-500'
                                }`}
                              />
                              <span
                                className={`text-[10px] font-mono w-8 text-right ${
                                  job.status === 'completed'
                                    ? 'text-emerald-400'
                                    : job.status === 'failed'
                                      ? 'text-rose-400'
                                      : 'text-zinc-400'
                                }`}
                              >
                                {Math.round(currentProgress)}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-[10px] text-zinc-400 font-mono whitespace-nowrap">
                            {job.started}
                          </TableCell>
                          <TableCell className="text-[10px] text-zinc-500 whitespace-nowrap">
                            {job.duration}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {(job.status === 'running' || job.status === 'queued') && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 text-[9px] gap-0.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-1.5"
                                  onClick={() => handleCancelJob(job.id)}
                                >
                                  <XCircle className="size-3" /> Cancel
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 text-[9px] gap-0.5 text-zinc-500 hover:text-zinc-300 px-1.5"
                              >
                                <Eye className="size-3" /> Logs
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ────── Tab 4: Feature Store ────── */}
        <TabsContent value="features" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {featureStores.map((store) => (
              <Card
                key={store.id}
                className="border-zinc-800 bg-zinc-950/80 hover:border-zinc-700 transition-colors"
              >
                <CardContent className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center size-10 rounded-lg bg-zinc-900 border border-zinc-800">
                        {sourceIcon[store.source]}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-zinc-100">{store.name}</h3>
                        <Badge
                          variant="outline"
                          className={`text-[9px] px-1.5 py-0 mt-1 ${sourceBadgeColor[store.source]}`}
                        >
                          {store.source}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-[9px] text-zinc-500">
                        {store.active ? 'Active' : 'Inactive'}
                      </Label>
                      <Switch
                        checked={store.active}
                        onCheckedChange={(checked) => handleFeatureToggle(store.id, checked)}
                        className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-zinc-700"
                      />
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                    <div className="p-2 rounded-lg bg-zinc-900/60 text-center">
                      <p className="text-lg font-bold text-zinc-100">{store.featuresCount}</p>
                      <p className="text-[9px] text-zinc-500 uppercase tracking-wider">Features</p>
                    </div>
                    <div className="p-2 rounded-lg bg-zinc-900/60 text-center">
                      <p className="text-sm font-bold text-zinc-200">{store.refreshInterval}</p>
                      <p className="text-[9px] text-zinc-500 uppercase tracking-wider">Refresh</p>
                    </div>
                    <div className="p-2 rounded-lg bg-zinc-900/60 text-center">
                      <p className="text-sm font-bold text-zinc-200 font-mono">{store.lastRefresh}</p>
                      <p className="text-[9px] text-zinc-500 uppercase tracking-wider">Last Sync</p>
                    </div>
                  </div>

                  <Separator className="bg-zinc-800 mb-3" />

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                      <RefreshCw className="size-3" /> Auto-refreshes every {store.refreshInterval}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-[9px] gap-1 text-zinc-500 hover:text-zinc-300"
                    >
                      <Settings className="size-3" /> Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Feature Store Summary */}
          <Card className="border-zinc-800 bg-zinc-950/80 mt-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="size-4 text-amber-400" />
                    <span className="text-xs text-zinc-300">
                      Total Features:{' '}
                      <span className="font-bold text-zinc-100">
                        {featureStores.reduce((a, s) => a + s.featuresCount, 0)}
                      </span>
                    </span>
                  </div>
                  <Separator orientation="vertical" className="h-4 bg-zinc-800" />
                  <div className="flex items-center gap-2">
                    <Activity className="size-4 text-emerald-400" />
                    <span className="text-xs text-zinc-300">
                      Active Stores:{' '}
                      <span className="font-bold text-zinc-100">
                        {featureStores.filter((s) => s.active).length}/{featureStores.length}
                      </span>
                    </span>
                  </div>
                  <Separator orientation="vertical" className="h-4 bg-zinc-800" />
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-sky-400" />
                    <span className="text-xs text-zinc-300">
                      Fastest Refresh:{' '}
                      <span className="font-bold text-zinc-100">
                        {Math.min(
                          ...featureStores.filter((s) => s.active).map((s) => parseInt(s.refreshInterval))
                        )}
                        min
                      </span>
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-[10px] gap-1 border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600"
                >
                  <RefreshCw className="size-3" /> Refresh All
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
