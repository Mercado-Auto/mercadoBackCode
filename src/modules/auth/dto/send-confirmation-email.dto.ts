import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class SendConfirmationEmail {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  email: string;
}
