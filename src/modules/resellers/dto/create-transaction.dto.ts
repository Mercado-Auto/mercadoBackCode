import { operation_type } from "../entities/transaction.entity";

export class CreateTransactionDto {
  amount!: number;

  operation!: operation_type;

  processed: boolean;

  description?:string
}
