'use client'
import React from 'react'
import useThreads from '@/hooks/use-threads'
import { api, type RouterOutputs } from '@/trpc/react'
import { toast } from 'sonner'
import EmailEditor from '../editor/EmailEditor'

const ReplyBox = () => {
    const { threadId, accountId } = useThreads()
    
    const { 
        data: replyDetails, 
        isLoading, 
        error 
    } = api.account.getReplyDetails.useQuery({
        accountId: accountId,
        threadId: threadId || '',
        replyType: 'reply'
    }, {
        enabled: !!accountId && !!threadId
    })
    
    const [subject, setSubject] = React.useState('')
    const [toValues, setToValues] = React.useState<{ label: string, value: string }[]>([])
    const [ccValues, setCcValues] = React.useState<{ label: string, value: string }[]>([])

    const sendEmail = api.account.sendEmail.useMutation()
    
    React.useEffect(() => {
        if (!replyDetails || !threadId) return;

        const newSubject = replyDetails.subject.startsWith('Re:') ? replyDetails.subject : `Re: ${replyDetails.subject}`
        setSubject(newSubject)
        setToValues(replyDetails.to.map((to) => ({ label: to.address ?? to.name, value: to.address })))
        setCcValues(replyDetails.cc.map((cc) => ({ label: cc.address ?? cc.name, value: cc.address })))
    }, [replyDetails, threadId])
    
    // Show loading state
    if (isLoading) {
        return (
            <div className="h-[300px] flex items-center justify-center">
                <div className="text-muted-foreground">Loading reply box...</div>
            </div>
        )
    }
    
    // Show error state
    if (error) {
        return (
            <div className="h-[300px] flex items-center justify-center">
                <div className="text-red-500 text-center">
                    <div className="mb-2">Failed to load reply details</div>
                    <div className="text-sm text-muted-foreground">
                        {error.message || 'Unable to prepare reply'}
                    </div>
                </div>
            </div>
        )
    }
    
    // Show message if no reply details available
    if (!replyDetails) {
        return (
            <div className="h-[300px] flex items-center justify-center">
                <div className="text-muted-foreground text-center">
                    <div className="mb-2">No reply details available</div>
                    <div className="text-sm">Select a thread to reply to</div>
                </div>
            </div>
        )
    }

    const handleSend = async (value: string) => {
        if (!replyDetails) return;
        sendEmail.mutate({
            accountId,
            threadId: threadId ?? undefined,
            body: value,
            subject,
            from: replyDetails.from,
            to: replyDetails.to.map((to) => ({ name: to.name ?? to.address, address: to.address })),
            cc: replyDetails.cc.map((cc) => ({ name: cc.name ?? cc.address, address: cc.address })),
            replyTo: replyDetails.from,
            inReplyTo: replyDetails.id,
        }, {
            onSuccess: () => {
                toast.success("Email sent")
            }
        })
    }

    return (
        <EmailEditor
            toValues={toValues || []}
            ccValues={ccValues}
            onToChange={(values) => {
                setToValues(values)
            }}
            onCcChange={(values) => {
                setCcValues(values || [])
            }}
            subject={subject}
            setSubject={setSubject}
            to={toValues.map(to => to.value).filter(Boolean)}
            handleSend={handleSend}
            isSending={sendEmail.isPending}
        />
    )
}

export default ReplyBox