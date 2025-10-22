'use client'
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button'
import { AnimatePresence } from 'framer-motion';
import React from 'react'
import { Send } from 'lucide-react';
import { useLocalStorage } from 'usehooks-ts';
import { cn } from '@/lib/utils';
import { SparklesIcon } from '@heroicons/react/24/solid';
// import StripeButton from './stripe-button';
// import PremiumBanner from './premium-banner';
import { toast } from 'sonner';


const transitionDebug = {
    type: "easeOut",
    duration: 0.2,
};
const AskAI = ({ isCollapsed }: { isCollapsed: boolean }) => {
    const [accountId] = useLocalStorage('accountId', '')
    const [input, setInput] = React.useState('')
    const [messages, setMessages] = React.useState<any[]>([])
    const [isLoading, setIsLoading] = React.useState(false)

    const sendMessage = async (message: { text: string }) => {
        const newMessage = {
            id: Date.now().toString(),
            role: 'user' as const,
            content: message.text,
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

            let assistantMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant' as const,
                content: '',
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
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (input.trim()) {
            sendMessage({ text: input })
            setInput('')
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value)
    }
    React.useEffect(() => {
        const messageContainer = document.getElementById("message-container");
        if (messageContainer) {
            messageContainer.scrollTo({
                top: messageContainer.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages]);


    if (isCollapsed) return null;

    if (!accountId) {
        return (
            <div className='p-4 mb-14'>
                <div className="h-4"></div>
                <motion.div className="flex flex-col pb-4 border p-4 rounded-lg bg-white shadow-inner dark:bg-gray-800">
                    <div className="flex items-center gap-4 py-2">
                        <SparklesIcon className='size-6 text-gray-500' />
                        <div>
                            <p className='text-gray-900 dark:text-gray-100'>No account connected</p>
                            <p className='text-gray-500 text-xs dark:text-gray-400'>Connect your Google account to get started</p>
                        </div>
                    </div>
                    <div className="h-2"></div>
                    <button
                        onClick={async () => {
                            try {
                                const { getAurinkoAuthUrl } = await import('@/lib/aurinko')
                                const url = await getAurinkoAuthUrl('Google')
                                window.location.href = url
                            } catch (error) {
                                toast.error((error as Error).message)
                            }
                        }}
                        className="w-full px-4 py-2 bg-black text-white rounded-md text-sm font-medium transition-colors duration-200"
                    >
                        Connect Google Account
                    </button>
                </motion.div>
            </div>
        )
    }

    return (
        <div className='p-3 pb-20'>
            <motion.div className="flex flex-col bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-lg shadow-lg">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-[#C2847A] to-[#D4A896] rounded-md flex items-center justify-center">
                            <SparklesIcon className='w-4 h-4 text-black' />
                        </div>
                        <h3 className="text-sm font-bold text-white">AI-Powered Email Search</h3>
                    </div>
                    <div className="w-6 h-6 bg-red-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-xs font-bold">🚀</span>
                    </div>
                </div>

                {/* Messages Area */}
                {messages.length > 0 && (
                    <div className="max-h-[200px] overflow-y-auto p-3 border-b border-gray-700" id='message-container'>
                        <AnimatePresence mode="wait">
                            {messages.map((message: any) => (
                                <motion.div
                                    key={message.id}
                                    layout="position"
                                    className={cn("z-10 mt-2 break-words rounded-2xl", {
                                        'self-end max-w-[250px] bg-gray-700 text-white': message.role === 'user',
                                        'self-start max-w-[400px] bg-gradient-to-br from-[#C2847A] to-[#D4A896] text-black shadow-lg': message.role === 'assistant',
                                    })}
                                    layoutId={`container-[${messages.length - 1}]`}
                                    transition={transitionDebug as any}
                                >
                                    <div className={cn("text-sm leading-[1.4]", {
                                        'px-4 py-3 text-white': message.role === 'user',
                                        'px-5 py-4 text-black': message.role === 'assistant',
                                    })}>
                                        {message.role === 'assistant' ? (
                                            <div className="space-y-2">
                                                <div className="font-medium text-black/80 mb-2">✨ AI Assistant</div>
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
                <div className="p-4">
                    {messages.length === 0 && (
                        <div className="mb-4">
                            {/* Description */}
                            <div className="text-center mb-4">
                                <p className='text-gray-300 text-xs'>Using RAG + Vector Search to find relevant emails</p>
                            </div>
                            
                            {/* Category Suggestions */}
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                <button 
                                    onClick={() => setInput('Show me emails about orders')} 
                                    className='px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md text-xs cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 font-medium border border-gray-600'
                                >
                                    <span className="text-sm">📦</span>
                                    <span>Orders</span>
                                </button>
                                <button 
                                    onClick={() => setInput('Find my flight bookings')} 
                                    className='px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md text-xs cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 font-medium border border-gray-600'
                                >
                                    <span className="text-sm">✈️</span>
                                    <span>Flights</span>
                                </button>
                                <button 
                                    onClick={() => setInput('What meetings do I have coming up?')} 
                                    className='px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md text-xs cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 font-medium border border-gray-600'
                                >
                                    <span className="text-sm">📅</span>
                                    <span>Meetings</span>
                                </button>
                                <button 
                                    onClick={() => setInput('Show receipts and payments')} 
                                    className='px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md text-xs cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 font-medium border border-gray-600'
                                >
                                    <span className="text-sm">💰</span>
                                    <span>Payments</span>
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {/* Search Input */}
                    <form onSubmit={handleSubmit} className="flex w-full gap-2">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                onChange={handleInputChange}
                                value={input}
                                className="w-full h-9 rounded-full border border-gray-600 bg-gray-700 px-3 text-white text-xs outline-none placeholder:text-gray-400 focus:border-[#C2847A] focus:ring-1 focus:ring-[#C2847A]/20 transition-all duration-200"
                                placeholder="Search your emails with AI..."
                            />
                        </div>
                        <button
                            type="submit"
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-[#C2847A] to-[#D4A896] hover:from-[#D4A896] hover:to-[#C2847A] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-md"
                            disabled={isLoading || !input.trim()}
                        >
                            <Send className="w-4 h-4 text-black" />
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    )
}

export default AskAI