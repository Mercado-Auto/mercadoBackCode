import { Reseller } from "src/modules/resellers/entities/reseller.entity";
import { Section } from "src/modules/sections/entities/section.entity";
import { Tag } from "src/modules/tags/entities/tag.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({
    type: "numeric",
    precision: 10,
    scale: 2,
  })
  price: number;

  @Column({
    default: false,
  })
  sell_activated: boolean;

  @Column({
    nullable: true,
  })
  description: string;

  @Column({
    type: "bigint",
    default: 0,
  })
  stock_quantity: number;

  @Column({
    type: "json",
    default: [],
  })
  photos: string[];

  @ManyToOne(() => Reseller, (reseller) => reseller.products)
  reseller: Reseller;

  @ManyToMany(() => Section, (section) => section.products)
  @JoinTable()
  sections: Section[];

  @ManyToMany(() => Tag)
  @JoinTable()
  tags: Tag[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor() {
    if (this.stock_quantity) {
      this.stock_quantity = Number(this.stock_quantity);
    }
  }
}
