import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsNumber,
} from "class-validator";

export class NewPaymentDto {
  //config customer
  customer_name: string;

  customer_email: string;
  //config purchased

  amount: number;
  //config card
  payment_type: "CreditCard" | "DebitCard";

  installments: number;
  //config of card
  card_number: string;

  card_holder: string;

  card_expiration_date: string; // format MM/AAAA

  card_security_code: string;

  card_brand: CardType;
}

export type CardType =
  | "Visa"
  | "Master"
  | "Amex"
  | "Elo"
  | "Aura"
  | "JCB"
  | "Diners"
  | "Discover"
  | "Hipercard"
  | "Hiper";

export class NewPixDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(4)
  identity_type: string; // CPF or CNPJ

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  identity: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  constructor() {
    this.amount = this.amount * 100;
  }
}
