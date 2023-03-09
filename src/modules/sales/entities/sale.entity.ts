import { CustomerAddress } from "src/modules/customers/entities/address.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Customer } from "../../customers/entities/customer.entity";
import { Product } from "../../products/entities/product.entity";
import { type_payment } from "../dto/checkout.dto";

export enum SaleStatus {
  WAITING_PAYMENT = "waiting_payment",
  SEPARATING_ORDER = "separating_order",
  CANCELED = "canceled",
  DELIVERY_TRANSIT = "delivery_transit",
  DELIVERED = "delivered",
}

export interface TimeLineStatus {
  updated_at: Date;
  status: string;
}

@Entity()
export class Sale {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Customer, (customer) => customer.sales, {
    nullable: false,
  })
  customer: Customer;

  @ManyToOne(() => CustomerAddress, {
    nullable: false,
  })
  @JoinColumn()
  shipping_address: CustomerAddress;

  @ManyToMany(() => Product, {
    nullable: false,
  })
  @JoinTable()
  products: Product[];

  @Column({
    type: "json",
    nullable: true,
  })
  quantity_products: any;

  @Column({
    default: type_payment.credit_card,
  })
  payment_type: type_payment;

  @Column({
    nullable: true,
  })
  qr_code_base_64: string;

  @Column({
    nullable: true,
  })
  code_pix: string;

  @Column({
    type: "real",
  })
  amount: number;

  @Column({
    type: "enum",
    enum: SaleStatus,
    default: SaleStatus.WAITING_PAYMENT,
  })
  status: SaleStatus;

  @Column({
    type: "jsonb",
    default: "[]",
  })
  time_line_status: TimeLineStatus[];

  @Column({
    nullable: true,
  })
  tracker_code: string;

  @Column({
    nullable: true,
  })
  reseller: string;

  @Column({
    type: "varchar",
    nullable: true,
    length: 128,
  })
  payment_tid?: string;

  @Column({
    nullable: true,
  })
  nf_link: string;

  @Column({
    type: "varchar",
    nullable: true,
    length: 128,
  })
  payment_nsu?: string;

  @Column({
    type: "varchar",
    nullable: true,
    length: 128,
  })
  payment_auth_code?: string;

  @Column({
    type: "varchar",
    nullable: true,
    length: 128,
  })
  payment_id?: string;

  @Column({
    type: "varchar",
    nullable: true,
    length: 128,
  })
  payment_st_code?: string;

  @Column({
    type: "varchar",
    nullable: true,
    length: 512,
  })
  payment_st_msg?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
