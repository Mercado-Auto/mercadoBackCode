import {
  Controller,
  Request,
  Query,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { SalesService } from "src/modules/sales/sales.service";
import { resolvePaginationAndSorteringAndFiltering } from "src/utils/pagination";
import { JwtAuthGuard } from "../accounts/guards/jwt-auth.guard";
import { filterRules } from "./sales.filters";
import { CheckoutDto } from "../../sales/dto/checkout.dto";

@ApiTags("App")
@Controller("app/sales")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  async findAll(@Request() req, @Query() query) {
    const myCustomerId = req.user.id;

    return await this.salesService.findAllByCustomer(
      myCustomerId,
      resolvePaginationAndSorteringAndFiltering(query, filterRules)
    );
  }

  @Get("/:id")
  async findOne(@Request() req, @Param("id") id: string) {
    const myCustomerId = req.user.id;

    const sale = await this.salesService.findOneByCustomer(myCustomerId, id);

    const findProduct = (product_id) =>
      sale.quantity_products.find((qt) => qt.product_id === product_id)
        .quantity;

    sale.products = sale.products.map((product) => {
      (product as any).quantity = findProduct(product.id);

      return product;
    });

    return sale;
  }

  @Get("/:sale_id/payment-paid")
  async checkPaymentPaid(@Param("sale_id") sale_id: string) {
    return await this.salesService.checkPaymentPaid(sale_id);
  }

  @Post("/checkout")
  async checkout(@Request() req, @Body() data: CheckoutDto) {
    const accountId = req.user.id;

    return await this.salesService.checkout({
      accountId,
      ...data,
    });
  }
}
