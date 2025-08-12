import { Injectable } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { AuditLog, AuditAction } from "../../entities/audit-log.entity"

interface LogData {
  action: string
  entityType: string
  entityId: string
  oldValues?: any
  newValues?: any
  userId?: string
  ipAddress?: string
  userAgent?: string
}

@Injectable()
export class AuditService {
  private auditLogRepository: Repository<AuditLog>

  constructor(auditLogRepository: Repository<AuditLog>) {
    this.auditLogRepository = auditLogRepository
  }

  async log(data: LogData) {
    const auditLog = this.auditLogRepository.create({
      action: data.action as AuditAction,
      entity_type: data.entityType,
      entity_id: data.entityId,
      old_values: data.oldValues,
      new_values: data.newValues,
      ip_address: data.ipAddress,
      user_agent: data.userAgent,
    })

    return this.auditLogRepository.save(auditLog)
  }
}
