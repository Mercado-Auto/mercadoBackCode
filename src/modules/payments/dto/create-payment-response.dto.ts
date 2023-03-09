export enum StatusTransaction {
  NotFinished = 0,
  Authorized = 1,
  PaymentConfirmed = 2,
  Denied = 3,
  Voided = 10,
  Refunded = 11,
  Pending = 12,
  Aborted = 13,
  Scheduled = 20,
}

export interface CreatePaymentResponseDTO {
  ProofOfSale: string;
  Amount: string;
  Tid: string;
  PaymentId: string;
  Status: StatusTransaction;
  ReturnCode: string;
  ReturnMessage: string;
  AuthorizationCode: string;
}

export interface CreatePaymentPixCieloReponseDTO {
  MerchantOrderId: string;
  Customer: {
    Name: string;
  };
  Payment: {
    PaymentId: string;
    AcquirerTransactionId: string;
    ProofOfSale: string;
    QrcodeBase64Image: string;
    QrCodeString: string;
    Status: string;
    ReturnCode: string;
    ReturnMessage: string;
  };
}
