import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty } from "class-validator";

class ProcessTransactionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  transactions: string[];
}

export { ProcessTransactionDto };
