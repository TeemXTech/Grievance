import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, hasRole } from "@/lib/auth-middleware"
import { askGemini } from "@/lib/gemini"

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasRole(user, "MINISTER", "PA", "ADMIN"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { message, mode } = await request.json()

  // Always fetch live DB stats for context
  const [
    totalPetitions,
    pendingPetitions,
    overduePetitions,
    resolvedPetitions,
    cmrfCount,
    transferCount,
    jobCount,
    totalWorks,
    worksInProgress,
    worksCompleted,
    worksStuck,
    recentPetitions,
    overdueCases,
  ] = await Promise.all([
    prisma.petitionRequest.count(),
    prisma.petitionRequest.count({ where: { status: { in: ["PENDING", "SUBMITTED_TO_PA"] } } }),
    prisma.petitionRequest.count({ where: { isOverdue: true } }),
    prisma.petitionRequest.count({ where: { status: { in: ["RESOLVED", "SANCTIONED"] } } }),
    prisma.petitionRequest.count({ where: { type: "CMRF_MEDICAL" } }),
    prisma.petitionRequest.count({ where: { type: "EMPLOYEE_TRANSFER" } }),
    prisma.petitionRequest.count({ where: { type: "JOB_EMPLOYMENT" } }),
    prisma.publicWork.count(),
    prisma.publicWork.count({ where: { stage: "IN_PROGRESS" } }),
    prisma.publicWork.count({ where: { stage: "COMPLETED" } }),
    prisma.publicWork.count({ where: { stage: "STUCK_DELAYED" } }),
    prisma.petitionRequest.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        trackingNumber: true, type: true, title: true,
        status: true, applicantName: true, mandalName: true,
        isOverdue: true, handlingPaName: true,
      },
    }),
    prisma.petitionRequest.findMany({
      where: { isOverdue: true },
      take: 5,
      select: {
        trackingNumber: true, title: true, applicantName: true,
        mandalName: true, handlingPaName: true, type: true,
      },
    }),
  ])

  // Morning briefing mode
  if (mode === "briefing") {
    const briefingContext = `
You are the AI assistant for Hon. Minister D. Sridhar Babu of Manthanani Constituency, Telangana.
Generate a concise morning briefing in 4-5 sentences. Be direct, formal, and actionable.

Live data as of now:
- Total petitions: ${totalPetitions} (${pendingPetitions} pending, ${overduePetitions} OVERDUE)
- Resolved/Sanctioned: ${resolvedPetitions}
- CMRF Medical cases: ${cmrfCount}
- Transfer requests: ${transferCount}
- Job requests: ${jobCount}
- Public works: ${totalWorks} (${worksInProgress} in progress, ${worksCompleted} completed, ${worksStuck} stuck/delayed)
- Recent petitions: ${recentPetitions.map(p => `${p.applicantName} from ${p.mandalName} (${p.type.replace(/_/g," ")})`).join(", ")}
${overdueCases.length > 0 ? `- OVERDUE cases needing attention: ${overdueCases.map(p => `${p.trackingNumber} - ${p.applicantName} (${p.type.replace(/_/g," ")})`).join(", ")}` : ""}

Start with "Good morning, Sir." and end with the most urgent action needed today.`

    try {
      const briefing = await askGemini(briefingContext)
      return NextResponse.json({ success: true, response: briefing, mode: "briefing" })
    } catch (err: any) {
      // Fallback briefing from DB
      const fallback = `Good morning, Sir. You have ${totalPetitions} total petitions in the system, with ${pendingPetitions} pending and ${overduePetitions} overdue cases requiring immediate attention. There are ${cmrfCount} CMRF medical cases, ${transferCount} transfer requests, and ${jobCount} job requests. Public works status: ${worksInProgress} in progress, ${worksStuck} stuck. ${overdueCases.length > 0 ? `Most urgent: ${overdueCases[0].trackingNumber} - ${overdueCases[0].applicantName} from ${overdueCases[0].mandalName}.` : "No overdue cases today."}`
      return NextResponse.json({ success: true, response: fallback, mode: "briefing", fallback: true })
    }
  }

  // Regular query mode
  const context = `
You are the AI assistant for Hon. Minister D. Sridhar Babu, Manthanani Constituency, Telangana Government.
Answer the minister's question using the live data below. Be concise, direct, and helpful.
If asked about specific people or cases, refer to the data provided.

LIVE DATABASE STATS:
- Total petitions: ${totalPetitions}
- Pending: ${pendingPetitions} | Overdue: ${overduePetitions} | Resolved: ${resolvedPetitions}
- CMRF Medical: ${cmrfCount} | Transfers: ${transferCount} | Jobs: ${jobCount}
- Public Works: ${totalWorks} total | ${worksInProgress} in progress | ${worksCompleted} done | ${worksStuck} stuck
- Recent 5 petitions: ${recentPetitions.map(p => `[${p.trackingNumber}] ${p.applicantName} from ${p.mandalName || "unknown"} - ${p.type.replace(/_/g," ")} - ${p.status} - PA: ${p.handlingPaName || "unassigned"}`).join(" | ")}
${overdueCases.length > 0 ? `- Overdue cases: ${overdueCases.map(p => `${p.trackingNumber} ${p.applicantName} (${p.mandalName})`).join(", ")}` : "- No overdue cases"}

Minister's question: ${message}`

  try {
    const response = await askGemini(context)
    return NextResponse.json({ success: true, response })
  } catch (err: any) {
    // Smart fallback based on keywords
    const q = message.toLowerCase()
    let fallback = ""

    if (q.includes("overdue")) {
      fallback = overdueCases.length > 0
        ? `${overduePetitions} overdue cases. Most urgent: ${overdueCases.map(p => `${p.trackingNumber} - ${p.applicantName} from ${p.mandalName}`).join(", ")}`
        : "No overdue cases currently."
    } else if (q.includes("cmrf") || q.includes("medical")) {
      fallback = `${cmrfCount} CMRF/Medical cases in the system. ${pendingPetitions} petitions are currently pending.`
    } else if (q.includes("work") || q.includes("project")) {
      fallback = `${totalWorks} public works total. ${worksInProgress} in progress, ${worksCompleted} completed, ${worksStuck} stuck/delayed.`
    } else if (q.includes("transfer")) {
      fallback = `${transferCount} employee transfer requests pending in the system.`
    } else if (q.includes("job")) {
      fallback = `${jobCount} job requests logged in the system.`
    } else {
      fallback = `Current status: ${totalPetitions} petitions (${overduePetitions} overdue, ${pendingPetitions} pending, ${resolvedPetitions} resolved). ${totalWorks} public works (${worksInProgress} active).`
    }

    return NextResponse.json({ success: true, response: fallback, fallback: true })
  }
}
