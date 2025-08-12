import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm"
import { User } from "./user.entity"

export enum AuditAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  ASSIGN = "ASSIGN",
  APPROVE = "APPROVE",
}

@Entity("audit_logs")
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(
    () => User,
    (user) => user.audit_logs,
  )
  user: User

  @Column({ type: "enum", enum: AuditAction })
  action: AuditAction

  @Column()
  entity_type: string

  @Column({ nullable: true })
  entity_id: string

  @Column({ type: "json", nullable: true })
  old_values: any

  @Column({ type: "json", nullable: true })
  new_values: any

  @Column({ nullable: true })
  ip_address: string

  @Column({ nullable: true })
  user_agent: string

  @CreateDateColumn()
  created_at: Date
}
