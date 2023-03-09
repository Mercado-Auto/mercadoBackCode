import { Module } from "@nestjs/common";
import { AddressesController } from "./addresses.controller";
import { CustomersModule } from "src/modules/customers/customers.module";

@Module({
  imports: [CustomersModule],
  controllers: [AddressesController],
})
export class AddressesModule {}
