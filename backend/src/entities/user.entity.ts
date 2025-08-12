import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
} from "typeorm"
import { Role } from "./role.entity"
import { Request } from "./request.entity"
import { AuditLog } from "./audit-log.entity"

export enum LanguagePreference {
  ENGLISH = "en",
  TELUGU = "te",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  name: string

  @Column({ unique: true })
  phone: string

  @Column({ nullable: true })
  email: string

  @Column()
  password_hash: string

  @Column({ type: "enum", enum: LanguagePreference, default: LanguagePreference.ENGLISH })
  language_pref: LanguagePreference

  @Column({ nullable: true })
  organization_id: string

  @Column({ default: true })
  is_active: boolean

  @ManyToOne(
    () => Role,
    (role) => role.users,
  )
  role: Role

  @OneToMany(
    () => Request,
    (request) => request.assigned_to,
  )
  assigned_requests: Request[]

  @OneToMany(
    () => Request,
    (request) => request.created_by_user,
  )
  created_requests: Request[]

  @OneToMany(
    () => AuditLog,
    (log) => log.user,
  )
  audit_logs: AuditLog[]

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date

  @DeleteDateColumn()
  deleted_at: Date
}
