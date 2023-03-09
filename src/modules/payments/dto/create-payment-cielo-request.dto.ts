export class CreatePaymentCieloRequestDto {
  MerchantOrderId: string;
  Customer: {
    Name: string;
    Email: string;
  };
  Payment: {
    Type: string;
    Amount: number;
    Installments: number;
    Capture: true | false;
    CreditCard: {
      CardNumber: string;
      Holder?: string;
      ExpirationDate: string; // in format MM/AAAA
      SecurityCode?: string;
      Brand: string;
    };
  };
}

export class CreatePaymentPixCieloRequestDto {
  MerchantOrderId: string;
  Customer: {
    Name: string;
    Identity: string;
    IdentityType: string;
  };
  Payment: {
    Type: string;
    Amount: number;
  };
}
