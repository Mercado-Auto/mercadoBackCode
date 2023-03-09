import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Product } from "../../products/entities/product.entity";
import { Sale } from "../../sales/entities/sale.entity";
import { CustomerAddress } from "./address.entity";

@Entity()
export class Customer {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 128 })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({
    nullable:true
  })
  identity: string;

  @Column({
    default: false,
    type: "bool",
  })
  verified_email: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => Product, {
    nullable: true,
  })
  @JoinTable({
    name: "favorites_products",
  })
  favorites: Product[];

  @OneToMany(() => Sale, (sale) => sale.customer)
  sales: Sale[];

  @OneToMany(() => CustomerAddress, (address) => address.customer)
  addresses: CustomerAddress[];
}
