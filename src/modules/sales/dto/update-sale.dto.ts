import { ApiProperty } from "@nestjs/swagger";
import { SaleStatus } from "../entities/sale.entity";

export class UpdateSaleDto {
  @ApiProperty()
  status?: SaleStatus;

  @ApiProperty()
  tracker_code?: string;

  @ApiProperty()
  payment_tid?: string;

  @ApiProperty()
  payment_nsu?: string;

  @ApiProperty()
  payment_auth_code?: string;

  @ApiProperty()
  payment_id?: string;

  @ApiProperty()
  payment_st_code?: string;

  @ApiProperty()
  payment_st_msg?: string;

  nf_link: string;
}
