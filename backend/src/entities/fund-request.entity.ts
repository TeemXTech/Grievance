import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm"
import { Request } from "./request.entity"
import { User } from "./user.entity"

export enum ApprovalStatus {
  REQUESTED = "REQUESTED",
  SANCTIONED = "SANCTIONED",
  RELEASED = "RELEASED",
  REJECTED = "REJECTED",
}

@Entity("fund_requests")
export class FundRequest {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(
    () => Request,
    (request) => request.fund_requests,
  )
  request: Request

  @Column({ type: "decimal", precision: 12, scale: 2 })
  amount: number

  @Column()
  purpose: string

  @Column()
  requested_date: Date

  @Column({ type: "enum", enum: ApprovalStatus, default: ApprovalStatus.REQUESTED })
  approval_status: ApprovalStatus

  @ManyToOne(() => User, { nullable: true })
  approver: User

  @Column({ nullable: true })
  release_date: Date

  @Column({ type: "json", nullable: true })
  documents: any

  @CreateDateColumn()
  created_at: Date
}
