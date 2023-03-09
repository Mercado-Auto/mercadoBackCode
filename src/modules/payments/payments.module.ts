import { Module } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { PaymentsController } from "./payments.controller";
import { HttpModule } from "@nestjs/axios";
import { PaymentsMapper } from "./mappers/payments.mappers";
import { DayjsDateProvider } from "../../utils/date";

@Module({
  imports: [HttpModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentsMapper, DayjsDateProvider],
  exports: [PaymentsService],
})
export class PaymentsModule {}
