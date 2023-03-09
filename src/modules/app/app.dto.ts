import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from "class-validator";

export class FilterCityDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(2)
  uf?: string;
}

export class findOrCreateCityDto {
  @ApiProperty({
    required: true,
  })
  @IsString()
  cep: string;
}

export class FilterSectionDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name?: string;
}

export class FilterTagDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name?: string;
}

export class FilterProductDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name?: string;

  @IsUUID("4", { each: true })
  @ApiProperty({
    type: "uuid",
    isArray: true,
    required: false,
  })
  @IsOptional()
  sections?: string[];

  @IsUUID("4", { each: true })
  @ApiProperty({
    type: "uuid",
    isArray: true,
    required: false,
  })
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    required: false,
    type: "number",
    isArray: true,
  })
  @IsOptional()
  price?: number[];
}
