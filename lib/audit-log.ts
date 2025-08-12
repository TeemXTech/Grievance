import { PrismaClient } from '@prisma/client'
import { headers } from 'next/headers'

const prisma = new PrismaClient()

export type AuditAction = 
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'VIEW'
  | 'ASSIGN'
  | 'STATUS_CHANGE'
  | 'EXPORT'

export type AuditEntityType =
  | 'GRIEVANCE'
  | 'USER'
  | 'CATEGORY'
  | 'ATTACHMENT'

interface AuditLogParams {
  action: AuditAction
  entityType: AuditEntityType
  entityId: string
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
}

export async function createAuditLog({
  action,
  entityType,
  entityId,
  oldValues,
  newValues
}: AuditLogParams) {
  const headersList = headers()
  const userId = headersList.get('x-user-id')

  if (!userId) {
    console.warn('No user ID found in headers for audit log')
    return
  }

  try {
    await prisma.auditLog.create({
      data: {
        action,
        entityType,
        entityId,
        userId,
        oldValues: oldValues || {},
        newValues: newValues || {},
        ipAddress: headersList.get('x-forwarded-for') || 'unknown',
        userAgent: headersList.get('user-agent') || 'unknown',
      },
    })
  } catch (error) {
    console.error('Failed to create audit log:', error)
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
  pageSize = 10,
}: GetAuditLogsParams) {
  const where = {
    ...(entityType && { entityType }),
    ...(entityId && { entityId }),
    ...(userId && { userId }),
    ...(action && { action }),
    ...(startDate && endDate && {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    }),
  }

  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])

  return {
    logs,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}
