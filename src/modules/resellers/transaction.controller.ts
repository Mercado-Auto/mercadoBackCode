import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { resolvePaginationAndSorteringAndFiltering } from "../../utils/pagination";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { UserType } from "../users/entities/user.entity";
import { ProcessTransactionDto } from "./dto/process-transaction.dto";
import { TransactionsService } from "./transaction.service";
import { filterRules } from "./transactions.filters";
import { PaginationAndSorteringAndFilteringDto } from "../../utils/pagination.dto";

@UseGuards(RolesGuard)
@UseGuards(JwtAuthGuard)
@Roles(UserType.SYSADMIN)
@ApiBearerAuth()
@ApiTags("Transactions")
@Controller("transactions")
export class TransactionController {
  constructor(private readonly transactionService: TransactionsService) {}

  @Roles(UserType.ADMIN, UserType.SYSADMIN)
  @Get("")
  find(@Query() query: any) {
    return this.transactionService.find(
      resolvePaginationAndSorteringAndFiltering(query, filterRules)
    );
  }

  @Roles(UserType.SYSADMIN, UserType.ADMIN)
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.transactionService.findById(id);
  }

  @Roles(UserType.SYSADMIN, UserType.ADMIN)
  @Patch("/process")
  processTransaction(@Body() data: ProcessTransactionDto) {
    return this.transactionService.processDebitTransaction(data);
  }
}
