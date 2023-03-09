import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateResellerDto {
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
  @MaxLength(255)
  corporate_name: string;

  @ApiProperty()
  @IsString()
  @MinLength(14)
  @MaxLength(18)
  @IsNotEmpty()
  cnpj: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  im: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(8)
  address_cep: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  address_street: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  address_number: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  address_district: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @MaxLength(255)
  address_complement: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  address_city: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(128)
  responsible_name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(128)
  @IsEmail()
  responsible_email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber("BR")
  responsible_phone: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(32)
  responsible_password: string;

  // bank
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  bank_code: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  bank_agency_number: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  bank_agency_dv: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  bank_account_number: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  bank_account_dv: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  bank_type_pix: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  bank_pix: string;
}
