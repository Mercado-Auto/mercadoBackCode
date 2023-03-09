import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class Search {
  @PrimaryGeneratedColumn("uuid")
  id: string;
  
  @Column()
  description: string;

  @CreateDateColumn()
  createdAt: Date;
}
