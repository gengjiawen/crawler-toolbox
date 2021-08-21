import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity()
@Unique(['url'])
export class Urls extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  url!: string

  @Column()
  content!: string

  @CreateDateColumn()
  created_at!: Date

  @UpdateDateColumn()
  updated_at!: Date
}
