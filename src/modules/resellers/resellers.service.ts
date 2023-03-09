import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MailService } from "src/mail/mail.service";
import { Repository } from "typeorm";
import { PaginationAndSorteringAndFilteringDto } from "../../utils/pagination.dto";
import { formatResponseWithPagination } from "../../utils/response";
import { CitiesService } from "../cities/cities.service";
import { TokensService } from "../tokens/tokens.service";
import { User, UserType } from "../users/entities/user.entity";
import { CreateResellerDto } from "./dto/create-reseller.dto";
import { UpdateResellerDto } from "./dto/update-reseller.dto";
import { Reseller } from "./entities/reseller.entity";

@Injectable()
export class ResellersService {
  constructor(
    @InjectRepository(Reseller)
    private readonly repo: Repository<Reseller>,
    private readonly mailService: MailService,
    private readonly citiesService: CitiesService,
    private readonly tokenService: TokensService
  ) {}

  async create(createResellerDto: CreateResellerDto): Promise<Reseller> {
    const { address_city, ...data } = createResellerDto;

    // Validate city
    const city = await this.citiesService.findOne(address_city);

    return await this.repo.manager.transaction(async (manager) => {
      const reseller = await manager.getRepository(Reseller).save({
        ...data,
        address_city: city,
      });

      const resellerUserMaster = await manager.getRepository(User).save({
        name: data.responsible_name,
        email: data.responsible_email,
        password: data.responsible_password,
        access_type: UserType.RESELLER,
        reseller,
      });

      const { token } = await this.tokenService.new(reseller);

      // await this.mailService.sendResellerWelcome(resellerUserMaster, token);

      return reseller;
    });
  }

  async find() {
    return await this.repo.find();
  }

  async findAll(pagination: PaginationAndSorteringAndFilteringDto) {
    return formatResponseWithPagination<Reseller>(
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
        },
      })
    );
  }

  async findOne(id: string): Promise<Reseller> {
    try {
      return await this.repo.findOneOrFail({
        where: {
          id,
        },
        relations: {
          address_city: true,
          transactions: true,
        },
      });
    } catch (error) {
      throw new NotFoundException("Revendedor não encontrado!");
    }
  }

  async findByUserId(id: string): Promise<Reseller> {
    try {
      return await this.repo.findOneOrFail({
        where: {
          users:{
            id
          }
        },
        relations: {
          address_city: true,
          transactions: true,
        },
      });
    } catch (error) {
      throw new NotFoundException("Revendedor não encontrado!");
    }
  }

  async findByMail(email: string): Promise<Reseller> {
    try {
      return await this.repo.findOneOrFail({
        where: {
          responsible_email: email,
        },
      });
    } catch (error) {
      throw new NotFoundException("Revendedor não encontrado!");
    }
  }

  async update(
    id: string,
    updateResellerDto: UpdateResellerDto
  ): Promise<void> {
    const { address_city, ...data } = updateResellerDto;
    const reseller = await this.findOne(id);

    // Validate city
    if (address_city) {
      const city = await this.citiesService.findOne(address_city);
      reseller.address_city = city;
    }

    this.repo.merge(reseller, data);

    await this.repo.save(reseller);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);

    await this.repo.delete(id);
  }

  async updateBalance(
    id: string,
    amount: number,
    type: "INCREMENT" | "DECREMENT"
  ): Promise<void> {
    const reseller = await this.findOne(id);

    if (type === "INCREMENT") {
      reseller.balance += amount;
    } else {
      if (Number(reseller.balance) < Number(amount)) {
        throw new ForbiddenException("Saldo insuficiente para retirada.");
      }
      reseller.balance -= amount;
    }

    await this.repo.save(reseller);
  }
}
