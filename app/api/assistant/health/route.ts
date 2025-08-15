import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check Ollama connection
    let ollamaStatus = 'disconnected'
    try {
      const response = await fetch('http://localhost:11434/api/tags', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      ollamaStatus = response.ok ? 'connected' : 'error'
    } catch {
      ollamaStatus = 'disconnected'
    }

    // Check database connection (mock for now)
    const dbStatus = 'connected'

    return NextResponse.json({
      status: 'healthy',
      services: {
        ollama: ollamaStatus,
        database: dbStatus
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: 'Health check failed'
    }, { status: 500 })
  }
}