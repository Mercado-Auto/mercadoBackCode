import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from "@nestjs/common";
import { ResellersService } from "./resellers.service";
import { UpdateResellerDto } from "./dto/update-reseller.dto";
import { resolvePaginationAndSorteringAndFiltering } from "../../utils/pagination";
import { filterRules, filterTransactionsRules } from "./resellers.filters";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { UserType } from "../users/entities/user.entity";
import { TransactionsService } from "./transaction.service";

@UseGuards(RolesGuard)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags("Resellers")
@Controller("resellers")
export class ResellersController {
  constructor(
    private readonly resellersService: ResellersService,
    private readonly transactionService: TransactionsService
  ) {}

  @Roles(UserType.SYSADMIN, UserType.ADMIN)
  @Get()
  findAll(@Query() query) {
    return this.resellersService.findAll(
      resolvePaginationAndSorteringAndFiltering(query, filterRules)
    );
  }

  @Roles(UserType.SYSADMIN, UserType.ADMIN, UserType.RESELLER)
  @Get("/transactions")
  findTrasactions(@Req() req, @Query() query) {
    const id = req.user.id;
    return this.transactionService.findAllByReseller(
      id,
      resolvePaginationAndSorteringAndFiltering(query, filterTransactionsRules)
    );
  }

  @Roles(UserType.SYSADMIN, UserType.ADMIN)
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.resellersService.findOne(id);
  }

  @Roles(UserType.SYSADMIN)
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateResellerDto: UpdateResellerDto
  ) {
    return this.resellersService.update(id, updateResellerDto);
  }

  @Roles(UserType.SYSADMIN)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.resellersService.remove(id);
  }
}
