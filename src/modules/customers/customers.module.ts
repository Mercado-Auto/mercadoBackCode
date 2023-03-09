import { Module } from "@nestjs/common";
import { CustomersService } from "./customers.service";
import { CustomersController } from "./customers.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Customer } from "./entities/customer.entity";
import { CustomerAddress } from "./entities/address.entity";
import { CitiesModule } from "../cities/cities.module";
import { TokensModule } from "../tokens/tokens.module";
import { ProductsModule } from "../products/products.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer, CustomerAddress]),
    CitiesModule,
    TokensModule,
    ProductsModule,
  ],
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}
