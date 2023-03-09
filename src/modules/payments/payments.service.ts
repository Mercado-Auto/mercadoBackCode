import { HttpService } from "@nestjs/axios";
import { HttpException, Injectable } from "@nestjs/common";
import {
  CreatePaymentCieloRequestDto,
  CreatePaymentPixCieloRequestDto,
} from "./dto/create-payment-cielo-request.dto";
import { NewPaymentDto, NewPixDto } from "./dto/create-payment.dto";
import { v4 as uuidv4 } from "uuid";
import { ConfigService } from "@nestjs/config";
import {
  CreatePaymentPixCieloReponseDTO,
  CreatePaymentResponseDTO,
} from "./dto/create-payment-response.dto";
import { PaymentsMapper } from "./mappers/payments.mappers";
import { payment } from "./dto/payment.dto";

type TYPE_REQ = "post" | "get" | "patch";

@Injectable()
export class PaymentsService {
  private readonly headers;

  baseUrls: any;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService
  ) {
    this.headers = {
      "Content-Type": "application/json",
      MerchantId: this.configService.get("CIELO_MERCHANT_ID"),
      MerchantKey: this.configService.get("CIELO_MERCHANT_KEY"),
    };
    this.baseUrls = {
      post: this.configService.get("BASE_URL_CIELO_TRANSACTIONS"),
      get: this.configService.get("BASE_URL_CIELO_QUERY"),
      patch: this.configService.get("BASE_URL_CIELO_TRANSACTIONS"),
    };
  }

  protected async request<I, O>(
    path: string,
    type: TYPE_REQ,
    data?: I
  ): Promise<O> {
    try {
      const params: any[] = [
        this.baseUrls[type] + path,
        {
          headers: {
            ...this.headers,
            RequestId: uuidv4(),
          },
        },
      ];

      if (data && type !== "get") params.splice(1, 0, data);

      const dataReturned = await this.httpService.axiosRef[type].call(
        this.httpService.axiosRef,
        ...params
      );
      return dataReturned.data;
    } catch (err) {
      throw new HttpException(err.response.data[0].Message, 400);
    }
  }

  async new(
    createPaymentDto: NewPaymentDto
  ): Promise<CreatePaymentResponseDTO> {
    createPaymentDto = createPaymentDto as NewPaymentDto;

    const retval = await this.request<CreatePaymentCieloRequestDto, any>(
      "/1/sales/",
      "post",
      {
        MerchantOrderId: uuidv4(),
        Customer: {
          Name: createPaymentDto.customer_name,
          Email: createPaymentDto.customer_email,
        },
        Payment: {
          Installments: createPaymentDto.installments,
          Amount: createPaymentDto.amount,
          Type: createPaymentDto.payment_type,
          Capture: true,
          CreditCard: {
            CardNumber: createPaymentDto.card_number,
            Brand: createPaymentDto.card_brand,
            Holder: createPaymentDto.card_holder,
            ExpirationDate: createPaymentDto.card_expiration_date,
            SecurityCode: createPaymentDto.card_security_code,
          },
        },
      }
    );
    return PaymentsMapper.render(retval);
  }

  async payment(paymentId: string): Promise<payment> {
    return await this.request<any, payment>(`/1/sales/${paymentId}`, "get");
  }

  async newPix(data: NewPixDto): Promise<CreatePaymentPixCieloReponseDTO> {
    return await this.request<
      CreatePaymentPixCieloRequestDto,
      CreatePaymentPixCieloReponseDTO
    >("/1/sales/", "post", {
      Customer: {
        Identity: data.identity,
        IdentityType: data.identity_type,
        Name: data.name,
      },
      MerchantOrderId: uuidv4(),
      Payment: {
        Amount: data.amount,
        Type: "Pix",
      },
    });
  }
}
