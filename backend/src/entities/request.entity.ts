import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  BeforeInsert,
} from "typeorm"
import { User } from "./user.entity"
import { Category } from "./category.entity"
import { Attachment } from "./attachment.entity"
import { FundRequest } from "./fund-request.entity"

export enum RequestType {
  PATIENT = "PATIENT",
  JOB = "JOB",
  TTD = "TTD",
  INFRA = "INFRA",
  FUND = "FUND",
  OTHER = "OTHER",
}

export enum RequestStatus {
  NEW = "NEW",
  PENDING = "PENDING",
  ASSIGNED = "ASSIGNED",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
  WITHDRAWN = "WITHDRAWN",
}

export enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

@Entity("requests")
export class Request {
  @PrimaryColumn()
  id: string

  @Column({ type: "enum", enum: RequestType })
  type: RequestType

  @Column({ nullable: true })
  sub_type: string

  @Column()
  title: string

  @Column("text")
  description: string

  @Column()
  requester_name: string

  @Column()
  requester_phone: string

  @Column("text")
  requester_address: string

  @Column({ type: "decimal", precision: 10, scale: 8, nullable: true })
  geo_latitude: number

  @Column({ type: "decimal", precision: 11, scale: 8, nullable: true })
  geo_longitude: number

  @Column({ type: "enum", enum: RequestStatus, default: RequestStatus.NEW })
  status: RequestStatus

  @Column({ type: "enum", enum: Priority, default: Priority.MEDIUM })
  priority: Priority

  @ManyToOne(
    () => User,
    (user) => user.assigned_requests,
    { nullable: true },
  )
  assigned_to: User

  @ManyToOne(() => User, { nullable: true })
  assigned_by: User

  @ManyToOne(
    () => User,
    (user) => user.created_requests,
    { nullable: true },
  )
  created_by_user: User

  @Column({ nullable: true })
  created_by: string

  @ManyToOne(() => Category, { nullable: true })
  category: Category

  @OneToMany(
    () => Attachment,
    (attachment) => attachment.request,
  )
  attachments: Attachment[]

  @OneToMany(
    () => FundRequest,
    (fundRequest) => fundRequest.request,
  )
  fund_requests: FundRequest[]

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date

  @Column({ nullable: true })
  closed_at: Date

  @BeforeInsert()
  generateId() {
    const year = new Date().getFullYear()
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")
    this.id = `GRV-${year}-${random}`
  }
}
