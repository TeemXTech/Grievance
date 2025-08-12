import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from "typeorm"
import { User } from "./user.entity"

@Entity("categories")
export class Category {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column({ nullable: true })
  name_te: string // Telugu translation

  @ManyToOne(() => Category, { nullable: true })
  parent: Category

  @OneToMany(
    () => Category,
    (category) => category.parent,
  )
  children: Category[]

  @ManyToOne(() => User)
  created_by: User

  @Column({ default: true })
  is_active: boolean

  @CreateDateColumn()
  created_at: Date
}
