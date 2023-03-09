import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Reseller } from "./reseller.entity";

export enum operation_type {
  "CREDIT" = "CREDIT",
  "DEBIT" = "DEBIT",
}

@Entity()
class Transaction {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    enum: operation_type,
  })
  operation: operation_type;

  @Column({
    type: "real",
  })
  amount: number;

  @Column({
    nullable:true
  })
  description:string

  @Column()
  reseller_id: string;

  @Column()
  processed: boolean;

  @ManyToOne(() => Reseller, (reseller) => reseller.id)
  @JoinColumn({
    name: "reseller_id",
  })
  reseller: Reseller;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export { Transaction };
