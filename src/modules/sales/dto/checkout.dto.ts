import { ApiProperty } from "@nestjs/swagger";
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateIf,
} from "class-validator";

import { CardType } from "../../payments/dto/create-payment.dto";

export enum type_payment {
  "credit_card" = "credit_card",
  "pix" = "pix",
}

export class CheckoutDto {
  accountId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsEnum(type_payment, {
    message: 'type_payment must be equal "credit_card" or "pix"',
  })
  type_payment: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  addressId: string;

  @ApiProperty({
    isArray: true,
    example: [
      {
        product_id: "986dcaf4-c1ea-4218-b6b4-e4fd95a3c28e",
        quantity: 5,
      },
    ],
    required: false,
  })
  @IsNotEmpty()
  cart: {
    product_id: string;
    quantity: number;
  }[];

  @ApiProperty()
  @ValidateIf((data) => data.type_payment === "credit_card")
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  cc_name: string;

  @ApiProperty()
  @ValidateIf((data) => data.type_payment === "credit_card")
  @IsString()
  @IsNotEmpty()
  @MaxLength(16)
  @MinLength(16)
  cc_number: string;

  @ApiProperty()
  @ValidateIf((data) => data.type_payment === "credit_card")
  @IsString()
  @IsNotEmpty()
  @MaxLength(3)
  @MinLength(3)
  cc_cvv: string;

  @ApiProperty()
  @ValidateIf((data) => data.type_payment === "credit_card")
  @IsString()
  @IsNotEmpty()
  cc_brand: CardType;

  @ApiProperty()
  @ValidateIf((data) => data.type_payment === "credit_card")
  @IsNumber()
  @IsNotEmpty()
  installments: number;

  @ApiProperty({
    example: "10/2025",
  })
  @IsString()
  @ValidateIf((data) => data.type_payment === "credit_card")
  @IsNotEmpty()
  @MaxLength(7)
  @MinLength(6)
  cc_due_date: string;
}
