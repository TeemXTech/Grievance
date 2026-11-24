import { NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth-middleware"
import { createAuditLog } from "@/lib/audit-log"
import { writeFile, mkdir } from "fs/promises"
import { join, extname } from "path"
import { randomUUID } from "crypto"

const UPLOAD_ROLES = ["PA", "ADMIN", "BACK_OFFICER", "FIELD_OFFICER"]

// 10 MB limit
const MAX_FILE_SIZE = 10 * 1024 * 1024

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg", "image/png", "image/webp", "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
])

// ─── S3 upload (production) ───────────────────────────────────────────────────
async function uploadToS3(buffer: Buffer, fileName: string, mimeType: string): Promise<string> {
  // require() at runtime — @aws-sdk/client-s3 must be installed in production
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3") as any

  const bucket = process.env.AWS_S3_BUCKET!
  const region = process.env.AWS_REGION || "ap-south-1"
  const key    = `uploads/${fileName}`

  const client = new S3Client({ region })
  await client.send(new PutObjectCommand({
    Bucket:      bucket,
    Key:         key,
    Body:        buffer,
    ContentType: mimeType,
  }))

  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`
}

// ─── Local disk upload (development) ─────────────────────────────────────────
async function uploadToLocal(buffer: Buffer, fileName: string): Promise<string> {
  const uploadDir = join(process.cwd(), "public", "uploads")
  await mkdir(uploadDir, { recursive: true })
  await writeFile(join(uploadDir, fileName), buffer)
  return `/uploads/${fileName}`
}

// ─── Handler ──────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  if (!UPLOAD_ROLES.includes(user.role))
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ success: false, error: "Invalid multipart form data" }, { status: 400 })
  }

  const file = formData.get("file") as File | null
  if (!file) return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })

  // Validate size
  if (file.size > MAX_FILE_SIZE)
    return NextResponse.json({ success: false, error: "File too large. Maximum size is 10 MB." }, { status: 413 })

  // Validate MIME type
  if (!ALLOWED_MIME_TYPES.has(file.type))
    return NextResponse.json({ success: false, error: `File type '${file.type}' is not allowed.` }, { status: 415 })

  const ext          = extname(file.name) || ".bin"
  const safeFileName = `${randomUUID()}${ext}`
  const buffer       = Buffer.from(await file.arrayBuffer())

  let fileUrl: string
  const isProduction = process.env.NODE_ENV === "production" && process.env.AWS_S3_BUCKET

  try {
    fileUrl = isProduction
      ? await uploadToS3(buffer, safeFileName, file.type)
      : await uploadToLocal(buffer, safeFileName)
  } catch (err: any) {
    console.error("[upload] Storage error:", err)
    return NextResponse.json({ success: false, error: "File storage failed. Please try again." }, { status: 500 })
  }

  await createAuditLog({
    action:     "CREATE",
    entityType: "ATTACHMENT",
    entityId:   safeFileName,
    userId:     user.id,
    newValues:  { originalName: file.name, size: file.size, mimeType: file.type, storage: isProduction ? "s3" : "local" },
  })

  return NextResponse.json({
    success:      true,
    fileUrl,
    fileName:     safeFileName,
    originalName: file.name,
    mimeType:     file.type,
    fileSize:     file.size,
  }, { status: 201 })
}
