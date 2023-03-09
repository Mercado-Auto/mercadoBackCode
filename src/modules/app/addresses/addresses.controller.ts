import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Request,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CreateAddressDto } from "src/modules/customers/dto/create-address.dto";
import { UpdateAddressDto } from "src/modules/customers/dto/update-address.dto";
import { CustomersService } from "../../customers/customers.service";
import { JwtAuthGuard } from "../accounts/guards/jwt-auth.guard";

@ApiTags("App")
@Controller("app/address")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class AddressesController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  create(@Request() req, @Body() createAddressDto: CreateAddressDto) {
    const myCustomerId = req.user.id;

    return this.customersService.createAddress(myCustomerId, createAddressDto);
  }

  @Get()
  findAll(@Request() req) {
    const myCustomerId = req.user.id;

    return this.customersService.findAllAddresses(myCustomerId);
  }

  @Get(":id")
  findOne(@Request() req, @Param("id") id: string) {
    const myCustomerId = req.user.id;

    return this.customersService.findOneAddress(myCustomerId, id);
  }

  @Patch(":id")
  update(
    @Request() req,
    @Param("id") id: string,
    @Body() updateAddressDto: UpdateAddressDto
  ) {
    const myCustomerId = req.user.id;

    return this.customersService.updateAddress(
      myCustomerId,
      id,
      updateAddressDto
    );
  }

  @Delete(":id")
  remove(@Request() req, @Param("id") id: string) {
    const myCustomerId = req.user.id;

    return this.customersService.removeAddress(myCustomerId, id);
  }
}
