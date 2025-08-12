import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm"
import { Request } from "./request.entity"
import { User } from "./user.entity"

@Entity("attachments")
export class Attachment {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(
    () => Request,
    (request) => request.attachments,
  )
  request: Request

  @Column()
  filename: string

  @Column()
  original_name: string

  @Column()
  file_path: string

  @Column()
  file_size: number

  @Column()
  mime_type: string

  @ManyToOne(() => User)
  uploaded_by: User

  @CreateDateColumn()
  created_at: Date
}
