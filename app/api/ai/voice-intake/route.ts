import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser, hasRole } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'

// Extract structured petition data from free-form speech transcript
// Works for Telugu-transliterated English, Hindi-English mix, and pure English
function extractFromTranscript(text: string) {
  const t = text.toLowerCase()

  // Name patterns: "my name is X", "naa peru X", "naam X", "I am X"
  const namePatterns = [
    /(?:my name is|i am|naam|naa peru|name)\s+([a-z\s]{2,30}?)(?:\s+from|\s+village|\s+mandal|,|\.)/i,
    /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})\s+(?:from|village)/i,
  ]
  let applicantName = ''
  for (const p of namePatterns) {
    const m = text.match(p)
    if (m) { applicantName = m[1].trim(); break }
  }

  // Phone: 10-digit number
  const phoneMatch = text.match(/\b([6-9]\d{9})\b/)
  const applicantPhone = phoneMatch ? phoneMatch[1] : ''

  // Village
  const villagePatterns = [
    /(?:village|gram|palli|pally|nagar|puram|pet|peta|wada|wadi)\s+(?:is\s+)?([a-z\s]{2,25}?)(?:\s+mandal|\s+district|,|\.)/i,
    /from\s+([a-z\s]{2,20}?)\s+(?:village|gram|mandal)/i,
  ]
  let villageName = ''
  for (const p of villagePatterns) {
    const m = text.match(p)
    if (m) { villageName = m[1].trim(); break }
  }

  // Mandal
  const mandalMatch = text.match(/(?:mandal|taluk)\s+(?:is\s+)?([a-z\s]{2,20}?)(?:\s+district|,|\.)/i)
  const mandalName = mandalMatch ? mandalMatch[1].trim() : ''

  // Type detection
  let type = 'PERSONAL_GRIEVANCE'
  let title = ''

  if (/medical|hospital|surgery|operation|cancer|heart|kidney|treatment|medicine|doctor|health|cmrf/i.test(t)) {
    type = 'CMRF_MEDICAL'
    const hospitalMatch = text.match(/(?:at|in)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})\s+(?:hospital|medical)/i)
    const conditionMatch = text.match(/(?:suffering from|diagnosed with|has|for)\s+([a-z\s]{3,30}?)(?:\s+surgery|\s+treatment|,|\.)/i)
    title = `Medical assistance${conditionMatch ? ' - ' + conditionMatch[1] : ''}${hospitalMatch ? ' at ' + hospitalMatch[1] : ''}`
  } else if (/transfer|posting|deputation|badi|badli/i.test(t)) {
    type = 'EMPLOYEE_TRANSFER'
    title = 'Employee transfer request'
  } else if (/job|employment|work|naukri|rojgar|vacancy|appointment/i.test(t)) {
    type = 'JOB_EMPLOYMENT'
    title = 'Job/employment assistance'
  } else if (/road|water|electricity|school|drainage|light|pipe|bridge|panchayat/i.test(t)) {
    type = 'PERSONAL_GRIEVANCE'
    const issueMatch = text.match(/(?:road|water|electricity|school|drainage|light|pipe|bridge)/i)
    title = issueMatch ? `${issueMatch[0]} issue in village` : 'Village infrastructure issue'
  } else if (/pension|ration|card|certificate|land|patta|aadhar|scheme/i.test(t)) {
    type = 'PERSONAL_GRIEVANCE'
    title = 'Government scheme / document issue'
  }

  if (!title) title = text.length > 80 ? text.substring(0, 80) + '...' : text

  // Priority detection
  let priority = 'MEDIUM'
  if (/urgent|emergency|critical|dying|serious|immediately|asap/i.test(t)) priority = 'URGENT'
  else if (/important|soon|quickly|fast/i.test(t)) priority = 'HIGH'

  // Amount for medical
  const amountMatch = text.match(/(?:rs\.?|rupees?|₹)\s*(\d[\d,]*)/i)
  const requestedAmount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : null

  // Hospital name
  const hospitalMatch = text.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})\s+(?:hospital|medical college|institute)/i)
  const hospitalName = hospitalMatch ? hospitalMatch[1] : ''

  return {
    applicantName: applicantName || '',
    applicantPhone,
    villageName,
    mandalName,
    type,
    title,
    priority,
    requestedAmount,
    hospitalName,
    description: text,
    confidence: [applicantName, applicantPhone, villageName].filter(Boolean).length,
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasRole(user, 'PA', 'BACK_OFFICER', 'ADMIN', 'MINISTER')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { transcript, lang = 'en' } = await req.json()
  if (!transcript?.trim()) {
    return NextResponse.json({ error: 'transcript is required' }, { status: 400 })
  }

  const extracted = extractFromTranscript(transcript)

  // Check for duplicate by phone if extracted
  let duplicate = null
  if (extracted.applicantPhone) {
    duplicate = await prisma.petitionRequest.findFirst({
      where: {
        applicantPhone: extracted.applicantPhone,
        status: { notIn: ['RESOLVED', 'SANCTIONED', 'CLOSED', 'REJECTED'] },
      },
      select: { trackingNumber: true, type: true, status: true, createdAt: true },
    })
  }

  return NextResponse.json({
    success: true,
    extracted,
    duplicate: duplicate ? {
      found: true,
      trackingNumber: duplicate.trackingNumber,
      type: duplicate.type,
      status: duplicate.status,
      daysAgo: Math.floor((Date.now() - new Date(duplicate.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
    } : { found: false },
  })
}
