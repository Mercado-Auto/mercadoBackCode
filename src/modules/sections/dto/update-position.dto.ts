import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class UpdatePositionDto {
  @ApiProperty()
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  section_id: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  to_section_id: string;
}
