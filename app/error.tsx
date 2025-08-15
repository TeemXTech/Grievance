"use client"

import { useEffect } from "react"

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  useEffect(() => {
    // Sanitize error before logging
    const sanitizedError = {
      message: error.message?.replace(/[<>"'&]/g, ''),
      stack: error.stack?.replace(/[<>"'&]/g, '')
    }
    console.error("Application error:", sanitizedError)
  }, [error])

  // Sanitize error message for display
  const sanitizedMessage = error.message?.replace(/[<>"'&]/g, '') || 'An unexpected error occurred'

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong!</h2>
        <p className="text-gray-600 mb-4">{sanitizedMessage}</p>
        <button
          onClick={reset}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
