import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth-middleware"
import { sanitizeInput } from "@/lib/input-sanitizer"
import { sendWhatsApp } from "@/lib/whatsapp-sender"
import { askGemini } from "@/lib/gemini"

const WEBHOOK_SECRET = process.env.WHATSAPP_WEBHOOK_SECRET
const MANUAL_ROLES   = ["PA", "ADMIN", "BACK_OFFICER"]

// ─── AI-powered message understanding ────────────────────────────────────────
// Handles Telugu, Hindi, Urdu, English, and any mix.
interface ParsedMessage {
  language: string       // te | hi | ur | en | mixed
  languageName: string   // Telugu | Hindi | Urdu | English | Mixed
  category: string       // GrievanceCategory enum value
  priority: "URGENT" | "HIGH" | "MEDIUM"
  applicantName: string
  villageName: string
  mandalName: string
  issue: string          // one-line English summary
  replyMessage: string   // reply in the SAME language as input
}

const FALLBACK: ParsedMessage = {
  language: "en", languageName: "English", category: "OTHER",
  priority: "MEDIUM", applicantName: "", villageName: "", mandalName: "",
  issue: "", replyMessage: "",
}

async function parseMessageWithAI(message: string, referenceNumber: string): Promise<ParsedMessage> {
  const prompt = `You are processing a WhatsApp message sent to a government Minister's office in Telangana, India.
The message may be in Telugu (తెలుగు), Hindi (हिंदी), Urdu (اردو), English, or a mix.

Message: "${message}"

Return ONLY a valid JSON object with these exact fields:
{
  "language": "te" | "hi" | "ur" | "en" | "mixed",
  "languageName": "Telugu" | "Hindi" | "Urdu" | "English" | "Mixed",
  "category": one of: HEALTH | JOBS | CIVIL_WORK | EDUCATION | AGRICULTURE | INFRASTRUCTURE | SOCIAL_WELFARE | TTD_SERVICES | PUBLIC_SERVICES | OTHER,
  "priority": "URGENT" | "HIGH" | "MEDIUM",
  "applicantName": extracted name or empty string,
  "villageName": extracted village name or empty string,
  "mandalName": extracted mandal name or empty string,
  "issue": one-line English summary of the problem,
  "replyMessage": short acknowledgement in the SAME language/script as the input confirming reference ${referenceNumber} and that the team will follow up
}

Rules:
- priority URGENT if message mentions death, accident, emergency, fire, flood, hospital surgery, or equivalent in any language
- HEALTH for medical/hospital, CIVIL_WORK for roads/drainage/water/construction, INFRASTRUCTURE for electricity, EDUCATION for school/college, AGRICULTURE for farming/crops, SOCIAL_WELFARE for pension/ration/scheme, JOBS for employment
- replyMessage must use the same script as input (Telugu script for Telugu, Devanagari for Hindi, Arabic script for Urdu)
- Return ONLY the JSON. No explanation. No markdown fences.`

  try {
    const raw     = await askGemini(prompt)
    const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim()
    const parsed  = JSON.parse(cleaned)
    if (!parsed.category || !parsed.priority || !parsed.replyMessage) throw new Error("incomplete")
    return { ...FALLBACK, ...parsed }
  } catch {
    return buildFallbackParse(message, referenceNumber)
  }
}

// ─── Keyword fallback (English only, used when Gemini is unavailable) ─────────
const CATEGORY_KEYWORDS: { category: string; keywords: string[] }[] = [
  { category: "HEALTH",         keywords: ["hospital", "doctor", "medicine", "health", "medical", "ambulance", "treatment"] },
  { category: "CIVIL_WORK",     keywords: ["water", "borewell", "tap", "pipeline", "road", "pothole", "bridge", "drain", "drainage", "construction", "toilet"] },
  { category: "INFRASTRUCTURE", keywords: ["electricity", "light", "power", "current", "transformer"] },
  { category: "EDUCATION",      keywords: ["school", "teacher", "college", "education", "student", "scholarship"] },
  { category: "AGRICULTURE",    keywords: ["farm", "crop", "agriculture", "rytu", "irrigation", "seed", "fertilizer"] },
  { category: "SOCIAL_WELFARE", keywords: ["pension", "ration", "welfare", "scheme", "benefit", "subsidy", "aadhar"] },
  { category: "JOBS",           keywords: ["job", "employment", "nrega", "mnrega", "salary"] },
]
const URGENT_KEYWORDS = ["urgent", "emergency", "critical", "death", "died", "accident", "fire", "flood", "immediate"]

