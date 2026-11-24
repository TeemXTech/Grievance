import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth-middleware"
import { headers } from "next/headers"

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "LOGIN"
  | "LOGOUT"
  | "VIEW"
  | "ASSIGN"
  | "STATUS_CHANGE"
  | "EXPORT"
  | "APPROVE"
  | "DISPATCH"
  | "GRADE_COMPUTE"
  | "CRON_MANUAL_TRIGGER"

export type AuditEntityType =
  | "GRIEVANCE"
  | "USER"
  | "CATEGORY"
  | "ATTACHMENT"
  | "PETITION"
  | "PUBLIC_WORK"
  | "VISITOR"
  | "LETTER"
  | "PARTY_WORKER"
  | "PARTY_POST"
  | "OFFICE"
  | "TASK"
  | "SURVEY"
  | "SURVEY_RESPONSE"
  | "FUND_ALLOCATION"
  | "GOVERNMENT_PROJECT"
  | "TOUR_APPOINTMENT"
  | "CITIZEN"
  | "HOUSEHOLD"
  | "POLLING_BOOTH"
  | "CAMPAIGN"
  | "SYSTEM"
  | "ASSEMBLY_QUESTION"

interface AuditLogParams {
  action: AuditAction
  entityType: AuditEntityType
  entityId: string
  userId: string
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
}

export async function createAuditLog({
  action,
  entityType,
  entityId,
  userId,
  oldValues,
  newValues,
}: AuditLogParams) {
  try {
    const headersList = headers()
    await prisma.auditLog.create({
      data: {
        action,
        entityType,
        entityId,
        userId,
        oldValues:  oldValues  || {},
        newValues:  newValues  || {},
        ipAddress:  headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown",
        userAgent:  headersList.get("user-agent") || "unknown",
      },
    })
  } catch (error) {
    // Audit log failure must never crash the main request
    console.error("Audit log failed:", error)
  }
}

interface GetAuditLogsParams {
  entityType?: AuditEntityType
  entityId?: string
  userId?: string
  action?: AuditAction
  startDate?: Date
  endDate?: Date
  page?: number
  pageSize?: number
}

export async function getAuditLogs({
  entityType,
  entityId,
  userId,
  action,
  startDate,
  endDate,
  page = 1,
  pageSize = 50,
}: GetAuditLogsParams) {
  const where: any = {}
  if (entityType) where.entityType = entityType
  if (entityId)   where.entityId   = entityId
  if (userId)     where.userId     = userId
  if (action)     where.action     = action
  if (startDate && endDate) where.createdAt = { gte: startDate, lte: endDate }

  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      include: { user: { select: { name: true, email: true, role: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])

  return { logs, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}
