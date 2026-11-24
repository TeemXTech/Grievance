import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth-middleware"
import { sanitizeInput } from "@/lib/input-sanitizer"
import { createAuditLog } from "@/lib/audit-log"

const READ_ROLES  = ["MINISTER", "PA", "ADMIN", "BACK_OFFICER"]
const WRITE_ROLES = ["PA", "ADMIN", "BACK_OFFICER"]

export async function GET(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!READ_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const search      = searchParams.get("search")   || ""
  const fileType    = searchParams.get("fileType") || ""
  const linkedTo    = searchParams.get("linkedTo") || "" // "petition" | "work"
  const page        = Math.max(1, parseInt(searchParams.get("page") || "1"))
  const pageSize    = 50

  const where: any = {}
  if (search) {
    where.OR = [
      { originalName:  { contains: search, mode: "insensitive" } },
      { fileType:      { contains: search, mode: "insensitive" } },
      { uploadedByName:{ contains: search, mode: "insensitive" } },
    ]
  }
  if (fileType) where.fileType = { contains: fileType, mode: "insensitive" }
  if (linkedTo === "petition") where.petitionRequestId = { not: null }
  if (linkedTo === "work")     where.publicWorkId      = { not: null }

  const [total, documents] = await Promise.all([
    prisma.fileAttachment.count({ where }),
    prisma.fileAttachment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        petitionRequest: { select: { id: true, trackingNumber: true, title: true, applicantName: true } },
        publicWork:      { select: { id: true, workCode: true, title: true } },
      },
    }),
  ])

  return NextResponse.json({ success: true, documents, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!WRITE_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const { fileName, originalName, fileUrl, fileType, mimeType, fileSize, petitionRequestId, publicWorkId } = body

  if (!fileName?.trim() || !fileUrl?.trim())
    return NextResponse.json({ success: false, error: "fileName and fileUrl are required" }, { status: 400 })

  const doc = await prisma.fileAttachment.create({
    data: {
      fileName:          sanitizeInput(fileName),
      originalName:      sanitizeInput(originalName || fileName),
      fileUrl:           fileUrl,
      fileType:          fileType          ? sanitizeInput(fileType) : "DOCUMENT",
      mimeType:          mimeType          || null,
      fileSize:          fileSize          ? parseInt(fileSize)      : null,
      uploadedByName:    user.name,
      petitionRequestId: petitionRequestId || null,
      publicWorkId:      publicWorkId      || null,
    },
  })

  await createAuditLog({ action: "CREATE", entityType: "ATTACHMENT", entityId: doc.id, userId: user.id, newValues: { fileName: doc.fileName, fileType: doc.fileType } })
  return NextResponse.json({ success: true, document: doc }, { status: 201 })
}
