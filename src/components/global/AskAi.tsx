'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles } from 'lucide-react'
import { useLocalStorage } from 'usehooks-ts'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { api } from '@/trpc/react'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface EmailSearchProps {
  isCollapsed: boolean
}

interface DebugData {
  totalEmails: number
  emails: Array<{
    id: string
    subject: string
    from: string
    sentAt: Date
    hasEmbedding: boolean
  }>
}

const ANIMATION_CONFIG = {
  type: "easeOut" as const,
  duration: 0.2,
}

const SUGGESTED_QUERIES = [
  { label: 'Orders', query: 'Show me emails about orders', icon: '📦' },
  { label: 'Flights', query: 'Find my flight bookings', icon: '✈️' },
  { label: 'Meetings', query: 'What meetings do I have coming up?', icon: '📅' },
  { label: 'Payments', query: 'Show receipts and payments', icon: '💰' },
] as const

export default function EmailSearchAssistant({ isCollapsed }: EmailSearchProps) {
  const [accountId] = useLocalStorage('accountId', '')
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const messageContainerRef = useRef<HTMLDivElement>(null)

  const processEmailsMutation = api.account.processEmailsForAI.useMutation({
    onSuccess: () => {
      console.log('Email processing completed successfully')
    },
    onError: (error) => {
      console.error('Email processing failed:', error)
      toast.error('Failed to process emails. Please try again.')
    }
  })

  const { data: debugData } = api.account.debugEmails.useQuery(
    { accountId },
    { enabled: !!accountId }
  )

  const scrollToBottom = useCallback(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTo({
        top: messageContainerRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [])

  const handleAccountConnection = useCallback(async () => {
    try {
      const { getAurinkoAuthUrl } = await import('@/lib/aurinko')
      const url = await getAurinkoAuthUrl('Google')
      window.location.href = url
    } catch (error) {
      toast.error((error as Error).message)
    }
  }, [])

  const sendMessage = useCallback(async (messageText: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: Date.now(),
    }
    
    setMessages(prev => [...prev, newMessage])
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, newMessage],
          accountId,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      }

      setMessages(prev => [...prev, assistantMessage])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        assistantMessage.content += chunk
        
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessage.id 
            ? { ...msg, content: assistantMessage.content }
            : msg
        ))
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [messages, accountId])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      sendMessage(input)
      setInput('')
    }
  }, [input, sendMessage])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }, [])

  const handleQuerySuggestion = useCallback((query: string) => {
    setInput(query)
  }, [])

  const handleProcessEmails = useCallback(() => {
    if (accountId) {
      processEmailsMutation.mutate({ accountId })
    }
  }, [accountId, processEmailsMutation])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  if (isCollapsed) return null

  if (!accountId) {
    return (
      <div className='p-4 mb-14'>
        <div className="h-4" />
        <motion.div 
          className="flex flex-col pb-4 border p-4 rounded-lg bg-white shadow-inner dark:bg-gray-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-4 py-2">
            <Sparkles className='size-6 text-gray-500' />
            <div>
              <p className='text-gray-900 dark:text-gray-100'>No account connected</p>
              <p className='text-gray-500 text-xs dark:text-gray-400'>
                Connect your Google account to get started
              </p>
            </div>
          </div>
          <div className="h-2" />
          <button
            onClick={handleAccountConnection}
            className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 text-white rounded-md text-sm font-medium transition-all hover:shadow-lg hover:shadow-purple-500/50"
          >
            Connect Google Account
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className='p-2 pb-20'>
      <motion.div className="flex flex-col bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-lg shadow-lg max-h-[350px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-purple-500/30">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 rounded flex items-center justify-center">
              <Sparkles className='w-3 h-3 text-white' />
            </div>
            <h3 className="text-xs font-bold text-white">Email Search Assistant</h3>
          </div>
          <div className="w-5 h-5 bg-gradient-to-r from-purple-600 to-amber-400 rounded flex items-center justify-center">
            <span className="text-white text-xs">🚀</span>
          </div>
        </div>

        {/* Messages Area */}
        {messages.length > 0 && (
          <div 
            className="max-h-[150px] overflow-y-auto p-2 border-b border-purple-500/30" 
            ref={messageContainerRef}
          >
            <AnimatePresence mode="wait">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  layout="position"
                  className={cn("z-10 mt-2 break-words rounded-2xl", {
                    'self-end max-w-[250px] bg-white/10 text-white': message.role === 'user',
                    'self-start max-w-[400px] bg-gradient-to-r from-purple-600/20 via-purple-400/20 to-amber-400/20 text-white shadow-lg border border-purple-500/30': message.role === 'assistant',
                  })}
                  layoutId={`container-[${messages.length - 1}]`}
                  transition={ANIMATION_CONFIG}
                >
                  <div className={cn("text-sm leading-[1.4]", {
                    'px-4 py-3 text-white': message.role === 'user',
                    'px-5 py-4 text-white': message.role === 'assistant',
                  })}>
                    {message.role === 'assistant' ? (
                      <div className="space-y-2">
                        <div className="font-medium text-purple-300 mb-2">✨ Assistant</div>
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      </div>
                    ) : (
                      message.content
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Content Area */}
        <div className="p-3 flex-1 overflow-y-auto">
          {messages.length === 0 && (
            <div className="mb-3">
              {/* Description */}
              <div className="text-center mb-3">
                <p className='text-gray-300 text-xs'>
                  Using semantic search to find relevant emails
                </p>
              </div>
              
              {/* Query Suggestions */}
              <div className="grid grid-cols-2 gap-1 mb-3">
                {SUGGESTED_QUERIES.map(({ label, query, icon }) => (
                  <button 
                    key={label}
                    onClick={() => handleQuerySuggestion(query)} 
                    className='px-2 py-1 bg-white/5 hover:bg-gradient-to-r hover:from-purple-600/20 hover:via-purple-400/20 hover:to-amber-400/20 text-white rounded text-xs cursor-pointer transition-all duration-200 flex items-center justify-center gap-1 font-medium border border-purple-500/30 hover:border-purple-500/50'
                  >
                    <span className="text-xs">{icon}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
              
              {/* Process Emails Button */}
              <div className="mb-3">
                <button 
                  onClick={handleProcessEmails}
                  disabled={processEmailsMutation.isPending || !accountId}
                  className='w-full px-2 py-1 bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 hover:shadow-lg hover:shadow-purple-500/50 text-white rounded text-xs cursor-pointer transition-all duration-200 flex items-center justify-center gap-1 font-medium disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <span className="text-xs">🤖</span>
                  {processEmailsMutation.isPending ? 'Processing...' : 'Process Emails for Search'}
                </button>
              </div>

              {/* Debug Information */}
              {debugData && (
                <div className="mb-3 p-2 bg-white/5 border border-purple-500/30 rounded text-xs">
                  <div className="text-purple-300 mb-1">System Status:</div>
                  <div className="text-gray-400 text-xs">
                    Total: {debugData.totalEmails} | Processed: {debugData.emails.filter(e => e.hasEmbedding).length}
                  </div>
                  <div className="text-gray-400 text-xs truncate">
                    Latest: {debugData.emails[0]?.subject || 'None'}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Search Input */}
          <form onSubmit={handleSubmit} className="flex w-full gap-1 mt-auto">
            <div className="flex-1 relative">
              <input
                type="text"
                onChange={handleInputChange}
                value={input}
                className="w-full h-8 rounded-full border border-purple-500/30 bg-white/5 px-2 text-white text-xs outline-none placeholder:text-gray-400 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all duration-200"
                placeholder="Search your emails..."
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              disabled={isLoading || !input.trim()}
            >
              <Send className="w-3 h-3 text-white" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}