function buildFallbackParse(message: string, referenceNumber: string): ParsedMessage {
  const lower    = message.toLowerCase()
  let category   = "OTHER"
  for (const { category: cat, keywords } of CATEGORY_KEYWORDS) {
    if (keywords.some(k => lower.includes(k))) { category = cat; break }
  }
  const priority = URGENT_KEYWORDS.some(k => lower.includes(k)) ? "URGENT" : "MEDIUM"
  return {
    ...FALLBACK,
    category,
    priority,
    issue:        message.substring(0, 100),
    replyMessage: `Your grievance has been registered. Reference: ${referenceNumber}. Our team will contact you shortly.`,
  }
}

// ─── Reference number ─────────────────────────────────────────────────────────
async function generateGrievanceRef(): Promise<string> {
  const year   = new Date().getFullYear()
  const prefix = `GRV-${year}-`
  const last   = await prisma.grievance.findFirst({
    where:   { referenceNumber: { startsWith: prefix } },
    orderBy: { referenceNumber: "desc" },
  })
  const seq = last ? parseInt(last.referenceNumber.split("-").pop()!, 10) + 1 : 1
  return `${prefix}${String(seq).padStart(4, "0")}`
}

// ─── Least-loaded BACK_OFFICER ────────────────────────────────────────────────
async function pickBackOfficer(): Promise<{ id: string; name: string } | null> {
  const officers = await prisma.user.findMany({
    where:  { role: "BACK_OFFICER", status: "active" },
    select: { id: true, name: true },
  })
  if (officers.length === 0) return null
  const counts = await Promise.all(
    officers.map(async o => ({
      ...o,
      count: await prisma.grievance.count({
        where: { assignedToId: o.id, status: { notIn: ["RESOLVED", "CLOSED", "REJECTED"] } },
      }),
    }))
  )
  counts.sort((a, b) => a.count - b.count)
  return counts[0]
}

