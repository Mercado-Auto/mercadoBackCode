import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, In, Not, Repository } from "typeorm";
import { DayjsDateProvider } from "../../utils/date";
import { Search } from "../products/entities/search.entity";
import { Reseller } from "../resellers/entities/reseller.entity";
import { operation_type, Transaction } from "../resellers/entities/transaction.entity";
import { Sale, SaleStatus } from "../sales/entities/sale.entity";
import { AdminDashboardDTO, ResellerDashboardDTO } from "./dto/dashboard.dto";
import { FilterReport } from "./dto/filter-report.dto";

const PLATFORM_TAX = 5 / 100;

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Sale)
    private readonly repoSale: Repository<Sale>,

    @InjectRepository(Reseller)
    private readonly repoReseller: Repository<Reseller>,

    @InjectRepository(Transaction)
    private readonly repoTransaction: Repository<Transaction>,

    @InjectRepository(Search)
    private readonly repoSearch: Repository<Search>,

    private readonly dateProvider: DayjsDateProvider
  ) { }

  async generateResellerDashboard(user_id: string, filters: FilterReport): Promise<ResellerDashboardDTO> {
    const reseller = await this.repoReseller.findOneBy({
      users: {
        id: user_id,
      }
    });

    if (!reseller) throw new NotFoundException("Revendedor não encontrado!");
    const reseller_id = reseller.id;

    const startDate: Date = filters.initial_date ? (typeof filters.initial_date === 'string' ? new Date(filters.initial_date) : filters.initial_date) : new Date();
    startDate.setHours(0, 0, 0);

    const endDate: Date = filters.end_date ? (typeof filters.end_date === 'string' ? new Date(filters.end_date) : filters.end_date) : new Date();
    endDate.setHours(23, 59, 59);

    const intervalLength = this.dateProvider.compareBetweenDate(
      filters.initial_date,
      filters.end_date
    );

    const gross_profit = (await this.repoSale.find({
      where: {
        createdAt: Between(startDate, endDate),
        status: Not(In([SaleStatus.CANCELED, SaleStatus.WAITING_PAYMENT])),
        reseller: reseller_id,
      },
    })).reduce((a, b) => a + b.amount, 0);

    const net_profit = gross_profit - (gross_profit * PLATFORM_TAX);

    const pending_payments = await this.repoTransaction.count({
      where: {
        createdAt: Between(startDate, endDate),
        processed: false,
        operation: operation_type.DEBIT,
        reseller_id,
      },
    });

    const [transactions, processed_payments] = await this.repoTransaction.findAndCount({
      where: {
        createdAt: Between(startDate, endDate),
        processed: true,
        operation: operation_type.DEBIT,
        reseller_id,
      },
    });

    const transferred_total_amount = transactions.reduce((a, b) => a + b.amount, 0);

    const top_most_sold: any[] = await this.repoSale.query(`
      select
        cart->>'product_id' as id,
        p.name as "name",
        sum((cart->>'quantity')::int) as sale_qty
      from sale s, json_array_elements(s.quantity_products) as cart
      left join product p on
        (cart->>'product_id')::uuid = p.id::uuid
      where
        s.quantity_products is not null and
        s."createdAt"::date between to_char($1::date, 'YYYY-MM-DD')::date and to_char($2::date, 'YYYY-MM-DD')::date and
        s.status not in ('waiting_payment', 'canceled') and
        s.reseller = $3
      group by cart->>'product_id', p.name order by sale_qty desc limit 5 offset 0;
    `, [startDate, endDate, reseller_id]);

    const least_top_most_sold: number = top_most_sold?.sort((a, b) => Number(a['sale_qty']) - Number(b['sale_qty']))[0]?.sale_qty || 1;

    const top_less_sold: any[] = await this.repoSale.query(`
      select
        p.id, 
        p.name,
        sum(coalesce(sales_wrapper.number_of_sales, 0)) as sale_qty
      from product p
      left join lateral (
        select
          (cart->>'product_id')::uuid as product_id,
          sum((cart->>'quantity')::int) as number_of_sales
        from sale s, json_array_elements(s.quantity_products) cart
        where
          s.quantity_products is not null and
          s."createdAt"::date between to_char($1::date, 'YYYY-MM-DD')::date and to_char($2::date, 'YYYY-MM-DD')::date and
          s.status not in ('waiting_payment', 'canceled') and
          s.reseller = $3
        group by cart->>'product_id'
      ) sales_wrapper on
        sales_wrapper.product_id::uuid = p.id::uuid
      where
        p."resellerId" = $4
      group by p.id, p.name having sum(coalesce(sales_wrapper.number_of_sales, 0)) < $5 order by sale_qty asc limit 5 offset 0;
    `, [startDate, endDate, reseller_id, reseller_id, least_top_most_sold]);

    const best_product = top_most_sold?.sort((a, b) => Number(b['sale_qty']) - Number(a['sale_qty']))?.[0]?.['name'];

    const worst_product = top_less_sold[0]?.['name'];
    
    const data_grafic = await this.repoSale.query(`
      select
        to_char(gs, ${intervalLength === "Month" ? "'YYYY-MM'" : "'YYYY-MM-DD'"}) as "date",
        total_of_sales.count::int as "total_of_sales"
      from
        generate_series($1::date, $2::date, '1 ${intervalLength === "Month" ? 'Month' : 'Day'}') gs
      left join lateral (
        select
          count(1)
        from sale s
        where
          to_char(s."createdAt", ${intervalLength === "Month" ? "'YYYY-MM'" : "'YYYY-MM-DD'"}) =
          to_char(gs, ${intervalLength === "Month" ? "'YYYY-MM'" : "'YYYY-MM-DD'"}) and
          s.reseller = $3
      ) total_of_sales on 1 = 1;
    `, [startDate, endDate, reseller_id]);

    const sales = await this.repoSale.query(`
      select
        sum(1) as total,
        sum(case when s.status = 'waiting_payment' then 1 else 0 end) as waiting_payment,
        sum(case when s.status = 'separating_order' then 1 else 0 end) as separating_order,
        sum(case when s.status = 'canceled' then 1 else 0 end) as canceled,
        sum(case when s.status = 'delivery_transit' then 1 else 0 end) as delivery_transit,
        sum(case when s.status = 'delivered' then 1 else 0 end) as delivered
      from sale s
      where
        s."createdAt"::date between $1::date and $2::date and
        s.reseller = $3
      group by s.reseller;
    `, [startDate, endDate, reseller_id]);

    return {
      gross_profit,
      net_profit,
      pending_payments,
      processed_payments,
      transferred_total_amount,
      top_most_sold,
      top_less_sold,
      best_product,
      worst_product,
      data_grafic: {
        data: data_grafic,
        type:intervalLength
      },
      sales: sales[0],
    }
  }

  async generateAdminDashboard(filters: FilterReport): Promise<AdminDashboardDTO> {

    console.log(filters);
    
    const startDate: Date = filters.initial_date ? (typeof filters.initial_date === 'string' ? new Date(filters.initial_date) : filters.initial_date) : new Date();
    startDate.setHours(0, 0, 0);

    const endDate: Date = filters.end_date ? (typeof filters.end_date === 'string' ? new Date(filters.end_date) : filters.end_date) : new Date();
    endDate.setHours(23, 59, 59);

    const resellers_qty = await this.repoReseller.count({
      where: {
        createdAt: Between(startDate, endDate)
      }
    });
    console.log(filters.initial_date);
    
    console.log(filters);
    

    const gross_profit = (await this.repoSale.find({
      where: {
        createdAt: Between(startDate, endDate),
        status: Not(In([SaleStatus.CANCELED, SaleStatus.WAITING_PAYMENT])),
      },
    })).reduce((a, b) => a + b.amount, 0);

    const net_profit = gross_profit * PLATFORM_TAX;

    const pending_payments = await this.repoTransaction.count({
      where: {
        createdAt: Between(startDate, endDate),
        processed: false,
        operation: operation_type.DEBIT,
      },
    });

    const [transactions, processed_payments] = await this.repoTransaction.findAndCount({
      where: {
        createdAt: Between(startDate, endDate),
        processed: true,
        operation: operation_type.DEBIT,
      },
    });

    const transferred_total_amount = transactions.reduce((a, b) => a + b.amount, 0);

    const top_most_searched = await this.repoSearch.query(`
      select
        description,
        count(trim(description))::bigint as qty
      from "search"
      where
        "createdAt"::date between $1 and $2
      group by(description) order by qty desc limit 5;
    `, [startDate, endDate]);

    const top_most_resellers = await this.repoSale.query(`
      select
        sales_wrapper.reseller_id as id,
        r.name,
        sales_wrapper.sale_qty::bigint
      from (
        select
          reseller as reseller_id,
          count(1) as sale_qty	
        from sale s
        where
          "createdAt"::date between $1 and $2 and
          status not in ('canceled', 'waiting_payment')
        group by reseller order by sale_qty desc limit 5 offset 0
      ) sales_wrapper
      inner join reseller r
        on r.id::uuid = sales_wrapper.reseller_id::uuid;
    `, [startDate, endDate]);

    return {
      resellers_qty,
      gross_profit,
      net_profit,
      pending_payments,
      processed_payments,
      transferred_total_amount,
      top_most_searched,
      top_most_resellers,
    }
  }
}
