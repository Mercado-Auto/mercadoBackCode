import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from "class-validator";
import { Reseller } from "src/modules/resellers/entities/reseller.entity";

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(128)
  name: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsBoolean()
  sell_activated: boolean;

  @IsUUID("4", { each: true })
  @ApiProperty({
    type: "uuid",
    isArray: true,
    example: [
      "9322c384-fd8e-4a13-80cd-1cbd1ef95ba8",
      "986dcaf4-c1ea-4218-b6b4-e4fd95a3c28e",
    ],
    required: false,
  })
  @IsOptional()
  sections?: string[];

  @IsUUID("4", { each: true })
  @ApiProperty({
    type: "uuid",
    isArray: true,
    example: [
      "9322c384-fd8e-4a13-80cd-1cbd1ef95ba8",
      "986dcaf4-c1ea-4218-b6b4-e4fd95a3c28e",
    ],
    required: false,
  })
  @IsOptional()
  tags?: string[];

  reseller: Reseller;
}
