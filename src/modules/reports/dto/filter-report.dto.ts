import { IsISO8601, IsNotEmpty, IsOptional } from "class-validator";

class FilterReport {
  @IsOptional()
  @IsNotEmpty()
  @IsISO8601()
  initial_date: Date;

  @IsOptional()
  @IsNotEmpty()
  @IsISO8601()
  end_date: Date;
}

export { FilterReport };
