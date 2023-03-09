import { forwardRef, Module } from "@nestjs/common";
import { ResellersService } from "./resellers.service";
import { ResellersController } from "./resellers.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Reseller } from "./entities/reseller.entity";
import { CitiesModule } from "../cities/cities.module";
import { SalesModule } from "../sales/sales.module";
import { TokensModule } from "../tokens/tokens.module";
import { TransactionsService } from "./transaction.service";
import { Transaction } from "./entities/transaction.entity";
import { TransactionController } from "./transaction.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([Reseller, Transaction]),
    CitiesModule,
    forwardRef(() => SalesModule),
    TokensModule,
  ],
  controllers: [ResellersController, TransactionController],
  providers: [ResellersService, TransactionsService],
  exports: [ResellersService, TransactionsService],
})
export class ResellersModule {}
