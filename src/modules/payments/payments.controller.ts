import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("Payments")
@Controller("payments")
export class PaymentsController {
  // constructor(private readonly paymentsService: PaymentsService) {}
  // @Post()
  // @HttpCode(200)
  // create(@Body() createPaymentDto: NewPaymentDto): Promise<any> {
  //   // return this.paymentsService.new(createPaymentDto);
  // }
}
