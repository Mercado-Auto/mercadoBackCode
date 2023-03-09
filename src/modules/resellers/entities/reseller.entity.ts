import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Product } from "src/modules/products/entities/product.entity";
import { City } from "src/modules/cities/entities/city.entity";
import { Transaction } from "./transaction.entity";

@Entity()
export class Reseller {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    length: 255,
  })
  name: string;

  @Column({
    length: 255,
  })
  corporate_name: string;

  @Column({
    length: 20,
  })
  cnpj: string;

  @Column({
    length: 30,
  })
  im: string;

  @Column({
    default: 0,
    type: "real",
    nullable: true,
  })
  balance: number;

  @Column({
    length: 9,
  })
  address_cep: string;

  @Column({
    length: 255,
  })
  address_street: string;

  @Column({
    length: 10,
  })
  address_number: string;

  @Column({
    length: 50,
  })
  address_district: string;

  @Column({
    length: 255,
    nullable: true,
  })
  address_complement: string;

  @ManyToOne(() => City, {
    nullable: false,
  })
  @JoinColumn()
  address_city: City;

  @Column({
    length: 128,
  })
  responsible_name: string;

  @Column({
    length: 128,
  })
  responsible_email: string;

  @Column({
    length: 128,
  })
  responsible_phone: string;

  @Column({
    nullable: true,
  })
  bank_code: string;

  @Column({
    nullable: true,
  })
  bank_agency_number: string;

  @Column({
    nullable: true,
  })
  bank_agency_dv: string;

  @Column({
    nullable: true,
  })
  bank_account_number: string;

  @Column({
    nullable: true,
  })
  bank_account_dv: string;

  @Column({
    nullable: true,
  })
  bank_type_pix: string;

  @Column({
    nullable: true,
  })
  bank_pix: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Transaction, (transaction) => transaction.reseller)
  transactions: Transaction[];

  @OneToMany(() => User, (user) => user.reseller)
  users: User[];

  @OneToMany(() => Product, (product) => product.reseller)
  products: Product[];
}
