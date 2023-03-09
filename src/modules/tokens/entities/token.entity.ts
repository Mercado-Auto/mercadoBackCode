import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Token {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  token: string;

  @Column({
    nullable: true,
  })
  customer: string;

  @Column({
    nullable: true,
  })
  user: string;
}
