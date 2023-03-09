import { Injectable } from "@nestjs/common";
import {
  CreatePaymentPixCieloReponseDTO,
  CreatePaymentResponseDTO,
} from "../dto/create-payment-response.dto";

Injectable();
export class PaymentsMapper {
  static render(data: any): CreatePaymentResponseDTO {
    return {
      Amount: data.Payment.Amount,
      ProofOfSale: data.Payment.ProofOfSale,
      AuthorizationCode: data.Payment.AuthorizationCode,
      Tid: data.Payment.Tid,
      PaymentId: data.Payment.PaymentId,
      Status: data.Payment.Status,
      ReturnCode: data.Payment.ReturnCode,
      ReturnMessage: data.Payment.ReturnMessage,
    };
  }
}
