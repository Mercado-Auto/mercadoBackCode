import {
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { formatResponseWithPagination } from "src/utils/response";
import { MailService } from "src/mail/mail.service";
import { Customer } from "./entities/customer.entity";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { PaginationAndSorteringAndFilteringDto } from "src/utils/pagination.dto";
import { CustomerAddress } from "./entities/address.entity";
import { CreateAddressDto } from "./dto/create-address.dto";
import { CitiesService } from "../cities/cities.service";
import { UpdateAddressDto } from "./dto/update-address.dto";
import { TokensService } from "../tokens/tokens.service";
import { ProductsService } from "../products/products.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly repo: Repository<Customer>,
    @InjectRepository(CustomerAddress)
    private readonly repoAddr: Repository<CustomerAddress>,
    private readonly citiesService: CitiesService,
    private readonly mailService: MailService,
    private readonly tokenService: TokensService,
    private readonly productsService: ProductsService
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const _customer = await this.findByEmail(createCustomerDto.email);

    if (_customer)
      throw new ConflictException("Usuario já cadastrado com esse email");

    return await this.repo.manager.transaction(async (manager) => {
      createCustomerDto.password = bcrypt.hashSync(
        createCustomerDto.password,
        10
      );

      const customer = await manager.getRepository(Customer).save({
        ...createCustomerDto
      });

      const { token } = await this.tokenService.new(customer);

      // await this.mailService.sendCustomerWelcome(customer, token);

      return customer;
    });
  }

  async findAll(pagination: PaginationAndSorteringAndFilteringDto) {
    return formatResponseWithPagination<Customer>(
      await this.repo.findAndCount({
        take: pagination.pageSize,
        skip: (pagination.page - 1) * pagination.pageSize,
        order: {
          [pagination.order_by]: pagination.sort_by
            .toString()
            .replace("end", "")
            .toUpperCase(),
        },
        select: ["id", "name", "email", "createdAt", "updatedAt"],
        where: {
          ...pagination.filters,
        },
      })
    );
  }

  async findOne(id: string) {
    try {
      return await this.repo.findOneOrFail({
        select: ["id", "name", "email", "identity", "createdAt", "updatedAt"],
        where: {
          id,
        },
        relations: {
          favorites: true,
        },
      });
    } catch (error) {
      throw new NotFoundException("Cliente não encontrado!");
    }
  }

  async findByEmailWithPassword(email: string): Promise<Customer> {
    return await this.repo.findOne({
      where: { email },
    });
  }

  async update(id: string, data: UpdateCustomerDto): Promise<void> {
    const customer = await this.findOne(id);

    if ("email" in data && data.email !== customer.email) {
      await this.sendConfirmMail(customer.email);
    }

    this.repo.merge(customer, data);
    await this.repo.save(customer);
  }

  async findByEmail(email: string): Promise<Customer> {
    return await this.repo.findOne({
      where: {
        email,
      },
    });
  }
  async forgetPassword(email: string): Promise<void> {
    const customer = await this.repo.findOne({
      where: {
        email,
      },
    });

    if (!customer) {
      throw new NotFoundException("Usuario não encontrado com esse email!");
    }

    const { token } = await this.tokenService.new(customer);

    await this.mailService.forgetPassword(customer, token);
  }

  async changePassword(token: string, newPassword: string): Promise<void> {
    const _token = await this.tokenService.findByToken(token);

    if (!_token) {
      throw new NotFoundException("Token não encontrado para esse email!");
    }

    if (!(await this.tokenService.isValid(token))) {
      throw new HttpException("Token expirado", 401);
    }
    const data = (await this.tokenService.decodeToken(token)) as Customer;

    const user = await this.findByEmail(data.email);

    if (user) {
      user.password = bcrypt.hashSync(newPassword, 10);

      await this.repo.save(user);

      await this.tokenService.destroy(_token.id);
      return;
    }

    throw new HttpException("User not found", 500);
  }

  async sendConfirmMail(customer_email: string): Promise<void> {
    const customer = await this.repo.findOne({
      where: {
        email: customer_email,
      },
    });

    if (!customer) {
      throw new NotFoundException("Cliente não encontrado!");
    }
    const { token } = await this.tokenService.new(customer);

    this.repo.merge(customer, {
      verified_email: false,
    });

    await this.repo.save(customer);

    await this.mailService.sendConfirmation(customer, token);
  }

  async confirmEmail(token: string): Promise<void> {
    const _token = await this.tokenService.findById(token);

    if (!_token) {
      throw new NotFoundException("Token não encontrado!");
    }

    if (!(await this.tokenService.isValid(_token.token))) {
      throw new HttpException("Token já espirado", 401);
    }

    const customer = await this.findOne(_token.customer);

    if (!customer) {
      throw new NotFoundException("Cliente não encontrado!");
    }

    this.repo.merge(customer, {
      verified_email: true,
    });

    await this.repo.save(customer);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);

    await this.repo.delete(id);
  }

  async add(customer_id: string, product_id: string) {
    const customer = await this.findOne(customer_id);

    const product = await this.productsService.findById(product_id);

    const allFavorites = await this.findAllFavorites(customer_id);

    if (
      Array.isArray(allFavorites) &&
      allFavorites.find((_product) => _product.id === product.id)
    ) {
      throw new HttpException(
        "Esse produto já esta na sua lista favoritos",
        409
      );
    }
    customer.favorites = [...allFavorites, product];

    await this.repo.save({
      ...customer,
    });
  }

  async findAllFavorites(customer_id: string) {
    return (
      await this.repo.findOne({
        where: {
          id: customer_id,
        },
        relations: {
          favorites: true,
        },
      })
    ).favorites;
  }

  async removeFavorite(customer_id: string, product_id: string) {
    const customer = await this.findOne(customer_id);

    if (!customer.favorites) {
      throw new NotFoundException(
        "Error, voce não tem esse produto na sua lista de favoritos "
      );
    }

    if (customer && Array.isArray(customer.favorites)) {
      const productIndex = customer.favorites.findIndex(
        (product) => product.id === product_id
      );

      if (productIndex != -1) {
        customer.favorites.splice(productIndex, 1);
      } else {
        throw new NotFoundException(
          "Error, voce não tem esse produto na sua lista de favoritos "
        );
      }
    }

    await this.repo.save(customer);
  }

  async createAddress(customerId: string, createAddressDto: CreateAddressDto) {
    const customer = await this.findOne(customerId);
    const { city: cityId, ...data } = createAddressDto;

    const city = await this.citiesService.findOne(cityId);

    return await this.repoAddr.save({
      customer,
      ...data,
      city,
    });
  }

  async findAllAddresses(customerId: string) {
    const customer = await this.findOne(customerId);

    return await this.repoAddr.find({
      where: {
        customer: {
          id: customer.id,
        },
      },
      relations: {
        city: true,
      },
    });
  }

  async findOneAddress(customerId: string, addressId: string) {
    const customer = await this.findOne(customerId);
    try {
      return await this.repoAddr.findOneOrFail({
        where: {
          id: addressId,
          customer: {
            id: customer.id,
          },
        },
        relations: {
          city: true,
        },
      });
    } catch (error) {
      throw new NotFoundException("Endereço do cliente não encontrado!");
    }
  }

  async updateAddress(
    customerId: string,
    addressId: string,
    updateAddressDto: UpdateAddressDto
  ) {
    const address = await this.findOneAddress(customerId, addressId);
    const { city: cityId, ...data } = updateAddressDto;

    this.repoAddr.merge(address, data);

    if (cityId) {
      const city = await this.citiesService.findOne(cityId);
      this.repoAddr.merge(address, { city });
    }

    await this.repoAddr.save(address);
  }

  async removeAddress(customerId: string, addressId: string) {
    await this.findOneAddress(customerId, addressId);

    await this.repoAddr.delete({
      id: addressId,
      customer: {
        id: customerId,
      },
    });
  }
}
