import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class City {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    length: 255,
    nullable: false,
  })
  name: string;

  @Column({
    length: 2,
    nullable: false,
  })
  uf: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
