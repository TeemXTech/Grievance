import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm"
import { Role } from "./role.entity"

export enum PermissionAction {
  CREATE = "CREATE",
  READ = "READ",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  ASSIGN = "ASSIGN",
  APPROVE = "APPROVE",
}

export enum PermissionResource {
  REQUEST = "REQUEST",
  USER = "USER",
  FUND = "FUND",
  DASHBOARD = "DASHBOARD",
  CATEGORY = "CATEGORY",
}

@Entity("permissions")
export class Permission {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: "enum", enum: PermissionAction })
  action: PermissionAction

  @Column({ type: "enum", enum: PermissionResource })
  resource: PermissionResource

  @ManyToMany(
    () => Role,
    (role) => role.permissions,
  )
  roles: Role[]
}
