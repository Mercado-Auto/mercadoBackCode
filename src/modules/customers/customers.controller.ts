import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { resolvePaginationAndSorteringAndFiltering } from "src/utils/pagination";
import { CustomersService } from "./customers.service";
import { filterRules } from "./customers.filters";

@ApiTags("Customers")
@Controller("customers")
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  async findAll(@Query() query) {
    return await this.customersService.findAll(
      resolvePaginationAndSorteringAndFiltering(query, filterRules)
    );
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return await this.customersService.findOne(id);
  }
}
