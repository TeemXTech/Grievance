import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm"
import { User } from "./user.entity"

export enum QueryType {
  GENERAL = "GENERAL",
  REQUEST_HELP = "REQUEST_HELP",
  STATUS_CHECK = "STATUS_CHECK",
  POLICY_INFO = "POLICY_INFO",
}

@Entity("ai_queries")
export class AiQuery {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => User, { nullable: true })
  user: User

  @Column()
  query_text: string

  @Column({ type: "enum", enum: QueryType })
  query_type: QueryType

  @Column("text")
  response_text: string

  @Column({ type: "json", nullable: true })
  context_data: any

  @Column({ default: false })
  is_helpful: boolean

  @CreateDateColumn()
  created_at: Date
}
