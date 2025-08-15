import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { generateText, generateSQL } from '../../../../lib/ollama'
import { queryDB } from '../../../../lib/db'
import { SCHEMA_HINT, isSqlSafe } from '../../../../lib/schema'
import { saveExcel, savePDF, savePPT, saveChartImage } from '../../../../lib/reports'

const Body = z.object({
  question: z.string(),
  format: z.enum(['text','excel','pdf','ppt']).optional(),
  chart: z.boolean().optional(),
  compare: z.boolean().optional()
})

function summarizeRows(rows: any[], max = 5) {
  if (!rows.length) return 'No results.';
  const keys = Object.keys(rows[0]);
  const sample = rows.slice(0, max);
  return `Columns: ${keys.join(', ')}\nSample:\n${sample.map(r=>JSON.stringify(r)).join('\n')}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, format='text', chart=false, compare=false } = Body.parse(body)

    // 1) Turn question into SQL
    const sql = await generateSQL(question, SCHEMA_HINT)

    if (!isSqlSafe(sql)) {
      return NextResponse.json({ error: 'Unsafe or invalid SQL generated', sql }, { status: 400 })
    }

    // 2) Execute SQL
    const rows = await queryDB(sql)

    // 3) Optional comparisons
    let compareSummary: any = null
    if (compare && rows.length && 'district' in rows[0]) {
      const byDistrict: Record<string, number> = {}
      rows.forEach((r: any) => {
        const d = String(r.district ?? 'Unknown')
        byDistrict[d] = (byDistrict[d] ?? 0) + 1
      })
      compareSummary = byDistrict
    }

    // 4) Create chart if requested
    let chartPath: string | undefined
    if (chart && rows.length) {
      const keys = Object.keys(rows[0])
      const catKey = ['district','department','status','category'].find(k => keys.includes(k)) || keys[0]
      const counts: Record<string, number> = {}
      rows.forEach((r:any) => {
        const k = String(r[catKey] ?? 'Unknown')
        counts[k] = (counts[k] ?? 0) + 1
      })
      const labels = Object.keys(counts)
      const values = Object.values(counts)
      chartPath = await saveChartImage(`chart_${Date.now()}.png`, labels, values, `Counts by ${catKey}`)
    }

    // 5) Natural language answer from local LLM
    const nlPrompt = `
You are a government MIS assistant. Using ONLY the data summary below, write a precise answer for the Minister in concise bullet points. If comparisons exist, include them.
Question: ${question}
Data Summary:
${summarizeRows(rows)}
${compareSummary ? `Comparisons:\n${JSON.stringify(compareSummary, null, 2)}` : ''}

Keep it short, factual, and actionable.`
    const answer = await generateText(nlPrompt)

    // 6) File outputs
    let fileUrl: string | null = null
    if (format === 'excel') {
      fileUrl = await saveExcel(`report_${Date.now()}.xlsx`, rows, 'Report')
    } else if (format === 'pdf') {
      fileUrl = await savePDF(`report_${Date.now()}.pdf`, 'Report', rows, chartPath)
    } else if (format === 'ppt') {
      fileUrl = await savePPT(`report_${Date.now()}.pptx`, 'Report', rows, chartPath)
    }

    return NextResponse.json({
      ok: true,
      sql,
      rows: rows.slice(0, 50),
      answer,
      compareSummary,
      chartPath,
      fileUrl
    })
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 })
  }
}