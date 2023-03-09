import { BadRequestException, Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PaginationAndSorteringAndFilteringDto } from "../../utils/pagination.dto";
import { formatResponseWithPagination } from "../../utils/response";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { ProcessTransactionDto } from "./dto/process-transaction.dto";
import { operation_type, Transaction } from "./entities/transaction.entity";
import { ResellersService } from "./resellers.service";

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly repo: Repository<Transaction>,

    private readonly resellerService: ResellersService
  ) {}

  async create(
    reseller_id: string,
    { amount, operation, processed, description }: CreateTransactionDto
  ): Promise<Transaction> {
    const tr = this.repo.create({
      reseller_id,
      amount,
      operation,
      processed,
      description
    });

    return await this.save(tr);
  }

  async find(pagination: PaginationAndSorteringAndFilteringDto): Promise<any> {
    return formatResponseWithPagination<Transaction>(
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
          operation: operation_type.DEBIT,
          ...pagination.filters,
        },
        relations: ["reseller"],
      })
    );
  }

  async findAllByReseller(
    reseller_id: string,
    pagination: PaginationAndSorteringAndFilteringDto
  ) {
    const reseller = await this.resellerService.findByUserId(reseller_id)

    const data = formatResponseWithPagination<Transaction>(
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
          reseller_id:reseller.id,
          ...pagination.filters,
        },
      })
    );
      const transactions = await this.repo.find({
        where:{
          reseller_id:reseller.id,
          processed:false,
          operation:operation_type.CREDIT
        }
      })

      const amount_next_payment = transactions.filter(transaction => transaction.operation === operation_type.DEBIT)?.sort((a:any, b:any) => a.createdAt - b.createdAt)[0]

      const transactions_debit = transactions.filter(transaction => transaction.operation === operation_type.DEBIT && transaction.processed === false)
      
      return {
        data:data.data,
        total:data.total,
        debit_unpaid:transactions_debit,
        balance:reseller.balance,
        amount_next_payment:{
          amount:amount_next_payment?.amount || 0,
          createdAt:amount_next_payment?.createdAt || 0
        }
      }
  }

  async findById(transaction_id: string): Promise<Transaction> {
    return await this.repo.findOne({
      where: {
        id: transaction_id,
      },
    });
  }

  async processDebitTransaction(data: ProcessTransactionDto): Promise<void> {
    const transactions = await Promise.all(
      data.transactions.map((transaction) =>
        this.repo.findOne({
          where: {
            operation: operation_type.DEBIT,
            id: transaction,
            processed: false,
          },
        })
      )
    );
    if (transactions.length === 0)
      throw new BadRequestException("transactions must be greater than 0");

    const amountTotal = transactions
      .map((transaction) => transaction.amount)
      .reduce((prev, cur) => prev + cur, 0);

    transactions.map(async (transaction) => {
      await this.save({
        ...transaction,
        processed: true,
      });
      await this.resellerService.updateBalance(
        transaction.reseller_id,
        amountTotal,
        "DECREMENT"
      );
    });
  }

  async processCredit(reseller_id: string) {
    const transactions: Transaction[] = await this.repo.query(
      `
    select * from "transaction" tr
    where tr."createdAt"::date <= (CURRENT_DATE::date - interval '7 days')::date
    and "tr".processed = false 
    and tr.operation = 'CREDIT'
    and reseller_id = $1;
    `,
      [reseller_id]
    );

    if (transactions.length > 0) {
      const amount_total = transactions
        .map((transaction) => transaction.amount)
        .reduce((prev, cur) => prev + cur);

      await Promise.all(
        transactions.map((transaction) =>
          this.save({
            ...transaction,
            processed: true,
          })
        )
      );

      await this.create(reseller_id, {
        amount: amount_total,
        operation: operation_type.DEBIT,
        processed: false,
        description:'Transação de Debito dos ultimos 7 dias'
      });
    }
  }

  // @Cron("* */12 * * * *")
  // async syncBalance() {
  //   const allResellers = await this.resellerService.find();
  //   console.log(allResellers);

  //   await Promise.all(
  //     allResellers.map((reseller) => this.processCredit(reseller.id))
  //   );
  // }

  async save(data: Transaction): Promise<Transaction> {
    return await this.repo.save(data);
  }
}
