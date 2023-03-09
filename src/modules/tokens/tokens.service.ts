import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Customer } from "../customers/entities/customer.entity";
import { Reseller } from "../resellers/entities/reseller.entity";
import { User } from "../users/entities/user.entity";
import { Token } from "./entities/token.entity";

@Injectable()
export class TokensService {
  constructor(
    @InjectRepository(Token)
    private readonly repo: Repository<Token>,
    private readonly jwtService: JwtService
  ) {}

  async new(data: User | Customer | Reseller) {
    const key = {
      User: "user",
      Customer: "customer",
      Reseller: "reseller",
    }[data.constructor.name];

    if ("password" in data) {
      delete data.password;
    }

    return await this.repo.save({
      token: this.jwtService.sign({
        ...data,
      }),
      key: data.id,
    });
  }

  async findByToken(token: string): Promise<Token> {
    return await this.repo.findOne({
      where: {
        token,
      },
    });
  }

  async isValid(token: string): Promise<boolean> {
    const _token = await this.repo.findOne({
      where: {
        token,
      },
    });

    return this.jwtService.verify(_token.token) ? true : false;
  }

  async decodeToken(token: string): Promise<Customer | User> {
    const _token = await this.repo.findOne({
      where: {
        token,
      },
    });

    return this.jwtService.decode(_token.token) as Customer | User;
  }

  async findById(id: string) {
    return await this.repo.findOne({
      where: {
        id,
      },
    });
  }

  destroy(id: string) {
    return this.repo.delete(id);
  }
}
