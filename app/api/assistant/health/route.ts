import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  // Check Gemini
  let geminiStatus = 'unconfigured'
  if (process.env.GEMINI_API_KEY) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`,
        { method: 'GET' }
      )
      geminiStatus = res.ok ? 'connected' : 'error'
    } catch {
      geminiStatus = 'unreachable'
    }
  }

  // Check DB
  let dbStatus = 'connected'
  try {
    await prisma.$queryRaw`SELECT 1`
  } catch {
    dbStatus = 'disconnected'
  }

  return NextResponse.json({
    status: geminiStatus === 'connected' && dbStatus === 'connected' ? 'healthy' : 'degraded',
    services: { gemini: geminiStatus, database: dbStatus },
    timestamp: new Date().toISOString(),
  })
}
