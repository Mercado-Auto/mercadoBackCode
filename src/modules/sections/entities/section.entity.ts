import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "../../products/entities/product.entity";

@Entity()
export class Section {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({
    generated: "increment",
    type: "int",
  })
  position: number;

  @ManyToMany(() => Product, (product) => product.sections)
  products: Product[];
}
