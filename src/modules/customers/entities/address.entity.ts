import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { City } from "src/modules/cities/entities/city.entity";
import { Customer } from "./customer.entity";

@Entity()
export class CustomerAddress {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Customer, (customer) => customer.addresses, {
    nullable: false,
  })
  customer: Customer;

  @Column({
    length: 9,
  })
  cep: string;

  @Column({
    length: 255,
  })
  street: string;

  @Column({
    length: 10,
  })
  number: string;

  @Column({
    length: 50,
  })
  district: string;

  @Column({
    length: 255,
    nullable: true,
  })
  complement: string;

  @ManyToOne(() => City, {
    nullable: false,
  })
  @JoinColumn()
  city: City;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
