import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToMany, JoinTable } from "typeorm"
import { User } from "./user.entity"
import { Permission } from "./permission.entity"

export enum RoleName {
  ADMIN = "ADMIN",
  MINISTER = "MINISTER",
  PERSONAL_ASSISTANT = "PERSONAL_ASSISTANT",
  OFFICE_STAFF = "OFFICE_STAFF",
  FIELD_TEAM = "FIELD_TEAM",
  VILLAGE_HEAD = "VILLAGE_HEAD",
  VOLUNTEER = "VOLUNTEER",
  AUDITOR = "AUDITOR",
}

@Entity("roles")
export class Role {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: "enum", enum: RoleName, unique: true })
  name: RoleName

  @Column({ type: "json", nullable: true })
  default_access_level: any

  @OneToMany(
    () => User,
    (user) => user.role,
  )
  users: User[]

  @ManyToMany(
    () => Permission,
    (permission) => permission.roles,
  )
  @JoinTable({ name: "role_permissions" })
  permissions: Permission[]

  @CreateDateColumn()
  created_at: Date
}
