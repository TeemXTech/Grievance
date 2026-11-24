import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, hasRole } from "@/lib/auth-middleware"
import { sanitizeInput } from "@/lib/input-sanitizer"
import { createAuditLog } from "@/lib/audit-log"

// Only PA and ADMIN can bulk-import ECI data
const WRITE_ROLES = ["PA", "ADMIN"]
const BATCH_SIZE  = 100

export async function POST(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!hasRole(user, ...WRITE_ROLES))
    return NextResponse.json({ error: "Forbidden: only PA/ADMIN can import citizen data" }, { status: 403 })

  const body = await req.json()
  const { citizens, dataSource = "ECI_ROLL" } = body

  if (!Array.isArray(citizens) || citizens.length === 0)
    return NextResponse.json({ error: "citizens array is required and must not be empty" }, { status: 400 })

  if (citizens.length > 5000)
    return NextResponse.json({ error: "Maximum 5000 records per import batch" }, { status: 400 })

  let created = 0
  let skipped = 0
  let errors: string[] = []

  // Process in batches to avoid memory issues
  for (let i = 0; i < citizens.length; i += BATCH_SIZE) {
    const batch = citizens.slice(i, i + BATCH_SIZE)

    for (const c of batch) {
      try {
        if (!c.name?.trim()) { errors.push(`Row ${i}: name is required`); skipped++; continue }

        // Deduplicate on EPIC number
        if (c.epicNumber) {
          const exists = await prisma.citizen.findUnique({ where: { epicNumber: c.epicNumber } })
          if (exists) { skipped++; continue }
        }

        await prisma.citizen.create({
          data: {
            epicNumber:      c.epicNumber      ? sanitizeInput(c.epicNumber)      : null,
            name:            sanitizeInput(c.name),
            fatherOrHusband: c.fatherOrHusband ? sanitizeInput(c.fatherOrHusband) : null,
            age:             c.age             ? parseInt(c.age)                  : null,
            gender:          c.gender          || null,
            houseNumber:     c.houseNumber     ? sanitizeInput(c.houseNumber)     : null,
            streetColony:    c.streetColony    ? sanitizeInput(c.streetColony)    : null,
            villageName:     c.villageName     ? sanitizeInput(c.villageName)     : null,
            mandalName:      c.mandalName      ? sanitizeInput(c.mandalName)      : null,
            district:        c.district        || "Peddapalli",
            boothNumber:     c.boothNumber     ? sanitizeInput(c.boothNumber)     : null,
            dataSource,
            isActive:        true,
          },
        })
        created++
      } catch (err: any) {
        errors.push(`Row ${i}: ${err.message}`)
        skipped++
      }
    }
  }

  await createAuditLog({
    action: "CREATE", entityType: "CITIZEN", entityId: "BULK_IMPORT", userId: user.id,
    newValues: { created, skipped, total: citizens.length, dataSource },
  })

  return NextResponse.json({
    success: true,
    summary: { total: citizens.length, created, skipped, errorCount: errors.length },
    errors: errors.slice(0, 20), // Return first 20 errors only
  }, { status: 201 })
}
