import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { queue } from '@/lib/queue'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const stats = queue.getStats()
    const recentJobs = queue.getJobs().slice(-20)

    return NextResponse.json({
      stats,
      recentJobs: recentJobs.map(job => ({
        id: job.id,
        type: job.type,
        status: job.status,
        attempts: job.attempts,
        createdAt: new Date(job.createdAt).toISOString(),
        processedAt: job.processedAt ? new Date(job.processedAt).toISOString() : null,
      })),
    })
  } catch (error) {
    console.error('Failed to get jobs:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve jobs' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { type, data } = body

    if (!type || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: type, data' },
        { status: 400 }
      )
    }

    const jobId = await queue.add(type, data)

    return NextResponse.json({
      jobId,
      message: 'Job queued successfully',
    })
  } catch (error) {
    console.error('Failed to create job:', error)
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    )
  }
}

