import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { CustomersService } from "src/modules/customers/customers.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class AccountsService {
  constructor(
    private readonly customersService: CustomersService,
    private readonly jwtService: JwtService
  ) {}

  async validateCustomer(email: string, password: string): Promise<any> {
    const customer = await this.customersService.findByEmailWithPassword(email);

    if (customer && bcrypt.compareSync(password, customer.password)) {
      const { password, ...result } = customer;
      return result;
    }

    return null;
  }

  async signCustomer(user: any) {
    const payload = {
      sub: user.id,
      name: user.name,
      email: user.email,
      identity:user.identity
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
