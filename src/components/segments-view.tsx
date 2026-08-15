'use client'

import { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Users, Palette, Plus, Filter, X, AlertCircle, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useSegments } from '@/hooks/use-segments'

const SEGMENT_COLORS = ['#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#f97316', '#14b8a6']

const fmt = (n: number) => `$${n.toLocaleString('en-US')}`

export function SegmentsView() {
  const { data: segmentsData, loading, error, refetch } = useSegments()
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newColor, setNewColor] = useState(SEGMENT_COLORS[0])

  // Map API data to UI format, keeping any locally-added segments
  const segments = (segmentsData || []).map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description || '',
    color: s.color || SEGMENT_COLORS[0],
    playerCount: s.playerCount,
    isDynamic: s.isDynamic,
    rules: s.rules,
  }))

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}><CardContent className="p-6"><Skeleton className="h-32 w-full" /></CardContent></Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive/40">
        <CardContent className="p-6 text-center">
          <AlertCircle className="size-8 text-destructive mx-auto mb-2" />
          <p className="text-sm font-medium text-destructive">Failed to load segments</p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
          <Button variant="outline" size="sm" className="mt-3 gap-1" onClick={refetch}>
            <RefreshCw className="size-3" /> Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  const handleCreate = () => {
    if (!newName.trim()) return
    // This would need an API call to persist; for now just visual feedback
    setNewName('')
    setNewDesc('')
    setNewColor(SEGMENT_COLORS[0])
  }

  const pieData = segments.map((s) => ({ name: s.name, value: s.playerCount, color: s.color }))

  return (
    <div className="space-y-4">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Player Segments</h2>
          <p className="text-xs text-muted-foreground">{segments.length} segments · {segments.reduce((a, s) => a + s.playerCount, 0).toLocaleString()} total players</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1 text-xs">
              <Plus className="size-3" /> New Segment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Segment</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium mb-1 block">Name</label>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Segment name" className="h-9 text-xs" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Description</label>
                <Textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Describe this segment..." className="text-xs min-h-[60px]" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Color</label>
                <div className="flex gap-2">
                  {SEGMENT_COLORS.map((c) => (
                    <button
                      key={c}
                      className="size-6 rounded-full border-2 transition-all"
                      style={{ backgroundColor: c, borderColor: newColor === c ? 'white' : 'transparent' }}
                      onClick={() => setNewColor(c)}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost" size="sm" className="text-xs">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button size="sm" className="text-xs" onClick={handleCreate}>Create</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Segment Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {segments.map((segment) => (
          <Card key={segment.id} className="relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: segment.color }} />
            <CardContent className="p-5 pt-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full" style={{ backgroundColor: segment.color }} />
                    <h3 className="text-sm font-semibold">{segment.name}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{segment.description || 'No description'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="text-center p-2 rounded-lg bg-muted/50">
                  <p className="text-lg font-bold">{segment.playerCount.toLocaleString()}</p>
                  <p className="text-[9px] text-muted-foreground uppercase">Players</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-muted/50">
                  <Badge variant={segment.isDynamic ? 'default' : 'secondary'} className="text-[9px]">
                    {segment.isDynamic ? 'Dynamic' : 'Static'}
                  </Badge>
                  <p className="text-[9px] text-muted-foreground uppercase mt-1">Type</p>
                </div>
              </div>

              {/* Filter Rules */}
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Filter className="size-3" /> Filter Rules
                </p>
                <div className="p-2 rounded bg-muted/30 text-[10px] font-mono text-muted-foreground max-h-16 overflow-y-auto">
                  {segment.rules || 'No rules defined'}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Distribution Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Segment Distribution</CardTitle>
          <CardDescription>Player count by segment</CardDescription>
        </CardHeader>
        <CardContent>
          {pieData.length > 0 ? (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <ResponsiveContainer width={240} height={240}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50}>
                    {pieData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => value.toLocaleString()}
                    contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {pieData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2 text-xs">
                    <div className="size-3 rounded-sm shrink-0" style={{ backgroundColor: entry.color }} />
                    <span className="flex-1">{entry.name}</span>
                    <span className="font-mono font-medium">{entry.value.toLocaleString()}</span>
                    <span className="text-muted-foreground">
                      ({pieData.reduce((a, b) => a + b.value, 0) > 0 ? ((entry.value / pieData.reduce((a, b) => a + b.value, 0)) * 100).toFixed(1) : '0'}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-8">No segments available</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
