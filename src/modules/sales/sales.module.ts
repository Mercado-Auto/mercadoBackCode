import { forwardRef, Module } from "@nestjs/common";
import { SalesService } from "./sales.service";
import { SalesController } from "./sales.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Sale } from "./entities/sale.entity";
import { CustomersModule } from "../customers/customers.module";
import { ProductsModule } from "../products/products.module";
import { PaymentsModule } from "../payments/payments.module";
import { UsersModule } from "../users/users.module";
import { FileS3Service } from "../../utils/FileS3Service";
import { ResellersModule } from "../resellers/resellers.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Sale]),
    CustomersModule,
    ProductsModule,
    forwardRef(() => ResellersModule),
    PaymentsModule,
    UsersModule,
  ],
  controllers: [SalesController],
  providers: [SalesService, FileS3Service],
  exports: [SalesService],
})
export class SalesModule {}
