import { ApiProperty } from '@nestjs/swagger';
import { IsJSON, IsNumber, IsOptional, IsString } from 'class-validator';

export class PaginationAndSorteringAndFilteringDto {
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  pageSize?: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  order_by?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  sort_by?: 'ascend' | 'descend';

  @ApiProperty()
  @IsJSON()
  @IsOptional()
  filters?: any;
}
