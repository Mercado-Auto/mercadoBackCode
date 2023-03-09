import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  HttpException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MailService } from "src/mail/mail.service";
import { IsNull, Not, Repository } from "typeorm";
import { CheckoutDto, type_payment } from "./dto/checkout.dto";
import { UpdateSaleDto } from "./dto/update-sale.dto";
import { Sale, SaleStatus } from "./entities/sale.entity";
import { CustomersService } from "../customers/customers.service";
import { ProductsService } from "../products/products.service";
import { PaginationAndSorteringAndFilteringDto } from "src/utils/pagination.dto";
import { formatResponseWithPagination } from "src/utils/response";
import { PaymentsService } from "../payments/payments.service";
import {
  CreatePaymentPixCieloReponseDTO,
  CreatePaymentResponseDTO,
  StatusTransaction,
} from "../payments/dto/create-payment-response.dto";
import { UsersService } from "../users/users.service";
import { Customer } from "../customers/entities/customer.entity";
import { Product } from "../products/entities/product.entity";
import { Cron } from "@nestjs/schedule";
import { TransactionsService } from "../resellers/transaction.service";
import { operation_type } from "../resellers/entities/transaction.entity";
import { ResellersService } from "../resellers/resellers.service";
import { data } from "./pix.mock";

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private readonly repo: Repository<Sale>,
    private readonly mailService: MailService,
    private readonly productsService: ProductsService,
    private readonly resellerService: ResellersService,
    private readonly transactionService: TransactionsService,
    private readonly paymentsService: PaymentsService,
    private readonly customersService: CustomersService,
    private readonly usersService: UsersService
  ) { }

  async checkout(checkoutDto: CheckoutDto) {
    const { accountId, addressId, cart, ...cc } = checkoutDto;
    let payment;
    let returnData;
    if (cart.length === 0) {
      throw new BadRequestException("Carrinho do compras vazio!");
    }

    // Validate the customer
    const customer = await this.customersService.findOne(accountId);

    // Validate the address
    const address = await this.customersService.findOneAddress(
      customer.id,
      addressId
    );

    const cartByReseller: { [resellerId: string]: Product[] } = {};
    const products = await Promise.all(
      cart.map(async (product) => {
        const _product = await this.productsService.findById(
          product.product_id
        );

        if (_product.stock_quantity < product.quantity) {
          throw new NotFoundException(
            "Infelizmente não temos essa quantidade de produto!"
          );
        }

        if (!cartByReseller[_product.reseller.id]) {
          cartByReseller[_product.reseller.id] = [_product];
        } else {
          cartByReseller[_product.reseller.id].push(_product);
        }

        return _product;
      })
    );

    // Try to pay and send the email
    await this.repo.manager.transaction(async (manager) => {
      const sales: Sale[] = [];

      const totalAmount = cart
        .map((record) => {
          return (
            products.find((product) => product.id === record.product_id).price *
            record.quantity
          );
        })
        .reduce((a, b) => +a + +b, 0);

      const resellerIds = Object.keys(cartByReseller);

      for (let i = 0; i < resellerIds.length; i++) {
        const resellerId = resellerIds[i];

        const resellerAmount = cartByReseller[resellerId]
          .map((product) => {
            return (
              product.price *
              cart.find((cartItem) => cartItem.product_id === product.id)
                .quantity
            );
          })
          .reduce((a, b) => +a + +b, 0);

        // Create the sale
        const sale = new Sale();
        sale.customer = customer;
        sale.shipping_address = address;
        sale.products = cartByReseller[resellerId];
        sale.amount = resellerAmount;
        sale.reseller = resellerId;
        sale.time_line_status = [];
        sales.push(sale);
      }

      payment =
        checkoutDto.type_payment === type_payment.credit_card
          ? await this.paymentsService.new({
            amount: totalAmount,
            card_brand: cc.cc_brand,
            card_expiration_date: cc.cc_due_date,
            card_holder: cc.cc_name,
            card_number: cc.cc_number,
            card_security_code: cc.cc_cvv,
            customer_name: customer.name,
            customer_email: customer.email,
            payment_type: "CreditCard",
            installments: cc.installments,
          })
          : await this.paymentsService.newPix({
            amount: totalAmount,
            identity: String(customer.identity),
            identity_type: "cnpj",
            name: customer.name,
          });

      if (
        (type_payment.credit_card === checkoutDto.type_payment &&
          payment.Status !== StatusTransaction.PaymentConfirmed) ||
        (type_payment.pix === checkoutDto.type_payment &&
          payment.Payment.Status !== StatusTransaction.Pending)
      ) {
        throw new ForbiddenException("Error ao processar o pagamento ");
      }

      await Promise.all(
        sales.map(async (sale) => {
          if (checkoutDto.type_payment === type_payment.credit_card) {
            payment = payment as CreatePaymentResponseDTO;
            sale.payment_nsu = payment.ProofOfSale;
            sale.payment_id = payment.PaymentId;
            sale.payment_tid = payment.PaymentId;
            sale.payment_st_code = String(payment.Status);
            sale.payment_st_msg = payment.ReturnMessage;
            sale.payment_auth_code = payment.AuthorizationCode;
            sale.payment_type = type_payment.credit_card;

            sale.status = SaleStatus.SEPARATING_ORDER;

            const description_transaction = sale.products.reduce((acc, cur) => acc += cur.name + ", ", '')

            await this.transactionService.create(sale.reseller, {
              amount: (sale.amount - (sale.amount * (5 / 100))),
              operation: operation_type.CREDIT,
              processed: false,
              description: description_transaction
            });

            await Promise.all(
              resellerIds.map((reseller_id: string) =>
                this.resellerService.updateBalance(
                  reseller_id,
                  (sale.amount - (sale.amount * (5 / 100))),
                  "INCREMENT"
                )
              )
            );

            sale.quantity_products = sale.products
              .map((product) => cart.filter((c) => c.product_id === product.id))
              .flat(1);

            sale.time_line_status.push({
              status: sale.status,
              updated_at: new Date(),
            });
          }

          if (checkoutDto.type_payment === type_payment.pix) {
            // payment = payment as CreatePaymentPixCieloReponseDTO;
            sale.payment_nsu = payment.Payment.ProofOfSale;
            sale.payment_id = payment.Payment.PaymentId;
            sale.payment_tid = payment.Payment.PaymentId;
            sale.payment_st_code = String(payment.Payment.Status);
            sale.payment_st_msg = payment.Payment.ReturnMessage;
            sale.code_pix = payment.Payment.QrCodeString;
            sale.qr_code_base_64 = payment.Payment.QrCodeBase64Image;
            sale.payment_type = type_payment.pix;

            sale.status = SaleStatus.WAITING_PAYMENT;

            sale.quantity_products = sale.products
              .map((product) => cart.filter((c) => c.product_id === product.id))
              .flat(1);

            sale.time_line_status.push({
              status: sale.status,
              updated_at: new Date(),
            });
          }
        })
      );

      await manager.getRepository(Sale).save(sales);

      returnData = {
        sale_id: sales[0].id,
        code_pix: sales[0].code_pix,
        qr_code_base_64: sales[0].qr_code_base_64,
        type: checkoutDto.type_payment,
      };

      // await this.mailService.sendCustomerSalePaid(customer, sale);
    });

    return returnData;
  }

  async checkPaymentPaid(sale_id: string) {
    const sale = await this.repo.findOne({
      where: {
        id: sale_id,
      },
    });

    return Number(sale.payment_st_code) === StatusTransaction.PaymentConfirmed;
  }

  async findAllByCustomer(
    customerId: string,
    pagination: PaginationAndSorteringAndFilteringDto
  ) {
    const myCustomerAccount = await this.customersService.findOne(customerId);

    return formatResponseWithPagination<Sale>(
      await this.repo.findAndCount({
        select: ["id", "amount", "status", "createdAt"],
        take: pagination.pageSize,
        skip: (pagination.page - 1) * pagination.pageSize,
        order: {
          [pagination.order_by]: pagination.sort_by
            .toString()
            .replace("end", "")
            .toUpperCase(),
        },
        where: {
          ...pagination.filters,
          customer: {
            id: myCustomerAccount.id,
          },
        },
      })
    );
  }

  async findAllByReseller(currentUserId: string) {
    const myUser = await this.usersService.findById(currentUserId);

    const sales = await this.repo.find({
      relations: ["products", "products.reseller", "customer"],
      where: {
        products: {
          reseller: {
            id: myUser.reseller.id,
          },
        },
      },
    });

    sales.map((_sales) => {
      (<Partial<Customer>>_sales.customer) = {
        name: _sales.customer.name,
        email: _sales.customer.email,
      };
      _sales.products.map((product) => {
        if (_sales.quantity_products) {
          _sales.amount =
            _sales.quantity_products.find(
              (_product) => _product.product_id === product.id
            ).quantity * product.price;
        }
      });

      return {
        ..._sales,
        customer: _sales.customer.name,
      };
    });

    return sales;
  }

  async findAllByResellerWithFilters(currentUserId: string, pagination:PaginationAndSorteringAndFilteringDto) {
  const myUser = await this.usersService.findById(currentUserId);

  const sales =  formatResponseWithPagination<Sale>(
      await this.repo.findAndCount({
        take: pagination.pageSize,
        skip: (pagination.page - 1) * pagination.pageSize,
        order: {
          [pagination.order_by]: pagination.sort_by
            .toString()
            .replace("end", "")
            .toUpperCase(),
        },
        where: {
          ...pagination.filters,
          products: {
            reseller: {
              id: myUser.reseller.id,
            },
          },
        },
        relations: ["products", "products.reseller", "customer"],
      })
    );


    sales.data.map((_sales) => {
      (<Partial<Customer>>_sales.customer) = {
        name: _sales.customer.name,
        email: _sales.customer.email,
      };
      _sales.products.map((product) => {
        if (_sales.quantity_products) {
          _sales.amount =
            _sales.quantity_products.find(
              (_product) => _product.product_id === product.id
            ).quantity * product.price;
        }
      });

      return {
        ..._sales,
        customer: _sales.customer.name,
      };
    });

    return sales;
  }

  async findOneByReseller(currentUserId: string, sale_id: string) {
    const myUser = await this.usersService.findById(currentUserId);

    const sale = await this.repo.findOne({
      where: {
        id: sale_id,
        products: {
          reseller: {
            id: myUser.reseller.id,
          },
        },
      },
      relations: ["products", "products.reseller", "customer", "shipping_address", "shipping_address.city"],
    });

    if (!sale) {
      throw new NotFoundException("Venda não encontrada!");
    }

    sale.products.map((product) => {
      if (sale.quantity_products) {
        sale.amount =
          sale.quantity_products.find(
            (_product) => _product.product_id === product.id
          ).quantity * product.price;
      }
    });

    return {
      ...sale,
      customer: {
        name: sale.customer.name,
        email: sale.customer.email,
      },
    };
  }

  async findOneByCustomer(customerId: string, id: string) {
    const myCustomerAccount = await this.customersService.findOne(customerId);

    try {
      const data = await this.repo.findOneOrFail({
        select: [
          "id",
          "amount",
          "status",
          "products",
          "shipping_address",
          "tracker_code",
          "quantity_products",
          "nf_link",
          "qr_code_base_64",
          "payment_type",
          "code_pix",
        ],
        where: {
          id,
          customer: {
            id: myCustomerAccount.id,
          },
        },
        relations: ["products", "shipping_address", "shipping_address.city"],
      });
      return data;
    } catch (error) {
      throw new NotFoundException("Pedido não encontrado!");
    }
  }

  async update(
    sale_id: string,
    currentUserId: string,
    updateSaleDto: UpdateSaleDto
  ) {
    const myUser = await this.usersService.findById(currentUserId);

    const sale = await this.repo.findOne({
      where: {
        id: sale_id,
        products: {
          reseller: {
            id: myUser.reseller.id,
          },
        },
      },
      relations: ["products", "products.reseller", "customer"],
    });

    if (
      "status" in updateSaleDto &&
      updateSaleDto.status &&
      updateSaleDto.status === "delivery_transit"
    ) {
      
      await Promise.all(
        sale.quantity_products.map((product) =>
             this.productsService.removeProduct(
              {
                product_id: product.product_id,
                quantity: product.quantity,
              },
              currentUserId
            )
        )
      );
    }

    if (sale.status === "delivery_transit") {
      updateSaleDto.status = SaleStatus.DELIVERED
      sale.time_line_status.push({
        status: updateSaleDto.status,
        updated_at: new Date(),
      });
    }

    this.repo.merge(sale, updateSaleDto);

    await this.repo.save(sale);
  }

  // @Cron("*/10 * * * * *")
  async checkPayments() {
    const sales = await this.repo.find({
      where: {
        status: SaleStatus.WAITING_PAYMENT,
        payment_type: type_payment.pix,
      },
      relations: ['products']
    });

    const sales_promises = sales.map(async (sale) => {

      const payment = await this.paymentsService.payment(sale.payment_id);
      const description_transaction = sale.products.reduce((acc, cur) => acc += cur.name + ", ", '')

      if (
        Number(sale.payment_st_code) !== payment.Payment.Status &&
        payment.Payment.Status === StatusTransaction.PaymentConfirmed
      ) {
        sale.payment_st_code = String(payment.Payment.Status);
        sale.status = SaleStatus.SEPARATING_ORDER;
        this.transactionService.create(sale.reseller, {
          amount: (sale.amount - (sale.amount * (5 / 100))),
          operation: operation_type.CREDIT,
          processed: false,
          description: description_transaction
        });
        await this.resellerService.updateBalance(
          sale.reseller,
          sale.amount,
          "INCREMENT"
        );
        await this.repo.save(sale);
      }
    });

    await Promise.all(sales_promises);
  }
}
