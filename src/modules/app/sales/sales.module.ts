import { Module } from "@nestjs/common";
import { SalesModule as AdminSalesModule } from "src/modules/sales/sales.module";
import { SalesController } from "./sales.controller";

@Module({
  imports: [AdminSalesModule],
  controllers: [SalesController],
})
export class SalesModule {}
