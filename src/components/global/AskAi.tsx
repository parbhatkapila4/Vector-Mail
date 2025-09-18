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
        <div className='p-4 mb-14'>

            {/* <PremiumBanner /> */}
            <div className="h-4"></div>
            <motion.div className="flex flex-col pb-4 border p-4 rounded-lg bg-white shadow-inner dark:bg-gray-800">
                <div className="max-h-[50vh] overflow-y-scroll w-full flex flex-col gap-2" id='message-container'>
                    <AnimatePresence mode="wait">
                        {messages.map((message: any) => (
                            <motion.div
                                key={message.id}
                                layout="position"
                                className={cn("z-10 mt-2 break-words rounded-2xl", {
                                    'self-end max-w-[250px] bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100': message.role === 'user',
                                    'self-start max-w-[400px] bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg': message.role === 'assistant',
                                })}
                                layoutId={`container-[${messages.length - 1}]`}
                                transition={transitionDebug as any}
                            >
                                <div className={cn("text-[15px] leading-[1.4]", {
                                    'px-4 py-3 text-gray-900 dark:text-gray-100': message.role === 'user',
                                    'px-5 py-4 text-white': message.role === 'assistant',
                                })}>
                                    {message.role === 'assistant' ? (
                                        <div className="space-y-2">
                                            <div className="font-medium text-blue-100 mb-2">✨ AI Assistant</div>
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
                {messages.length > 0 && <div className="h-4"></div>}
                <div className="w-full">
                    {messages.length === 0 && <div className="mb-4">
                        <div className='flex items-center gap-4  py-2'>
                            <SparklesIcon className='size-6 text-gray-500' />
                            <div>
                                <p className='text-gray-900 dark:text-gray-100'>Ask AI anything about your emails</p>
                                <p className='text-gray-500 text-xs dark:text-gray-400'>Get answers to your questions about your emails</p>
                            </div>
                        </div>
                        <div className="h-2"></div>
                        <div className="flex items-center gap-2  flex-wrap">
                            <span onClick={() => setInput('What can I ask?')} className='px-2 py-1 bg-gray-800 text-gray-200 rounded-md text-xs cursor-pointer'>What can I ask?</span>
                            <span onClick={() => setInput('When is my next flight?')} className='px-2 py-1 bg-gray-800 text-gray-200 rounded-md text-xs cursor-pointer'>When is my next flight?</span>
                            <span onClick={() => setInput('When is my next meeting?')} className='px-2 py-1 bg-gray-800 text-gray-200 rounded-md text-xs cursor-pointer'>When is my next meeting?</span>
                        </div>
                    </div>
                    }
                    <form onSubmit={handleSubmit} className="flex w-full gap-2">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                onChange={handleInputChange}
                                value={input}
                                className="w-full h-9 placeholder:text-[13px] rounded-full border border-gray-200 bg-white px-3 text-[15px] outline-none placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-blue-500/20 focus-visible:ring-offset-1
                dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 dark:focus-visible:ring-blue-500/20 dark:focus-visible:ring-offset-1 dark:focus-visible:ring-offset-gray-700
                "
                                placeholder="Ask AI anything about your emails"
                            />
                            <motion.div
                                key={messages.length}
                                layout="position"
                                className="pointer-events-none absolute z-10 flex h-9 w-[250px] items-center overflow-hidden break-words rounded-full  [word-break:break-word] dark:bg-gray-800"
                                layoutId={`container-[${messages.length}]`}
                                transition={transitionDebug as any}
                                initial={{ opacity: 0.6, zIndex: -1 }}
                                animate={{ opacity: 0.6, zIndex: -1 }}
                                exit={{ opacity: 1, zIndex: 1 }}
                            >
                                <div className="px-3 py-2 text-[15px] leading-[15px] text-white dark:text-gray-100">
                                    {input}
                                </div>
                            </motion.div>
                        </div>
                        <button
                            type="submit"
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                            disabled={isLoading || !input.trim()}
                        >
                            <Send className="size-4 text-white" />
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    )
}

export default AskAI