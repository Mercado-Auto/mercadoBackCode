import { Module } from "@nestjs/common";
import { ReportsService } from "./reports.service";
import { ReportsController } from "./reports.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Sale } from "../sales/entities/sale.entity";
import { Reseller } from "../resellers/entities/reseller.entity";
import { Product } from "../products/entities/product.entity";
import { Transaction } from "../resellers/entities/transaction.entity";
import { DayjsDateProvider } from "../../utils/date";
import {Search} from "../products/entities/search.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Sale, Reseller, Product, Transaction,Search])],
  controllers: [ReportsController],
  providers: [ReportsService, DayjsDateProvider],
})
export class ReportsModule {}
