'use client'
import TurndownService from 'turndown'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import React from 'react'
import { generateEmail } from "./actions"
import { Bot } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import useThreads from "@/hooks/use-threads"
import { turndown } from '@/lib/turndown'

type Props = {
    onGenerate: (value: string) => void
    isComposing?: boolean
}

const AIComposeButton = (props: Props) => {
    const [prompt, setPrompt] = React.useState('')
    const [open, setOpen] = React.useState(false)
    const { account, threads, threadId } = useThreads()
    const thread = threads?.find(t => t.id === threadId)
    const aiGenerate = async (prompt: string) => {
        try {
            let context: string | undefined = ''
            if (!props.isComposing) {
                context = thread?.emails.map(m => `Subject: ${m.subject}\nFrom: ${m.from.address}\n\n${turndown.turndown(m.body ?? m.bodySnippet ?? '')}`).join('\n')
            }

            console.log('Generating email with context:', context?.substring(0, 200) + '...')
            console.log('Prompt:', prompt)

            const result = await generateEmail((context || '') + `\n\nMy name is: ${account?.name}\n\n`, prompt)
            
            // Send complete content at once (no streaming)
            if (result.content && result.content.trim()) {
                props.onGenerate(result.content);
            }
        } catch (error) {
            console.error('Error generating email:', error)
            props.onGenerate('Error generating email. Please check your OpenAI API key and try again.')
        }
    }
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <Button onClick={() => setOpen(true)} size='icon' variant={'outline'}>
                    <Bot className="size-5" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>AI Compose</DialogTitle>
                    <DialogDescription>
                        AI will compose an email based on the context of your previous emails.
                    </DialogDescription>
                    <div className="h-2"></div>
                    <Textarea
                        placeholder="What would you like to compose?"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                    />
                    <div className="h-2"></div>
                    <Button onClick={() => { aiGenerate(prompt); setOpen(false); setPrompt('') }}>Generate</Button>
                </DialogHeader>
            </DialogContent>
        </Dialog>

    )
}

export default AIComposeButton