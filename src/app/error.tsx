'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gradient-to-br from-purple-900/20 to-amber-900/20 border border-purple-500/30 rounded-2xl p-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="p-4 bg-red-500/20 rounded-full">
            <AlertCircle className="w-12 h-12 text-red-400" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">
          Something went wrong!
        </h1>

        <p className="text-gray-400 mb-6">
          We encountered an unexpected error. Please try again.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-purple-400 hover:text-purple-300 mb-2">
              Error Details (Development Only)
            </summary>
            <div className="bg-black/50 p-4 rounded-lg overflow-auto max-h-48">
              <p className="text-red-400 text-sm font-mono break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-gray-500 text-xs mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          </details>
        )}

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>

          <Link href="/">
            <button className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all border border-purple-500/30">
              <Home className="w-4 h-4" />
              Go Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

