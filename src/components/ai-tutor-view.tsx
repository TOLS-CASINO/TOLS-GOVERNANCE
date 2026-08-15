'use client'

import { useState, useRef, useEffect } from 'react'
import { Bot, Send, User, Lightbulb, MessageSquare, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface ChatMessage {
  id: number
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

type Context = 'financial' | 'player' | 'promotion' | 'general'

const contextLabels: Record<Context, string> = {
  financial: 'Financial',
  player: 'Player Intelligence',
  promotion: 'Promotions',
  general: 'General',
}

const suggestedQuestions: Record<Context, string[]> = {
  financial: [
    'What is the current waterfall distribution?',
    'Show me escrow settlement status',
    'Explain the variance alerts',
    'What is the net house edge today?',
  ],
  player: [
    'Who are the top 5 VIP players?',
    'What is the average churn risk?',
    'Show players with high churn risk',
    'Segment distribution summary',
  ],
  promotion: [
    'Which promotion has the best ROI?',
    'Active bonus codes summary',
    'What are the wagering requirements?',
    'Show promotion conversion rates',
  ],
  general: [
    'Give me a platform health summary',
    'What needs my attention today?',
    'Explain the Waterfall Protocol',
    'How does the Escrow Engine work?',
  ],
}

// Simulated AI responses
const aiResponses: Record<string, string> = {
  'What is the current waterfall distribution?': 'The current revenue waterfall distributes gross revenue as follows:\n\n• **Payment Processing**: 3.5% ($149K)\n• **Game Providers**: 15.0% ($639K)\n• **Affiliate Commission**: 8.0% ($341K)\n• **Platform Fee**: 5.0% ($213K)\n• **Regulatory Reserve**: 4.0% ($170K)\n• **Tax Obligations**: 12.0% ($511K)\n• **Net Operator Revenue**: 52.5% ($2.24M)\n\nThe net operator revenue is tracking **2.8% below** the budgeted target for this period.',
  'Who are the top 5 VIP players?': 'Based on LTV, the top 5 VIP players are:\n\n1. **HighRoller_X** — LTV: $42,850 | VIP 5 | Segment: VIP Elite\n2. **CasinoKing99** — LTV: $38,200 | VIP 5 | Segment: High Value\n3. **DiamondPete** — LTV: $31,400 | VIP 4 | Segment: VIP Elite\n4. **MaxBet_Mike** — LTV: $28,900 | VIP 4 | Segment: High Value\n5. **GoldRush_** — LTV: $24,600 | VIP 5 | Segment: VIP Elite\n\nAll 5 have dedicated account managers and custom RG limits.',
  'Which promotion has the best ROI?': 'The **Welcome Bonus 100%** has the highest ROI at **285%**, with 4,520 claims and 1,890 conversions. Here\'s the full ranking:\n\n1. Welcome Bonus 100% — 285% ROI\n2. Monday Reload 50% — 120% ROI\n3. Weekend Free Spins — 142% ROI\n4. 10% Cashback VIP — 95% ROI\n\nThe Spring Frenzy 200% is scheduled and hasn\'t launched yet.',
  'Give me a platform health summary': '🟢 **Platform Health: Good**\n\n• **Revenue**: $4.26M GGR (5.4% below budget)\n• **Active Players**: 12,847 (+5.1% trend)\n• **Escrow**: All accounts active, 2 pending settlements\n• **Critical Alerts**: 2 (GGR variance, EUR settlement delay)\n• **Affiliates**: 8 active, $165K total commissions\n• **Promotions**: 3 active, top ROI: 285%\n\n⚠️ **Action Items**: Review GGR variance, expedite EUR settlement, check VIP churn uptick.',
}

function getAIResponse(message: string): string {
  // Check for exact matches first
  if (aiResponses[message]) return aiResponses[message]
  // Check for partial matches
  for (const key of Object.keys(aiResponses)) {
    if (message.toLowerCase().includes(key.toLowerCase().slice(0, 20))) return aiResponses[key]
  }
  // Default response
  return `I've analyzed your query about "${message.slice(0, 50)}..."\n\nBased on the current platform data, here are my insights:\n\n• The relevant metrics are tracking within normal parameters\n• I recommend reviewing the detailed view in the corresponding section for more granular data\n• No immediate action items flagged for this specific area\n\nWould you like me to drill deeper into any specific aspect?`
}

export function AiTutorView() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: 'assistant',
      content: 'Welcome to the TOLS AI Tutor! 🎰\n\nI can help you understand your casino operations, analyze financial data, review player intelligence, and optimize promotions. Select a context above and ask me anything.',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [context, setContext] = useState<Context>('general')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const handleSend = (text?: string) => {
    const message = text || input.trim()
    if (!message) return

    const userMsg: ChatMessage = {
      id: messages.length + 1,
      role: 'user',
      content: message,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: messages.length + 2,
        role: 'assistant',
        content: getAIResponse(message),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMsg])
      setIsTyping(false)
    }, 800 + Math.random() * 1200)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] min-h-[500px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          <h2 className="text-sm font-semibold">AI Tutor</h2>
          <Badge variant="secondary" className="text-[9px]">GPT</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">Context:</span>
          <Select value={context} onValueChange={(v) => setContext(v as Context)}>
            <SelectTrigger className="w-[150px] h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="financial">💰 Financial</SelectItem>
              <SelectItem value="player">👤 Player Intelligence</SelectItem>
              <SelectItem value="promotion">🎁 Promotions</SelectItem>
              <SelectItem value="general">🌐 General</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Suggested Questions */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2 no-scrollbar">
        {suggestedQuestions[context].map((q) => (
          <Button
            key={q}
            variant="outline"
            size="sm"
            className="text-[10px] h-6 whitespace-nowrap shrink-0 gap-1"
            onClick={() => handleSend(q)}
          >
            <Lightbulb className="size-3 text-primary" />
            {q}
          </Button>
        ))}
      </div>

      {/* Chat Messages */}
      <Card className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollRef}>
          <CardContent className="p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <Avatar className="size-7 shrink-0 mt-0.5">
                    <AvatarFallback className="bg-primary/20 text-primary text-[10px]">
                      <Bot className="size-3.5" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/80 text-foreground'
                  }`}
                >
                  {msg.content.split('\n').map((line, i) => {
                    // Simple markdown-like rendering
                    if (line.startsWith('• ')) {
                      return <p key={i} className="ml-2">• {line.slice(2)}</p>
                    }
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return <p key={i} className="font-bold">{line.slice(2, -2)}</p>
                    }
                    // Bold inline
                    const parts = line.split(/(\*\*.*?\*\*)/g)
                    return (
                      <p key={i}>
                        {parts.map((part, j) => {
                          if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={j}>{part.slice(2, -2)}</strong>
                          }
                          return <span key={j}>{part}</span>
                        })}
                      </p>
                    )
                  })}
                </div>
                {msg.role === 'user' && (
                  <Avatar className="size-7 shrink-0 mt-0.5">
                    <AvatarFallback className="bg-muted text-muted-foreground text-[10px]">
                      <User className="size-3.5" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2.5 items-start">
                <Avatar className="size-7 shrink-0">
                  <AvatarFallback className="bg-primary/20 text-primary text-[10px]">
                    <Bot className="size-3.5" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted/80 rounded-xl px-4 py-3">
                  <div className="flex gap-1">
                    <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
                    <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
                    <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </ScrollArea>
      </Card>

      {/* Input Area */}
      <div className="flex gap-2 pt-3 mt-2">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Ask about ${contextLabels[context].toLowerCase()}...`}
          className="flex-1 h-9 text-xs"
          disabled={isTyping}
        />
        <Button
          size="sm"
          onClick={() => handleSend()}
          disabled={!input.trim() || isTyping}
          className="gap-1 text-xs h-9"
        >
          <Send className="size-3" />
          Send
        </Button>
      </div>
    </div>
  )
}
