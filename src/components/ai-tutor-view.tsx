'use client'

import { useState, useRef, useEffect } from 'react'
import { Bot, Send, User, Lightbulb, Sparkles, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
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

  const [error, setError] = useState<string | null>(null)

  const handleSend = async (text?: string) => {
    const message = text || input.trim()
    if (!message) return

    setError(null)
    const userMsg: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    try {
      const res = await fetch('/api/ai-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, context }),
      })

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`)
      }

      const data = await res.json()
      const aiMsg: ChatMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.response || 'I apologize, I could not process your request. Please try again.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMsg])
    } catch (err) {
      console.error('AI Tutor fetch error:', err)
      setError('Failed to get a response. Please try again.')
      const errorMsg: ChatMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'I\'m sorry, I encountered an error processing your request. Please try again or ask a different question.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsTyping(false)
    }
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-border mb-3 gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          <h2 className="text-sm font-semibold">AI Tutor</h2>
          <Badge variant="secondary" className="text-[9px]">GPT</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">Context:</span>
          <Select value={context} onValueChange={(v) => setContext(v as Context)}>
            <SelectTrigger className="w-[120px] sm:w-[150px] h-7 text-xs">
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
                  className={`max-w-[90%] sm:max-w-[80%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
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

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-1.5 pt-1 text-destructive text-[10px]">
          <AlertCircle className="size-3" />
          {error}
        </div>
      )}

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