// ─── Handler ──────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    // 1. Auth
    const authHeader = request.headers.get("authorization") || ""
    const isWebhook  = WEBHOOK_SECRET && authHeader === `Bearer ${WEBHOOK_SECRET}`
    if (!isWebhook) {
      const user = await getAuthUser()
      if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      if (!MANUAL_ROLES.includes(user.role))
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // 2. Parse body
    const body = await request.json()
    const { phone, message, senderName, mediaUrl, mediaType, mediaCaption } = body
    if (!phone?.trim() || (!message?.trim() && !mediaUrl))
      return NextResponse.json({ error: "phone and either message or mediaUrl are required" }, { status: 400 })

    const safePhone    = sanitizeInput(phone)
    const safeMessage  = sanitizeInput(message || mediaCaption || "[Media received]")
    const safeName     = senderName ? sanitizeInput(senderName) : "WhatsApp Citizen"
    const safeMediaUrl = mediaUrl   ? sanitizeInput(mediaUrl)   : null
    const safeMediaType = mediaType || null

    // 3. Store raw message immediately (with media fields)
    const whatsappMessage = await prisma.whatsAppMessage.create({
      data: {
        phone:        safePhone,
        message:      safeMessage,
        rawText:      safeMessage,
        isProcessed:  false,
        mediaUrl:     safeMediaUrl,
        mediaType:    safeMediaType,
        mediaCaption: mediaCaption ? sanitizeInput(mediaCaption) : null,
      },
    })

    // 4. Generate reference number first (needed for AI reply)
    const referenceNumber = await generateGrievanceRef()

    // 5. AI parses the message — handles any language
    const parsed = await parseMessageWithAI(safeMessage, referenceNumber)

    // 6. Pick least-loaded officer
    const assignedOfficer = await pickBackOfficer()

    // 7. Create grievance
    const grievance = await prisma.grievance.create({
      data: {
        referenceNumber,
        title:             parsed.issue || `WhatsApp: ${safeMessage.substring(0, 80)}`,
        description:       safeMessage,
        requesterPhone:    safePhone,
        requesterName:     parsed.applicantName || safeName,
        village:           parsed.villageName   || null,
        mandal:            parsed.mandalName    || null,
        intakeMethod:      "WHATSAPP",
        grievanceCategory: parsed.category as any,
        requestOrigin:     "VILLAGE",
        status:            assignedOfficer ? "ASSIGNED" : "PENDING",
        priority:          parsed.priority,
        assignedToId:      assignedOfficer?.id ?? null,
        assignedBy:        "WhatsApp Auto-Intake",
        assignedAt:        assignedOfficer ? new Date() : null,
        lastActionDate:    new Date(),
        qrCode:            `QR-WA-${referenceNumber}`,
        remarks:           `Language: ${parsed.languageName}`,
      },
    })

    // 8. Status update
    if (assignedOfficer) {
      await prisma.grievanceStatusUpdate.create({
        data: {
          grievanceId: grievance.id,
          userId:      assignedOfficer.id,
          oldStatus:   "PENDING",
          newStatus:   "ASSIGNED",
          remarks:     `Auto-assigned via WhatsApp intake (${parsed.languageName})`,
        },
      })
    }

    // 9. Notify officer
    if (assignedOfficer) {
      await prisma.notification.create({
        data: {
          userId:  assignedOfficer.id,
          type:    "GRIEVANCE_ASSIGNED",
          title:   `New WhatsApp Grievance: ${referenceNumber}`,
          message: `${parsed.languageName} message from ${parsed.applicantName || safeName} (${safePhone}). Category: ${parsed.category}. Priority: ${parsed.priority}. Issue: ${parsed.issue}`,
          data:    { grievanceId: grievance.id, referenceNumber, phone: safePhone, language: parsed.language },
        },
      })
    }

    // 10. Mark processed
    await prisma.whatsAppMessage.update({
      where: { id: whatsappMessage.id },
      data:  { isProcessed: true, processedAt: new Date(), grievanceId: grievance.id },
    })

    // 11. If media was sent, store it as an Attachment linked to the grievance
    if (safeMediaUrl) {
      await prisma.attachment.create({
        data: {
          fileName:     `wa-${grievance.id}-${Date.now()}`,
          originalName: mediaCaption || `WhatsApp ${safeMediaType || "media"} from ${safePhone}`,
          url:          safeMediaUrl,
          mimeType:     safeMediaType === "image" ? "image/jpeg"
                      : safeMediaType === "document" ? "application/pdf"
                      : safeMediaType === "audio" ? "audio/ogg"
                      : "application/octet-stream",
          fileSize:     0,
          grievanceId:  grievance.id,
          uploadedBy:   `WhatsApp:${safePhone}`,
        },
      })
    }

    // 11. Send reply in citizen's own language
    await sendWhatsApp(safePhone, parsed.replyMessage)

    return NextResponse.json({
      success:      true,
      referenceNumber,
      grievanceId:  grievance.id,
      category:     parsed.category,
      priority:     parsed.priority,
      language:     parsed.language,
      languageName: parsed.languageName,
      assignedTo:   assignedOfficer?.name ?? null,
      status:       grievance.status,
      replyMessage: parsed.replyMessage,
    })
  } catch (error: any) {
    console.error("WhatsApp intake error:", error)
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 })
  }
}
