export interface payment {
  MerchantOrderId: string;
  AcquirerOrderId: string;
  Customer: {
    Name: string;
    Address: object;
  };
  Payment: {
    ServiceTaxAmount: number;
    Installments: number;
    Interest: string;
    Capture: boolean;
    Authenticate: boolean;
    CreditCard: {
      CardNumber: string;
      Holder: string;
      ExpirationDate: string;
      SaveCard: boolean;
      Brand: string;
      PaymentAccountReference: string;
    };
    ProofOfSale: string;
    Tid: string;
    AuthorizationCode: string;
    PaymentId: string;
    Type: string;
    Amount: number;
    ReceivedDate: string;
    CapturedAmount: number;
    CapturedDate: string;
    VoidedAmount: number;
    VoidedDate: string;
    Currency: string;
    Country: string;
    ExtraDataCollection: any[];
    Status: number;
  };
}
