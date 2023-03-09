import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  ManyToOne,
} from "typeorm";
import { Reseller } from "../../resellers/entities/reseller.entity";

export enum UserType {
  SYSADMIN = "sysadmin",
  ADMIN = "admin",
  RESELLER = "reseller",
  USER = "user",
}

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  @Unique("user_email_un", ["email"])
  email: string;

  @Column({
    default: false,
    type: "bool",
  })
  verified_email: boolean;

  @Column()
  password: string;

  @Column({
    type: "enum",
    enum: UserType,
    default: UserType.USER,
  })
  access_type: UserType;

  @ManyToOne(() => Reseller, (reseller) => reseller.users)
  reseller?: Reseller;
}
