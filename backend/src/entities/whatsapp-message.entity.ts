import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm"
import { User } from "./user.entity"
import { Request } from "./request.entity"

export enum ParsedStatus {
  PENDING = "PENDING",
  PARSED = "PARSED",
  FAILED = "FAILED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

@Entity("whatsapp_messages")
export class WhatsappMessage {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  from_number: string

  @Column("text")
  message_content: string

  @Column()
  message_id: string

  @Column({ type: "enum", enum: ParsedStatus, default: ParsedStatus.PENDING })
  parsed_status: ParsedStatus

  @Column({ type: "json", nullable: true })
  parsed_data: any

  @ManyToOne(() => Request, { nullable: true })
  created_request: Request

  @ManyToOne(() => User, { nullable: true })
  processed_by: User

  @CreateDateColumn()
  received_at: Date

  @UpdateDateColumn()
  processed_at: Date
}
